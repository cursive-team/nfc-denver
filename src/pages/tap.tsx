import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  LocationTapResponse,
  PersonTapResponse,
  TapResponseCode,
  tapResponseSchema,
} from "./api/tap";
import LoginForm from "@/components/LoginForm";
import {
  getAuthToken,
  getKeys,
  getProfile,
  updateUserFromTap,
} from "@/lib/client/localStorage";
import { updateLocationSignatureFromTap } from "@/lib/client/localStorage/locationSignatures";
import { encryptLocationTapMessage } from "@/lib/client/jubSignal";

export default function Tap() {
  const router = useRouter();
  const [pendingPersonTapResponse, setPendingPersonTapResponse] =
    useState<PersonTapResponse>();
  const [pendingLocationTapResponse, setPendingLocationTapResponse] =
    useState<LocationTapResponse>();

  // Save the newly tapped person to local storage and redirect to their profile
  const processPersonTap = useCallback(
    async (person: PersonTapResponse) => {
      const userId = await updateUserFromTap(person);
      router.push("/users/" + userId + "/share");
    },
    [router]
  );

  // First, record the location signature as a jubSignal message
  // Then, save the newly tapped location to local storage and redirect to their profile
  const processLocationTap = useCallback(
    async (location: LocationTapResponse) => {
      const authToken = getAuthToken();
      const profile = getProfile();
      const keys = getKeys();

      if (!authToken || authToken.expiresAt < new Date() || !profile || !keys) {
        alert("You must be logged in to connect");
        router.push("/login");
        return;
      }

      const recipientPublicKey = profile.encryptionPublicKey;
      const encryptedMessage = await encryptLocationTapMessage({
        locationId: location.id,
        locationName: location.name,
        signaturePublicKey: location.signaturePublicKey,
        signatureMessage: location.signatureMessage,
        signature: location.signature,
        senderPrivateKey: keys.encryptionPrivateKey,
        recipientPublicKey,
      });

      // Send location tap as encrypted jubSignal message to self
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: encryptedMessage,
            recipientPublicKey,
            token: authToken.value,
          }),
        });

        if (!response.ok) {
          throw new Error("Error sending message");
        }
      } catch (error) {
        console.error(
          "Error sending encrypted location tap to server: ",
          error
        );
        alert("An error occured while processing the tap. Please try again.");
        router.push("/");
        return;
      }

      // Update location signature in local storage
      const locationId = await updateLocationSignatureFromTap(location);
      router.push("/locations/" + locationId);
    },
    [router]
  );

  useEffect(() => {
    const cmac = router.query.cmac as string;

    if (!cmac) {
      alert("No CMAC provided!");
      router.push("/");
      return;
    }

    const handlePersonRegistration = (cmac: string) => {
      router.push(`/register?cmac=${cmac}`);
    };

    const handleLocationRegistration = (cmac: string) => {
      router.push(`/register-location?cmac=${cmac}`);
    };

    const handlePersonTap = async (person: PersonTapResponse) => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        setPendingPersonTapResponse(person);
      } else {
        processPersonTap(person);
      }
    };

    const handleLocationTap = async (location: LocationTapResponse) => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        alert("You must be logged in to connect");
        setPendingLocationTapResponse(location);
        return;
      } else {
        processLocationTap(location);
      }
    };

    fetch(`/api/tap?cmac=${cmac}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(async (data) => {
        const tapResponse = tapResponseSchema.validateSync(data);
        switch (tapResponse.code) {
          case TapResponseCode.CMAC_INVALID:
            throw new Error("CMAC invalid!");
          case TapResponseCode.PERSON_NOT_REGISTERED:
            handlePersonRegistration(cmac);
            break;
          case TapResponseCode.LOCATION_NOT_REGISTERED:
            handleLocationRegistration(cmac);
            break;
          case TapResponseCode.VALID_PERSON:
            if (!tapResponse.person) {
              throw new Error("Person is null!");
            }
            await handlePersonTap(tapResponse.person);
            break;
          case TapResponseCode.VALID_LOCATION:
            if (!tapResponse.location) {
              throw new Error("Location is null!");
            }
            await handleLocationTap(tapResponse.location);
            break;
          default:
            throw new Error("Invalid tap response code!");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Error! Please refresh and try again.");
      });
  }, [router, processPersonTap, processLocationTap]);

  if (pendingPersonTapResponse) {
    return (
      <LoginForm
        onSuccessfulLogin={() => processPersonTap(pendingPersonTapResponse)}
        onFailedLogin={(errorMessage: string) => {
          alert(errorMessage);
        }}
      />
    );
  } else if (pendingLocationTapResponse) {
    return (
      <LoginForm
        onSuccessfulLogin={() => processLocationTap(pendingLocationTapResponse)}
        onFailedLogin={(errorMessage: string) => {
          alert(errorMessage);
        }}
      />
    );
  }

  return null;
}

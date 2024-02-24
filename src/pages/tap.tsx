import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  LocationTapResponse,
  PersonTapResponse,
  TapResponseCode,
  tapResponseSchema,
} from "./api/tap/cmac";
import LoginForm from "@/components/LoginForm";
import {
  getAuthToken,
  getKeys,
  getProfile,
  updateUserFromTap,
  getLocationSignature,
} from "@/lib/client/localStorage";
import { encryptLocationTapMessage } from "@/lib/client/jubSignal";
import { loadMessages } from "@/lib/client/jubSignalClient";
import { toast } from "sonner";
import { Spinner } from "@/components/Spinner";
import { getHaLoArgs } from "@/lib/client/libhalo";
import { sigCardTapResponseSchema } from "./api/tap/sig_card";

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
        toast.error("You must be logged in to connect");
        router.push("/login");
        return;
      }

      const locationSignature = getLocationSignature(location.id);
      if (locationSignature) {
        toast.error("You have already visited this location!");
        router.push(`/locations/${location.id}`);
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
      // Simultaneously update location signature and activity feed in local storage
      try {
        await loadMessages({
          forceRefresh: false,
          messageRequests: [
            {
              encryptedMessage,
              recipientPublicKey,
            },
          ],
        });
      } catch (error) {
        console.error(
          "Error sending encrypted location tap to server: ",
          error
        );
        toast.error(
          "An error occured while processing the tap. Please try again."
        );
        router.push("/");
        return;
      }

      router.push(`/locations/${location.id}?tap=true`);
    },
    [router]
  );

  useEffect(() => {
    const handlePersonRegistration = (cmac: string) => {
      router.push(`/register?cmac=${cmac}`);
    };

    const handleLocationRegistration = (cmac: string) => {
      router.push(`/register_location?cmac=${cmac}`);
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
        setPendingLocationTapResponse(location);
      } else {
        processLocationTap(location);
      }
    };

    // ----- HANDLE CMAC TAP -----
    const cmac = router.query.cmac as string;
    if (cmac) {
      fetch(`/api/tap/cmac?cmac=${cmac}`, {
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
          toast.error("Error! Please refresh and try again.");
        });
    } else {
      // ----- HANDLE CARD GENERATED SIGNATURE TAP -----
      if (!location.hash) {
        toast.error("Unable to process cmac or signature from tap.");
        router.push("/");
        return;
      }

      const urlParams = new URLSearchParams(location.hash.slice(1));
      const rawLocationSignature = getHaLoArgs(urlParams);
      if (!rawLocationSignature) {
        toast.error("Unable to process cmac or signature from tap.");
        router.push("/");
        return;
      }
      const { signaturePublicKey, signatureMessage, signature } =
        rawLocationSignature;

      fetch(`/api/tap/sig_card?signaturePublicKey=${signaturePublicKey}`, {
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
          const sigCardTapResponse =
            sigCardTapResponseSchema.validateSync(data);
          if (!sigCardTapResponse.registered) {
            throw new Error("This location card is not registered!");
          } else {
            if (!sigCardTapResponse.locationInfo) {
              throw new Error("Unable to retrieve location!");
            }
            const tapResponse: LocationTapResponse = {
              ...sigCardTapResponse.locationInfo,
              signatureMessage,
              signature,
            };
            handleLocationTap(tapResponse);
          }
        })
        .catch((error) => {
          console.error(error);
          toast.error("Error! Please refresh and try again.");
        });
    }
  }, [router, processPersonTap, processLocationTap]);

  if (pendingPersonTapResponse) {
    return (
      <LoginForm
        onSuccessfulLogin={() => processPersonTap(pendingPersonTapResponse)}
      />
    );
  }

  if (pendingLocationTapResponse) {
    return (
      <LoginForm
        onSuccessfulLogin={() => processLocationTap(pendingLocationTapResponse)}
      />
    );
  }

  return (
    <div className="mx-auto my-auto">
      <Spinner />
    </div>
  );
}

Tap.getInitialProps = () => {
  return { fullPage: true };
};

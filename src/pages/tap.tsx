import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  LocationTapResponse,
  PersonTapResponse,
  TapResponseCode,
  tapResponseSchema,
} from "./api/tap";
import LoginForm from "@/components/LoginForm";
import { getAuthToken, updateUserFromTap } from "@/lib/client/localStorage";
import { updateLocationSignatureFromTap } from "@/lib/client/localStorage/locationSignatures";
import { useTap } from "@/hooks/useTap";
import toast from "react-hot-toast";

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

  // Save the newly tapped location to local storage and redirect to their profile
  const processLocationTap = useCallback(
    async (location: LocationTapResponse) => {
      const locationId = await updateLocationSignatureFromTap(location);
      router.push("/locations/" + locationId);
    },
    [router]
  );
  const cmac = router.query.cmac as string;
  const { isPending, data } = useTap(cmac);

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
      toast.error("You must be logged in to connect");
      setPendingLocationTapResponse(location);
      return;
    } else {
      processLocationTap(location);
    }
  };

  const handleTap = async () => {
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
  };

  useEffect(() => {
    if (isPending) return; // still loading data, let's wait until it's done
    if (!cmac) {
      toast.error("No CMAC provided!");
      router.push("/");
      return;
    }

    handleTap();
  }, [cmac, isPending, router]);

  if (isPending) return null;

  if (pendingPersonTapResponse) {
    return (
      <LoginForm
        onSuccessfulLogin={() => processPersonTap(pendingPersonTapResponse)}
        onFailedLogin={(errorMessage: string) => {
          toast.error(errorMessage);
        }}
      />
    );
  } else if (pendingLocationTapResponse) {
    return (
      <LoginForm
        onSuccessfulLogin={() => processLocationTap(pendingLocationTapResponse)}
        onFailedLogin={(errorMessage: string) => {
          toast.error(errorMessage);
        }}
      />
    );
  }

  return null;
}

Tap.getInitialProps = () => {
  return { fullPage: true };
};

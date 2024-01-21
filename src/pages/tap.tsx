import { useEffect } from "react";
import { useRouter } from "next/router";
import {
  LocationTapResponse,
  PersonTapResponse,
  TapResponseCode,
  tapResponseSchema,
} from "./api/tap";

export default function Tap() {
  const router = useRouter();

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
      router.push(`/register_location?cmac=${cmac}`);
    };

    const handlePersonTap = async (person: PersonTapResponse) => {};

    const handleLocationTap = async (location: LocationTapResponse) => {};

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
  }, [router]);

  return null;
}

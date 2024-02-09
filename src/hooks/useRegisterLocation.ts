import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface LocationDataProps {
  cmac: string;
  name: string;
  description: string;
  sponsor: string;
  imageUrl: string;
}

export function useRegisterLocation() {
  return useMutation({
    mutationKey: ["registerLocation"],
    mutationFn: async (locationData: LocationDataProps) => {
      const response = await fetch("/api/register/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        toast.error("Error registering location. Please try again.");
        return Promise.reject();
      }

      const { locationId } = await response.json();

      return Promise.resolve(locationId);
    },
  });
}

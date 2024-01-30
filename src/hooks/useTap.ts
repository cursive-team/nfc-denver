import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useTap = (cmac: string) => {
  return useQuery({
    queryKey: ["tap", cmac],
    queryFn: async () => {
      const response = await fetch(`/api/tap?cmac=${cmac}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Error tapping the keg. Please try again later.");
        return Promise.reject(
          new Error(`HTTP error! status: ${response.status}`)
        );
      }

      return response.json();
    },
    enabled: !!cmac,
  });
};

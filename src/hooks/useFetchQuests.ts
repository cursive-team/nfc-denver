import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/client/localStorage";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { QuestItem } from "@/types";

export const useFetchQuests = () => {
  const router = useRouter();

  return useQuery({
    queryKey: ["quests"],
    queryFn: async (): Promise<QuestItem[]> => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        toast.error("You must be logged in to connect");
        router.push("/login");
        return [];
      }

      const response = await fetch(`/api/quest?token=${authToken.value}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const quests = response.json() as Promise<QuestItem[]>;
      return quests;
    },
  });
};

import { useQuery } from "@tanstack/react-query";
import { getAllQuestCompleted, getAuthToken } from "@/lib/client/localStorage";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { QuestWithRequirements } from "@/types";

export interface QuestListItem extends QuestWithRequirements {
  isCompleted?: boolean;
}

export const useFetchQuests = () => {
  const router = useRouter();

  const questCompleted = getAllQuestCompleted();
  const completedQuestIds: string[] = Object.keys(questCompleted);

  return useQuery({
    queryKey: ["quests"],
    queryFn: async (): Promise<QuestListItem[]> => {
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

      const quests = await response.json();
      return quests.map((quest: QuestWithRequirements) => {
        const isCompleted = completedQuestIds?.includes(quest.id.toString());

        return {
          ...quest,
          isCompleted,
        };
      });
    },
  });
};

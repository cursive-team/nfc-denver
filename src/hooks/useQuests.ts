import { QuestWithRequirements } from "@/types";
import { getAuthToken } from "@/lib/client/localStorage";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function useQuests() {
  const [quests, setQuests] = useState<QuestWithRequirements[]>();
  const router = useRouter();

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }

    fetch(`/api/quest?token=${authToken.value}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setQuests(data);
      })
      .catch((error) => {
        console.error("Failed to fetch quests:", error);
      });
  }, [router]);

  return {
    quests,
  };
}

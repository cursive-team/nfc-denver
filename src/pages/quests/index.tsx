import { Button } from "@/components/Button";
import { Filters } from "@/components/Filters";
import { Icons } from "@/components/Icons";
import { QuestCard } from "@/components/cards/QuestCard";
import { getAuthToken } from "@/lib/client/localStorage";
import { QuestTagMapping } from "@/shared/constants";
import { QuestWithRequirements } from "@/types";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<QuestWithRequirements[]>();
  const [selectedOption, setSelectedOption] = useState("ALL");

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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Filters
          label="Filters"
          defaultValue="ALL"
          object={QuestTagMapping}
          onChange={setSelectedOption}
        />
      </div>
      <div className="flex flex-col gap-2">
        {quests?.map(
          (
            { id, name, description, userRequirements, locationRequirements },
            index
          ) => (
            <Link href={`/quests/${id}`} key={id}>
              <QuestCard
                title={name}
                description={description}
                numSigsRequired={
                  userRequirements.length + locationRequirements.length
                }
              />
            </Link>
          )
        )}
      </div>
      <div className="mt-2">
        <Link href="/create-quest">
          <Button size="md" align="left">
            <span>Create quest</span>
            <div className="ml-auto">
              <Icons.arrowRight />
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}

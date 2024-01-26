import { Button } from "@/components/Button";
import { Filters } from "@/components/Filters";
import { Icons } from "@/components/Icons";
import { QuestCard } from "@/components/cards/QuestCard";
import useQuests from "@/hooks/useQuests";

import { QuestTagMapping } from "@/shared/constants";
import { QuestWithRequirements } from "@/types";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function QuestsPage() {
  const { quests } = useQuests();
  const [selectedOption, setSelectedOption] = useState("ALL");

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
                completedSigs={1}
                userRequirements={userRequirements}
                locationRequirements={locationRequirements}
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

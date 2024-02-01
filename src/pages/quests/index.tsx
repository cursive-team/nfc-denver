import { Button } from "@/components/Button";
import { Filters } from "@/components/Filters";
import { Icons } from "@/components/Icons";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { QuestCard } from "@/components/cards/QuestCard";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useFetchQuests } from "@/hooks/useFetchQuests";

import { QuestTagMapping } from "@/shared/constants";
import Link from "next/link";
import React, { useState } from "react";

export default function QuestsPage() {
  const { isLoading, data: quests = [] } = useFetchQuests();
  const [selectedOption, setSelectedOption] = useState("ALL");

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Filters
          label="Filters"
          defaultValue={selectedOption}
          object={QuestTagMapping}
          onChange={setSelectedOption}
          disabled={isLoading}
        />
      </div>
      <LoadingWrapper
        className="flex flex-col gap-2"
        isLoading={isLoading}
        fallback={<Placeholder.List items={3} />}
        noResultsLabel="No quests found"
      >
        {quests?.map(
          ({
            id,
            name,
            description,
            userRequirements,
            locationRequirements,
          }: any) => (
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
      </LoadingWrapper>
      <div className="mt-2">
        <Link href="/create-quest">
          <Button size="md" align="left" disabled={isLoading}>
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

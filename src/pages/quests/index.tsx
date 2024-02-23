import { Filters } from "@/components/Filters";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { QuestCard } from "@/components/cards/QuestCard";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useFetchQuests } from "@/hooks/useFetchQuests";

import { QuestTagMapping, QuestTagMappingType } from "@/shared/constants";
import Link from "next/link";
import React, { useMemo, useRef, useState } from "react";

import { QuestWithCompletion } from "@/types";
import { getPinnedQuest } from "@/lib/client/localStorage/questPinned";
import { useQuestRequirements } from "@/hooks/useQuestRequirements";

export default function QuestsPage() {
  const pinnedQuests = useRef<Set<number>>(getPinnedQuest());
  const { isLoading, data: quests = [] } = useFetchQuests();
  const [selectedOption, setSelectedOption] =
    useState<QuestTagMappingType>("ALL");

  const displayQuests: QuestWithCompletion[] = useMemo(() => {
    const inProgressQuests = quests.filter((quest) => !quest.isCompleted);
    const completedQuests = quests.filter((quest) => quest.isCompleted);
    const questFilteredItems =
      selectedOption === "IN_PROGRESS"
        ? inProgressQuests
        : selectedOption === "COMPLETED"
        ? completedQuests
        : quests;

    const pinnedQuest = questFilteredItems.filter((quest) =>
      pinnedQuests.current.has(quest.id)
    );
    const notPinnedQuest = questFilteredItems.filter(
      (quest) => !pinnedQuests.current.has(quest.id)
    );

    return [...pinnedQuest, ...notPinnedQuest];
  }, [quests, selectedOption, pinnedQuests]);

  const { numRequirementsSatisfied } = useQuestRequirements(displayQuests);

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
        {displayQuests.map(
          (
            {
              id,
              name,
              description,
              userRequirements,
              locationRequirements,
              isCompleted = false,
            }: QuestWithCompletion,
            index
          ) => {
            const key = `${id}-${index}`;

            return (
              <Link href={`/quests/${id}`} key={key}>
                <QuestCard
                  title={name}
                  description={description}
                  completedSigs={numRequirementsSatisfied[index]}
                  userRequirements={userRequirements}
                  locationRequirements={locationRequirements}
                  isCompleted={isCompleted}
                  isPinned={pinnedQuests.current.has(id)}
                />
              </Link>
            );
          }
        )}
      </LoadingWrapper>
    </div>
  );
}

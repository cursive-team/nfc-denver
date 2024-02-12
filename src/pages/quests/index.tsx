import { Button } from "@/components/Button";
import { Filters } from "@/components/Filters";
import { Icons } from "@/components/Icons";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { QuestCard } from "@/components/cards/QuestCard";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { QuestListItem, useFetchQuests } from "@/hooks/useFetchQuests";

import { QuestTagMapping, QuestTagMappingType } from "@/shared/constants";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  getUsers,
  getLocationSignatures,
  User,
  LocationSignature,
} from "@/lib/client/localStorage";
import { computeNumRequirementsSatisfied } from "@/lib/client/quests";
import { QuestWithRequirements } from "@/types";
import { getPinnedQuest } from "@/lib/client/localStorage/questPinned";
import { filterArrayByValue } from "@/lib/shared/utils";

export default function QuestsPage() {
  const pinnedQuests = useRef<Set<number>>(getPinnedQuest());
  const { isLoading, data: quests = [] } = useFetchQuests();
  // Compute users and locations that user has signatures for
  const [userPublicKeys, setUserPublicKeys] = useState<string[]>([]);
  const [locationPublicKeys, setLocationPublicKeys] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] =
    useState<QuestTagMappingType>("ALL");

  const KeyFilterMapping: Record<QuestTagMappingType, any> = {
    IN_PROGRESS: "isCompleted",
    COMPLETED: "isCompleted",
    ALL: undefined,
  };

  const questFilteredItems = filterArrayByValue(
    quests ?? [],
    KeyFilterMapping?.[selectedOption] as any,
    selectedOption === "ALL" ? true : selectedOption === "IN_PROGRESS"
  );

  useEffect(() => {
    const users = getUsers();
    const locationSignatures = getLocationSignatures();

    const validUserPublicKeys = Object.values(users)
      .filter((user: User) => user.sig)
      .map((user: User) => user.sigPk!);
    setUserPublicKeys(validUserPublicKeys);

    const validLocationPublicKeys = Object.values(locationSignatures).map(
      (location: LocationSignature) => location.pk
    );
    setLocationPublicKeys(validLocationPublicKeys);
  }, []);

  const numRequirementsSatisfied: number[] = useMemo(() => {
    return quests?.map(
      ({ userRequirements, locationRequirements }: QuestWithRequirements) => {
        return computeNumRequirementsSatisfied({
          userPublicKeys,
          locationPublicKeys,
          userRequirements,
          locationRequirements,
        });
      }
    );
  }, [quests, userPublicKeys, locationPublicKeys]);

  const pinnedQuest = questFilteredItems.filter((quest) =>
    pinnedQuests.current.has(quest.id)
  );

  const notPinnedQuest = questFilteredItems.filter(
    (quest) => !pinnedQuests.current.has(quest.id)
  );

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
        {[
          ...pinnedQuest, // show pinned quests first
          ...notPinnedQuest, // remaining quests except pinned
        ]?.map(
          (
            {
              id,
              name,
              description,
              userRequirements,
              locationRequirements,
              isCompleted = false,
            }: QuestListItem,
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
      <div>
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

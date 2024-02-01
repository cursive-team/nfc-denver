import React, { useEffect, useMemo, useState } from "react";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { PointCard } from "@/components/cards/PointCard";
import { QuestRequirementCard } from "@/components/cards/QuestRequirementCard";
import { classed } from "@tw-classed/react";
import { useParams } from "next/navigation";
import {
  LocationRequirement,
  QuestRequirementType,
  QuestWithRequirements,
  UserRequirement,
} from "@/types";
import { Button } from "@/components/Button";
import { CompleteQuestModal } from "@/components/modals/CompleteQuestModal";
import { useFetchQuestById } from "@/hooks/useFetchQuestById";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { QuestDetailPlaceholder } from "@/components/placeholders/QuestDetailPlaceHolder";
import { ListWrapper } from "@/components/wrappers/ListWrapper";
import { Placeholder } from "@/components/placeholders/Placeholder";
import {
  LocationSignature,
  User,
  getLocationSignatures,
  getUsers,
} from "@/lib/client/localStorage";
import {
  computeNumRequirementSignatures,
  computeNumRequirementsSatisfied,
} from "@/lib/client/quests";

interface QuestDetailProps {
  loading?: boolean;
  quest: Partial<QuestWithRequirements> | null;
}

const Label = classed.span("text-xs text-gray-10 font-light");

const QuestDetail = ({ quest, loading = false }: QuestDetailProps) => {
  const { name: title, description, buidlReward } = quest ?? {};

  return (
    <LoadingWrapper
      isLoading={loading}
      fallback={<QuestDetailPlaceholder />}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          <span className="text-xl font-light leading-6">{title}</span>
        </div>
        <button
          type="button"
          className="flex gap-2 items-center disabled:opacity-50"
          disabled={loading}
        >
          <span className="text-gray-11 text-xs font-light">Pin</span>
          <Icons.pin />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <span className=" text-gray-11 text-xs font-light">{description}</span>
        {buidlReward && <PointCard label="Reward" point={buidlReward} />}
      </div>
    </LoadingWrapper>
  );
};

export default function QuestById() {
  const params = useParams();
  const [userPublicKeys, setUserPublicKeys] = useState<string[]>([]);
  const [locationPublicKeys, setLocationPublicKeys] = useState<string[]>([]);
  const [completeQuestModal, setCompleteQuestModal] = useState(false);
  const { id: questId } = params;
  const { isLoading, data: quest = null } = useFetchQuestById(
    questId as string
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

  const numRequirementsSatisfied: number = useMemo(() => {
    if (!quest) return 0;

    return computeNumRequirementsSatisfied({
      userPublicKeys,
      locationPublicKeys,
      userRequirements: quest.userRequirements,
      locationRequirements: quest.locationRequirements,
    });
  }, [quest, userPublicKeys, locationPublicKeys]);

  const numUserRequirementSignatures: number[] = useMemo(() => {
    if (!quest) return [];

    return quest.userRequirements.map((requirement: UserRequirement) => {
      return computeNumRequirementSignatures({
        publicKeyList: userPublicKeys,
        userRequirement: requirement,
      });
    });
  }, [quest, userPublicKeys]);

  const numLocationRequirementSignatures: number[] = useMemo(() => {
    if (!quest) return [];

    return quest.locationRequirements.map(
      (requirement: LocationRequirement) => {
        return computeNumRequirementSignatures({
          publicKeyList: locationPublicKeys,
          locationRequirement: requirement,
        });
      }
    );
  }, [quest, locationPublicKeys]);

  const numRequirementsTotal =
    (quest?.userRequirements?.length ?? 0) +
    (quest?.locationRequirements?.length ?? 0);

  return (
    <div>
      <AppBackHeader />
      {quest && (
        <CompleteQuestModal
          isOpen={completeQuestModal}
          setIsOpen={setCompleteQuestModal}
          questName={quest.name}
          type="item"
        />
      )}
      <div className="flex flex-col gap-2">
        <QuestDetail quest={quest} loading={isLoading} />
        <LoadingWrapper
          isLoading={isLoading}
          fallback={<Placeholder.List items={3} />}
        >
          <ListWrapper
            title="Requirements"
            label={
              <div className="flex gap-2 items-center">
                <Label>{`${numRequirementsSatisfied}/${numRequirementsTotal}`}</Label>
                <Button
                  onClick={() => {
                    setCompleteQuestModal(true);
                  }}
                  size="tiny"
                >
                  Complete quest
                </Button>
              </div>
            }
          >
            <>
              {quest &&
                quest.userRequirements.map(
                  ({ name, numSigsRequired, users }: any, index: number) => (
                    <QuestRequirementCard
                      key={index}
                      title={name}
                      numSigsCollected={numUserRequirementSignatures[index]}
                      numSigsRequired={numSigsRequired}
                      questRequirementType={QuestRequirementType.USER}
                      users={users}
                      userPubKeysCollected={userPublicKeys}
                    />
                  )
                )}
              {quest &&
                quest.locationRequirements.map(
                  (
                    { name, numSigsRequired, locations }: any,
                    index: number
                  ) => (
                    <QuestRequirementCard
                      key={index}
                      title={name}
                      numSigsCollected={numLocationRequirementSignatures[index]}
                      numSigsRequired={numSigsRequired}
                      questRequirementType={QuestRequirementType.LOCATION}
                      locations={locations}
                      locationPubKeysCollected={locationPublicKeys}
                    />
                  )
                )}
            </>
          </ListWrapper>
        </LoadingWrapper>
      </div>
    </div>
  );
}

QuestById.getInitialProps = () => {
  return { showHeader: false };
};

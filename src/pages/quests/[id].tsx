import React, { useEffect, useState } from "react";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { PointCard } from "@/components/cards/PointCard";
import { QuestRequirementCard } from "@/components/cards/QuestRequirementCard";
import { classed } from "@tw-classed/react";
import { useParams } from "next/navigation";
import { QuestRequirementType, QuestWithRequirements } from "@/types";
import { Button } from "@/components/Button";
import { CompleteQuestModal } from "@/components/modals/CompleteQuestModal";
import { useFetchQuestById } from "@/hooks/useFetchQuestById";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { QuestDetailPlaceholder } from "@/components/placeholders/QuestDetailPlaceHolder";
import { ListWrapper } from "@/components/wrappers/ListWrapper";
import { Placeholder } from "@/components/placeholders/Placeholder";

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
  const [completeQuestModal, setCompleteQuestModal] = useState(false);
  const { id: questId } = params;

  const { isLoading, data: quest = null } = useFetchQuestById(
    questId as string
  );

  const totalNumRequirements =
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
                <Label>{`X/${totalNumRequirements}`}</Label>
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
                      numSigsRequired={numSigsRequired}
                      questRequirementType={QuestRequirementType.USER}
                      users={users}
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
                      numSigsRequired={numSigsRequired}
                      questRequirementType={QuestRequirementType.LOCATION}
                      locations={locations}
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

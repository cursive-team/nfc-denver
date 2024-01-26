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

type QuestDetailProps = {
  title: string;
  description: string;
  buidlReward?: number;
};

const Label = classed.span("text-xs text-gray-10 font-light");

const QuestDetail = ({ title, description, buidlReward }: QuestDetailProps) => {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          <span className="text-xl font-light leading-6">{title}</span>
        </div>
        <button type="button" className="flex gap-2 items-center">
          <span className="text-gray-11 text-xs font-light">Pin</span>
          <Icons.pin />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <span className=" text-gray-11 text-xs font-light">{description}</span>
        {buidlReward && <PointCard label="Reward" point={buidlReward} />}
      </div>
    </div>
  );
};

export default function QuestById() {
  const params = useParams();
  const [completeQuestModal, setCompleteQuestModal] = useState(false);
  const { id: questId } = params;
  const [quest, setQuest] = useState<QuestWithRequirements>();

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const response = await fetch(`/api/quest/${questId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: QuestWithRequirements = await response.json();
        setQuest(data);
      } catch (error) {
        console.error("Error fetching quest:", error);
      }
    };

    if (questId) {
      fetchQuest();
    }
  }, [questId]);

  if (!quest) return null;

  const totalNumRequirements =
    quest.userRequirements.length + quest.locationRequirements.length;

  return (
    <div>
      <AppBackHeader />
      <CompleteQuestModal
        isOpen={completeQuestModal}
        setIsOpen={setCompleteQuestModal}
        questName={quest.name}
        type="point"
      />
      <div className="flex flex-col gap-4">
        <QuestDetail
          title={quest.name}
          description={quest.description}
          buidlReward={quest.buidlReward}
        />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Requirements</Label>
            <div className="flex items-center gap-2">
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
          </div>
          <div className="flex flex-col gap-2">
            {quest.userRequirements.map(
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
            {quest.locationRequirements.map(
              ({ name, numSigsRequired, locations }: any, index: number) => (
                <QuestRequirementCard
                  key={index}
                  title={name}
                  numSigsRequired={numSigsRequired}
                  questRequirementType={QuestRequirementType.LOCATION}
                  locations={locations}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

QuestById.getInitialProps = () => {
  return { showHeader: false };
};

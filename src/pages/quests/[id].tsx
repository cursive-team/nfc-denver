import React, { useEffect, useState } from "react";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { PointCard } from "@/components/cards/PointCard";
import { QuestRequirementCard } from "@/components/cards/QuestRequirementCard";
import { classed } from "@tw-classed/react";
import { useParams } from "next/navigation";
import { QuestRequirementType, QuestWithRequirements } from "@/types";

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
      <div className="flex flex-col gap-8">
        <QuestDetail title={quest.name} description={quest.description} />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Requirements</Label>
            <Label>{`X/${totalNumRequirements}`}</Label>
          </div>
          <div className="flex flex-col gap-2">
            {quest.userRequirements.map(
              ({ name, numSigsRequired }, index: number) => (
                <QuestRequirementCard
                  key={index}
                  questName={quest.name}
                  title={name}
                  numSigsRequired={numSigsRequired}
                  questRequirementType={QuestRequirementType.USER}
                />
              )
            )}
            {quest.locationRequirements.map(
              ({ name, numSigsRequired }, index: number) => (
                <QuestRequirementCard
                  key={index}
                  questName={quest.name}
                  title={name}
                  numSigsRequired={numSigsRequired}
                  questRequirementType={QuestRequirementType.LOCATION}
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

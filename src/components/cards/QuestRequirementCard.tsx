import React, { useState } from "react";
import { Card } from "./Card";
import { Icons } from "../Icons";
import { cn } from "@/lib/client/utils";
import { QuestRequirementModal } from "../modals/QuestRequirementModal";
import { QuestRequirement } from "@/types";

interface QuestRequirementCardProps {
  title: string;
  showProgress?: boolean;
  completed?: boolean;
  questType: QuestRequirement;
}

const QuestRequirementCard = ({
  title,
  showProgress = false,
  completed = false,
  questType,
}: QuestRequirementCardProps) => {
  const [showQuestRequirement, setShowQuestRequirement] = useState(false);

  const onShowQuestRequirement = () => {
    setShowQuestRequirement(!showQuestRequirement);
  };

  return (
    <>
      <QuestRequirementModal
        isOpen={showQuestRequirement}
        setIsOpen={setShowQuestRequirement}
        questType={questType}
      />
      <Card.Base
        onClick={onShowQuestRequirement}
        className="text-center flex justify-center py-4"
      >
        <div className="flex flex-col gap-2 items-center">
          <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
          <div className="flex flex-col">
            <Card.Title>{title}</Card.Title>
            <Card.Description>
              {completed ? "Complete" : "X/X"}
            </Card.Description>
          </div>
        </div>
        {completed && (
          <Icons.checkedCircle className="absolute right-[6px] top-[6px]" />
        )}
        <Icons.arrowRight className={cn("absolute right-[6px] bottom-[6px]")} />
        {showProgress && <Card.Progress />}
      </Card.Base>
    </>
  );
};

QuestRequirementCard.displayName = "QuestRequirementCard";
export { QuestRequirementCard };

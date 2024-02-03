import React, { useState } from "react";
import { Card } from "./Card";
import { Icons } from "../Icons";
import { cn } from "@/lib/client/utils";
import { QuestRequirementModal } from "../modals/QuestRequirementModal";
import {
  LocationRequirementPreview,
  QuestRequirementType,
  UserRequirementPreview,
} from "@/types";
import Image from "next/image";

interface QuestRequirementCardProps {
  title: string;
  numSigsCollected: number;
  numSigsRequired: number;
  questRequirementType: QuestRequirementType;
  users?: UserRequirementPreview[];
  locations?: LocationRequirementPreview[];
  userPubKeysCollected?: string[];
  locationPubKeysCollected?: string[];
  showProgress?: boolean;
}

const QuestRequirementCard = ({
  title,
  numSigsCollected,
  numSigsRequired,
  questRequirementType,
  users,
  locations,
  userPubKeysCollected,
  locationPubKeysCollected,
  showProgress = false,
}: QuestRequirementCardProps) => {
  const [showQuestRequirement, setShowQuestRequirement] = useState(false);

  const onShowQuestRequirement = () => {
    setShowQuestRequirement(!showQuestRequirement);
  };

  const isUserRequirement = questRequirementType == QuestRequirementType.USER;
  const isLocationRequirement =
    questRequirementType == QuestRequirementType.LOCATION;

  const completed = numSigsCollected >= numSigsRequired;

  return (
    <>
      <QuestRequirementModal
        requirementName={title}
        questRequirementType={questRequirementType}
        users={users}
        locations={locations}
        userPubKeysCollected={userPubKeysCollected}
        locationPubKeysCollected={locationPubKeysCollected}
        numSigsRequired={numSigsRequired}
        completed={completed}
        isOpen={showQuestRequirement}
        setIsOpen={setShowQuestRequirement}
      />
      <Card.Base
        onClick={onShowQuestRequirement}
        className="text-center flex justify-center py-4"
      >
        <div className="flex flex-col gap-2 items-center">
          <div
            className={cn(
              "flex items-center  justify-center h-10 w-10 rounded-full",
              isUserRequirement && "bg-[#677363]",
              isLocationRequirement && "bg-gray-400"
            )}
          >
            {isUserRequirement && <Icons.person size={16} />}
            {isLocationRequirement && (
              <Image
                width={18}
                height={18}
                alt="home icon"
                src="/icons/home.png"
              />
            )}
          </div>
          <div className="flex flex-col">
            <Card.Title>{title}</Card.Title>
            <Card.Description>
              {completed
                ? "Complete"
                : `${numSigsCollected}/${numSigsRequired}`}
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

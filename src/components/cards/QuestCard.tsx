import React from "react";
import { Card } from "./Card";
import { LocationRequirement, UserRequirement } from "@/types";
import { Icons } from "../Icons";
import { CircleCard } from "./CircleCard";

type QuestCardProps = {
  title: string;
  description: string;
  userRequirements?: UserRequirement[];
  locationRequirements?: LocationRequirement[];
  completedSigs?: number; // number of completed signatures
  isCompleted: boolean; // whether the quest is completed
  isPinned?: boolean;
};

const QuestRequirementIcons = ({
  userRequirements = [],
  locationRequirements = [],
  isCompleted = false,
}: Pick<
  QuestCardProps,
  "userRequirements" | "locationRequirements" | "isCompleted"
>) => {
  const requirementIconsLimit = 4;

  const overcomeRequirementLimit =
    userRequirements.length + locationRequirements.length >
    requirementIconsLimit;

  const remainingRequirements =
    userRequirements.length +
    locationRequirements.length -
    requirementIconsLimit;

  return (
    <div className="flex relative items-center gap-1">
      <div className="flex">
        {[...userRequirements, ...locationRequirements]
          .splice(0, requirementIconsLimit)
          .map((item: UserRequirement | LocationRequirement, index) => {
            const isPersonRequirement = "users" in item;

            return (
              <CircleCard
                key={index}
                isMultiple={true}
                icon={isPersonRequirement ? "person" : "location"}
              />
            );
          })}
        {isCompleted && <CircleCard isMultiple={true} icon="proof" />}
      </div>
      {overcomeRequirementLimit && (
        <span className="text-[11px] text-gray-11 font-light tracking-[0.8px]">
          {`+${remainingRequirements}`}
        </span>
      )}
    </div>
  );
};

const QuestCard = ({
  title,
  description,
  locationRequirements = [],
  userRequirements = [],
  completedSigs,
  isCompleted,
  isPinned,
}: QuestCardProps) => {
  const numSigsRequired =
    userRequirements?.length + locationRequirements?.length;

  const percentageComplete = completedSigs
    ? (completedSigs / numSigsRequired) * 100
    : 0;

  return (
    <Card.Base className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Card.Title>{title}</Card.Title>
          {isPinned ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-11">Pinned</span>
              <Icons.pin />
            </div>
          ) : (
            (isCompleted && <Icons.checkedCircle />) || null
          )}
        </div>
        <Card.Description>{description}</Card.Description>
      </div>
      <div className="flex gap-4 items-center justify-between">
        <QuestRequirementIcons
          userRequirements={userRequirements}
          locationRequirements={locationRequirements}
          isCompleted={isCompleted}
        />
        {isCompleted ? (
          <Card.Description>{"Quest Complete"}</Card.Description>
        ) : (
          <Card.Description>{`${
            completedSigs || 0
          }/${numSigsRequired} completed`}</Card.Description>
        )}
      </div>
      <Card.Progress
        style={{
          width: `${percentageComplete}%`,
        }}
      />
    </Card.Base>
  );
};

QuestCard.displayName = "QuestCard";
export { QuestCard };

import React from "react";
import { Card } from "./Card";
import { LocationRequirement, UserRequirement } from "@/types";
import { Icons } from "../Icons";
import Image from "next/image";
import { classed } from "@tw-classed/react";

type QuestCardProps = {
  title: string;
  description: string;
  userRequirements?: UserRequirement[];
  locationRequirements?: LocationRequirement[];
  completedSigs?: number; // number of completed signatures
  isCompleted: boolean; // whether the quest is completed
  isPinned?: boolean;
};

const CircleCard = classed.div(
  "flex border-2 -ml-[4px] border-gray-200 justify-center items-center h-6 w-6 rounded-full overflow-hidden float-none",
  {
    variants: {
      color: {
        white: "bg-white/10",
        gray: "bg-[#677363]",
      },
    },
    defaultVariants: {
      color: "white",
    },
  }
);

const QuestRequirementIcons = ({
  userRequirements = [],
  locationRequirements = [],
}: Pick<QuestCardProps, "userRequirements" | "locationRequirements">) => {
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
                color={isPersonRequirement ? "white" : "gray"}
              >
                {isPersonRequirement ? (
                  <Icons.person />
                ) : (
                  <Image
                    src="/icons/home.png"
                    height={12}
                    width={12}
                    alt="home image"
                  />
                )}
              </CircleCard>
            );
          })}
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

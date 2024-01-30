import React from "react";
import { Card } from "./Card";
import { LocationRequirement, UserRequirement } from "@/types";
import { cn } from "@/lib/client/utils";

type QuestCardProps = {
  title: string;
  description: string;
  userRequirements?: UserRequirement[];
  locationRequirements?: LocationRequirement[];
  completedSigs?: number; // number of completed signatures
};

const QuestRequirementIcons = ({
  userRequirements = [],
  locationRequirements = [],
}: Pick<QuestCardProps, "userRequirements" | "locationRequirements">) => {
  return (
    <div className="flex relative gap-1">
      {[...userRequirements, ...locationRequirements].map(
        (requirement, index) => {
          return (
            <div
              key={index}
              style={{
                marginLeft: `-${index}px`,
              }}
              className={cn(
                "relative w-6 h-6 ring-transparent bg-slate-200 rounded-full overflow-hidden"
              )}
            ></div>
          );
        }
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
}: QuestCardProps) => {
  const numSigsRequired =
    userRequirements?.length + locationRequirements?.length;

  const percentageComplete = completedSigs
    ? (completedSigs / numSigsRequired) * 100
    : 0;

  return (
    <Card.Base className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </div>
      <div className="flex  gap-4 items-center justify-between">
        <QuestRequirementIcons
          userRequirements={userRequirements}
          locationRequirements={locationRequirements}
        />
        <Card.Description>{`${completedSigs}/${numSigsRequired} completed`}</Card.Description>
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

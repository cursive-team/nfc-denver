import React from "react";
import { Card } from "./Card";

const QuestRequirementCard = () => {
  return (
    <Card.Base className="text-center flex justify-center py-4">
      <div className="flex flex-col gap-2 items-center">
        <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
        <div className="flex flex-col">
          <Card.Title>Quest title</Card.Title>
          <Card.Description>Complete</Card.Description>
        </div>
      </div>
      <Card.Progress />
    </Card.Base>
  );
};

QuestRequirementCard.displayName = "QuestRequirementCard";
export { QuestRequirementCard };

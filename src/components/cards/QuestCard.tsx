import React from "react";
import { Card } from "./Card";

type QuestCardProps = {
  title: string;
  description: string;
  numSigsRequired: number;
};

const QuestCard = ({ title, description, numSigsRequired }: QuestCardProps) => {
  return (
    <Card.Base className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <Card.Title>{title}</Card.Title>
        <Card.Description>{description}</Card.Description>
      </div>
      <div className="flex items-center justify-between">
        <>icons</>
        <Card.Description>{`0/${numSigsRequired} completed`}</Card.Description>
      </div>
      <Card.Progress />
    </Card.Base>
  );
};

QuestCard.displayName = "QuestCard";
export { QuestCard };

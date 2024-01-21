import React from "react";
import { Card } from "./Card";
import exp from "constants";

const QuestCard = () => {
  return (
    <Card.Base className="flex flex-col gap-4 p-3">
      <div className="flex flex-col gap-2">
        <Card.Title>Quest 1</Card.Title>
        <Card.Description>
          Visit the Optimism booth and lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Nulla commodo imperdiet lorem, non efficitur mi
          bibendum et.
        </Card.Description>
      </div>
      <div className="flex items-center justify-between">
        <>icons</>
        <Card.Description>0/1 completed</Card.Description>
      </div>
    </Card.Base>
  );
};

QuestCard.displayName = "QuestCard";
export { QuestCard };

import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { PointCard } from "@/components/cards/PointCard";
import { QuestRequirementCard } from "@/components/cards/QuestRequirementCard";
import { questListMock } from "@/mocks";
import { classed } from "@tw-classed/react";
import { useParams } from "next/navigation";
import React from "react";

type QuestDetailProps = {
  title: string;
  description: string;
};

const Label = classed.span("text-xs text-gray-10 font-light");

const QuestDetail = ({ title, description }: QuestDetailProps) => {
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
        <PointCard label="Reward" point={500} />
      </div>
    </div>
  );
};

export default function QuestById() {
  const params = useParams();
  const { id: questId } = params;

  // get quest item by id
  const questItem = questListMock.find(({ id }) => id === Number(questId));

  const requirements = questItem?.requirements?.length || 0;

  if (!questItem) return null; // quest item not present

  return (
    <div>
      <AppBackHeader />
      <div className="flex flex-col gap-8">
        <QuestDetail
          title={questItem?.title}
          description={questItem?.description}
        />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label>Requirements</Label>
            <Label>{`X/${requirements}`}</Label>
          </div>
          <div className="flex flex-col gap-2">
            {questItem?.requirements?.map(({ title, type }, index) => (
              <QuestRequirementCard
                key={index}
                title={title}
                questType={type}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

QuestById.getInitialProps = () => {
  return { showHeader: false };
};

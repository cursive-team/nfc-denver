import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { QuestRequirementCard } from "@/components/cards/QuestRequirementCard";
import React from "react";

export default function QuestById() {
  return (
    <div>
      <AppBackHeader />
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
            <span className="text-xl font-light leading-6">Quest name</span>
          </div>
          <button type="button" className="flex gap-2 items-center">
            <span className="text-gray-11 text-xs font-light">Pin</span>
            <Icons.pin />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          <span className=" text-gray-10 font-light">Requirements</span>
          <div className="flex flex-col gap-2">
            <QuestRequirementCard />
            <QuestRequirementCard />
            <QuestRequirementCard />
          </div>
        </div>
      </div>
    </div>
  );
}

QuestById.getInitialProps = () => {
  return { showHeader: false };
};

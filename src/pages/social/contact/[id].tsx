import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { CandyCard } from "@/components/cards/CandyCard";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
import React from "react";

export default function SocialDetail() {
  return (
    <div>
      <AppBackHeader />
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="h-32 w-32 rounded bg-slate-200"></div>
          <div className="flex flex-col gap-1">
            <h2 className=" text-xl font-gray-12 font-light">Name</h2>
            <div className="flex items-center gap-1">
              <Icons.checkedCircle />
              <span className="text-sm font-light text-white">
                Connected XXX
              </span>
            </div>
          </div>
        </div>
        <CandyCard />
        <ListLayout className="!gap-2" label="Links">
          <div className="flex flex-col gap-1">
            <Card.Base className="flex gap-2 p-3">
              <Card.Title>Telegram</Card.Title>
              <Card.Description>@telegram</Card.Description>
            </Card.Base>
            <Card.Base className="flex gap-2 p-3">
              <Card.Title>X</Card.Title>
              <Card.Description>@twitter</Card.Description>
            </Card.Base>
          </div>
        </ListLayout>
      </div>
    </div>
  );
}

SocialDetail.getInitialProps = () => {
  return { showHeader: false, showFooter: false };
};

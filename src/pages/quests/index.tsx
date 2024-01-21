import { Button } from "@/components/Button";
import { Icons } from "@/components/Icons";
import { QuestCard } from "@/components/cards/QuestCard";
import Link from "next/link";
import React from "react";

export default function QuestsPage() {
  return (
    <div className="flex flex-col gap-2">
      <Link href="/leaderboard">
        <Button size="tiny" align="left">
          <span>View leaderboard</span>
          <div className="ml-auto">
            <Icons.arrowRight />
          </div>
        </Button>
      </Link>
      <div className="flex flex-col gap-2">
        <Link href="/quests/1">
          <QuestCard />
        </Link>
      </div>
    </div>
  );
}

import { Button } from "@/components/Button";
import { Filters } from "@/components/Filters";
import { Icons } from "@/components/Icons";
import { QuestCard } from "@/components/cards/QuestCard";
import { questListMock } from "@/mocks";
import { QuestTagMapping } from "@/shared/constants";
import Link from "next/link";
import React, { useState } from "react";

export default function QuestsPage() {
  const [selectedOption, setSelectedOption] = useState("ALL");

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
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-900 font-light">Filters</span>
        <Filters
          label="Filters"
          defaultValue="ALL"
          object={QuestTagMapping}
          onChange={setSelectedOption}
        />
      </div>
      <div className="flex flex-col gap-2">
        {questListMock?.map(({ id, title, description }, index) => (
          <Link href={`/quests/${id}`} key={id}>
            <QuestCard title={title} description={description} />
          </Link>
        ))}
      </div>
    </div>
  );
}

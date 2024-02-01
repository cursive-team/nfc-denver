import { AppBackHeader } from "@/components/AppHeader";
import { Filters } from "@/components/Filters";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useGetLeaderboard } from "@/hooks/useLeaderboard";
import { classed } from "@tw-classed/react";
import React from "react";

type LeaderBoardType = "CONNECTIONS" | "CANDY";
const LeaderBoardMapping: Record<LeaderBoardType, string> = {
  CONNECTIONS: "Connections",
  CANDY: "Candy",
};

const TableWrapper = classed.div("grid grid-cols-[25px_200px_1fr] gap-4");
const TableHeaderLabel = classed.div(
  "text-gray-900 text-xs font-light uppercase"
);
const DisplayName = classed.span("text-gray-12 text-sm");
const Point = classed.span("text-gray-900 text-sm");
const PositionCard = classed.div(
  "duration-200 w-6 h-6 text-white text-xs flex items-center justify-center rounded-full",
  {
    variants: {
      active: {
        false: "bg-gray-300",
        true: "bg-[#677363]",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);
export default function LeaderBoard() {
  const [selectedOption, setSelectedOption] =
    React.useState<LeaderBoardType>("CONNECTIONS");
  const { isLoading, data: leaderboard = [] } = useGetLeaderboard();

  const activeLabel = LeaderBoardMapping[selectedOption];

  return (
    <div>
      <AppBackHeader />
      <div className="flex flex-col gap-6 pb-6">
        <Filters
          defaultValue="CONNECTIONS"
          object={LeaderBoardMapping}
          onChange={setSelectedOption}
        />
        <div className="flex flex-col gap-2">
          <TableWrapper>
            <TableHeaderLabel className="text-center">#</TableHeaderLabel>
            <TableHeaderLabel>Display name</TableHeaderLabel>
            <TableHeaderLabel className="text-right">
              {activeLabel}
            </TableHeaderLabel>
          </TableWrapper>
          <LoadingWrapper
            isLoading={isLoading}
            className="flex flex-col gap-[6px]"
            fallback={<Placeholder.List type="line" items={20} />}
          >
            {leaderboard?.map(({ name, connections, points }, index) => {
              const position = index + 1;
              const active = false;

              return (
                <TableWrapper key={index}>
                  <PositionCard active={active}>{position}</PositionCard>
                  <DisplayName>{name}</DisplayName>
                  <Point className="text-right">
                    {selectedOption === "CONNECTIONS" ? connections : points}
                  </Point>
                </TableWrapper>
              );
            })}
          </LoadingWrapper>
        </div>
      </div>
    </div>
  );
}

LeaderBoard.getInitialProps = () => {
  return { fullPage: true };
};

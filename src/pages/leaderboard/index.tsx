import { AppBackHeader } from "@/components/AppHeader";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useGetLeaderboard } from "@/hooks/useLeaderboard";
import { getAuthToken } from "@/lib/client/localStorage";
import { classed } from "@tw-classed/react";
import React, { useMemo, useRef } from "react";

const TableWrapper = classed.div(
  "grid grid-cols-[25px_200px_1fr] items-center gap-4"
);
const TableHeaderLabel = classed.div(
  "text-gray-900 text-xs font-light uppercase"
);
const DisplayName = classed.span("text-gray-12 text-sm leading-5");
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
  const authToken = useMemo(getAuthToken, []);
  const { isLoading, data: leaderboard = [] } = useGetLeaderboard(authToken);

  const currentUserRank = useRef(0);

  const getLeaderboardData = () => {
    let rank = 0;
    let prevConnections: Number | undefined;
    let skip = 1;

    return leaderboard?.map(({ name, connections, isCurrentUser }, index) => {
      if (index === 0 || connections !== prevConnections) {
        prevConnections = connections;
        rank += skip;
        skip = 1;
      } else {
        skip++;
      }
      const active = isCurrentUser;

      currentUserRank.current = active ? rank : 0;

      return (
        <TableWrapper key={index}>
          <PositionCard active={active}>{rank}</PositionCard>
          <DisplayName>{name}</DisplayName>
          <Point className="text-right">{connections}</Point>
        </TableWrapper>
      );
    });
  };

  return (
    <div>
      <AppBackHeader
        actions={
          !isLoading && (
            <div className="flex gap-0.5 text-sm">
              <span className="text-gray-900">Your rank:</span>
              <span className="text-gray-12">{currentUserRank.current}</span>
            </div>
          )
        }
      />
      <div className="flex flex-col gap-6 pb-6">
        <div className="flex flex-col gap-4">
          <TableWrapper>
            <TableHeaderLabel className="text-center">#</TableHeaderLabel>
            <TableHeaderLabel>Display name</TableHeaderLabel>
            <TableHeaderLabel className="text-right">
              Connections
            </TableHeaderLabel>
          </TableWrapper>
          <LoadingWrapper
            isLoading={isLoading}
            className="flex flex-col gap-[6px]"
            fallback={<Placeholder.List type="line" items={20} />}
          >
            {getLeaderboardData()}
          </LoadingWrapper>
        </div>
      </div>
    </div>
  );
}

LeaderBoard.getInitialProps = () => {
  return { fullPage: true };
};

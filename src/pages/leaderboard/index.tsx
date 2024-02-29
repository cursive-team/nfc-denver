import { AppBackHeader } from "@/components/AppHeader";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useGetLeaderboard } from "@/hooks/useLeaderboard";
import { getAuthToken } from "@/lib/client/localStorage";
import { classed } from "@tw-classed/react";
import React, { useEffect, useMemo, useState } from "react";

const TableWrapper = classed.div(
  "grid grid-cols-[25px_200px_1fr] items-center gap-4"
);
const TableHeaderLabel = classed.div(
  "text-gray-900 text-xs font-light uppercase"
);
const DisplayName = classed.span("text-gray-12 text-sm leading-5 font-light");
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

  const [currentUserRank, setCurrentUserRank] = useState<number | undefined>();

  useEffect(() => {
    if (leaderboard) {
      let rank = 0;
      let prevConnections: Number | undefined;
      let skip = 1;

      for (let i = 0; i < leaderboard.length; i++) {
        const { connections, isCurrentUser } = leaderboard[i];

        if (i === 0 || connections !== prevConnections) {
          prevConnections = connections;
          rank += skip;
          skip = 1;
        } else {
          skip++;
        }

        if (isCurrentUser) {
          setCurrentUserRank(rank);
          break;
        }
      }
    }
  }, [leaderboard]);

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

      return (
        <TableWrapper key={index}>
          <PositionCard active={isCurrentUser}>{rank}</PositionCard>
          <DisplayName className=" font-re">
            {name}{" "}
            {isCurrentUser && <span className="text-gray-10">(you)</span>}
          </DisplayName>
          <Point className="text-right">{connections}</Point>
        </TableWrapper>
      );
    });
  };

  return (
    <div>
      <AppBackHeader
        actions={
          !isLoading &&
          currentUserRank && (
            <div className="flex gap-0.5 text-sm">
              <span className="text-gray-900">Your rank:</span>
              <span className="text-gray-12">{currentUserRank}</span>
            </div>
          )
        }
      />
      <div className="flex flex-col gap-6 pb-6">
        <div className="flex flex-col gap-4">
          <span className="text-gray-900 text-xs font-light">
            {"The leaderboard is based on the number of taps you've "}{" "}
            <i>given.</i> {"To complete quests however, you must "}{" "}
            <i>receive</i> {" a tap."}
          </span>
          <TableWrapper>
            <TableHeaderLabel className="text-center">#</TableHeaderLabel>
            <TableHeaderLabel>Display name</TableHeaderLabel>
            <TableHeaderLabel className="text-right">
              Taps given
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

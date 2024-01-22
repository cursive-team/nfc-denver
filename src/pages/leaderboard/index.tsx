import { AppBackHeader } from "@/components/AppHeader";
import { Filters } from "@/components/Filters";
import React from "react";

const LeaderBoardMapping: Record<"CONNECTIONS" | "CANDY", string> = {
  CONNECTIONS: "Connections",
  CANDY: "Candy",
};

export default function LeaderBoard() {
  const [selectedOption, setSelectedOption] = React.useState("CONNECTIONS");

  return (
    <div>
      <AppBackHeader />
      <div className="flex flex-col gap-6">
        <Filters
          label="Sort"
          defaultValue="CONNECTIONS"
          object={LeaderBoardMapping}
          onChange={setSelectedOption}
        />
      </div>
    </div>
  );
}

LeaderBoard.getInitialProps = () => {
  return { fullPage: true };
};

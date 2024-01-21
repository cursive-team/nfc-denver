import { AppBackHeader } from "@/components/AppHeader";
import React from "react";

export default function QuestById() {
  return (
    <div>
      <AppBackHeader />
      QuestById
    </div>
  );
}

QuestById.getInitialProps = () => {
  return { showHeader: false };
};

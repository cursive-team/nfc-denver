export const APP_CONFIG = {
  APP_NAME: "nfc-denver",
};

export const QuestTagMapping: Record<
  "ALL" | "IN_PROGRESS" | "COMPLETED",
  string
> = {
  ALL: "All",
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
};

export const StoreSortMapping: Record<"ALL" | "UNLOCKED" | "REDEEMED", string> =
  {
    ALL: "All",
    UNLOCKED: "Unlocked",
    REDEEMED: "Redeemed",
  };

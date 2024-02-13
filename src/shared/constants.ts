export const APP_CONFIG = {
  APP_NAME: "BUIDLQuest",
  SUPPORT_EMAIL: "help@buidlquest.xyz",
};

export type StoreSortMappingType = "ALL" | "UNLOCKED" | "REDEEMED";
export type QuestTagMappingType = "ALL" | "IN_PROGRESS" | "COMPLETED";

export const QuestTagMapping: Record<QuestTagMappingType, string> = {
  ALL: "All",
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
};

export const StoreSortMapping: Record<StoreSortMappingType, string> = {
  ALL: "All",
  UNLOCKED: "Unlocked",
  REDEEMED: "Redeemed",
};

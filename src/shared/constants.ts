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

export const StoreSortMapping: Record<
  "ASC" | "POINT_ASC" | "POINT_DESC",
  string
> = {
  ASC: "A-Z",
  POINT_ASC: "BUIDL High",
  POINT_DESC: "BUIDL Low",
};

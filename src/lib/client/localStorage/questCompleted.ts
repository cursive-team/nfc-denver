import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const QUEST_COMPLETED_STORAGE_KEY = "questCompleted";

export type QuestCompleted = {
  id: string; // Quest id
  name: string; // Quest name
  pfId: string; // Id for proof of quest completion
  ts: string; // Timestamp as ISO string
};

export const saveAllQuestCompleted = (
  questCompleted: Record<string, QuestCompleted>
): void => {
  saveToLocalStorage(
    QUEST_COMPLETED_STORAGE_KEY,
    JSON.stringify(questCompleted)
  );
};

export const getAllQuestCompleted = (): Record<string, QuestCompleted> => {
  const questCompleted = getFromLocalStorage(QUEST_COMPLETED_STORAGE_KEY);
  if (questCompleted) {
    return JSON.parse(questCompleted);
  }

  return {};
};

export const saveQuestCompleted = (questCompleted: QuestCompleted): void => {
  const allQuestCompleted = getAllQuestCompleted();
  allQuestCompleted[questCompleted.id] = questCompleted;

  saveAllQuestCompleted(allQuestCompleted);
};

export const getQuestCompleted = (
  questId: string
): QuestCompleted | undefined => {
  const allQuestCompleted = getAllQuestCompleted();

  return allQuestCompleted[questId];
};

export const deleteAllQuestCompleted = (): void => {
  deleteFromLocalStorage(QUEST_COMPLETED_STORAGE_KEY);
};

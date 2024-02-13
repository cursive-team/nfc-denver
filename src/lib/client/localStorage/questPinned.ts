import { getFromLocalStorage, saveToLocalStorage } from ".";

export const PINNED_QUEST_STORAGE_KEY = "pinnedQuest";

export const togglePinQuestById = (questId: number): Set<number> => {
  let newList: number[] = [];
  const storedPinnedQuests = getFromLocalStorage(PINNED_QUEST_STORAGE_KEY);

  if (storedPinnedQuests) {
    newList = [...JSON.parse(storedPinnedQuests)];
  }

  // add quest quest when is not pinned yet or remove from the storage
  if (newList.includes(questId)) {
    newList = newList.filter((item) => item !== questId);
  } else {
    newList.push(questId);
  }

  saveToLocalStorage(PINNED_QUEST_STORAGE_KEY, JSON.stringify(newList));

  return new Set(newList);
};

export const getPinnedQuest = (): Set<number> => {
  const storedPinnedQuests: string | null = getFromLocalStorage(
    PINNED_QUEST_STORAGE_KEY
  );
  if (storedPinnedQuests) {
    return new Set(JSON.parse(storedPinnedQuests));
  }

  return new Set([]);
};

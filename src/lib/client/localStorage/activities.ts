import { getFromLocalStorage, saveToLocalStorage } from ".";
import { JUB_SIGNAL_MESSAGE_TYPE } from "../jubSignal";

export const ACTIVITIES_STORAGE_KEY = "activities";

export type Activity = {
  type: JUB_SIGNAL_MESSAGE_TYPE; // Activity type
  name: string; // Display name for the activity
  id: string; // Id for the activity
  ts: string; // Timestamp as ISO string
};

export const saveActivities = (activities: Activity[]): void => {
  saveToLocalStorage(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
};

export const getActivities = (): Activity[] => {
  const activities = getFromLocalStorage(ACTIVITIES_STORAGE_KEY);
  if (activities) {
    return JSON.parse(activities);
  }

  return [];
};

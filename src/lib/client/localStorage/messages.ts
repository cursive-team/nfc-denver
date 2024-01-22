import { Message } from "@/lib/client/jubSignal";
import { getFromLocalStorage, saveToLocalStorage } from ".";

// Overwrites existing messages in profile
export const writeMessages = (messages: Message[]): void => {
  saveToLocalStorage("messages", JSON.stringify(messages));
};

export const getMessages = (): Message[] => {
  const messages = getFromLocalStorage("messages");
  if (messages) {
    return JSON.parse(messages);
  }

  return [];
};

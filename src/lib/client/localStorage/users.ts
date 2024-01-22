import { hashPublicKeyToUUID } from "@/lib/client/utils";
import { PersonTapResponse } from "@/pages/api/tap";
import { getFromLocalStorage, saveToLocalStorage } from ".";

export type User = {
  displayName: string;
  encryptionPublicKey: string;
  twitterUsername?: string;
  telegramUsername?: string;
};

export const saveUsers = (users: Record<string, User>): void => {
  saveToLocalStorage("users", JSON.stringify(users));
};

export const getUsers = (): Record<string, User> => {
  const users = getFromLocalStorage("users");
  if (users) {
    return JSON.parse(users);
  }

  return {};
};

// Populate user information based on a tap
export const updateUserFromTap = async (
  userUpdate: PersonTapResponse
): Promise<string> => {
  const users = getUsers();
  const userId = await hashPublicKeyToUUID(userUpdate.encryptionPublicKey);
  const user = users[userId];

  if (user) {
    const updatedUser = { ...user, ...userUpdate };
    users[userId] = updatedUser;
  } else {
    const newUser = {
      ...userUpdate,
    };
    users[userId] = newUser;
  }

  saveUsers(users);

  return userId;
};

// Users are stored based on the hash of their encryption public key
export const fetchUserByEncryptionPublicKey = async (
  encryptionPublicKey: string
): Promise<User | undefined> => {
  const userId = await hashPublicKeyToUUID(encryptionPublicKey);

  return fetchUserByUUID(userId);
};

export const fetchUserByUUID = (userId: string): User | undefined => {
  const users = getUsers();

  return users[userId];
};

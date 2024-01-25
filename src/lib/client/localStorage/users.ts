import { hashPublicKeyToUUID } from "@/lib/client/utils";
import { PersonTapResponse } from "@/pages/api/tap";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const USERS_STORAGE_KEY = "users";

export type User = {
  displayName: string;
  encryptionPublicKey: string;
  twitterUsername?: string;
  telegramUsername?: string;
};

export const saveUsers = (users: Record<string, User>): void => {
  saveToLocalStorage(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const getUsers = (): Record<string, User> => {
  const users = getFromLocalStorage(USERS_STORAGE_KEY);
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

export const deleteAllUsers = (): void => {
  deleteFromLocalStorage(USERS_STORAGE_KEY);
};

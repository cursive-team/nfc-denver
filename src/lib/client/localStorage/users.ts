import { hashPublicKeyToUUID } from "@/lib/client/utils";
import { PersonTapResponse } from "@/pages/api/tap/cmac";
import {
  deleteFromLocalStorage,
  getFromLocalStorage,
  saveToLocalStorage,
} from ".";

export const USERS_STORAGE_KEY = "users";

export type User = {
  name: string; // User's display name
  encPk: string; // User's encryption public key
  pkId: string; // User's public key index for FHE
  x?: string; // User's Twitter username
  tg?: string; // User's Telegram username
  fc?: string; // User's Farcaster username
  bio?: string; // User's bio
  note?: string; // Private note
  sigPk?: string; // User's signature public key
  msg?: string; // User's signature message
  sig?: string; // User's signature
  outTs?: string; // Time of last outbound tap as ISO string
  inTs?: string; // Time of last inbound tap as ISO string
  mr1?: string; // User's message for round 1
  r1O?: string; // Round 1 output for PSI with this user
  mr2?: string; // User's message for round 2
  r2O?: string; // Round 2 output for PSI with this user
  mr3?: string; // User's message for round 3
  oI?: string; // User's PSI overlap indices
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
    const updatedUser = {
      ...user,
      name: userUpdate.displayName,
      encPk: userUpdate.encryptionPublicKey,
      pkId: userUpdate.id,
      mr1: userUpdate.psiRound1Message,
    };

    users[userId] = updatedUser;
  } else {
    const newUser = {
      name: userUpdate.displayName,
      encPk: userUpdate.encryptionPublicKey,
      pkId: userUpdate.id,
      mr1: userUpdate.psiRound1Message,
    };

    users[userId] = newUser;
  }

  saveUsers(users);

  return userId;
};

// Update user information after an outbound tap
export const updateUserFromOutboundTap = async (
  encryptionPublicKey: string,
  privateNote?: string
): Promise<void> => {
  const users = getUsers();
  const userId = await hashPublicKeyToUUID(encryptionPublicKey);
  const user = users[userId];

  if (!user) {
    return;
  }

  const updatedUser = {
    ...user,
    note: privateNote,
    outTs: new Date().toISOString(),
  };

  users[userId] = updatedUser;
  saveUsers(users);
};

// Save PSI round 1 output for a user
export const saveUserRound1Output = async (
  userEncPk: string,
  round1Output: string
) => {
  const users = getUsers();
  const userId = await hashPublicKeyToUUID(userEncPk);
  const user = users[userId];

  if (!user) {
    return;
  }

  const updatedUser = {
    ...user,
    r1O: round1Output,
  };

  users[userId] = updatedUser;
  saveUsers(users);
};

export const saveUserRound2Output = async (
  userId: string,
  round2Output: string
) => {
  const users = getUsers();
  const user = users[userId];

  if (!user) {
    return;
  }

  const updatedUser = {
    ...user,
    r2O: round2Output,
  };

  users[userId] = updatedUser;
  saveUsers(users);
};

export const saveUserRound3Message = async (
  userId: string,
  messageRound3: string
) => {
  const users = getUsers();
  const user = users[userId];

  if (!user) {
    return;
  }

  const updatedUser = {
    ...user,
    mr3: messageRound3,
  };

  users[userId] = updatedUser;
  saveUsers(users);
};

export const saveUserPSI = async (
  userId: string,
  overlapIndices: string
): Promise<void> => {
  const users = getUsers();
  const user = users[userId];

  if (!user) {
    return;
  }

  // delete all other data to save space
  const updatedUser = {
    ...user,
    mr1: undefined,
    r1O: undefined,
    mr2: undefined,
    r2O: undefined,
    mr3: undefined,
    oI: overlapIndices,
  };

  users[userId] = updatedUser;
  saveUsers(users);
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

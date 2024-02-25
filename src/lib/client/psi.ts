import init, { gen_keys_js, round2_js, round3_js } from "@/lib/mp_psi";
import {
  Activity,
  Keys,
  User,
  getKeys,
  getLocationSignatures,
  getUsers,
} from "./localStorage";
import { MessageRequest } from "@/pages/api/messages";
import {
  getUserPsiState,
  saveUserPsiState,
  saveUserRound2Output,
  userPsiStateKeys,
} from "./indexedDB/psi";
import {
  JUB_SIGNAL_MESSAGE_TYPE,
  encryptDecryptionSharesMessage,
} from "./jubSignal";

export const generatePSIKeys = async () => {
  await init();
  const gen_keys_output = gen_keys_js();

  return {
    psiPrivateKeys: gen_keys_output.psi_keys,
    psiPublicKeys: gen_keys_output.message_round1,
  };
};

export const generateSelfBitVector = (): Uint32Array => {
  let bitVector = new Uint32Array(25000).fill(0);
  let users = getUsers();
  let locations = getLocationSignatures();

  // 0-19999 reserved for users
  for (let id in users) {
    let user = users[id];
    // don't include yourself in PSI
    if (user.pkId && user.pkId !== "0") {
      let index = parseInt(user.pkId);
      if (index < bitVector.length) {
        bitVector[index] = 1;
      }
    }
  }

  // 20001-25000 reserved for locations
  for (let id in locations) {
    let location = locations[id];
    if (location.id) {
      let index = parseInt(location.id);
      if (index < bitVector.length) {
        bitVector[20000 + index] = 1;
      }
    }
  }

  return bitVector;
};

export const handleRound2MessageRequests = async (
  keys: Keys,
  selfPkId: string
): Promise<MessageRequest[]> => {
  let messageRequests: MessageRequest[] = [];
  const users = getUsers();
  const userPsiStateValidKeys = await userPsiStateKeys();

  for (const userId in users) {
    // don't waste time reading IndexedDB if keys are not present
    if (!userPsiStateValidKeys.includes(userId)) {
      continue;
    }

    const user = users[userId];
    const userPsiState = await getUserPsiState(userId);
    if (!userPsiState) {
      continue;
    }

    if (
      userPsiState.pkId &&
      userPsiState.r1O &&
      userPsiState.mr2 &&
      !userPsiState.r2O
    ) {
      await init();
      const round2Output = round2_js(
        {
          psi_keys: JSON.parse(keys.psiPrivateKeys),
          message_round1: JSON.parse(keys.psiPublicKeys),
        },
        JSON.parse(userPsiState.r1O),
        JSON.parse(userPsiState.mr2),
        parseInt(selfPkId) > parseInt(userPsiState.pkId)
      );
      await saveUserRound2Output(userId, JSON.stringify(round2Output));

      const recipientPublicKey = user.encPk;
      const senderPrivateKey = keys.encryptionPrivateKey;
      const encryptedMessage = await encryptDecryptionSharesMessage(
        JSON.stringify(round2Output.message_round3),
        senderPrivateKey,
        recipientPublicKey
      );
      messageRequests.push({
        recipientPublicKey,
        encryptedMessage,
      });
    }
  }

  return messageRequests;
};

export const handleOverlapActivities = async (): Promise<Activity[]> => {
  const newActivities: Activity[] = [];
  const users = getUsers();
  const userPsiStateValidKeys = await userPsiStateKeys();
  for (const userId in users) {
    if (!userPsiStateValidKeys.includes(userId)) {
      continue;
    }

    const user = users[userId];
    const userPsiState = await getUserPsiState(userId);
    if (!userPsiState) {
      continue;
    }

    if (userPsiState.r2O && userPsiState.mr3 && !userPsiState.oI) {
      await init();
      const psiOutput = round3_js(
        JSON.parse(userPsiState.r2O),
        JSON.parse(userPsiState.mr3)
      );

      let overlapIndices = [];
      for (let i = 0; i < psiOutput.length; i++) {
        if (psiOutput[i] === 1) {
          overlapIndices.push(i);
        }
      }
      await saveUserPsiState(userId, { oI: JSON.stringify(overlapIndices) });
      newActivities.push({
        type: JUB_SIGNAL_MESSAGE_TYPE.DECRYPTION_SHARES,
        name: user.name,
        id: userId,
        ts: new Date().toISOString(),
      });
    }
  }

  return newActivities;
};

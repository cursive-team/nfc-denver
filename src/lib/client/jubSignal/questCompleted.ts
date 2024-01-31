import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type QuestCompletedMessage = {
  id: string; // Quest id
  name: string; // Quest name
  pfId: string; // Id for proof of quest completion
};

export const questCompletedMessageSchema = object({
  id: string().required(),
  name: string().required(),
  pfId: string().required(),
});

export type EncryptQuestCompletedMessageArgs = {
  questId: string;
  questName: string;
  proofId: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptQuestCompletedMessage({
  questId,
  questName,
  proofId,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptQuestCompletedMessageArgs): Promise<string> {
  const messageData: QuestCompletedMessage = {
    id: questId,
    name: questName,
    pfId: proofId,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.QUEST_COMPLETED,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}

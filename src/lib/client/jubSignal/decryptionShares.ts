import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type DecryptionSharesMessage = {
  messageRound3: string;
};

export const decryptionSharesMessageSchema = object({
  messageRound3: string().required(),
});

export async function encryptDecryptionSharesMessage(
  messageRound3: string,
  senderPrivateKey: string,
  recipientPublicKey: string
): Promise<string> {
  const messageData: DecryptionSharesMessage = {
    messageRound3,
  };

  return await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.DECRYPTION_SHARES,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );
}

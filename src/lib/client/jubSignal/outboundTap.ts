import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type OutboundTapMessage = {
  name: string; // Display name of other user
  pk: string; // Encryption public key of user
  x?: string; // Twitter handle
  tg?: string; // Telegram handle
  note?: string; // Private note
};

export const outboundTapMessageSchema = object({
  name: string().required(),
  pk: string().required(),
  x: string().optional(),
  tg: string().optional(),
  note: string().optional(),
});

export type EncryptOutboundTapMessageArgs = {
  displayName: string;
  encryptionPublicKey: string;
  twitterUsername?: string;
  telegramUsername?: string;
  privateNote?: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptOutboundTapMessage({
  displayName,
  encryptionPublicKey,
  twitterUsername,
  telegramUsername,
  privateNote,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptOutboundTapMessageArgs): Promise<string> {
  const messageData: OutboundTapMessage = {
    name: displayName,
    pk: encryptionPublicKey,
    x: twitterUsername,
    tg: telegramUsername,
    note: privateNote,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}

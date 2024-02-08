import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type InboundTapMessage = {
  x?: string; // Twitter handle
  tg?: string; // Telegram handle
  bio?: string; // Bio
  pk: string; // Signature public key
  msg: string; // Signature message
  sig: string; // Signature
};

export const inboundTapMessageSchema = object({
  x: string().optional(),
  tg: string().optional(),
  bio: string().optional(),
  pk: string().required(),
  msg: string().required(),
  sig: string().required(),
});

export type EncryptInboundTapMessageArgs = {
  twitterUsername?: string;
  telegramUsername?: string;
  bio?: string;
  signaturePublicKey: string;
  signatureMessage: string;
  signature: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptInboundTapMessage({
  twitterUsername,
  telegramUsername,
  bio,
  signaturePublicKey,
  signatureMessage,
  signature,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptInboundTapMessageArgs): Promise<string> {
  const messageData: InboundTapMessage = {
    x: twitterUsername,
    tg: telegramUsername,
    bio,
    pk: signaturePublicKey,
    msg: signatureMessage,
    sig: signature,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.INBOUND_TAP,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}

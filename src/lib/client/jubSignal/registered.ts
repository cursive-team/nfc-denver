import { object, string } from "yup";
import { JUB_SIGNAL_MESSAGE_TYPE, encryptMessage } from ".";

export type RegisteredMessage = {
  pk: string; // Signature public key
  msg: string; // Signature message
  sig: string; // Signature
};

export const registeredMessageSchema = object({
  pk: string().required(),
  msg: string().required(),
  sig: string().required(),
});

export type EncryptRegisteredMessageArgs = {
  signaturePublicKey: string;
  signatureMessage: string;
  signature: string;
  senderPrivateKey: string;
  recipientPublicKey: string;
};

export async function encryptRegisteredMessage({
  signaturePublicKey,
  signatureMessage,
  signature,
  senderPrivateKey,
  recipientPublicKey,
}: EncryptRegisteredMessageArgs): Promise<string> {
  const messageData: RegisteredMessage = {
    pk: signaturePublicKey,
    msg: signatureMessage,
    sig: signature,
  };

  const encryptedMessage = await encryptMessage(
    JUB_SIGNAL_MESSAGE_TYPE.REGISTERED,
    messageData,
    senderPrivateKey,
    recipientPublicKey
  );

  return encryptedMessage;
}

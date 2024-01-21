import { object, string, date } from "yup";
import { decrypt, encrypt } from "./encryption";

export const DEFAULT_MESSAGE_TYPE = "TAP";

export type MessageContents = {
  type: string;
  data: object;
};

export const messageContentsSchema = object({
  type: string().required(),
  data: object().required(),
});

export type EncryptedMessage = {
  to: string;
  from: string;
  encryptedContents: string;
  timestamp: Date;
};

export const encryptedMessageSchema = object({
  to: string().required(),
  from: string().required(),
  encryptedContents: string().required(),
  timestamp: date().required(),
});

export type Message = {
  to: string;
  from: string;
  type: string;
  data: object;
  timestamp: Date;
};

export const encryptMessage = async (
  type: string,
  data: object,
  senderPrivateKey: string,
  recipientPublicKey: string
): Promise<string> => {
  const messageContents: MessageContents = { type, data };

  return await encrypt(
    senderPrivateKey,
    recipientPublicKey,
    JSON.stringify(messageContents)
  );
};

export const decryptMessage = async (
  encryptedMessage: EncryptedMessage,
  recipientPrivateKey: string
): Promise<Message> => {
  await encryptedMessageSchema.validate(encryptedMessage);

  const decryptedContents = await decrypt(
    recipientPrivateKey,
    encryptedMessage.from,
    encryptedMessage.encryptedContents
  );

  if (!decryptedContents) {
    throw new Error("Decryption failed.");
  }

  const messageContents: MessageContents = JSON.parse(decryptedContents);
  await messageContentsSchema.validate(messageContents);

  return {
    to: encryptedMessage.to,
    from: encryptedMessage.from,
    type: messageContents.type,
    data: messageContents.data,
    timestamp: encryptedMessage.timestamp,
  };
};

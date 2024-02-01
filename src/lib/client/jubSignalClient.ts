import {
  JUB_SIGNAL_MESSAGE_TYPE,
  PlaintextMessage,
  decryptMessage,
  encryptedMessageSchema,
  inboundTapMessageSchema,
  locationTapMessageSchema,
  outboundTapMessageSchema,
} from "./jubSignal";
import {
  Activity,
  LocationSignature,
  User,
  getActivities,
  getKeys,
  getLocationSignatures,
  getProfile,
  getSession,
  getUsers,
  saveActivities,
  saveLocationSignatures,
  saveSession,
  saveUsers,
} from "./localStorage";
import { hashPublicKeyToUUID } from "./utils";

// Loads messages from the server and updates the local storage
// Uses the lastMessageFetchTimestamp from the session to determine the start date for the fetch
// If forceRefresh is true, fetches all messages from the server
export const loadMessages = async ({
  forceRefresh,
}: {
  forceRefresh: boolean;
}): Promise<void> => {
  const session = getSession();
  if (!session || session.authToken.expiresAt < new Date()) {
    console.error("Invalid session while trying to load messages");
    throw new Error("Invalid session while trying to load messages");
  }

  const profile = getProfile();
  const keys = getKeys();
  if (!profile || !keys) {
    console.error("Error loading profile and keys from local storage");
    throw new Error("Error loading profile and keys from local storage");
  }

  // Fetch jubSignal messages from server
  const previousMessageFetchTime = session.lastMessageFetchTimestamp;
  const newMessageFetchTime = new Date();
  const urlStartFilter =
    previousMessageFetchTime && !forceRefresh
      ? `?startDate=${encodeURIComponent(
          previousMessageFetchTime.toISOString()
        )}`
      : "";
  const url =
    `/api/messages?token=${encodeURIComponent(
      session.authToken.value
    )}?endDate=${encodeURIComponent(newMessageFetchTime.toISOString())}` +
    urlStartFilter;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Error fetching jubSignal messages from server");
    throw new Error("Error fetching jubSignal messages from server");
  }

  // Decrypt messages and update localStorage with decrypted messages
  // Start with empty users, location signatures, activities if forceRefresh is true
  const messages = await response.json();
  const existingUsers = forceRefresh ? {} : getUsers();
  const existingLocationSignatures = forceRefresh
    ? {}
    : getLocationSignatures();
  const existingActivities = forceRefresh ? [] : getActivities();
  const { newUsers, newLocationSignatures, newActivities } =
    await processEncryptedMessages({
      messages,
      recipientPrivateKey: keys.encryptionPrivateKey,
      recipientPublicKey: profile.encryptionPublicKey,
      existingUsers,
      existingLocationSignatures,
      existingActivities,
    });

  // Save users, location signatures, activities to localStorage
  saveUsers(newUsers);
  saveLocationSignatures(newLocationSignatures);
  saveActivities(newActivities);

  // Update the session
  session.lastMessageFetchTimestamp = newMessageFetchTime;
  saveSession(session);
};

// Helper function to process encrypted messages and update users, location signatures, activities
const processEncryptedMessages = async (args: {
  messages: any[];
  recipientPrivateKey: string;
  recipientPublicKey: string;
  existingUsers: Record<string, User>;
  existingLocationSignatures: Record<string, LocationSignature>;
  existingActivities: Activity[];
}): Promise<{
  newUsers: Record<string, User>;
  newLocationSignatures: Record<string, LocationSignature>;
  newActivities: Activity[];
}> => {
  const {
    messages,
    recipientPrivateKey,
    recipientPublicKey,
    existingUsers: users,
    existingLocationSignatures: locationSignatures,
    existingActivities: activities,
  } = args;

  activities.reverse(); // We will reverse the activities array at the end - this is for faster array operations

  for (const message of messages) {
    let decryptedMessage: PlaintextMessage;
    try {
      const encryptedMessage = await encryptedMessageSchema.validate(message);
      decryptedMessage = await decryptMessage(
        encryptedMessage,
        recipientPrivateKey
      );
    } catch (error) {
      console.error("Invalid message received from server: ", message);
      continue;
    }

    const { metadata, type, data } = decryptedMessage;

    switch (type) {
      case JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP:
        try {
          if (metadata.fromPublicKey !== recipientPublicKey) {
            throw new Error(
              "Invalid message: outbound tap messages must be sent from self"
            );
          }

          const { name, pk, x, tg, note } =
            await outboundTapMessageSchema.validate(data);
          const userId = await hashPublicKeyToUUID(pk);
          const user = users[userId];
          if (user) {
            user.name = name;
            user.encPk = pk;
            user.x = user.x && x === undefined ? user.x : x;
            user.tg = user.tg && tg === undefined ? user.tg : tg;
            user.note = note;
            user.outTs = metadata.timestamp.toISOString();

            users[userId] = user;
          } else {
            users[userId] = {
              name,
              encPk: pk,
              x,
              tg,
              note,
              outTs: metadata.timestamp.toISOString(),
            };
          }

          const activity = {
            type: JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP,
            name,
            id: userId,
            ts: metadata.timestamp.toISOString(),
          };
          activities.push(activity);
        } catch (error) {
          console.error(
            "Invalid outbound tap message received from server: ",
            message
          );
        } finally {
          break;
        }
      case JUB_SIGNAL_MESSAGE_TYPE.INBOUND_TAP:
        // TODO: Can optionally validate received signature here
        try {
          const { x, tg, pk, msg, sig } =
            await inboundTapMessageSchema.validate(data);
          const userId = await hashPublicKeyToUUID(metadata.fromPublicKey);
          const user = users[userId];
          if (user) {
            user.name = metadata.fromDisplayName;
            user.encPk = metadata.fromPublicKey;
            user.x = x;
            user.tg = tg;
            user.sigPk = pk;
            user.msg = msg;
            user.sig = sig;
            user.inTs = metadata.timestamp.toISOString();

            users[userId] = user;
          } else {
            users[userId] = {
              name: metadata.fromDisplayName,
              encPk: metadata.fromPublicKey,
              x,
              tg,
              sigPk: pk,
              msg,
              sig,
              inTs: metadata.timestamp.toISOString(),
            };
          }

          const activity = {
            type: JUB_SIGNAL_MESSAGE_TYPE.INBOUND_TAP,
            name: metadata.fromDisplayName,
            id: userId,
            ts: metadata.timestamp.toISOString(),
          };
          activities.push(activity);
        } catch (error) {
          console.error(
            "Invalid inbound tap message received from server: ",
            message
          );
        } finally {
          break;
        }
      case JUB_SIGNAL_MESSAGE_TYPE.LOCATION_TAP:
        try {
          if (metadata.fromPublicKey !== recipientPublicKey) {
            throw new Error(
              "Invalid message: location tap messages must be sent from self"
            );
          }

          const { id, name, pk, msg, sig } =
            await locationTapMessageSchema.validate(data);
          const location = locationSignatures[id];
          if (location) {
            location.id = id;
            location.name = name;
            location.pk = pk;
            location.msg = msg;
            location.sig = sig;
            location.ts = metadata.timestamp.toISOString();

            locationSignatures[id] = location;
          } else {
            locationSignatures[id] = {
              id,
              name,
              pk,
              msg,
              sig,
              ts: metadata.timestamp.toISOString(),
            };
          }

          const activity = {
            type: JUB_SIGNAL_MESSAGE_TYPE.LOCATION_TAP,
            name,
            id,
            ts: metadata.timestamp.toISOString(),
          };
          activities.push(activity);
        } catch (error) {
          console.error(
            "Invalid location tap message received from server: ",
            message
          );
        } finally {
          break;
        }
      case JUB_SIGNAL_MESSAGE_TYPE.QUEST_COMPLETED:
        console.error("Unable to handle quest completed messages");
        break;
      default:
        console.error("Received invalid message type");
    }
  }

  activities.reverse(); // We want activities to be in reverse chronological order

  return {
    newUsers: users,
    newLocationSignatures: locationSignatures,
    newActivities: activities,
  };
};

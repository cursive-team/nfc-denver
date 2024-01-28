import { useState } from "react";
import {
  saveAuthToken,
  loadBackup,
  AuthToken,
  User,
  LocationSignature,
  saveUsers,
  saveLocationSignatures,
  saveActivities,
  Activity,
} from "../lib/client/localStorage";
import { hashPassword, hashPublicKeyToUUID } from "@/lib/client/utils";
import { decryptBackupString } from "@/lib/shared/backup";
import { encryptedBackupDataSchema } from "@/pages/api/backup";
import { Input } from "./Input";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Record } from "@prisma/client/runtime/library";
import Link from "next/link";
import { Button } from "./Button";
import {
  JUB_SIGNAL_MESSAGE_TYPE,
  decryptMessage,
  encryptedMessageSchema,
  inboundTapMessageSchema,
  locationTapMessageSchema,
  outboundTapMessageSchema,
} from "@/lib/client/jubSignal";

enum DisplayState {
  INPUT_EMAIL = "INPUT_EMAIL",
  INPUT_CODE = "INPUT_CODE",
  INPUT_PASSWORD = "INPUT_PASSWORD",
  LOGGING_IN = "LOGGING_IN",
}

interface LoginFormProps {
  onSuccessfulLogin: () => void;
  onFailedLogin: (errorMessage: string) => void;
}

export default function LoginForm({
  onSuccessfulLogin,
  onFailedLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [displayState, setDisplayState] = useState(DisplayState.INPUT_EMAIL);
  const [authToken, setAuthToken] = useState<AuthToken>();
  const [encryptedData, setEncryptedData] = useState("");
  const [authenticationTag, setAuthenticationTag] = useState("");
  const [iv, setIv] = useState("");
  const [passwordSalt, setPasswordSalt] = useState("");
  const [passwordHash, setPasswordHash] = useState("");

  // This function is called once a backup is loaded
  // It fetches the user's jubSignal messages, populates localStorage,
  // saves the auth token, and calls the onSuccessfulLogin callback
  const completeLogin = async (backup: string) => {
    if (!authToken) {
      onFailedLogin("Error logging in. Please try again.");
      return;
    }

    setDisplayState(DisplayState.LOGGING_IN);

    // Fetch jubSignal messages from server
    const response = await fetch(
      `/api/messages?token=${encodeURIComponent(authToken.value)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Error fetching jubSignal messages from server");
      onFailedLogin("Error logging in. Please try again.");
      return;
    }
    const messages = await response.json();

    // Load backup into localStorage and fetch user profile and keys
    const { profile, keys } = loadBackup(backup);
    const recipientPrivateKey = keys.encryptionPrivateKey;

    // Decrypt messages and update localStorage with decrypted messages
    const users: Record<string, User> = {};
    const locationSignatures: Record<string, LocationSignature> = {};
    const activities: Activity[] = [];
    messages.forEach(async (message: any) => {
      try {
        const encryptedMessage = await encryptedMessageSchema.validate(message);
        const { metadata, type, data } = await decryptMessage(
          encryptedMessage,
          recipientPrivateKey
        );

        switch (type) {
          case JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP:
            try {
              if (metadata.fromPublicKey !== profile.encryptionPublicKey) {
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
                user.outTs = metadata.timestamp;

                users[userId] = user;
              } else {
                users[userId] = {
                  name,
                  encPk: pk,
                  x,
                  tg,
                  note,
                  outTs: metadata.timestamp,
                };
              }

              const activity = {
                type: JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP,
                name,
                id: userId,
                ts: metadata.timestamp,
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
                user.inTs = metadata.timestamp;

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
                  inTs: metadata.timestamp,
                };
              }

              const activity = {
                type: JUB_SIGNAL_MESSAGE_TYPE.INBOUND_TAP,
                name: metadata.fromDisplayName,
                id: userId,
                ts: metadata.timestamp,
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
              if (metadata.fromPublicKey !== profile.encryptionPublicKey) {
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
                location.ts = metadata.timestamp;

                locationSignatures[id] = location;
              } else {
                locationSignatures[id] = {
                  id,
                  name,
                  pk,
                  msg,
                  sig,
                  ts: metadata.timestamp,
                };
              }

              const activity = {
                type: JUB_SIGNAL_MESSAGE_TYPE.LOCATION_TAP,
                name,
                id,
                ts: metadata.timestamp,
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
            throw new Error("Unable to handle quest completed messages");
          default:
            throw new Error("Invalid message type");
        }
      } catch (error) {
        console.error("Invalid message received from server: ", message);
      }
    });

    // Save users, location signatures, activities, and authToken to localStorage
    saveUsers(users);
    saveLocationSignatures(locationSignatures);
    activities.reverse(); // We want activities to be in chronological order
    saveActivities(activities);
    saveAuthToken(authToken);

    // Login is successful
    onSuccessfulLogin();
  };

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/login/get_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setDisplayState(DisplayState.INPUT_CODE);
      } else {
        onFailedLogin("Error requesting code. Please try again.");
      }
    } catch (error) {
      onFailedLogin("An unexpected error occurred. Please try again.");
    }
  };

  const handleCodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/login/verify_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        onFailedLogin("Error logging in. Please try again.");
        console.error(data.error);
        return;
      }

      if (!data.backup) {
        onFailedLogin("Error logging in. Please try again.");
        console.error("No backup received");
        return;
      }

      // Validate auth token is correctly formed
      if (
        !data.authToken ||
        !data.authToken.value ||
        typeof data.authToken.value !== "string" ||
        !data.authToken.expiresAt ||
        typeof data.authToken.expiresAt !== "string"
      ) {
        console.error("Invalid auth token received");
        onFailedLogin("Error logging in. Please try again.");
        return;
      }

      // Save auth token
      const { value, expiresAt } = data.authToken;
      const authToken = { value, expiresAt: new Date(expiresAt) };
      setAuthToken(authToken);

      // Password hint is provided if user chooses self custody
      if (data.password) {
        const { encryptedData, authenticationTag, iv } =
          encryptedBackupDataSchema.validateSync(data.backup);

        // User must confirm password to decrypt data
        setEncryptedData(encryptedData);
        setAuthenticationTag(authenticationTag);
        setIv(iv);
        setPasswordSalt(data.password.salt);
        setPasswordHash(data.password.hash);

        setDisplayState(DisplayState.INPUT_PASSWORD);
      } else {
        if (
          !data.backup ||
          !data.backup.decryptedData ||
          typeof data.backup.decryptedData !== "string"
        ) {
          console.error("Invalid backup received");
          onFailedLogin("Error logging in. Please try again.");
          return;
        }

        const backup = data.backup.decryptedData;
        completeLogin(backup);
      }
    } catch (error) {
      console.error(error);
      onFailedLogin("An unexpected error occurred. Please try again.");
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const derivedPasswordHash = await hashPassword(password, passwordSalt);
      if (derivedPasswordHash !== passwordHash) {
        alert("Incorrect password!");
        return;
      }

      const decryptedBackupData = decryptBackupString(
        encryptedData,
        authenticationTag,
        iv,
        email,
        password
      );

      completeLogin(decryptedBackupData);
    } catch (error) {
      console.error(error);
      onFailedLogin("Error logging in. Please try again.");
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const StatusStepComponent: Record<
    keyof typeof DisplayState,
    React.ReactNode
  > = {
    INPUT_EMAIL: (
      <FormStepLayout
        title="Login"
        description="Welcome to ETHDenver"
        onSubmit={handleEmailSubmit}
      >
        <Input
          type="email"
          id="email"
          name="email"
          label="Email"
          placeholder="example@xyz.com"
          value={email}
          onChange={handleEmailChange}
          required
        />
        <Button type="submit">Send Code</Button>
        <Link href="/register" className="link text-center">
          I am not registered
        </Link>
      </FormStepLayout>
    ),
    INPUT_CODE: (
      <FormStepLayout
        title="Login"
        description="Welcome to ETHDenver"
        onSubmit={handleCodeSubmit}
      >
        <Input
          type="text"
          id="code"
          name="code"
          label="Code"
          placeholder="XXX-XXX"
          value={code}
          onChange={handleCodeChange}
          required
        />
        <Button type="submit">Login</Button>
      </FormStepLayout>
    ),
    INPUT_PASSWORD: (
      <FormStepLayout
        title="Login"
        description="Welcome to ETHDenver"
        onSubmit={handlePasswordSubmit}
      >
        <Input
          type="password"
          id="password"
          name="password"
          label="Password"
          value={password}
          onChange={handlePasswordChange}
          required
        />
        <Button type="submit">Login</Button>
      </FormStepLayout>
    ),
    LOGGING_IN: (
      <div>
        <span>Logging in...</span>
      </div>
    ),
  };

  return (
    <div className="h-screen flex flex-col">
      {StatusStepComponent[displayState]}
    </div>
  );
}

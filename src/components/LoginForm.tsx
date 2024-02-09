import { useState } from "react";
import {
  saveAuthToken,
  loadBackup,
  AuthToken,
  deleteAccountFromLocalStorage,
} from "../lib/client/localStorage";
import { hashPassword } from "@/lib/client/utils";
import { decryptBackupString } from "@/lib/shared/backup";
import { encryptedBackupDataSchema } from "@/pages/api/backup";
import { Input } from "./Input";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Record } from "@prisma/client/runtime/library";
import Link from "next/link";
import { Button } from "./Button";
import { loadMessages } from "@/lib/client/jubSignalClient";
import toast from "react-hot-toast";
import useSettings from "@/hooks/useSettings";

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
  const { pageHeight } = useSettings();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [displayState, setDisplayState] = useState(DisplayState.INPUT_EMAIL);
  const [savedAuthToken, setSavedAuthToken] = useState<AuthToken>();
  const [encryptedData, setEncryptedData] = useState("");
  const [authenticationTag, setAuthenticationTag] = useState("");
  const [iv, setIv] = useState("");
  const [passwordSalt, setPasswordSalt] = useState("");
  const [passwordHash, setPasswordHash] = useState("");

  // This function is called once a backup is loaded
  // It fetches the user's jubSignal messages, populates localStorage,
  // saves the auth token, and calls the onSuccessfulLogin callback
  const completeLogin = async (backup: string, token?: AuthToken) => {
    const authToken = savedAuthToken || token;
    if (!authToken) {
      console.error("No auth token found");
      onFailedLogin("Error logging in. Please try again.");
      return;
    }

    setDisplayState(DisplayState.LOGGING_IN);
    // Populate localStorage with auth and backup data to load messages
    saveAuthToken(authToken);
    loadBackup(backup);

    try {
      await loadMessages({ forceRefresh: true });
    } catch (error) {
      deleteAccountFromLocalStorage(); // Clear localStorage if login fails
      onFailedLogin("Error logging in. Please try again.");
      return;
    }

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
      setSavedAuthToken(authToken); // Save auth token state for case where user needs to input password

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
        await completeLogin(backup, authToken);
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
        toast.error("Incorrect password!");
        return;
      }

      const decryptedBackupData = decryptBackupString(
        encryptedData,
        authenticationTag,
        iv,
        email,
        password
      );

      await completeLogin(decryptedBackupData);
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
    <div
      className="flex flex-col"
      style={{
        height: `${pageHeight}px`,
      }}
    >
      {StatusStepComponent[displayState]}
    </div>
  );
}

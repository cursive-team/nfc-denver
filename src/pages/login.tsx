import { useState } from "react";
import { useRouter } from "next/router";
import { saveAuthToken, loadBackup } from "../util/localStorage";
import { encryptedBackupDataSchema } from "./api/backup";
import { hashPassword } from "@/lib/password";
import { decryptString } from "@/lib/backup";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import Link from "next/link";

enum DisplayState {
  INPUT_EMAIL = "INPUT_EMAIL",
  INPUT_CODE = "INPUT_CODE",
  INPUT_PASSWORD = "INPUT_PASSWORD",
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [displayState, setDisplayState] = useState(DisplayState.INPUT_EMAIL);
  const [encryptedData, setEncryptedData] = useState("");
  const [authenticationTag, setAuthenticationTag] = useState("");
  const [iv, setIv] = useState("");
  const [passwordSalt, setPasswordSalt] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const router = useRouter();

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      alert("Error requesting code. Please try again.");
    }
  };

  const handleCodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch("/api/login/verify_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });
    const data = await response.json();

    if (!response.ok) {
      alert("Error logging in. Please try again.");
      console.error(data.error);
      return;
    }

    // Todo: validate login response

    // Password hint is provided if user chooses self custody
    if (data.password) {
      try {
        const { encryptedData, authenticationTag, iv } =
          encryptedBackupDataSchema.validateSync(data.backup);

        // Save auth token
        const { value, expiresAt } = data.authToken;
        saveAuthToken(value, new Date(expiresAt));

        // User must confirm password to decrypt data
        setEncryptedData(encryptedData);
        setAuthenticationTag(authenticationTag);
        setIv(iv);
        setPasswordSalt(data.password.salt);
        setPasswordHash(data.password.hash);

        setDisplayState(DisplayState.INPUT_PASSWORD);
      } catch (error) {
        console.error(error);
        alert("Error logging in. Please try again.");
        return;
      }
    } else {
      if (
        !data.backup ||
        !data.backup.decryptedData ||
        typeof data.backup.decryptedData !== "string"
      ) {
        alert("Error logging in. Please try again.");
        return;
      }

      try {
        loadBackup(data.backup.decryptedData);
      } catch (error) {
        console.error(error);
        alert("Error logging in. Please try again.");
        return;
      }

      // Save auth token
      const { value, expiresAt } = data.authToken;
      saveAuthToken(value, new Date(expiresAt));

      router.push("/");
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const derivedPasswordHash = await hashPassword(password, passwordSalt);
    if (derivedPasswordHash !== passwordHash) {
      alert("Incorrect password!");
      return;
    }

    try {
      const decryptedBackupData = decryptString(
        encryptedData,
        authenticationTag,
        iv,
        email,
        password
      );
      loadBackup(decryptedBackupData);

      router.push("/");
    } catch (error) {
      console.error(error);
      alert("Error logging in. Please try again.");
      return;
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
  };

  return (
    <div className="min-h-screen flex flex-col">
      {StatusStepComponent[displayState]}
    </div>
  );
}

Login.getInitialProps = () => {
  return { fullPage: true };
};

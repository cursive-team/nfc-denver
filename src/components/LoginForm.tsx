import { useState } from "react";
import { saveAuthToken, loadBackup } from "../lib/client/localStorage";
import { hashPassword } from "@/lib/client/utils";
import { decryptBackupString } from "@/lib/shared/backup";
import { encryptedBackupDataSchema } from "@/pages/api/backup";
import { Input } from "./Input";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Record } from "@prisma/client/runtime/library";
import Link from "next/link";
import { Button } from "./Button";
import { useGetLoginCode, useVerifyCode } from "@/hooks/useAuth";
import toast from "react-hot-toast";

enum DisplayState {
  INPUT_EMAIL = "INPUT_EMAIL",
  INPUT_CODE = "INPUT_CODE",
  INPUT_PASSWORD = "INPUT_PASSWORD",
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
  const [encryptedData, setEncryptedData] = useState("");
  const [authenticationTag, setAuthenticationTag] = useState("");
  const [iv, setIv] = useState("");
  const [passwordSalt, setPasswordSalt] = useState("");
  const [passwordHash, setPasswordHash] = useState("");

  const getLoginCodeMutation = useGetLoginCode();
  const loginVerifyCodeMutation = useVerifyCode();

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await getLoginCodeMutation.mutateAsync(
      {
        email,
      },
      {
        onSuccess: () => {
          setDisplayState(DisplayState.INPUT_CODE);
        },
        onError: () => {
          toast.error("Error requesting code. Please try again.");
        },
      }
    );
  };

  const handleCodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await loginVerifyCodeMutation.mutateAsync(
      { email, code },
      {
        onSuccess: (data: any) => {
          // Todo: validate login response

          // Password hint is provided if user chooses self custody
          if (data.password) {
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
          } else {
            if (
              !data.backup ||
              !data.backup.decryptedData ||
              typeof data.backup.decryptedData !== "string"
            ) {
              toast.error("Error logging in. Please try again.");
              return;
            }

            loadBackup(data.backup.decryptedData);

            // Save auth token
            const { value, expiresAt } = data.authToken;
            saveAuthToken(value, new Date(expiresAt));

            onSuccessfulLogin();
          }
        },
      }
    );
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
      loadBackup(decryptedBackupData);

      onSuccessfulLogin();
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
        <Button loading={getLoginCodeMutation.isPending} type="submit">
          Send Code
        </Button>
        <button type="button" disabled={getLoginCodeMutation.isPending}>
          <Link href="/register" className="link text-center">
            I am not registered
          </Link>
        </button>
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
        <Button loading={loginVerifyCodeMutation.isPending} type="submit">
          Login
        </Button>
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
    <div className="h-screen flex flex-col">
      {StatusStepComponent[displayState]}
    </div>
  );
}

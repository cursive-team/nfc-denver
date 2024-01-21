import { useState } from "react";
import { useRouter } from "next/router";
import {
  saveAuthToken,
  getProfile,
  Profile,
  loadBackup,
} from "../util/localStorage";
import { encryptedBackupDataSchema } from "./api/backup";
import { hashPassword } from "@/lib/password";
import { decryptString } from "@/lib/backup";

enum DisplayState {
  INPUT_EMAIL,
  INPUT_CODE,
  INPUT_PASSWORD,
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
          encryptedBackupDataSchema.validateSync(data.backupData);

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
        !data.backupData ||
        !data.backupData.decryptedData ||
        typeof data.backupData.decryptedData !== "string"
      ) {
        alert("Error logging in. Please try again.");
        return;
      }

      try {
        loadBackup(data.backupData.decryptedData);
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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        {displayState === DisplayState.INPUT_EMAIL && (
          <form
            onSubmit={handleEmailSubmit}
            className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Send Code
              </button>
            </div>
          </form>
        )}
        {displayState === DisplayState.INPUT_CODE && (
          <form
            onSubmit={handleCodeSubmit}
            className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2"
                htmlFor="code"
              >
                Code
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={code}
                onChange={handleCodeChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Login
              </button>
            </div>
          </form>
        )}
        {displayState === DisplayState.INPUT_PASSWORD && (
          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div className="mb-4">
              <label
                className="block text-gray-700 dark:text-gray-200 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

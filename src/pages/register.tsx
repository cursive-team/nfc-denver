import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { generateEncryptionKeyPair } from "@/lib/encryption";
import { generateSignatureKeyPair } from "@/lib/signature";
import { generateSalt, hashPassword } from "@/lib/password";
import { saveAuthToken, saveKeys, saveProfile } from "@/util/localStorage";
import { verifySigninCodeResponseSchema } from "./api/_auth";

enum DisplayState {
  INPUT_EMAIL,
  INPUT_CODE,
  INPUT_SOCIAL,
  CHOOSE_CUSTODY,
  INPUT_PASSWORD,
  CREATING_ACCOUNT,
}

export default function Register() {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.INPUT_EMAIL
  );
  const [cmac, setCmac] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [twitterUsername, setTwitterUsername] = useState<string>("");
  const [telegramUsername, setTelegramUsername] = useState<string>("");
  const [wantsServerCustody, setWantsServerCustody] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    if (router.query.cmac) {
      setCmac(router.query.cmac as string);
    }
  }, [router.query.cmac]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handleDisplayNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDisplayName(event.target.value);
  };

  const handleTwitterUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTwitterUsername(event.target.value);
  };

  const handleTelegramUsernameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTelegramUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch("/api/register/get_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (response.ok) {
          setDisplayState(DisplayState.INPUT_CODE);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  };

  const handleCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch("/api/register/verify_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        const verifyCodeResponse =
          verifySigninCodeResponseSchema.validateSync(data);
        if (verifyCodeResponse.success) {
          setDisplayState(DisplayState.INPUT_SOCIAL);
        } else {
          const errorReason = verifyCodeResponse.reason;
          if (errorReason) {
            throw new Error(errorReason);
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  };

  const handleSocialSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Validate display name: alphanumeric and reasonable length
    if (!/^[a-z0-9]+$/i.test(displayName) || displayName.length > 20) {
      alert("Display name must be alphanumeric and less than 20 characters.");
      return;
    }

    setDisplayState(DisplayState.CHOOSE_CUSTODY);
  };

  const handleCustodySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (wantsServerCustody) {
      await handleCreateAccount();
    } else {
      setDisplayState(DisplayState.INPUT_PASSWORD);
    }
  };

  const handleCreateAccount = async () => {
    setDisplayState(DisplayState.CREATING_ACCOUNT);

    const { privateKey, publicKey } = await generateEncryptionKeyPair();
    const { signingKey, verifyingKey } = await generateSignatureKeyPair();
    saveKeys(privateKey, signingKey);

    let passwordSalt, passwordHash;
    if (!wantsServerCustody) {
      passwordSalt = generateSalt();
      passwordHash = await hashPassword(password, passwordSalt);
    }

    const response = await fetch("/api/register/create_account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cmac,
        email,
        code,
        displayName,
        twitterUsername,
        telegramUsername,
        wantsServerCustody,
        encryptionPublicKey: publicKey,
        signaturePublicKey: verifyingKey,
        passwordSalt,
        passwordHash,
      }),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      alert("Error creating account! Please try again.");
    }

    const data = await response.json();
    if (!data.value || !data.expiresAt) {
      console.error("Account created, but no auth token returned.");
      alert("Account created, but error logging in! Please try again.");
      return;
    }

    saveProfile({
      displayName,
      email,
      encryptionPublicKey: publicKey,
      signaturePublicKey: verifyingKey,
      wantsServerCustody,
      twitterUsername,
      telegramUsername,
    });
    saveAuthToken(data.value, new Date(data.expiresAt));

    router.push("/");
  };

  const handleCreateSelfCustodyAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    await handleCreateAccount();
  };

  return (
    <div>
      <h1>Register</h1>
      {displayState === DisplayState.INPUT_EMAIL && (
        <form
          onSubmit={handleEmailSubmit}
          className="bg-gray-800 text-white p-4 rounded-md"
        >
          <label className="block mb-2">
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
              required
            />
          </label>
          <input
            type="submit"
            value="Next"
            className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
        </form>
      )}
      {displayState === DisplayState.INPUT_CODE && (
        <form
          onSubmit={handleCodeSubmit}
          className="bg-gray-800 text-white p-4 rounded-md"
        >
          <label className="block mb-2">
            Check your email {email} for a code:
            <input
              type="text"
              name="code"
              value={code}
              onChange={handleCodeChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
              required
            />
          </label>
          <input
            type="submit"
            value="Next"
            className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
        </form>
      )}
      {displayState === DisplayState.INPUT_SOCIAL && (
        <form
          onSubmit={handleSocialSubmit}
          className="bg-gray-800 text-white p-4 rounded-md"
        >
          <label className="block mb-2">
            Display Name:
            <input
              type="text"
              name="displayName"
              value={displayName}
              onChange={handleDisplayNameChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
              required
            />
          </label>
          <label className="block mb-2">
            Twitter Username (optional):
            <input
              type="text"
              name="twitterUsername"
              value={twitterUsername}
              onChange={handleTwitterUsernameChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
            />
          </label>
          <label className="block mb-2">
            Telegram Username (optional):
            <input
              type="text"
              name="telegramUsername"
              value={telegramUsername}
              onChange={handleTelegramUsernameChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
            />
          </label>
          <input
            type="submit"
            value="Next"
            className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
        </form>
      )}
      {displayState === DisplayState.CHOOSE_CUSTODY && (
        <div className="bg-gray-800 text-white p-4 rounded-md">
          <form onSubmit={handleCustodySubmit}>
            <fieldset>
              <legend className="mb-4">Choose your custody option:</legend>
              <div className="flex items-center mb-4">
                <input
                  id="selfCustody"
                  type="radio"
                  name="custody"
                  value="self"
                  checked={!wantsServerCustody}
                  onChange={() => setWantsServerCustody(false)}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                />
                <label
                  htmlFor="selfCustody"
                  className="ml-2 block text-sm font-medium"
                >
                  Self Custody
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="serverCustody"
                  type="radio"
                  name="custody"
                  value="server"
                  checked={wantsServerCustody}
                  onChange={() => setWantsServerCustody(true)}
                  className="w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500 dark:focus:ring-indigo-600"
                />
                <label
                  htmlFor="serverCustody"
                  className="ml-2 block text-sm font-medium"
                >
                  Server Custody
                </label>
              </div>
            </fieldset>
            <button
              type="submit"
              className="mt-4 w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue
            </button>
          </form>
        </div>
      )}
      {displayState === DisplayState.INPUT_PASSWORD && (
        <form
          onSubmit={handleCreateSelfCustodyAccount}
          className="bg-gray-800 text-white p-4 rounded-md"
        >
          <label className="block mb-2">
            Password:
            <input
              type="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
              required
            />
          </label>
          <label className="block mb-2">
            Confirm Password:
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
              required
            />
          </label>
          <input
            type="submit"
            value="Create Account"
            className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
        </form>
      )}
      {displayState === DisplayState.CREATING_ACCOUNT && (
        <div className="bg-gray-800 text-white p-4 rounded-md">
          Creating account...
        </div>
      )}
    </div>
  );
}

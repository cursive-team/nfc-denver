import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { generateEncryptionKeyPair } from "@/lib/client/encryption";
import { generateSignatureKeyPair, sign } from "@/lib/shared/signature";
import { generateSalt, hashPassword } from "@/lib/client/utils";
import {
  createBackup,
  deleteAccountFromLocalStorage,
  saveAuthToken,
  saveKeys,
  saveProfile,
} from "@/lib/client/localStorage";
import { encryptBackupString } from "@/lib/shared/backup";
import { toast } from "sonner";
import { Spinner } from "@/components/Spinner";
import { loadMessages } from "@/lib/client/jubSignalClient";
import { encryptRegisteredMessage } from "@/lib/client/jubSignal/registered";
import { generatePSIKeys } from "@/lib/client/psi";
import { AppBackHeader } from "@/components/AppHeader";
import { RegisterStepForm } from "@/components/registerFormSteps";
import { RegisterStepCode } from "@/components/registerFormSteps/code";
import { RegisterSocial } from "@/components/registerFormSteps/social";
import { RegisterCustody } from "@/components/registerFormSteps/custody";
import { useStateMachine } from "little-state-machine";
import updateStateFromAction from "@/lib/shared/updateAction";
import { RegisterPassword } from "@/components/registerFormSteps/password";

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
  const { getState } = useStateMachine({ updateStateFromAction });

  const wantsServerCustody = getState()?.register?.wantsServerCustody ?? false;
  const allowsAnalytics = getState()?.register?.allowsAnalytics ?? false;

  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.INPUT_EMAIL
  );
  const [iykRef, setIykRef] = useState<string>("");
  const [mockRef, setMockRef] = useState<string>();

  useEffect(() => {
    if (router.query.iykRef) {
      setIykRef(router.query.iykRef as string);
    }
    if (router.query.mockRef) {
      setMockRef(router.query.mockRef as string);
    }
  }, [router.query.iykRef, router.query.mockRef]);

  const handleCreateAccount = async () => {
    setDisplayState(DisplayState.CREATING_ACCOUNT);

    const { privateKey, publicKey } = await generateEncryptionKeyPair();
    const { signingKey, verifyingKey } = generateSignatureKeyPair();
    const { psiPrivateKeys, psiPublicKeys } = await generatePSIKeys();

    // get the values from the state
    const {
      email,
      displayName,
      telegramUsername,
      twitterUsername,
      farcasterUsername,
      bio,
      code,
      password,
    } = getState().register;

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
        iykRef,
        mockRef,
        email,
        code,
        displayName,
        wantsServerCustody,
        allowsAnalytics,
        passwordSalt,
        passwordHash,
        encryptionPublicKey: publicKey,
        signaturePublicKey: verifyingKey,
        psiRound1Message: JSON.stringify(psiPublicKeys),
      }),
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      toast.error("Error creating account! Please try again.");
      setDisplayState(DisplayState.INPUT_EMAIL);
      return;
    }

    const data = await response.json();
    if (!data.authTokenResponse.value || !data.authTokenResponse.expiresAt) {
      console.error("Account created, but no auth token returned.");
      toast.error("Account created, but error logging in! Please try again.");
      setDisplayState(DisplayState.INPUT_EMAIL);
      return;
    }
    const pkId = data.pkId;
    if (!pkId) {
      console.error("Account created, but no id returned.");
      toast.error("Account created, but error logging in! Please try again.");
      setDisplayState(DisplayState.INPUT_EMAIL);
      return;
    }

    // Ensure the user is logged out of an existing session before creating a new account
    deleteAccountFromLocalStorage();
    saveKeys({
      encryptionPrivateKey: privateKey,
      signaturePrivateKey: signingKey,
      psiPrivateKeys: JSON.stringify(psiPrivateKeys),
      psiPublicKeys: JSON.stringify(psiPublicKeys),
    });

    saveProfile({
      pkId,
      encryptionPublicKey: publicKey,
      signaturePublicKey: verifyingKey,
      wantsServerCustody,
      allowsAnalytics,
      displayName,
      email,
      twitterUsername,
      telegramUsername,
      farcasterUsername,
      bio,
    });
    saveAuthToken({
      value: data.authTokenResponse.value,
      expiresAt: new Date(data.authTokenResponse.expiresAt),
    });

    let backupData = createBackup();
    if (!backupData) {
      console.error("Error creating backup!");
      toast.error("Error creating backup! Please try again.");
      return;
    }

    // Encrypt backup data if user wants self custody
    const backup = wantsServerCustody
      ? backupData
      : encryptBackupString(backupData, email, password);

    const backupResponse = await fetch("/api/backup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        backup,
        wantsServerCustody,
        authToken: data.authTokenResponse.value,
      }),
    });

    if (!backupResponse.ok) {
      console.error(`HTTP error! status: ${backupResponse.status}`);
      toast.error("Error storing backup! Please try again.");
      return;
    }

    // Send a jubSignal message to self to store the signature
    const dataToSign = uuidv4().replace(/-/g, ""); // For now, we just sign a random uuid as a hex string
    const signature = sign(signingKey, dataToSign);
    const recipientPublicKey = publicKey;
    const encryptedMessage = await encryptRegisteredMessage({
      signaturePublicKey: verifyingKey,
      signatureMessage: dataToSign,
      signature,
      senderPrivateKey: privateKey,
      recipientPublicKey,
    });
    try {
      await loadMessages({
        forceRefresh: false,
        messageRequests: [
          {
            encryptedMessage,
            recipientPublicKey,
          },
        ],
      });
    } catch (error) {
      console.error("Error sending registration tap to server: ", error);
      toast.error("An error occured while registering.");
      return;
    }

    toast.success("Account created and backed up!");
    router.push("/");
  };

  return (
    <>
      {displayState === DisplayState.INPUT_EMAIL && (
        <RegisterStepForm
          iykRef={iykRef}
          mockRef={mockRef}
          onSuccess={() => {
            setDisplayState(DisplayState.INPUT_CODE);
          }}
        />
      )}
      {displayState === DisplayState.INPUT_CODE && (
        <RegisterStepCode
          iykRef={iykRef}
          mockRef={mockRef}
          onBack={() => {
            setDisplayState(DisplayState.INPUT_EMAIL);
          }}
          onSuccess={() => {
            setDisplayState(DisplayState.INPUT_SOCIAL);
          }}
        />
      )}
      {displayState === DisplayState.INPUT_SOCIAL && (
        <RegisterSocial
          iykRef={iykRef}
          mockRef={mockRef}
          onBack={() => {
            //no need to get back to code, redirect to email input
            setDisplayState(DisplayState.INPUT_EMAIL);
          }}
          onSuccess={() => {
            setDisplayState(DisplayState.CHOOSE_CUSTODY);
          }}
        />
      )}
      {displayState === DisplayState.CHOOSE_CUSTODY && (
        <RegisterCustody
          iykRef={iykRef}
          mockRef={mockRef}
          onBack={() => {
            //no need to get back to code, redirect to email input
            setDisplayState(DisplayState.INPUT_SOCIAL);
          }}
          onSuccess={async () => {
            if (wantsServerCustody) {
              await handleCreateAccount();
            } else {
              setDisplayState(DisplayState.INPUT_PASSWORD);
            }
          }}
        />
      )}
      {displayState === DisplayState.INPUT_PASSWORD && (
        <RegisterPassword
          iykRef={iykRef}
          mockRef={mockRef}
          onBack={() => {
            setDisplayState(DisplayState.CHOOSE_CUSTODY);
          }}
          onSuccess={async () => {
            await handleCreateAccount();
          }}
        />
      )}
      {displayState === DisplayState.CREATING_ACCOUNT && (
        <div className="my-auto mx-auto">
          <Spinner label="Your account is being created." />
        </div>
      )}
    </>
  );
}

Register.getInitialProps = () => {
  return { fullPage: true };
};

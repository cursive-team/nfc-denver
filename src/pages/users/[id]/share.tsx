import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  fetchUserByUUID,
  getAuthToken,
  getKeys,
  getProfile,
  updateUserFromOutboundTap,
  User,
} from "@/lib/client/localStorage";
import { sign } from "@/lib/client/signature";
import {
  encryptInboundTapMessage,
  encryptOutboundTapMessage,
} from "@/lib/client/jubSignal";

const SharePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();
  const [shareTwitter, setShareTwitter] = useState(false);
  const [shareTelegram, setShareTelegram] = useState(false);
  const [privateNote, setPrivateNote] = useState<string>();

  useEffect(() => {
    if (typeof id === "string") {
      const fetchedUser = fetchUserByUUID(id);
      if (fetchedUser) {
        setUser(fetchedUser);
        setPrivateNote(fetchedUser.note);
      }
    }
  }, [id]);

  const handleConnectClick = async () => {
    if (!user) {
      alert("An error occurred. Please try again.");
      router.push("/");
      return;
    }

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }

    const keys = getKeys();
    if (!keys) {
      console.error("Cannot find user keys");
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }
    const { encryptionPrivateKey, signaturePrivateKey } = keys;

    const profile = getProfile();
    if (!profile) {
      console.error("Cannot find user profile");
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }

    // ----- SEND MESSAGE TO OTHER USER -----
    // This messages sends contact information to the other user
    const dataToSign = user.pk; // For now, we just sign the other user's encryption public key
    const signature = await sign(signaturePrivateKey, dataToSign);
    const recipientPublicKey = user.pk;
    const encryptedMessage = await encryptInboundTapMessage({
      twitterUsername: shareTwitter ? profile.twitterUsername : undefined,
      telegramUsername: shareTelegram ? profile.telegramUsername : undefined,
      signaturePublicKey: profile.signaturePublicKey,
      signatureMessage: dataToSign,
      signature,
      senderPrivateKey: encryptionPrivateKey,
      recipientPublicKey,
    });

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: encryptedMessage,
          recipientPublicKey,
          token: authToken.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share information");
      }
    } catch (error) {
      console.error("Error sharing information:", error);
      alert("An error occurred while sending the message. Please try again.");
    }

    // ----- SEND MESSAGE TO SELF -----
    // This message records the outbound interaction and saves the private note
    const selfPublicKey = profile.encryptionPublicKey;
    const selfEncryptedMessage = await encryptOutboundTapMessage({
      displayName: user.name,
      encryptionPublicKey: user.pk,
      twitterUsername: user.x,
      telegramUsername: user.tg,
      privateNote,
      senderPrivateKey: encryptionPrivateKey,
      recipientPublicKey: selfPublicKey,
    });

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: selfEncryptedMessage,
          recipientPublicKey: selfPublicKey,
          token: authToken.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share information");
      }
    } catch (error) {
      console.error("Error sharing information:", error);
      alert("An error occurred while sending the message. Please try again.");
    }

    // Updates local storage with new private note and timestamp
    updateUserFromOutboundTap(user.pk, privateNote);
    alert(`Successfully shared information with ${user.name}!`);
    router.push(`/users/${id}`);
  };

  const handleTwitterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShareTwitter(event.target.checked);
  };

  const handleTelegramChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShareTelegram(event.target.checked);
  };

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
        Connect with {user.name}
      </h3>
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            disabled={!user.x}
            checked={shareTwitter}
            onChange={handleTwitterChange}
          />
          <span className="ml-2">Share my Twitter @{user.x}</span>
        </label>
      </div>
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            disabled={!user.tg}
            checked={shareTelegram}
            onChange={handleTelegramChange}
          />
          <span className="ml-2">Share my Telegram @{user.tg}</span>
        </label>
      </div>
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="longtext"
            disabled
            value={privateNote}
            onChange={(event) => {
              setPrivateNote(event.target.value);
            }}
          />
          <span className="ml-2">Private Note</span>
        </label>
      </div>
      <div className="mt-8">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleConnectClick}
        >
          Connect
        </button>
      </div>
    </div>
  );
};

export default SharePage;

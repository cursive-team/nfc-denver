import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  fetchUserByUUID,
  getAuthToken,
  getKeys,
  getProfile,
  User,
} from "@/util/localStorage";
import { sign } from "@/lib/signature";
import { DEFAULT_MESSAGE_TYPE, encryptMessage } from "@/lib/jubSignal";

const SharePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();
  const [shareTwitter, setShareTwitter] = useState(false);
  const [shareTelegram, setShareTelegram] = useState(false);

  useEffect(() => {
    if (typeof id === "string") {
      const fetchedUser = fetchUserByUUID(id);
      setUser(fetchedUser);
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

    const profile = getProfile();
    if (!profile) {
      console.error("Cannot find user profile");
      alert("You must be logged in to connect");
      router.push("/login");
      return;
    }

    const { encryptionPrivateKey, signaturePrivateKey } = keys;

    // For now, we just sign the other user's encryption public key
    const signature = await sign(signaturePrivateKey, user.encryptionPublicKey);
    const shareData = {
      signature,
      twitter: shareTwitter ? profile.twitterUsername : undefined,
      telegram: shareTelegram ? profile.telegramUsername : undefined,
    };

    const encryptedMessage = await encryptMessage(
      DEFAULT_MESSAGE_TYPE,
      shareData,
      encryptionPrivateKey,
      user.encryptionPublicKey
    );

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: encryptedMessage,
          recipientPublicKey: user.encryptionPublicKey,
          token: authToken.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share information");
      }

      alert("Shared information successfully!");
      router.push("/");
    } catch (error) {
      console.error("Error sharing information:", error);
      alert("An error occurred while sending the message. Please try again.");
    }
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
        Connect with {user.displayName}
      </h3>
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            disabled={!user.twitterUsername}
            checked={shareTwitter}
            onChange={handleTwitterChange}
          />
          <span className="ml-2">Share my Twitter @{user.twitterUsername}</span>
        </label>
      </div>
      <div className="mt-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            disabled={!user.telegramUsername}
            checked={shareTelegram}
            onChange={handleTelegramChange}
          />
          <span className="ml-2">
            Share my Telegram @{user.telegramUsername}
          </span>
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

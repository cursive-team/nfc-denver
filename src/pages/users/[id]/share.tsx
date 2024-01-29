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
import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import Link from "next/link";
import { AppBackHeader } from "@/components/AppHeader";

const SharePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();
  const [profile, setProfile] = useState(getProfile());
  const [shareTwitter, setShareTwitter] = useState(false);
  const [shareTelegram, setShareTelegram] = useState(false);
  const [privateNote, setPrivateNote] = useState<string>();

  useEffect(() => {
    if (typeof id === "string") {
      const profile = getProfile();
      if (!profile) {
        alert("You must be logged in to connect");
        router.push("/login");
        return;
      }
      setProfile(profile);

      const fetchedUser = fetchUserByUUID(id);
      if (fetchedUser) {
        setUser(fetchedUser);
        setPrivateNote(fetchedUser.note);
      }
    }
  }, [id, router]);

  const handleConnect = async () => {
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
    const dataToSign = user.encPk; // For now, we just sign the other user's encryption public key
    const signature = await sign(signaturePrivateKey, dataToSign);
    const recipientPublicKey = user.encPk;
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
      encryptionPublicKey: user.encPk,
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
      console.error("Error sharing information: ", error);
      alert("An error occurred while sending the message. Please try again.");
    }

    // Updates local storage with new private note and timestamp
    updateUserFromOutboundTap(user.encPk, privateNote);
    alert(`Successfully shared information with ${user.name}!`);
    router.push(`/users/${id}`);
  };

  const handleTwitterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShareTwitter(event.target.checked);
  };

  const handleTelegramChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShareTelegram(event.target.checked);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <AppBackHeader />
      <FormStepLayout
        title={`Connect with ${user.name}`}
        description="Share your contact information with this user."
        onSubmit={handleConnect}
      >
        <Input
          type="checkbox"
          className="form-checkbox"
          label={`Share my Twitter: @${profile.twitterUsername}`}
          disabled={!profile.twitterUsername}
          checked={shareTwitter}
          onChange={handleTwitterChange}
        />
        <Input
          type="checkbox"
          className="form-checkbox"
          label={`Share my Telegram: @${profile.telegramUsername}`}
          disabled={!profile.telegramUsername}
          checked={shareTelegram}
          onChange={handleTelegramChange}
        />
        <Input
          type="longtext"
          label="Private Note"
          value={privateNote}
          onChange={(event) => {
            setPrivateNote(event.target.value);
          }}
        />
        <Button type="submit">Connect</Button>
      </FormStepLayout>
    </div>
  );
};

export default SharePage;

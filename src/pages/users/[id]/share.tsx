import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  fetchUserByUUID,
  getAuthToken,
  getKeys,
  getProfile,
  User,
} from "@/lib/client/localStorage";
import {
  encryptInboundTapMessage,
  encryptOutboundTapMessage,
} from "@/lib/client/jubSignal";
import { sign } from "@/lib/shared/signature";
import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { AppBackHeader } from "@/components/AppHeader";
import toast from "react-hot-toast";
import { loadMessages } from "@/lib/client/jubSignalClient";
import { Checkbox } from "@/components/Checkbox";
import {
  InputWrapper,
  InputDescription as Description,
} from "@/components/input/InputWrapper";

const SharePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();
  const [profile, setProfile] = useState(getProfile());
  const [shareTwitter, setShareTwitter] = useState(false);
  const [shareTelegram, setShareTelegram] = useState(false);
  const [privateNote, setPrivateNote] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof id === "string") {
      const profile = getProfile();
      if (!profile) {
        toast.error("You must be logged in to connect");
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

  const handleConnect = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    if (!user) {
      toast.error("An error occurred. Please try again.");
      router.push("/");
      return;
    }

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to connect");
      router.push("/login");
      return;
    }

    const keys = getKeys();
    if (!keys) {
      console.error("Cannot find user keys");
      toast.error("You must be logged in to connect");
      router.push("/login");
      return;
    }
    const { encryptionPrivateKey, signaturePrivateKey } = keys;

    const profile = getProfile();
    if (!profile) {
      console.error("Cannot find user profile");
      toast.error("You must be logged in to connect");
      router.push("/login");
      return;
    }

    // ----- SEND MESSAGE TO OTHER USER -----
    // This messages sends contact information to the other user
    const dataToSign = user.encPk; // For now, we just sign the other user's encryption public key
    const signature = sign(signaturePrivateKey, dataToSign);
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
      setLoading(false);
      if (!response.ok) {
        const { error } = await response.json();
        console.error("Error sharing information: ", error);
        throw new Error("Failed to share information");
      }
    } catch (error) {
      toast.error(
        "An error occurred while sending the message. Please try again."
      );
      setLoading(false);
      return;
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
        const { error } = await response.json();
        console.error("Error sharing information: ", error);
        throw new Error("Failed to share information");
      }
    } catch (error) {
      toast.error(
        "An error occurred while sending the message. Please try again."
      );
      return;
    }

    // Updates local storage and activity feed
    try {
      await loadMessages({ forceRefresh: false });
      toast.success(`Successfully shared information with ${user.name}!`);
    } catch (error) {
      console.error("Error loading messages after sharing information");
      toast.error("An error occurred while updating your activity feed.");
    }

    router.push(`/users/${id}`);
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <FormStepLayout
        className="!pt-0"
        title={
          <span className="text-base text-gray-12 !pb-1">{`Share with ${user.name}`}</span>
        }
        onSubmit={handleConnect}
      >
        <Description>
          {`By sharing, you will allow ${user.name} to complete any quests that require meeting you. 
        This is done by sharing a private stamp that can be used to ZK prove they met you. `}
        </Description>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <InputWrapper
              size="sm"
              label={`Choose socials to share`}
              className="grid grid-cols-2 gap-2"
              spacing
            >
              <Checkbox
                id="twitter"
                label="X"
                disabled={!profile.twitterUsername}
                checked={shareTwitter}
                type="button"
                onChange={setShareTwitter}
              />
              <Checkbox
                id="x"
                label="Telegram"
                disabled={!profile.telegramUsername}
                checked={shareTelegram}
                type="button"
                onChange={setShareTelegram}
              />
            </InputWrapper>
          </div>
        </div>
        <Input
          type="longtext"
          label="Private note"
          placeholder="e.g Met on Saturday"
          textSize="sm"
          description={
            <>
              <span className="block">
                {`Use to help remember your interaction with ${user.name}.`}
              </span>
              <span className="block">Only you will see this.</span>
            </>
          }
          value={privateNote}
          onChange={(event) => {
            setPrivateNote(event.target.value);
          }}
        />
        <Button loading={loading} type="submit">
          Share
        </Button>
      </FormStepLayout>
    </div>
  );
};

SharePage.getInitialProps = () => {
  return { fullPage: true };
};

export default SharePage;

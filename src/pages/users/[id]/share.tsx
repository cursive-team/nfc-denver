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
import { AppBackHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { loadMessages } from "@/lib/client/jubSignalClient";
import { Checkbox } from "@/components/Checkbox";
import {
  InputWrapper,
  InputDescription as Description,
} from "@/components/input/InputWrapper";
import { v4 as uuidv4 } from "uuid";
import { MessageRequest } from "@/pages/api/messages";
import { generateSelfBitVector } from "@/lib/client/psi";
import init, { round1_js } from "@/lib/mp_psi/mp_psi";
import {
  getUserPsiState,
  saveUserRound1Output,
} from "@/lib/client/indexedDB/psi";

const SharePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();
  const [profile, setProfile] = useState(getProfile());
  const [shareTwitter, setShareTwitter] = useState(false);
  const [shareTelegram, setShareTelegram] = useState(false);
  const [shareFarcaster, setShareFarcaster] = useState(false);
  const [shareBio, setShareBio] = useState(false);
  const [shareOverlap, setShareOverlap] = useState(false);
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
        if (fetchedUser.encPk === profile.encryptionPublicKey) {
          toast.error("You cannot connect with yourself");
          router.push("/");
          return;
        }

        if (fetchedUser.outTs) {
          router.push(`/users/${id}?alreadyConnected=true`);
          return;
        }

        setUser(fetchedUser);
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
    const {
      encryptionPrivateKey,
      signaturePrivateKey,
      psiPrivateKeys,
      psiPublicKeys,
    } = keys;

    const profile = getProfile();
    if (!profile) {
      console.error("Cannot find user profile");
      toast.error("You must be logged in to connect");
      router.push("/login");
      return;
    }

    const response = await fetch(`/api/psiRound1Message/${user.pkId}`);
    if (!response.ok) {
      console.error("Error fetching user psi round 1 message: ", response);
      toast.error(
        "This user does not have overlap set up. Please try sharing without the overlap."
      );
      setLoading(false);
      return;
    }
    const { psiRound1Message: userMessageRound1 } = await response.json();

    let messageRound2 = undefined;
    if (shareOverlap && !userMessageRound1) {
      toast.error("User does not have their PSI parameters set up");
      setLoading(false);
      return;
    } else if (shareOverlap && userMessageRound1) {
      const selfBitVector = generateSelfBitVector();

      await init();
      const round1Output = round1_js(
        {
          psi_keys: JSON.parse(psiPrivateKeys),
          message_round1: JSON.parse(psiPublicKeys),
        },
        JSON.parse(userMessageRound1),
        selfBitVector
      );

      await saveUserRound1Output(user.encPk, JSON.stringify(round1Output));
      messageRound2 = JSON.stringify(round1Output.message_round2);
    }

    // ----- SEND MESSAGE TO OTHER USER -----
    // This messages sends contact information to the other user
    const dataToSign = uuidv4().replace(/-/g, ""); // For now, we just sign a random uuid as a hex string
    const signature = sign(signaturePrivateKey, dataToSign);
    const recipientPublicKey = user.encPk;
    const encryptedMessage = await encryptInboundTapMessage({
      twitterUsername: shareTwitter ? profile.twitterUsername : undefined,
      telegramUsername: shareTelegram ? profile.telegramUsername : undefined,
      farcasterUsername: shareFarcaster ? profile.farcasterUsername : undefined,
      bio: shareBio ? profile.bio : undefined,
      signaturePublicKey: profile.signaturePublicKey,
      signatureMessage: dataToSign,
      signature,
      senderPrivateKey: encryptionPrivateKey,
      recipientPublicKey,
      messageRound2,
      pkId: profile.pkId,
    });
    const otherUserMessageRequest: MessageRequest = {
      encryptedMessage,
      recipientPublicKey,
    };

    // ----- SEND MESSAGE TO SELF -----
    // This message records the outbound interaction
    const selfPublicKey = profile.encryptionPublicKey;
    const selfEncryptedMessage = await encryptOutboundTapMessage({
      displayName: user.name,
      pkId: user.pkId,
      encryptionPublicKey: user.encPk,
      privateNote: undefined,
      senderPrivateKey: encryptionPrivateKey,
      recipientPublicKey: selfPublicKey,
    });
    const selfMessageRequest: MessageRequest = {
      encryptedMessage: selfEncryptedMessage,
      recipientPublicKey: selfPublicKey,
    };

    // Send both messages and update activity feed
    try {
      await loadMessages({
        forceRefresh: false,
        messageRequests: [otherUserMessageRequest, selfMessageRequest],
      });
      toast.success(`Successfully shared information with ${user.name}!`);
      setLoading(false);
    } catch (error) {
      console.error("Error sending encrypted tap to server: ", error);
      toast.error(
        "An error occurred while sending the message. Please try again."
      );
      setLoading(false);
      return;
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
        {(profile.twitterUsername ||
          profile.telegramUsername ||
          profile.farcasterUsername ||
          profile.bio) && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <InputWrapper
                size="sm"
                label={`Choose socials to share`}
                className="grid grid-cols-2 gap-2"
                spacing
              >
                {profile.twitterUsername && (
                  <Checkbox
                    id="twitter"
                    label="X"
                    checked={shareTwitter}
                    type="button"
                    onChange={setShareTwitter}
                  />
                )}
                {profile.telegramUsername && (
                  <Checkbox
                    id="telegram"
                    label="Telegram"
                    checked={shareTelegram}
                    type="button"
                    onChange={setShareTelegram}
                  />
                )}
                {profile.farcasterUsername && (
                  <Checkbox
                    id="farcaster"
                    label="Farcaster"
                    checked={shareFarcaster}
                    type="button"
                    onChange={setShareFarcaster}
                  />
                )}
                {profile.bio && (
                  <Checkbox
                    id="bio"
                    label="Bio"
                    checked={shareBio}
                    type="button"
                    onChange={setShareBio}
                  />
                )}
              </InputWrapper>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-4">
          <InputWrapper
            size="sm"
            label={`Private overlap icebreaker`}
            description={
              <span>
                {`If both you and ${user.name} opt in, use `}
                <a
                  href="https://github.com/gaussian-dev/MP-PSI"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <u>FHE</u>
                </a>
                {` to discover a snapshot of shared contacts & locations without revealing
                anything else!`}
              </span>
            }
            className="grid grid-cols-1"
            spacing
          >
            <Checkbox
              id="overlap"
              label="Opt-in"
              checked={shareOverlap}
              type="button"
              onChange={setShareOverlap}
            />
          </InputWrapper>
        </div>
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

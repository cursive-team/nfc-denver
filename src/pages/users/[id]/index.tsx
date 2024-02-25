import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  fetchUserByUUID,
  getKeys,
  getProfile,
  User,
} from "@/lib/client/localStorage";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { Card } from "@/components/cards/Card";
import Link from "next/link";
import { classed } from "@tw-classed/react";
import { labelStartWith, removeLabelStartWith } from "@/lib/shared/utils";
import { InputWrapper } from "@/components/input/InputWrapper";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { encryptOutboundTapMessage } from "@/lib/client/jubSignal";
import { toast } from "sonner";
import { MessageRequest } from "@/pages/api/messages";
import { Spinner } from "@/components/Spinner";
import { loadMessages } from "@/lib/client/jubSignalClient";

const Label = classed.span("text-sm text-gray-12");

interface LinkCardProps {
  label?: string;
  href: string;
  value?: string;
}

const LinkCard = ({ label, value, href }: LinkCardProps) => {
  return (
    <Link href={href} target="_blank">
      <Card.Base className="flex items-center justify-between p-3">
        <div className="flex items-center gap-1">
          <Card.Title>{label}</Card.Title>
          <Card.Description>{value ?? "N/A"}</Card.Description>
        </div>
        <Icons.externalLink size={18} />
      </Card.Base>
    </Link>
  );
};

const UserProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();
  const [privateNote, setPrivateNote] = useState<string>("");
  const [viewNote, setViewNote] = useState(false);
  const [loading, setLoading] = useState(false);

  const alreadyConnected = router?.query?.alreadyConnected === "true";

  useEffect(() => {
    if (typeof id === "string") {
      const fetchedUser = fetchUserByUUID(id);
      setUser(fetchedUser);
      if (fetchedUser) setPrivateNote(fetchedUser.note || "");
    }
  }, [id]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Loading user..." />
      </div>
    );
  }

  if (viewNote) {
    const handleSaveNote = async () => {
      setLoading(true);

      const keys = getKeys();
      if (!keys) {
        console.error("Cannot find user keys");
        toast.error("You must be logged in to connect");
        router.push("/login");
        return;
      }

      const profile = getProfile();
      if (!profile) {
        console.error("Cannot find user profile");
        toast.error("You must be logged in to connect");
        router.push("/login");
        return;
      }

      const selfPublicKey = profile.encryptionPublicKey;
      const selfEncryptedMessage = await encryptOutboundTapMessage({
        displayName: user.name,
        pkId: user.pkId,
        encryptionPublicKey: user.encPk,
        privateNote,
        senderPrivateKey: keys.encryptionPrivateKey,
        recipientPublicKey: selfPublicKey,
      });
      const selfMessageRequest: MessageRequest = {
        encryptedMessage: selfEncryptedMessage,
        recipientPublicKey: selfPublicKey,
      };
      try {
        await loadMessages({
          forceRefresh: false,
          messageRequests: [selfMessageRequest],
        });
        toast.success(`Successfully saved private note!`);
        setLoading(false);
      } catch (error) {
        console.error("Error sending encrypted tap to server: ", error);
        toast.error("An error occurred while saving note. Please try again.");
        setLoading(false);
        return;
      }

      setViewNote(false);
      setLoading(false);
    };

    return (
      <div>
        <AppBackHeader onBackClick={() => setViewNote(false)} />
        <FormStepLayout
          title={
            <span className="text-base text-gray-12">{`Private note for ${user.name}`}</span>
          }
        >
          <Input
            type="longtext"
            placeholder="e.g Met on Saturday"
            textSize="xs"
            value={privateNote}
            description={`Use to help remember your interaction.`}
            onChange={(event) => {
              setPrivateNote(event.target.value);
            }}
          />
          <Button
            loading={loading}
            disabled={privateNote === (user.note || "")}
            size="sm"
            onClick={handleSaveNote}
          >
            Save
          </Button>
        </FormStepLayout>
      </div>
    );
  }

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      {alreadyConnected && (
        <div className="flex items-start justify-center py-28">
          <span className="text-xl text-gray-12">
            You have already connected with this user!
          </span>
        </div>
      )}
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="h-32 w-32 rounded bg-slate-200"></div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 mt-2">
              <h2 className="text-xl font-gray-12 font-light">{user.name}</h2>
              <div className="flex items-center gap-1">
                <Icons.checkedCircle />
                <span className="text-sm font-light text-gray-10">
                  {user.outTs ? (
                    <Label>{`Shared on ${new Date(user.outTs).toLocaleString(
                      undefined,
                      {
                        dateStyle: "medium",
                      }
                    )}`}</Label>
                  ) : (
                    <Label>{`Not yet connected.`}</Label>
                  )}
                </span>
              </div>
            </div>

            <Button size="sm" onClick={() => setViewNote(true)}>
              {user && user.note ? "View private note" : "Set private note"}
            </Button>
          </div>
        </div>
        {!user.inTs && (
          <div className="p-3 bg-zinc-900 rounded flex-col justify-center items-start gap-1 inline-flex">
            <InputWrapper
              className="flex flex-col gap-2"
              label="Details pending"
            >
              <span className="text-gray-11 text-[14px] left-5 mt-1">
                If {user.name} taps you back and shares their socials, they will
                appear here.
              </span>
            </InputWrapper>
          </div>
        )}
        {(user.x || user.tg || user.fc) && (
          <div className="flex flex-col gap-1">
            {(user.x?.length ?? 0) > 1 && (
              <LinkCard
                label="Twitter"
                href={`https://x.com/${removeLabelStartWith(user.x, "@")}`}
                value={labelStartWith(user.x, "@")}
              />
            )}
            {(user.tg?.length ?? 0) > 1 && (
              <LinkCard
                label="Telegram"
                href={`https://t.me/${removeLabelStartWith(user.tg, "@")}`}
                value={labelStartWith(user.tg, "@")}
              />
            )}
            {(user.fc?.length ?? 0) > 1 && (
              <LinkCard
                label="Farcaster"
                href={`https://warpcast.com/${removeLabelStartWith(
                  user.fc,
                  "@"
                )}`}
                value={labelStartWith(user.fc, "@")}
              />
            )}
          </div>
        )}
        {user.bio && (
          <InputWrapper className="flex flex-col gap-2" label={`Bio`}>
            <span className="text-gray-11 text-[14px] mt-1 left-5">
              {user.bio}
            </span>
          </InputWrapper>
        )}
      </div>
    </div>
  );
};

UserProfilePage.getInitialProps = () => {
  return { showHeader: false, showFooter: true };
};

export default UserProfilePage;

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchUserByUUID, User } from "@/lib/client/localStorage";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
import Link from "next/link";
import { classed } from "@tw-classed/react";
import { labelStartWith, removeLabelStartWith } from "@/lib/shared/utils";
import { InputWrapper } from "@/components/input/InputWrapper";

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

  useEffect(() => {
    if (typeof id === "string") {
      const fetchedUser = fetchUserByUUID(id);
      setUser(fetchedUser);
    }
  }, [id]);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="h-32 w-32 rounded bg-slate-200"></div>
          <div className="flex flex-col gap-1">
            <h2 className=" text-xl font-gray-12 font-light">{user.name}</h2>
            <div className="flex items-center gap-1">
              <Icons.checkedCircle />
              <span className="text-sm font-light text-white">
                {user.outTs ? (
                  <Label>{`You shared on ${new Date(user.outTs).toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                    }
                  )}`}</Label>
                ) : (
                  <Label>{`You have not yet connected with ${user.name}.`}</Label>
                )}
              </span>
            </div>
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
        {user?.note && (
          <InputWrapper
            className="flex flex-col gap-2"
            label="Your private note"
          >
            <span className="text-gray-11 text-[14px] mt-1 left-5">
              {user?.note}
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

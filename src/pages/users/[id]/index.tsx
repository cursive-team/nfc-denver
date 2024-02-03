import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchUserByUUID, User } from "@/lib/client/localStorage";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
import Link from "next/link";
import { classed } from "@tw-classed/react";
import { Input } from "@/components/Input";
import { labelStartWith } from "@/lib/shared/utils";

const Label = classed.span("text-sm text-gray-12");

interface LinkCardProps {
  label?: string;
  href: string;
  value?: string;
}

const LinkCard = ({ label, value, href }: LinkCardProps) => {
  return (
    <Link href={href}>
      <Card.Base className="flex items-center gap-2 p-3">
        <Card.Title>{label}</Card.Title>
        <Card.Description>{value ?? "N/A"}</Card.Description>
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
                {user.inTs ? (
                  <Label>{`Connected on ${new Date(user.inTs).toLocaleString(
                    undefined,
                    {
                      dateStyle: "short",
                    }
                  )}`}</Label>
                ) : (
                  <Label>{`Not connected.`}</Label>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {user.outTs ? (
            <Label>{`You connected with ${user.name} on ${new Date(
              user.outTs
            ).toLocaleString()}`}</Label>
          ) : (
            <Label>{`You have not yet connected with ${user.name}.`}</Label>
          )}
        </div>
        {(user?.x || user.tg) && (
          <ListLayout className="!gap-2" label="Links">
            <div className="flex flex-col gap-1">
              {(user?.x?.length ?? 0) > 1 && (
                <LinkCard
                  label="Twitter"
                  href={`https://x.com/${user.x}`}
                  value={labelStartWith(user.x, "@")}
                />
              )}
              {(user?.tg?.length ?? 0) > 1 && (
                <LinkCard
                  label="Telegram"
                  href={`https://t.me/${user.tg}`}
                  value={labelStartWith(user.tg, "@")}
                />
              )}
            </div>
          </ListLayout>
        )}
        <Input label="Your private note" value={user?.note} readOnly disabled />
      </div>
    </div>
  );
};

UserProfilePage.getInitialProps = () => {
  return { fullPage: true };
};

export default UserProfilePage;

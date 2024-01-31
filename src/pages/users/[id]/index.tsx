import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchUserByUUID, User } from "@/lib/client/localStorage";
import { AppBackHeader } from "@/components/AppHeader";
import { Icons } from "@/components/Icons";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
import Link from "next/link";
import { Button } from "@/components/Button";

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
      <AppBackHeader />
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 items-center">
          <div className="h-32 w-32 rounded bg-slate-200"></div>
          <div className="flex flex-col gap-1">
            <h2 className=" text-xl font-gray-12 font-light">{user.name}</h2>
            <div className="flex items-center gap-1">
              <Icons.checkedCircle />
              <span className="text-sm font-light text-white">
                Connected XXX
              </span>
            </div>
            <Button onClick={() => router.push(`/users/${id}/share`)}>
              Connect
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {user.outTs ? (
            <span>{`You connected with ${user.name} on ${new Date(
              user.outTs
            ).toLocaleString()}`}</span>
          ) : (
            <span>{`You have not yet connected with ${user.name}.`}</span>
          )}
          {user.inTs ? (
            <span>{`${user.name} connected with you on ${new Date(
              user.inTs
            ).toLocaleString()}`}</span>
          ) : (
            <span>{`${user.name} has not yet connected with you.`}</span>
          )}
        </div>
        <ListLayout className="!gap-2" label="Links">
          <div className="flex flex-col gap-1">
            {user.x && (
              <Link href={`https://x.com/${user.x}`}>
                <Card.Base className="flex gap-2 p-3">
                  <Card.Title>Twitter</Card.Title>
                  <Card.Description>@{user.x}</Card.Description>
                </Card.Base>
              </Link>
            )}
            {user.tg && (
              <Link href={`https://t.me/${user.tg}`}>
                <Card.Base className="flex gap-2 p-3">
                  <Card.Title>Telegram</Card.Title>
                  <Card.Description>
                    {user.tg ? "@" + user.tg : "N/A"}
                  </Card.Description>
                </Card.Base>
              </Link>
            )}
          </div>
        </ListLayout>
      </div>
    </div>
  );
};

export default UserProfilePage;

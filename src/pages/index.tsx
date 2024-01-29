import { Icons } from "@/components/Icons";
import { ProfileImage } from "@/components/ProfileImage";
import { Button } from "@/components/Button";
import { TabsProps, Tabs } from "@/components/Tabs";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Activity,
  Profile,
  User,
  getActivities,
  getAuthToken,
  getKeys,
  getMessages,
  getProfile,
  getUsers,
  writeMessages,
} from "@/lib/client/localStorage";
import {
  EncryptedMessage,
  PlaintextMessage,
  decryptMessage,
} from "@/lib/client/jubSignal";
import { PointCard } from "@/components/cards/PointCard";

interface ContactCardProps {
  name: string;
  date: string;
}

const ContactCard = ({ name, date }: ContactCardProps) => {
  return (
    <Link href="/contact/1">
      <Card.Base className="flex justify-between p-3">
        <Card.Title>{name}</Card.Title>
        <Card.Description>{date}</Card.Description>
      </Card.Base>
    </Link>
  );
};

const ConnectionFeed = ({ name, date }: ContactCardProps) => {
  return (
    <div className="flex justify-between py-1">
      <div className="flex items-center gap-2">
        <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
          <Icons.person />
        </div>
        <Card.Title>{name}</Card.Title>
      </div>
      <Card.Description>{date}</Card.Description>
    </div>
  );
};

const items: TabsProps["items"] = [
  {
    label: "Connection feed",
    children: (
      <div className="flex flex-col gap-4">
        <ListLayout className="!gap-2" label="January 22nd">
          <ConnectionFeed name="Andrew" date="12:45am" />
          <ConnectionFeed name="Alex" date="5:43pm" />
          <ConnectionFeed name="Kali" date="5:45pm" />
        </ListLayout>
        <ListLayout className="!gap-2" label="January 23rd">
          <ConnectionFeed name="Alan" date="1:31pm" />
          <ConnectionFeed name="Ben" date="2:45pm" />
        </ListLayout>
        <ListLayout className="!gap-2" label="January 24th">
          <ConnectionFeed name="Bobby" date="1:25pm" />
        </ListLayout>
      </div>
    ),
  },
  {
    label: "Contacts",
    children: (
      <div className="flex flex-col gap-5">
        <ListLayout className="!gap-2" label="A">
          <div className="flex flex-col gap-1">
            <ContactCard name="Andrew" date="January 22nd 12:45am" />
            <ContactCard name="Alan" date="January 23rd 1:31pm" />
            <ContactCard name="Alex" date="January 22nd 5:43pm" />
          </div>
        </ListLayout>
        <ListLayout className="!gap-2" label="B">
          <div className="flex flex-col gap-1">
            <ContactCard name="Ben" date="January 23rd 2:45pm" />
            <ContactCard name="Bobby" date="January 24th 1:25pm" />
          </div>
        </ListLayout>
        <ListLayout className="!gap-2" label="K">
          <div className="flex flex-col gap-1">
            <ContactCard name="Kali" date="January 22nd 5:45pm" />
          </div>
        </ListLayout>
      </div>
    ),
  },
];

export default function Social() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>();
  const [users, setUsers] = useState<Record<string, User>>({});
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const profileData = getProfile();
    const keyData = getKeys();
    const authToken = getAuthToken();
    const users = getUsers();
    const activities = getActivities();
    if (
      !profileData ||
      !keyData ||
      !authToken ||
      authToken.expiresAt < new Date()
    ) {
      router.push("/login");
    } else {
      setProfile(profileData);
      setUsers(users);
      setActivities(activities);
    }
  }, [router]);

  if (!profile) {
    return null;
  }

  // Group activities by date
  const groupedActivities: Activity[][] = [];
  let currentDate: string | undefined = undefined;
  let currentDateActivities: Activity[] = [];
  activities.forEach((activity) => {
    const date = new Date(activity.ts).toDateString();
    if (currentDate === undefined) {
      currentDateActivities.push(activity);
      currentDate = date;
    } else if (currentDate === date) {
      currentDateActivities.push(activity);
    } else {
      groupedActivities.push(currentDateActivities);
      currentDateActivities = [activity];
      currentDate = date;
    }
  });
  groupedActivities.push(currentDateActivities);

  // Sort contacts by name then group by first letter
  const usersList = Object.values(users);
  const sortedUsers = usersList.sort((a, b) => {
    return a.name.localeCompare(b.name, "en", { sensitivity: "base" }); // Ignore case
  });
  const groupedUsers: User[][] = [];
  let currentLetter: string | undefined = undefined;
  let currentLetterUsers: User[] = [];
  sortedUsers.forEach((user) => {
    const letter = user.name[0].toUpperCase();
    if (currentLetter === undefined) {
      currentLetterUsers.push(user);
      currentLetter = letter;
    } else if (currentLetter === letter) {
      currentLetterUsers.push(user);
    } else {
      groupedUsers.push(currentLetterUsers);
      currentLetterUsers = [user];
      currentLetter = letter;
    }
  });
  groupedUsers.push(currentLetterUsers);

  const tabItems: TabsProps["items"] = [
    {
      label: "Activity Feed",
      children: (
        <div className="flex flex-col gap-4">
          {" "}
          {activities.length === 0 && (
            <div className="flex justify-center items-center h-40">
              <span className="text-gray-10">No activities yet</span>
            </div>
          )}
          {activities.length !== 0 &&
            groupedActivities.map((activities, index) => {
              return (
                <ListLayout
                  key={index}
                  label={new Date(activities[0].ts).toDateString()}
                >
                  {activities.map((activity, index) => {
                    return (
                      <ConnectionFeed
                        key={index}
                        name={activity.name}
                        date={new Date(activity.ts).toLocaleTimeString()}
                      />
                    );
                  })}
                </ListLayout>
              );
            })}
        </div>
      ),
    },
    {
      label: "Contacts",
      children: (
        <div className="flex flex-col gap-5">
          {" "}
          {usersList.length === 0 && (
            <div className="flex justify-center items-center h-40">
              <span className="text-gray-10">No contacts yet</span>
            </div>
          )}
          {usersList.length !== 0 &&
            groupedUsers.map((users, index) => {
              return (
                <ListLayout key={index} label={users[0].name[0].toUpperCase()}>
                  <div className="flex flex-col gap-1">
                    {users.map((user, index) => {
                      const { name, outTs, inTs } = user;
                      const outDate = outTs ? new Date(outTs) : undefined;
                      const inDate = inTs ? new Date(inTs) : undefined;

                      // Use most recent timestamp of an interaction with this user
                      let date;
                      if (outDate && inDate) {
                        date =
                          inDate > outDate
                            ? inDate.toLocaleString()
                            : outDate.toLocaleString();
                      } else if (inDate) {
                        date = inDate.toLocaleString();
                      } else if (outDate) {
                        date = outDate.toLocaleString();
                      } else {
                        date = "";
                      }

                      return (
                        <ContactCard key={index} name={name} date={date} />
                      );
                    })}
                  </div>
                </ListLayout>
              );
            })}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex gap-6">
        <Link href="/snapshot/1">
          <ProfileImage>
            <img
              width="100%"
              src="https://fnhxjtmpinl8vxmj.public.blob.vercel-storage.com/Your_Artwork-Evl6XS2t9gSpQ6LHk2HU1pSHKMsjHY.png"
            />

            <button type="button" className="absolute right-1 top-1">
              <Icons.zoom />
            </button>
          </ProfileImage>
        </Link>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex gap-[6px] items-center">
              <h2 className="text-xl font-gray-12 font-light">
                {profile?.displayName}
              </h2>
              <PointCard point={199} />
            </div>
            <span className="text-sm font-light text-gray-10">
              {`${Object.keys(users).length} Connections`}
            </span>
          </div>
          <Link href="/leaderboard">
            <Card.Base className="flex items-center justify-center p-2 bg-gray-200">
              <span className="text-white text-sm">View leaderboard</span>
            </Card.Base>
          </Link>
        </div>
      </div>
      <Tabs items={tabItems} />
    </div>
  );
}

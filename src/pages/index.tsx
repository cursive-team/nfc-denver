import { Icons } from "@/components/Icons";
import { ProfileImage } from "@/components/ProfileImage";
import { TabsProps, Tabs } from "@/components/Tabs";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
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
  getProfile,
  getUsers,
} from "@/lib/client/localStorage";
import { JUB_SIGNAL_MESSAGE_TYPE } from "@/lib/client/jubSignal";
import { PointCard } from "@/components/cards/PointCard";
import { SnapshotModal } from "@/components/modals/SnapshotModal";
import Image from "next/image";

interface ContactCardProps {
  name: string;
  userId: string;
  date: string;
}

const ContactCard = ({ name, userId, date }: ContactCardProps) => {
  return (
    <Link href={`/users/${userId}`}>
      <Card.Base className="flex justify-between p-3">
        <Card.Title className="leading-none">{name}</Card.Title>
        <Card.Description>{date}</Card.Description>
      </Card.Base>
    </Link>
  );
};

interface ActivityFeedProps {
  type: JUB_SIGNAL_MESSAGE_TYPE;
  name: string;
  id: string;
  date: string;
}

const ActivityFeed = ({ type, name, id, date }: ActivityFeedProps) => {
  switch (type) {
    case JUB_SIGNAL_MESSAGE_TYPE.OUTBOUND_TAP:
      return (
        <Link href={`/users/${id}`}>
          <div className="flex justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
                <Icons.person />
              </div>
              <Card.Title>
                {
                  <div>
                    <u>You</u> {"connected with"} <u>{name}</u>
                  </div>
                }
              </Card.Title>
            </div>
            <Card.Description>{date}</Card.Description>
          </div>
        </Link>
      );
    case JUB_SIGNAL_MESSAGE_TYPE.INBOUND_TAP:
      return (
        <Link href={`/users/${id}`}>
          <div className="flex justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
                <Icons.person />
              </div>
              <Card.Title>
                {
                  <div>
                    <u>{name}</u> {"connected with"} <u>You</u>
                  </div>
                }
              </Card.Title>
            </div>
            <Card.Description>{date}</Card.Description>
          </div>
        </Link>
      );
    case JUB_SIGNAL_MESSAGE_TYPE.LOCATION_TAP:
      return (
        <Link href={`/locations/${id}`}>
          <div className="flex justify-between py-1">
            <div className="flex items-center gap-2">
              <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
                <Icons.person />
              </div>
              <Card.Title>
                {
                  <div>
                    <u>You</u> {"visited"} <u>{name}</u>
                  </div>
                }
              </Card.Title>
            </div>
            <Card.Description>{date}</Card.Description>
          </div>
        </Link>
      );
    default:
      return null;
  }
};

export default function Social() {
  const router = useRouter();
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [buidlBalance, setBuidlBalance] = useState<number>(0);
  const [numConnections, setNumConnections] = useState<number>(0);
  const [tabsItems, setTabsItems] = useState<TabsProps["items"]>();

  // Helper function to compute data needed to populate tabs
  const computeTabsItems = (
    users: Record<string, User>,
    activities: Activity[]
  ): TabsProps["items"] => {
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
    const usersList = Object.entries(users).map(([key, value]) => ({
      ...value,
      uuid: key,
    }));
    const sortedUsers = usersList.sort((a, b) => {
      return a.name.localeCompare(b.name, "en", { sensitivity: "base" }); // Ignore case
    });
    const groupedUsers: (User & { uuid: string })[][] = []; // User with uuid property included
    let currentLetter: string | undefined = undefined;
    let currentLetterUsers: (User & { uuid: string })[] = [];
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

    return [
      {
        label: "Activity Feed",
        children: (
          <div className="flex flex-col gap-4">
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
                        <ActivityFeed
                          key={index}
                          type={activity.type}
                          name={activity.name}
                          id={activity.id}
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
            {usersList.length === 0 && (
              <div className="flex justify-center items-center h-40">
                <span className="text-gray-10">No contacts yet</span>
              </div>
            )}
            {usersList.length !== 0 &&
              groupedUsers.map((users, index) => {
                return (
                  <ListLayout
                    key={index}
                    label={users[0].name[0].toUpperCase()}
                  >
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
                          <ContactCard
                            key={index}
                            name={name}
                            userId={user.uuid}
                            date={date}
                          />
                        );
                      })}
                    </div>
                  </ListLayout>
                );
              })}
          </div>
        ),
      },
      {
        label: "Pending",
        children: null,
      },
    ];
  };

  useEffect(() => {
    const EXAMPLE_BUIDL_BALANCE = 199;

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
      setBuidlBalance(EXAMPLE_BUIDL_BALANCE);
      setNumConnections(Object.keys(users).length);
      setTabsItems(computeTabsItems(users, activities)); // Sorting logic for activities and contacts
    }
  }, [router]);

  if (!profile || !tabsItems) {
    return null;
  }

  return (
    <>
      <SnapshotModal
        isOpen={showSnapshotModal}
        setIsOpen={setShowSnapshotModal}
      />
      <div className="flex flex-col pt-4">
        <div className="flex gap-6 mb-6">
          <ProfileImage
            onClick={() => {
              setShowSnapshotModal(true);
            }}
          >
            <Image
              src="https://picsum.photos/600/600"
              width={200}
              height={200}
              alt="Profile image"
              className="bg-cover"
            />
            <button type="button" className="absolute right-1 top-1">
              <Icons.zoom />
            </button>
          </ProfileImage>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex gap-[6px] items-center">
                <h2 className="text-xl font-gray-12 font-light">
                  {profile?.displayName}
                </h2>
                <PointCard point={buidlBalance} />
              </div>
              <span className="text-sm font-light text-gray-10">
                {numConnections === 1
                  ? `${numConnections} Connection`
                  : `${numConnections} Connections`}
              </span>
            </div>
            <Link href="/leaderboard">
              <Card.Base className="flex items-center justify-center p-2 bg-gray-200">
                <span className="text-white text-sm">View leaderboard</span>
                <div className="ml-auto">
                  <Icons.arrowRight />
                </div>
              </Card.Base>
            </Link>
          </div>
        </div>
      </div>
      <Tabs items={tabsItems} />
    </>
  );
}

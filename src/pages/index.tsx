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
  Profile,
  User,
  getAuthToken,
  getKeys,
  getMessages,
  getProfile,
  getUsers,
  writeMessages,
} from "@/lib/client/localStorage";
import {
  EncryptedMessage,
  Message,
  decryptMessage,
} from "@/lib/client/jubSignal";
import { PointCard } from "@/components/cards/PointCard";
import { SnapshotModal } from "@/components/modals/SnapshotModal";

interface ContactCardProps {
  name: string;
  date: string;
}

const ContactCard = ({ name, date }: ContactCardProps) => {
  return (
    <Link href="/contact/1">
      <Card.Base className="flex justify-between p-3">
        <Card.Title className="leading-none">{name}</Card.Title>
        <Card.Description>{date}</Card.Description>
      </Card.Base>
    </Link>
  );
};

const IconCard = () => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full">
        <Icons.person clasName="block" />
      </div>
    </div>
  );
};

const ConnectionFeed = ({ name, date }: ContactCardProps) => {
  return (
    <div className="flex flex-col group">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <IconCard />
          <Card.Title>{name}</Card.Title>
        </div>
        <Card.Description>{date}</Card.Description>
      </div>
      <div className="group-last-of-type:hidden ml-[11px] h-[6px] w-[1px] bg-gray-300 my-1"></div>
    </div>
  );
};

const items: TabsProps["items"] = [
  {
    label: "Connection feed",
    children: (
      <div className="flex flex-col gap-4">
        <ListLayout label="January 22nd">
          <ConnectionFeed name="Andrew" date="12:45am" />
          <ConnectionFeed name="Alex" date="5:43pm" />
          <ConnectionFeed name="Kali" date="5:45pm" />
        </ListLayout>
        <ListLayout label="January 23rd">
          <ConnectionFeed name="Alan" date="1:31pm" />
          <ConnectionFeed name="Ben" date="2:45pm" />
        </ListLayout>
        <ListLayout label="January 24th">
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
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [users, setUsers] = useState<Record<string, User>>({});
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const profileData = getProfile();
    const keyData = getKeys();
    const authToken = getAuthToken();
    const users = getUsers();
    const messages = getMessages();
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
      setMessages(messages);
    }
  }, [router]);

  // If user is logged in, fetch new messages
  useEffect(() => {
    const fetchMessages = async () => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        return;
      }

      const keyData = getKeys();
      if (!keyData) {
        return;
      }

      // Get all messages in past 24 hours
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const response = await fetch(
        `/api/messages?token=${encodeURIComponent(
          authToken.value
        )}&startDate=${startDate.toISOString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const messages = await response.json();

        // TODO: Validate format of messages received
        const decryptedMessages = await Promise.all(
          messages.map((message: EncryptedMessage) =>
            decryptMessage(message, keyData.encryptionPrivateKey)
          )
        );

        writeMessages(decryptedMessages);
      } else {
        console.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, []);

  if (!profile) {
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
                <PointCard point={199} color="white" size="xs" />
              </div>
              <span className="text-sm font-light text-gray-10">
                {`${Object.keys(users).length} Connections`}
              </span>
            </div>
            <Link href="/leaderboard">
              <Button size="tiny">View leaderboard</Button>
            </Link>
          </div>
        </div>
        <Tabs items={items} />
      </div>
    </>
  );
}

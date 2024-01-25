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
          <ConnectionFeed name="Mr K" date="12:38am" />
          <ConnectionFeed name="Elon" date="12:38am" />
        </ListLayout>
        <ListLayout className="!gap-2" label="January 23nd">
          <ConnectionFeed name="Mr t" date="14:38am" />
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
            <ContactCard name="Andrew" date="Today 12:45am" />
            <ContactCard name="Alan" date="Today 12:45am" />
            <ContactCard name="Alex" date="Today 12:45am" />
          </div>
        </ListLayout>
        <ListLayout className="!gap-2" label="B">
          <div className="flex flex-col gap-1">
            <ContactCard name="Ben" date="Today 12:45am" />
            <ContactCard name="Bobby" date="Today 12:45am" />
          </div>
        </ListLayout>
        <ListLayout className="!gap-2" label="K">
          <div className="flex flex-col gap-1">
            <ContactCard name="Kali" date="Today 12:45am" />
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
      <Tabs items={items} />
    </div>
  );
}

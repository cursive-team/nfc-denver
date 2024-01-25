import { Icons } from "@/components/Icons";
import { ProfileImage } from "@/components/ProfileImage";
import { Button } from "@/components/Button";
import { TabsProps, Tabs } from "@/components/Tabs";
import { Card } from "@/components/cards/Card";
import { ListLayout } from "@/layouts/ListLayout";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface ContactCardProps {
  name: string;
  date: string;
}

const ContactCard = ({ name, date }: ContactCardProps) => {
  return (
    <Link href="/social/contact/1">
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
        <div className="flex justify-center items-center bg-[#677363] h-6 w-6 rounded-full"></div>
        <Card.Title>{name}</Card.Title>
      </div>
      <Card.Description>{date}</Card.Description>
    </div>
  );
};

export default function Social() {
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

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex gap-6">
        <Link href="/social/snapshot/1">
          <ProfileImage>
            <button type="button" className="absolute right-1 top-1">
              <Icons.zoom />
            </button>
          </ProfileImage>
        </Link>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex gap-[6px] items-center">
              <h2 className="text-xl font-gray-12 font-light">Name</h2>
              <Card.Base className="bg-gray-100/10 px-1 py-0.5 flex items-center gap-[6px]">
                <Image
                  width={15}
                  height={15}
                  src="/icons/buidl.png"
                  alt="buidl"
                />
                <span className="text-gray-100 text-xs font-thin">
                  XX BUIDL
                </span>
              </Card.Base>
            </div>
            <span className="text-sm font-light text-gray-10">
              XX Connections
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

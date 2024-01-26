import { useState } from "react";
import { Icons } from "../Icons";
import { PointCard } from "../cards/PointCard";
import { Modal, ModalProps } from "./Modal";
import { Button } from "../Button";
import Link from "next/link";
import { classed } from "@tw-classed/react";
import QRCode from "react-qr-code";

interface QuestDetailProps {
  questName?: string;
  type: "point" | "item";
}

const QRCodeWrapper = classed.div("bg-white max-w-[254px]");

interface CompleteQuestModalProps extends QuestDetailProps, ModalProps {}

const RedeemPoint = ({ questName }: Omit<QuestDetailProps, "type">) => {
  const [redeemPoint, setRedeemPoint] = useState(false);

  return (
    <div className="flex flex-col w-full justify-center text-center gap-5">
      <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
      <div className="flex flex-col gap-1 self-center">
        <div className="flex flex-col">
          <span className="text-xs text-gray-10">{questName}</span>
          <span className="text-xl text-gray-12">Quest completed</span>
        </div>
      </div>
      <div className="flex self-center w-full justify-center">
        {!redeemPoint ? (
          <Button
            onClick={() => {
              setRedeemPoint(true);
            }}
            className="w-full"
          >
            Collected X BUILD
          </Button>
        ) : (
          <PointCard label="Your balance" point={99} />
        )}
      </div>
      <div className="flex items-center gap-1 self-center">
        <span className="text-sm text-gray-11">Share on</span>
        <Icons.twitter />
      </div>
    </div>
  );
};

const RedeemItem = ({ questName }: Omit<QuestDetailProps, "type">) => {
  const [redeemItem, setRedeemItem] = useState(false);
  const [itemPurchased, setItemPurchased] = useState(false);
  const qrCodeUrl = "https://www.google.com";

  if (redeemItem && !itemPurchased)
    return (
      <div className="flex flex-col justify-center items-center text-center w-full gap-6">
        <div className="flex flex-col justify-center items-center">
          <span className="text-xs text-gray-10">Partner name</span>
          <span className="text-xl text-gray-12">Item name</span>
        </div>
        <span className="text-sm text-gray-12">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus,
          delectus?
        </span>
        <PointCard className="!gap-3" label="Balance" point={33} />
        <Button
          onClick={() => {
            setItemPurchased(true);
          }}
        >
          <PointCard
            label="Pay"
            variant="transparent"
            color="white"
            size="sm"
            point={99}
          />
        </Button>
      </div>
    );

  if (itemPurchased) {
    return (
      <div className="flex flex-col justify-center items-center text-center w-full gap-6 mt-24">
        <div className="flex flex-col justify-center items-center">
          <span className="text-xl text-gray-12">Redeemed</span>
        </div>
        <QRCodeWrapper>
          <QRCode
            size={254}
            className="ml-auto p-4 h-auto w-full max-w-full"
            value={qrCodeUrl}
            viewBox={`0 0 254 254`}
          />
        </QRCodeWrapper>
        <span className="text-sm text-gray-12 font-light">
          Show the QR code to claim the physical item
        </span>
        <Link className="w-full" href="/quests">
          <Button>Back to quests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full justify-center text-center gap-5">
      <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
      <div className="flex flex-col gap-1 self-center">
        <div className="flex flex-col">
          <span className="text-xs text-gray-10">{questName}</span>
          <span className="text-xl text-gray-12">Quest completed</span>
        </div>
      </div>
      <div className="self-center w-full">
        {!redeemItem && (
          <Button
            onClick={() => {
              setRedeemItem(true);
            }}
            className="w-full"
          >
            Redeem item name
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1 self-center">
        <span className="text-sm text-gray-11">Share on</span>
        <Icons.twitter />
      </div>
    </div>
  );
};

const CompleteQuestModal = ({
  isOpen,
  setIsOpen,
  questName,
  type,
}: CompleteQuestModalProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex h-[50vh]">
        {type === "point" && <RedeemPoint questName={questName} />}
        {type === "item" && <RedeemItem questName={questName} />}
      </div>
    </Modal>
  );
};

CompleteQuestModal.displayName = "CompleteQuestModal";
export { CompleteQuestModal };

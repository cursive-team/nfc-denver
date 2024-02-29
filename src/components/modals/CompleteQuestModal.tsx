import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Icons } from "../Icons";
import { PointCard } from "../cards/PointCard";
import { Modal, ModalProps } from "./Modal";
import { Button } from "../Button";
import Link from "next/link";
import { classed } from "@tw-classed/react";
import { QuestWithRequirementsAndItem } from "@/types";
import {
  QuestProvingStateUpdate,
  generateProofForQuest,
} from "@/lib/client/proving";
import {
  getAuthToken,
  getItemRedeemed,
  getKeys,
  getProfile,
} from "@/lib/client/localStorage";
import { toast } from "sonner";
import { useRouter } from "next/router";
import { encryptQuestCompletedMessage } from "@/lib/client/jubSignal";
import { loadMessages } from "@/lib/client/jubSignalClient";
import { Spinner } from "../Spinner";

const QRCodeWrapper = classed.div("bg-white max-w-[254px]");

const RedeemPoint = ({ questName }: { questName: string }) => {
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
            Collected X BUIDL
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

const RedeemItem = ({ questName }: { questName: string }) => {
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
          <PointCard label="Pay" size="sm" point={99} />
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

interface CompleteQuestModalProps extends ModalProps {
  quest: QuestWithRequirementsAndItem;
  existingProofId?: string;
}

enum CompleteQuestDisplayState {
  INITIAL,
  PROVING,
  COMPLETED,
}

type QuestProvingState = {
  numRequirementsTotal: number;
  numRequirementsProven: number;
  currentRequirementNumSigsTotal: number;
  currentRequirementNumSigsProven: number;
};

const CompleteQuestModal = ({
  quest,
  isOpen,
  setIsOpen,
  existingProofId,
}: CompleteQuestModalProps) => {
  const router = useRouter();
  const [displayState, setDisplayState] = useState<CompleteQuestDisplayState>(
    CompleteQuestDisplayState.INITIAL
  );
  const [provingState, setProvingState] = useState<QuestProvingState>({
    numRequirementsTotal: 0,
    numRequirementsProven: 0,
    currentRequirementNumSigsTotal: 0,
    currentRequirementNumSigsProven: 0,
  });
  const [proofId, setProofId] = useState<string>();
  const [itemRedeemed, setItemRedeemed] = useState(false);

  useEffect(() => {
    if (existingProofId) {
      setProofId(existingProofId);
      setDisplayState(CompleteQuestDisplayState.COMPLETED);
      if (quest.item) {
        const itemRedeemed = getItemRedeemed(quest.item.id.toString());
        if (itemRedeemed) {
          setItemRedeemed(true);
        }
      }
    }
  }, [existingProofId, quest.item]);

  const handleCompleteQuest = async () => {
    const authToken = getAuthToken();
    const profile = getProfile();
    const keys = getKeys();

    if (!authToken || authToken.expiresAt < new Date() || !profile || !keys) {
      toast.error("You must be logged in to complete a quest");
      router.push("/login");
      return;
    }

    setDisplayState(CompleteQuestDisplayState.PROVING);

    const onUpdateProvingState = (
      provingStateUpdate: QuestProvingStateUpdate
    ) => {
      setProvingState((prevProvingState) => {
        const newProvingState = { ...prevProvingState };
        if (provingStateUpdate.numRequirementsUpdate) {
          newProvingState.numRequirementsTotal =
            provingStateUpdate.numRequirementsUpdate.numRequirementsTotal;
          newProvingState.numRequirementsProven =
            provingStateUpdate.numRequirementsUpdate.numRequirementsProven;
        }
        if (provingStateUpdate.currentRequirementUpdate) {
          newProvingState.currentRequirementNumSigsTotal =
            provingStateUpdate.currentRequirementUpdate.currentRequirementNumSigsTotal;
          newProvingState.currentRequirementNumSigsProven =
            provingStateUpdate.currentRequirementUpdate.currentRequirementNumSigsProven;
        }

        return newProvingState;
      });
    };

    const serializedProof = await generateProofForQuest(
      quest,
      onUpdateProvingState
    );

    const response = await fetch("/api/quest/submit_proof", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questId: quest.id.toString(),
        authToken: authToken.value,
        serializedProof,
      }),
    });

    if (!response.ok) {
      toast.error("Failed to submit proof!");
      setDisplayState(CompleteQuestDisplayState.INITIAL);
      return;
    }

    const data = await response.json();
    if (!data.verified) {
      toast.error("Proof failed to verify!");
      setDisplayState(CompleteQuestDisplayState.INITIAL);
      return;
    }

    const proofId = data.proofId;
    if (!proofId) {
      toast.error("Failed to submit proof!");
      setDisplayState(CompleteQuestDisplayState.INITIAL);
      return;
    }

    const senderPrivateKey = keys.encryptionPrivateKey;
    const recipientPublicKey = profile.encryptionPublicKey;
    const encryptedMessage = await encryptQuestCompletedMessage({
      questId: quest.id.toString(),
      questName: quest.name,
      proofId,
      senderPrivateKey,
      recipientPublicKey,
    });

    // Send quest completed info as encrypted jubSignal message to self
    // Simultaneously refresh activity feed
    try {
      await loadMessages({
        forceRefresh: false,
        messageRequests: [
          {
            encryptedMessage,
            recipientPublicKey,
          },
        ],
      });
    } catch (error) {
      console.error(
        "Error sending encrypted quest completed info to server: ",
        error
      );
      toast.error(
        "An error occured while completing the quest. Please try again."
      );
      setDisplayState(CompleteQuestDisplayState.INITIAL);
      return;
    }

    setProofId(proofId);
    setDisplayState(CompleteQuestDisplayState.COMPLETED);
  };

  const handleBackToQuests = () => {
    setIsOpen(false);
    router.push("/quests");
  };

  const getModalContent = (): JSX.Element => {
    if (proofId && quest.item && !itemRedeemed) {
      const qrCodeData = `${window.location.origin}/qr/${proofId}`;
      const { name, sponsor, imageUrl, isSoldOut } = quest.item;

      return (
        <div className="flex flex-col gap-6 mt-8">
          <div className="flex flex-col gap-4 items-center">
            <div className="rounded-[2px] overflow-hidden">
              <img
                className="object-cover w-[174px] h-[174px]"
                alt={`${sponsor} store item`}
                src={imageUrl}
                width={174}
                height={174}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-col text-center">
                <h2 className="text-sm text-gray-12">
                  {"Redeemable: " + name}
                </h2>
                {isSoldOut ? (
                  <span className="text-xs font-light text-gray-900 mt-2">
                    Sold Out
                  </span>
                ) : (
                  <span className="text-xs font-light text-gray-900 mt-2">
                    Present this QR code at the BUIDL Store!
                  </span>
                )}
              </div>
            </div>
            {!isSoldOut && (
              <QRCodeWrapper>
                <QRCode
                  size={156}
                  className="ml-auto p-4 h-auto w-full max-w-full"
                  value={qrCodeData}
                  viewBox={`0 0 156 156`}
                />
              </QRCodeWrapper>
            )}
            {quest.buidlReward > 0 && (
              <span className="text-xs text-gray-10 mt-2">
                {`You've also received ${quest.buidlReward} BUIDL!`}
              </span>
            )}
          </div>
        </div>
      );
    }

    switch (displayState) {
      case CompleteQuestDisplayState.INITIAL:
        return (
          <div className="flex flex-col w-full justify-center items-center text-center gap-5">
            <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
            <div className="flex flex-col gap-1 self-center">
              <div className="flex flex-col gap-2">
                <span className="text-xl text-gray-12">{quest.name}</span>
              </div>
            </div>
            <div className="self-center w-full">
              <Button onClick={handleCompleteQuest}>
                Generate completion ZK Proof
              </Button>
            </div>
          </div>
        );
      case CompleteQuestDisplayState.PROVING:
        return (
          <div className="flex flex-col w-full justify-center text-center gap-5">
            <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
            <div className="flex flex-col gap-1 self-center">
              <div className="flex flex-col">
                <span className="text-xl text-gray-12 mb-2">{quest.name}</span>
                <Spinner
                  label={`Generating ZK proof (${provingState.numRequirementsProven}/${provingState.numRequirementsTotal} reqs)`}
                />
              </div>
            </div>
            <div className="self-center w-full">
              <Button disabled>Generating proof</Button>
            </div>
          </div>
        );
      case CompleteQuestDisplayState.COMPLETED:
        return (
          <div className="flex flex-col w-full justify-center text-center gap-5">
            <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
            <div className="flex flex-col gap-1 self-center">
              <div className="flex flex-col">
                <span className="text-xl text-gray-12">{"Completed!"}</span>
                <span className="text-xl text-gray-12">{quest.name}</span>
                {quest.buidlReward > 0 && (
                  <span className="text-xs text-gray-10 mt-4">
                    {`You've received ${quest.buidlReward} BUIDL!`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 self-center">
              <span className="text-sm text-gray-11">Share on</span>
              <Icons.twitter />
            </div>
            <div className="self-center w-full">
              <Button onClick={handleBackToQuests}>Back to Quests</Button>
            </div>
          </div>
        );
      default:
        return <></>;
    }
  };

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      {getModalContent()}
    </Modal>
  );
};

CompleteQuestModal.displayName = "CompleteQuestModal";
export { CompleteQuestModal };

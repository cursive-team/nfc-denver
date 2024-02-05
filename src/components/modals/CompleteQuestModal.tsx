import { useState } from "react";
import { Icons } from "../Icons";
import { PointCard } from "../cards/PointCard";
import { Modal, ModalProps } from "./Modal";
import { Button } from "../Button";
import Link from "next/link";
import { QuestCard } from "../cards/QuestCard";
import { classed } from "@tw-classed/react";
import QRCode from "react-qr-code";
import { useFetchQuests } from "@/hooks/useFetchQuests";
import { QuestWithRequirements } from "@/types";
import {
  QuestProvingStateUpdate,
  generateProofForQuest,
} from "@/lib/client/proving";
import { getAuthToken, getKeys, getProfile } from "@/lib/client/localStorage";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { encryptQuestCompletedMessage } from "@/lib/client/jubSignal";
import { loadMessages } from "@/lib/client/jubSignalClient";

const QRCodeWrapper = classed.div("bg-white max-w-[254px]");

const MoreQuests = () => {
  const { isLoading, data: quests = [] } = useFetchQuests();
  const MORE_QUESTS_TO_SHOW = 4;

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs text-gray-10 font-light">More quests</span>
      <div className="flex flex-col gap-2">
        {quests
          ?.slice(0, MORE_QUESTS_TO_SHOW)
          ?.map(
            (
              {
                id,
                name,
                description,
                userRequirements,
                locationRequirements,
              }: any,
              index
            ) => (
              <Link href={`/quests/${id}`} key={id}>
                <QuestCard
                  title={name}
                  description={description}
                  completedSigs={1}
                  userRequirements={userRequirements}
                  locationRequirements={locationRequirements}
                />
              </Link>
            )
          )}
      </div>
    </div>
  );
};

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

interface QuestDetailProps {
  quest: QuestWithRequirements;
}

interface CompleteQuestModalProps extends QuestDetailProps, ModalProps {}

enum CompleteQuestDisplayState {
  INITIAL,
  PROVING,
  COMPLETED,
  QR_CODE,
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
  const [serializedProof, setSerializedProof] = useState<string>();
  const [proofId, setProofId] = useState<string>();

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
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: encryptedMessage,
          recipientPublicKey,
          token: authToken.value,
        }),
      });

      if (!response.ok) {
        throw new Error("Error sending message");
      }
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

    // Update activity feed in local storage
    try {
      await loadMessages({ forceRefresh: false });
    } catch (error) {
      console.error("Error loading messages after completing quest");
      toast.error(
        "An error occured while adding this event to your activity feed."
      );
    }

    setSerializedProof(serializedProof);
    setProofId(proofId);
    setDisplayState(CompleteQuestDisplayState.COMPLETED);
  };

  const handleBackToQuests = () => {
    setIsOpen(false);
    router.push("/quests");
  };

  const getModalContent = (): JSX.Element => {
    switch (displayState) {
      case CompleteQuestDisplayState.INITIAL:
        return (
          <div className="flex flex-col w-full justify-center text-center gap-5">
            <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
            <div className="flex flex-col gap-1 self-center">
              <div className="flex flex-col">
                <span className="text-xs text-gray-10">
                  {
                    "Completing this quest will generate a zero knowledge proof of completion"
                  }
                </span>
                <span className="text-xl text-gray-12">{quest.name}</span>
              </div>
            </div>
            <div className="self-center w-full">
              <Button onClick={handleCompleteQuest}>Complete Quest</Button>
            </div>
            <div className="flex items-center gap-1 self-center">
              <span className="text-sm text-gray-11">Share on</span>
              <Icons.twitter />
            </div>
          </div>
        );
      case CompleteQuestDisplayState.PROVING:
        return (
          <div className="flex flex-col w-full justify-center text-center gap-5">
            <div className="h-10 w-10 bg-slate-200 rounded-full self-center"></div>
            <div className="flex flex-col gap-1 self-center">
              <div className="flex flex-col">
                <span className="text-xl text-gray-12">{quest.name}</span>
                <span className="text-xs text-gray-10">
                  {"Generating zero knowledge proof"}
                </span>
                <span className="text-xs text-gray-10">
                  {`Proving requirement ${provingState.numRequirementsProven} of ${provingState.numRequirementsTotal}`}
                </span>
                <span className="text-xs text-gray-10">
                  {`Proving signature ${provingState.currentRequirementNumSigsProven} of ${provingState.currentRequirementNumSigsTotal}`}
                </span>
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
                <span className="text-xl text-gray-12">
                  {"Completed: " + quest.name}
                </span>
                <span className="text-xs text-gray-10">
                  {`Proof: ${serializedProof}`}
                </span>
                <span className="text-xs text-gray-10 mt-4">
                  {`Proof ID: ${proofId}`}
                </span>
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

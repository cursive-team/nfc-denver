import QRCode from "react-qr-code";
import { Modal, ModalProps } from "./Modal";
import { ListLayout } from "@/layouts/ListLayout";
import Link from "next/link";
import { QuestCard } from "../cards/QuestCard";
import { useEffect, useState } from "react";
import {
  LocationSignature,
  User,
  getAllQuestCompleted,
  getItemRedeemed,
  getLocationSignatures,
  getQuestCompleted,
  getUsers,
} from "@/lib/client/localStorage";
import { ItemWithCompletion } from "@/types";
import { classed } from "@tw-classed/react";
import { computeNumRequirementsSatisfied } from "@/lib/client/quests";
import { PointCard } from "../cards/PointCard";

const QRCodeWrapper = classed.div(
  "bg-white rounded-[8px] w-full max-w-[156px]"
);

interface StoreModalItemProps extends ModalProps {
  storeItem: ItemWithCompletion;
}

const StoreModalItem = ({
  isOpen,
  setIsOpen,
  onClose,
  storeItem,
}: StoreModalItemProps) => {
  const questCompleted = getAllQuestCompleted();
  const completedQuestIds: string[] = Object.keys(questCompleted);
  const [numRequirementsSatisfied, setNumRequirementsSatisfied] =
    useState<number>(0);
  const [areQuestRequirementsSatisfied, setAreQuestRequirementsSatisfied] =
    useState(false);
  const [existingProofId, setExistingProofId] = useState<string>();
  const [isItemRedeemed, setIsItemRedeemed] = useState(false);

  const quest = storeItem.quest;

  useEffect(() => {
    if (!quest) return;

    const users = getUsers();
    const locationSignatures = getLocationSignatures();
    const userPublicKeys = Object.values(users)
      .filter((user: User) => user.sig)
      .map((user: User) => user.sigPk!);

    const locationPublicKeys = Object.values(locationSignatures).map(
      (location: LocationSignature) => location.pk
    );

    const numRequirementsSatisfied = computeNumRequirementsSatisfied({
      userPublicKeys,
      locationPublicKeys,
      userRequirements: quest.userRequirements,
      locationRequirements: quest.locationRequirements,
    });
    setNumRequirementsSatisfied(numRequirementsSatisfied);

    // Check if user has met all quest requirements
    if (
      numRequirementsSatisfied ===
      quest.userRequirements.length + quest.locationRequirements.length
    ) {
      setAreQuestRequirementsSatisfied(true);
      // Check if the user has already submitted a proof for this quest
      // (i.e. the quest is already completed)
      const questCompleted = getQuestCompleted(quest.id.toString());
      if (questCompleted) {
        setExistingProofId(questCompleted.pfId);
      }
    }

    // Check if user has already redeemed this item
    const itemRedeemed = getItemRedeemed(storeItem.id.toString());
    if (itemRedeemed) {
      setIsItemRedeemed(true);
    }
  }, [quest, storeItem.id]);

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      onClose={onClose}
      withBackButton
    >
      <div className="flex flex-col gap-6 mt-8">
        <div className="flex flex-col gap-4 items-center">
          <div className="rounded-[2px] overflow-hidden">
            <img
              className="object-cover w-[174px] h-[174px]"
              alt={`${storeItem.sponsor} store item`}
              src={storeItem.imageUrl}
              width={174}
              height={174}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col text-center items-center gap-1">
              <span className="text-xs font-light text-gray-900">
                {storeItem.sponsor}
              </span>
              <h2 className="text-sm text-gray-12">{storeItem.name}</h2>
              {storeItem.isSoldOut ? (
                <span className="text-xs font-light text-gray-900">
                  Sold Out
                </span>
              ) : storeItem.buidlCost > 0 ? (
                <PointCard point={storeItem.buidlCost} />
              ) : null}
            </div>
          </div>
          {existingProofId && !storeItem.isSoldOut && (
            <div className="flex flex-col gap-3 items-center text-center">
              <span className="text-xs font-light text-gray-900">
                {isItemRedeemed
                  ? "You have already redeemed this item!"
                  : "Present this QR code at the BUIDL Store!"}
              </span>
              {!isItemRedeemed && (
                <QRCodeWrapper>
                  <QRCode
                    size={156}
                    className="ml-auto p-4 h-auto w-full max-w-full"
                    value={`${window.location.origin}/qr/${existingProofId}`}
                    viewBox={`0 0 156 156`}
                  />
                </QRCodeWrapper>
              )}
            </div>
          )}
        </div>
        {quest !== null && !existingProofId && (
          <ListLayout
            label={
              areQuestRequirementsSatisfied
                ? "Click on the following quest to generate a proof and redeem your item"
                : "Complete the following quest to redeem"
            }
          >
            <div className="flex flex-col gap-4">
              {
                <Link href={`/quests/${quest.id}`} key={quest.id}>
                  <QuestCard
                    title={quest.name}
                    description={quest.description}
                    completedSigs={numRequirementsSatisfied}
                    userRequirements={quest.userRequirements}
                    locationRequirements={quest.locationRequirements}
                    isCompleted={completedQuestIds.includes(
                      quest.id.toString()
                    )}
                  />
                </Link>
              }
            </div>
          </ListLayout>
        )}
      </div>
    </Modal>
  );
};

StoreModalItem.displayName = "StoreModalItem";
export { StoreModalItem };

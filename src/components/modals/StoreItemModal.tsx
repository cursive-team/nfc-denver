import QRCode from "react-qr-code";
import { Modal, ModalProps } from "./Modal";
import { ListLayout } from "@/layouts/ListLayout";
import { useRedeemStoreItem } from "@/hooks/useStore";
import Link from "next/link";
import { QuestCard } from "../cards/QuestCard";
import { useState } from "react";
import { Button } from "../Button";
import { getAllQuestCompleted } from "@/lib/client/localStorage";
import { ItemWithCompletion, QuestWithRequirements } from "@/types";
import { toast } from "sonner";
import { classed } from "@tw-classed/react";
import { useQuestRequirements } from "@/hooks/useQuestRequirements";

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
  const [qrCodeUrl, setQrCodeUrl] = useState<string>();

  const redeemStoreItemMutation = useRedeemStoreItem();
  const onRedeemItem = async () => {
    try {
      const qrCodeId = await redeemStoreItemMutation.mutateAsync(storeItem.id);
      setQrCodeUrl(`${window.location.origin}/qr/${qrCodeId}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to redeem item, please try again.");
    }
  };

  const questRequirements = storeItem.questRequirements;

  const { numRequirementsSatisfied } = useQuestRequirements(
    storeItem.questRequirements ?? []
  );

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
            <div className="flex flex-col text-center">
              <span className="text-xs font-light text-gray-900">
                {storeItem.sponsor}
              </span>
              <h2 className="text-sm text-gray-12">{storeItem.name}</h2>
            </div>
          </div>
          {qrCodeUrl && (
            <QRCodeWrapper>
              <QRCode
                size={156}
                className="ml-auto p-4 h-auto w-full max-w-full"
                value={qrCodeUrl}
                viewBox={`0 0 156 156`}
              />
            </QRCodeWrapper>
          )}
          {!qrCodeUrl && (
            <Button
              loading={redeemStoreItemMutation.isPending}
              onClick={onRedeemItem}
              disabled={storeItem.isCompleted}
            >
              {storeItem.isCompleted ? "Item Redeemed" : "Redeem"}
            </Button>
          )}
        </div>
        {questRequirements.length !== 0 && (
          <ListLayout label="Complete the following quests to redeem">
            <div className="flex flex-col gap-4">
              {questRequirements.map(
                (
                  {
                    id,
                    name,
                    description,
                    userRequirements,
                    locationRequirements,
                  }: QuestWithRequirements,
                  index: number
                ) => {
                  const isCompleted = completedQuestIds.includes(id.toString());
                  if (isCompleted) return null; // no need to show completed quests
                  return (
                    <Link href={`/quests/${id}`} key={id}>
                      <QuestCard
                        title={name}
                        description={description}
                        completedSigs={numRequirementsSatisfied[index]}
                        userRequirements={userRequirements}
                        locationRequirements={locationRequirements}
                        isCompleted={completedQuestIds.includes(id.toString())}
                      />
                    </Link>
                  );
                }
              )}
            </div>
          </ListLayout>
        )}
      </div>
    </Modal>
  );
};

StoreModalItem.displayName = "StoreModalItem";
export { StoreModalItem };

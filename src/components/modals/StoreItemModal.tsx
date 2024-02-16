import { Modal, ModalProps } from "./Modal";
import { ListLayout } from "@/layouts/ListLayout";
import { useRedeemStoreItem } from "@/hooks/useStore";
import Link from "next/link";
import { QuestCard } from "../cards/QuestCard";
import { useState } from "react";
import { Button } from "../Button";
import { getAllQuestCompleted } from "@/lib/client/localStorage";
import { ItemWithCompletion, QuestWithRequirements } from "@/types";

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
  const [isItemRedeemed, setIsItemRedeemed] = useState(false);

  const redeemStoreItemMutation = useRedeemStoreItem();
  const onRedeemItem = async () => {
    await redeemStoreItemMutation.mutateAsync(storeItem.id);
  };

  const questRequirements = storeItem.questRequirements;

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
          {!isItemRedeemed && (
            <Button
              loading={redeemStoreItemMutation.isPending}
              onClick={onRedeemItem}
            >
              Redeem
            </Button>
          )}
        </div>
        <ListLayout label="Complete the following quests to redeem">
          {questRequirements.map(
            ({
              id,
              name,
              description,
              userRequirements,
              locationRequirements,
            }: QuestWithRequirements) => {
              return (
                <Link href={`/quests/${id}`} key={id}>
                  <QuestCard
                    title={name}
                    description={description}
                    completedSigs={1}
                    userRequirements={userRequirements}
                    locationRequirements={locationRequirements}
                    isCompleted={completedQuestIds.includes(id.toString())}
                  />
                </Link>
              );
            }
          )}
        </ListLayout>
      </div>
    </Modal>
  );
};

StoreModalItem.displayName = "StoreModalItem";
export { StoreModalItem };

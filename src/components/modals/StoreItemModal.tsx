import Image from "next/image";
import { Modal, ModalProps } from "./Modal";
import { ListLayout } from "@/layouts/ListLayout";
import { useFetchStore, useRedeemStoreItem } from "@/hooks/useStore";
import { LoadingWrapper } from "../wrappers/LoadingWrapper";
import { Placeholder } from "../placeholders/Placeholder";
import { StoreCard } from "../cards/StoreCard";
import { useFetchQuests } from "@/hooks/useFetchQuests";
import Link from "next/link";
import { QuestCard } from "../cards/QuestCard";
import { useState } from "react";
import { Button } from "../Button";

interface StoreModalItemProps extends ModalProps {
  storeItem: any;
}

const StoreModalItem = ({
  isOpen,
  setIsOpen,
  onClose,
  storeItem,
}: StoreModalItemProps) => {
  const [isItemRedeemed, setIsItemRedeemed] = useState(false);
  const { isLoading: isLoadingStoreItems, data: relatedItems } =
    useFetchStore();
  const { isLoading: isLoadingQuest, data: relatedQuests } = useFetchQuests();
  const redeemStoreItemMutation = useRedeemStoreItem();

  const onRedeemItem = async () => {
    await redeemStoreItemMutation.mutateAsync(storeItem.id);
  };

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
            <Image
              className="object-cover w-[174px] h-[174px]"
              alt={`${storeItem?.partnerName} store item`}
              src={
                storeItem
                  ? `https://picsum.photos/id/${storeItem.id}/300/300`
                  : `https://picsum.photos/300/300`
              }
              width={174}
              height={174}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col text-center">
              <span className="text-xs font-light text-gray-900">
                {storeItem?.partner}
              </span>
              <h2 className="text-sm text-gray-12">{storeItem?.itemName}</h2>
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
        <ListLayout label="Complete quest to redeem">
          <LoadingWrapper
            className="grid grid-cols-1 gap-x-3 gap-y-4"
            isLoading={isLoadingQuest}
            fallback={<Placeholder.List items={2} />}
          >
            {relatedQuests?.map(
              ({
                id,
                name,
                description,
                userRequirements,
                locationRequirements,
              }: any) => (
                <Link href={`/quests/${id}`} key={id}>
                  <QuestCard
                    title={name}
                    description={description}
                    completedSigs={1}
                    userRequirements={userRequirements}
                    locationRequirements={locationRequirements}
                    isCompleted={false}
                  />
                </Link>
              )
            )}
          </LoadingWrapper>
        </ListLayout>
        <ListLayout label="Related items">
          <LoadingWrapper
            className="grid grid-cols-2 gap-x-3 gap-y-4"
            isLoading={isLoadingStoreItems}
            fallback={<Placeholder.List items={2} />}
          >
            {relatedItems?.slice(0, 4)?.map((storeItem, index) => (
              <StoreCard
                key={index}
                itemId={storeItem.id}
                partnerName={storeItem.partner}
                itemName={storeItem.itemName}
                pointsRequired={storeItem.points}
              />
            ))}
          </LoadingWrapper>
        </ListLayout>
      </div>
    </Modal>
  );
};

StoreModalItem.displayName = "StoreModalItem";
export { StoreModalItem };

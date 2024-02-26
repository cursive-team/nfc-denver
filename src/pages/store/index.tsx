import { Filters } from "@/components/Filters";
import { StoreCard } from "@/components/cards/StoreCard";
import { StoreModalItem } from "@/components/modals/StoreItemModal";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useFetchQuests } from "@/hooks/useFetchQuests";
import { useFetchStore } from "@/hooks/useStore";
import { getAllItemRedeemed } from "@/lib/client/localStorage";
import { StoreSortMapping, StoreSortMappingType } from "@/shared/constants";
import { ItemWithCompletion } from "@/types";
import React, { useMemo, useState } from "react";

export default function StorePage() {
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [storeItem, setStoreItem] = useState<ItemWithCompletion>();
  const [selectedOption, setSelectedOption] =
    useState<StoreSortMappingType>("ALL");
  const { data: quests = [] } = useFetchQuests();
  const { isLoading, data: storeItems } = useFetchStore();

  const displayItems: ItemWithCompletion[] = useMemo(() => {
    const allItemRedeemed = getAllItemRedeemed();
    const allItems = storeItems || [];
    if (selectedOption === "ALL") {
      return allItems;
    } else if (selectedOption === "UNLOCKED") {
      return allItems.filter((item: any) => {
        return quests.some(
          (quest) => quest.id === item?.questId && quest.isCompleted
        );
      });
    } else if (selectedOption === "REDEEMED") {
      return allItems.filter((item) => {
        return allItemRedeemed[item.id];
      });
    } else {
      return allItems;
    }
  }, [storeItems, selectedOption, quests]);

  return (
    <>
      {storeItem && (
        <StoreModalItem
          isOpen={itemModalOpen}
          setIsOpen={setItemModalOpen}
          storeItem={storeItem}
          onClose={() => {
            setItemModalOpen(false);
            setStoreItem(undefined); // reset selected store item
          }}
        />
      )}
      <div className="flex flex-col gap-4">
        <Filters
          label="Sort"
          defaultValue={selectedOption}
          object={StoreSortMapping}
          onChange={setSelectedOption}
          disabled={isLoading}
        />
        <LoadingWrapper
          className="grid grid-cols-2 gap-x-3 gap-y-6"
          isLoading={isLoading}
          fallback={
            <>
              {Array.from(Array(10).keys()).map((_item, index) => {
                return <StoreCard.Placeholder key={index} />;
              })}
            </>
          }
        >
          {displayItems.map((storeItem, index) => (
            <StoreCard
              key={`${storeItem.id}-${index}`}
              partnerName={storeItem.sponsor}
              itemName={storeItem.name}
              itemId={storeItem.id}
              pointsRequired={storeItem.buidlCost}
              imageUrl={storeItem.imageUrl}
              isSoldOut={storeItem?.isSoldOut ?? false}
              onClick={() => {
                setStoreItem(storeItem);
                setItemModalOpen(true);
              }}
            />
          ))}
        </LoadingWrapper>
      </div>
    </>
  );
}

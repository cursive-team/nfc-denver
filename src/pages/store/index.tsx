import { Filters } from "@/components/Filters";
import { StoreCard } from "@/components/cards/StoreCard";
import { StoreModalItem } from "@/components/modals/StoreItemModal";
import { Placeholder } from "@/components/placeholders/Placeholder";
import { LoadingWrapper } from "@/components/wrappers/LoadingWrapper";
import { useFetchStore } from "@/hooks/useStore";
import { filterArrayByValue } from "@/lib/shared/utils";
import { StoreSortMapping, StoreSortMappingType } from "@/shared/constants";
import React, { useState } from "react";

export default function StorePage() {
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [storeItem, setStoreItem] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] =
    useState<StoreSortMappingType>("ALL");

  const { isLoading, data: storeItems } = useFetchStore();

  const KeyFilterMapping: Record<StoreSortMappingType, any> = {
    UNLOCKED: "unlocked",
    REDEEMED: "redeemed",
    ALL: undefined,
  };

  const storeFilteredItems = filterArrayByValue(
    storeItems ?? [],
    KeyFilterMapping?.[selectedOption] as any,
    true // only show unlocked or redeemed items
  );

  return (
    <>
      <StoreModalItem
        isOpen={itemModalOpen}
        setIsOpen={setItemModalOpen}
        storeItem={storeItem}
        onClose={() => {
          setItemModalOpen(false);
          setStoreItem(null); // reset selected store item
        }}
      />
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
          fallback={<Placeholder.List items={10} />}
        >
          {storeFilteredItems?.map((storeItem, index) => (
            <StoreCard
              key={`${storeItem.id}-${index}`}
              partnerName={storeItem.partner}
              itemName={storeItem.itemName}
              itemId={storeItem.id}
              pointsRequired={storeItem.points}
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

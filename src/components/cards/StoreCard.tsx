import { HTMLAttributes } from "react";
import { PointCard } from "./PointCard";

interface StoreCardProps extends HTMLAttributes<HTMLDivElement> {
  partnerName: string;
  itemName: string;
  pointsRequired?: number;
}

const StoreCard = ({
  partnerName,
  itemName,
  pointsRequired = 0,
  ...props
}: StoreCardProps) => {
  return (
    <div className="flex flex-col gap-2" {...props}>
      <div className="rounded-[2px] overflow-hidden">
        <img
          className="object-cover w-full min-h-[174px] bg-slate-200 "
          alt={`${partnerName} store item`}
          src="https://picsum.photos/300/300"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-col">
          <span className="text-xs font-light text-gray-900">
            {partnerName}
          </span>
          <h2 className="text-sm text-gray-12">{itemName}</h2>
        </div>
        <PointCard color="white" point={pointsRequired} />
      </div>
    </div>
  );
};

StoreCard.displayName = "StoreCard";
export { StoreCard };

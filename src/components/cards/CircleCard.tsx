import { classed } from "@tw-classed/react";
import Image from "next/image";
import type * as Classed from "@tw-classed/react";

type CardIconType = "person" | "location" | "proof";
const CircleIconCard = classed.div(
  "flex justify-center items-center rounded-full overflow-hidden float-none",
  {
    variants: {
      color: {
        white: "bg-[#677363]",
        gray: "bg-[#323232]",
      },
      size: {
        xs: "size-6",
        sm: "size-10",
        md: "size-16",
      },
    },
    defaultVariants: {
      color: "gray",
      size: "xs",
    },
  }
);

type CardIconVariants = Classed.VariantProps<typeof CircleIconCard>;
const CircleCardQuest = classed.div(
  CircleIconCard,
  "border-2 -ml-[4px] border-gray-200"
);

const CardIconMapping: Record<CardIconType, string> = {
  person: "/icons/person.svg",
  location: "/icons/location.svg",
  proof: "/icons/proof.svg",
};

interface CircleCardProps extends CardIconVariants {
  icon: CardIconType;
  isMultiple?: boolean; // have multiple icons
}

const IconSizeMapping: Record<"xs" | "sm" | "md", number> = {
  xs: 10,
  sm: 18,
  md: 24,
};

const IconSizeClass: Record<"xs" | "sm" | "md", string> = {
  xs: "h-[10px]",
  sm: "h-[18px]",
  md: "h-[32px]",
};

const CircleCard = ({
  icon,
  isMultiple,
  color = "gray",
  size = "xs",
}: CircleCardProps) => {
  const Component = isMultiple ? CircleCardQuest : CircleIconCard;

  const iconSize = IconSizeMapping[size];
  const iconSizeClass = IconSizeClass[size];

  return (
    <Component color={color} size={size}>
      <Image
        src={CardIconMapping[icon]}
        height={iconSize}
        width={iconSize}
        className={iconSizeClass}
        alt={`${icon} icon`}
      />
    </Component>
  );
};

CircleCard.displayName = "CircleCard";
export { CircleCard };

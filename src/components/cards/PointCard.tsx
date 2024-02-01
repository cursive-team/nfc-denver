import Image from "next/image";
import type * as Classed from "@tw-classed/react";
import { classed } from "@tw-classed/react";

const PointCardComponent = classed.div(
  "relative rounded overflow-hidden px-1 py-0.5 flex items-center gap-[6px]",
  {
    variants: {
      variant: {
        default: "!bg-gray-100/10",
        transparent: "!bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const PointCardLabel = classed.span("font-light", {
  variants: {
    color: {
      gray: "text-gray-10",
      white: "text-white",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
    },
  },
  defaultVariants: {
    color: "gray",
    size: "xs",
  },
});

type PointCardVariants = Classed.VariantProps<typeof PointCardComponent>;
type PointLabelVariants = Classed.VariantProps<typeof PointCardLabel>;

interface PointCardProps extends PointCardVariants, PointLabelVariants {
  label?: string;
  point: number;
  onClick?: () => void;
  className?: string;
}

const PointCard = ({
  label,
  className = "",
  point = 0,
  onClick,
  color,
  size,
  variant,
}: PointCardProps) => {
  return (
    <button
      className={`flex items-center gap-1 ${className}`}
      type="button"
      onClick={() => {
        onClick?.();
      }}
    >
      {label && (
        <PointCardLabel color={color} size={size}>
          {label}
        </PointCardLabel>
      )}
      <PointCardComponent variant={variant}>
        <PointCardLabel color={color} size={size} className="uppercase">
          ✦ {`${point} BUIDL`}
        </PointCardLabel>
      </PointCardComponent>
    </button>
  );
};

PointCard.displayName = "PointCard";
export { PointCard };

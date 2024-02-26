import type * as Classed from "@tw-classed/react";
import { classed } from "@tw-classed/react";

const PointCardComponent = classed.div(
  "relative overflow-hidden px-[2px] flex items-center font-light",
  {
    variants: {
      variant: {
        default: "bg-[#F1F1F1] text-[#202020] text-[10px] leading-4",
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
  point = 0,
  onClick,
  variant,
  size,
  color,
  ...props
}: PointCardProps) => {
  return (
    <div className="flex gap-[5px]">
      {label && (
        <PointCardLabel color={color} size={size}>
          {label}
        </PointCardLabel>
      )}
      <PointCardComponent
        onClick={() => {
          onClick?.();
        }}
        variant={variant}
        {...props}
      >
        {`${point} BUIDL`}
      </PointCardComponent>
    </div>
  );
};

PointCard.displayName = "PointCard";
export { PointCard };

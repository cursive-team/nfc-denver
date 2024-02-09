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
  partner?: string;
  image?: string;
  item?: string;
  onClick?: () => void;
  className?: string;
}

const PartnerItemCard = ({
  label,
  onClick,
  variant,
  size,
  color,
  image,
  partner = "Partner",
  item = "Item",
  ...props
}: PointCardProps) => {
  return (
    <div className="flex items-center gap-1">
      {label && (
        <PointCardLabel color={color} size={size}>
          {label}
        </PointCardLabel>
      )}
      <div
        onClick={() => {
          onClick?.();
        }}
        className="flex gap-[6px] items-center p-1 rounded border border-[#2E2E2E] bg-gray-100/10"
        {...props}
      >
        <div className="w-5 h-5 bg-slate-200 rounded-[2px]"></div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-10">{partner}</span>
          <span className="text-xs text-gray-100">{item}</span>
        </div>
      </div>
    </div>
  );
};

PartnerItemCard.displayName = "PartnerItemCard";
export { PartnerItemCard };

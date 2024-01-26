import { classed } from "@tw-classed/react";
import { HTMLAttributes } from "react";

const CardBase = classed.div("relative rounded overflow-hidden ", {
  variants: {
    variant: {
      primary: "bg-gray-200 border border-gray-400",
      candy: "bg-candy/20 border border-candy-200",
    },
  },
  defaultVariants: {
    variant: "primary",
  },
});
const CardTitle = classed.h1("text-sm leading-5 text-gray-12");
const CardDescription = classed.span(
  "text-xs leading-4 text-gray-11 text-light"
);

const CardProgress = ({ style }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="absolute bottom-0 right-0 left-0 h-1"
      style={{
        background: "linear-gradient(270deg, #FD5201 50%, #FF0521 99.48%)",
        ...style
      }}
    ></div>
  );
};

const Card = {
  displayName: "Card",
  Base: CardBase,
  Title: CardTitle,
  Description: CardDescription,
  Progress: CardProgress,
};

export { Card };

import { classed } from "@tw-classed/react";

const CardBase = classed.div("rounded-[4px] border border-gray-400");
const CardTitle = classed.h1("text-sm leading-5 text-gray-12");
const CardDescription = classed.span(
  "text-xs leading-4 text-gray-11 text-light"
);

const Card = {
  displayName: "Card",
  Base: CardBase,
  Title: CardTitle,
  Description: CardDescription,
};

export { Card };

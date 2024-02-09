import { classed } from "@tw-classed/react";
import type * as Classed from "@tw-classed/react";

const ListLayoutWrapper = classed.div("flex flex-col", {
  variants: {
    spacing: {
      xs: "gap-3",
      sm: "gap-4",
    },
  },
  defaultVariants: {
    spacing: "xs",
  },
});

type ListLayoutVariants = Classed.VariantProps<typeof ListLayoutWrapper>;

interface ListLayoutProps extends ListLayoutVariants {
  label: string;
  children?: React.ReactNode;
  className?: string;
}

const ListLayout = ({
  label,
  children,
  spacing,
  className = "",
}: ListLayoutProps) => {
  return (
    <ListLayoutWrapper spacing={spacing} className={className}>
      <span className="text-gray-10 font-light text-xs">{label}</span>
      <div>{children}</div>
    </ListLayoutWrapper>
  );
};

ListLayout.displayName = "ListLayout";
export { ListLayout };

import { classed } from "@tw-classed/react";
import { ReactNode } from "react";
import type * as Classed from "@tw-classed/react";

const Label = classed.span("text-xs text-gray-10 font-light");

const ListWrapperContainer = classed.div("flex flex-col", {
  variants: {
    gap: {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    gap: "md",
  },
});

type ListWrapperContainerVariants = Classed.VariantProps<
  typeof ListWrapperContainer
>;

interface ListWrapperProps extends ListWrapperContainerVariants {
  title: ReactNode;
  label?: ReactNode; // label or extra info for the list
  children?: React.ReactNode;
}

const ListWrapper = ({ title, label, children, gap }: ListWrapperProps) => {
  return (
    <ListWrapperContainer gap={gap}>
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        {label && (
          <div className="flex items-center gap-2">
            <Label>{label}</Label>
          </div>
        )}
      </div>
      {children}
    </ListWrapperContainer>
  );
};

ListWrapper.displayName = "ListWrapper";
export { ListWrapper };

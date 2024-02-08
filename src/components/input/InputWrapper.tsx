import { classed } from "@tw-classed/react";
import type * as Classed from "@tw-classed/react";
import { ReactNode } from "react";

const InputLabel = classed.div("text-gray-12 font-light", {
  variants: {
    size: {
      xs: "text-xs leading-4",
      sm: "text-sm leading-5",
    },
  },
  defaultVariants: {
    size: "xs",
  },
});

const InputDescription = classed.div(
  "text-gray-11 font-light text-xs leading-4"
);

const InputSpacing = classed.div("flex flex-col", {
  variants: {
    spacing: {
      true: "gap-[11px]",
    },
  },
  defaultVariants: {
    spacing: false,
  },
});

type InputLabelVariants = Classed.VariantProps<typeof InputLabel>;
type InputDescriptionVariants = Classed.VariantProps<typeof InputDescription>;
type InputSpacingVariants = Classed.VariantProps<typeof InputSpacing>;

export interface InputWrapperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    InputLabelVariants,
    InputDescriptionVariants,
    InputSpacingVariants {
  label?: string;
  description?: ReactNode;
  children: ReactNode;
}

const InputWrapper = ({
  label,
  children,
  description,
  size,
  spacing, // spacing of label from input
  className = "",
}: InputWrapperProps) => {
  return (
    <InputSpacing spacing>
      <InputSpacing spacing={spacing}>
        {label && <InputLabel size={size}>{label}</InputLabel>}
        <div className={className}>{children}</div>
      </InputSpacing>
      {description && <InputDescription>{description}</InputDescription>}
    </InputSpacing>
  );
};

InputWrapper.displayName = "InputWrapper";

export { InputWrapper };

import type * as Classed from "@tw-classed/react";
import { classed } from "@tw-classed/react";
import { InputHTMLAttributes } from "react";
import { InputWrapper, InputWrapperProps } from "./input/InputWrapper";

const InputComponent = classed.input(
  "min-h-5 py-[5px] placeholder:font-light placeholder-[#818181] plac leading-[20px] rounded-none w-full text-white !outline-none text-light shadow-none focus:border-b focus:ring-0 focus:outline-none focus:shadow-none focus:outline-offset-0 focus:ring-offset-0",
  {
    variants: {
      variant: {
        primary:
          "bg-transparent border-b border-b-gray-600 focus:border-b-gray-600",
      },
      hasIcon: {
        true: "pl-[20px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      hasIcon: false,
    },
  }
);

type InputComponentVariants = Classed.VariantProps<typeof InputComponent>;

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "ref">,
    InputComponentVariants,
    Pick<InputWrapperProps, "label" | "description"> {
  loading?: boolean;
  icon?: React.ReactNode;
}

const Input = ({
  label,
  variant,
  placeholder,
  description,
  icon,
  ...props
}: InputProps) => {
  return (
    <InputWrapper label={label} description={description}>
      <label className="relative form-control w-full">
        <div className="relative">
          {icon && (
            <div className="pointer-events-none w-8 h-8 absolute top-[3.5px] transform left-1">
              <span className="text-gray-10">{icon}</span>
            </div>
          )}
          <InputComponent
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            variant={variant}
            hasIcon={!!icon}
            {...props}
          />
        </div>
      </label>
    </InputWrapper>
  );
};

Input.displayName = "Input";

export { Input };

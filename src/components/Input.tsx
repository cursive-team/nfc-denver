import type * as Classed from "@tw-classed/react";
import { classed } from "@tw-classed/react";
import { InputHTMLAttributes } from "react";

const InputComponent = classed.input(
  "min-h-5 py-[5px] leading-[20px] rounded-none w-full text-white !outline-none text-light shadow-none focus:border-b focus:ring-0 focus:outline-none focus:shadow-none focus:outline-offset-0 focus:ring-offset-0",
  {
    variants: {
      variant: {
        primary:
          "bg-transparent border-b border-b-gray-600 focus:border-b-gray-600",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

type InputComponentVariants = Classed.VariantProps<typeof InputComponent>;

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "ref">,
    InputComponentVariants {
  loading?: boolean;
  icon?: React.ReactNode;
  label?: string;
}

const Input = ({ label, variant, placeholder, ...props }: InputProps) => {
  return (
    <label className="form-control w-full">
      {label && (
        <div className="label p-0">
          <span className="label-text font-light text-white text-[12px]">
            {label}
          </span>
        </div>
      )}
      <InputComponent
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        variant={variant}
        {...props}
      />
    </label>
  );
};

Input.displayName = "Input";

export { Input };

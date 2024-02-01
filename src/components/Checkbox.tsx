import { classed } from "@tw-classed/react";

interface CheckboxProps extends React.HTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  disabled?: boolean;
  checked?: boolean;
}

const CheckboxBase = classed.label(
  "w-full flex bg-gray-transparent border border-gray-400 peer-checked:bg-gray-200 text-sm justify-center items-center rounded-[4px] cursor-pointer py-[18px] overflow-hidden"
);
const CheckboxComponent = classed.label(
  CheckboxBase,
  "relative before:absolute before:bg-transparent before:left-0 before:flex before:h-full before:w-full before:items-center before:justify-center before:bg-white before:transition-[background-color] before:duration-100 before:ease-in before:content-[''] peer-checked:before:text-white peer-checked:before:transition-[background-color] peer-checked:before:duration-100 peer-checked:before:ease-in",
  {}
);

const Checkbox = ({
  id,
  label,
  disabled,
  checked,
  ...props
}: CheckboxProps) => {
  console.table({ id, label, disabled, checked });
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        className="hidden peer"
        id={id}
        checked={checked}
        disabled={disabled}
        {...props}
      />
      <CheckboxComponent htmlFor={id}>{label}</CheckboxComponent>
    </div>
  );
};

Checkbox.displayName = "Checkbox";

export { Checkbox };

import { Icons } from "./Icons";

interface SpinnerProps {
  label?: string; // Optional label to display below the spinner
}

const Spinner = ({ label }: SpinnerProps) => {
  return (
    <div className="flex flex-col gap-6 text-center">
      <div className="mx-auto">
        <Icons.loading size={28} className="animate-spin" />
      </div>
      {label && (
        <span className="text-sm text-gray-11 leading-5 font-light">
          {label}
        </span>
      )}
    </div>
  );
};

Spinner.displayName = "Spinner";

export { Spinner };

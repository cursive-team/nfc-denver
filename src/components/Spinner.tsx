import { Icons } from "./Icons";

const Spinner = () => {
  return <Icons.loading size={28} className="animate-spin" />;
};

Spinner.displayName = "Spinner";

export { Spinner };

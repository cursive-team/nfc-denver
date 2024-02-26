import { Transition } from "@headlessui/react";

interface TransitionWrapperProps {
  children: React.ReactNode;
  show: boolean;
}
export const TransitionFade = ({ children, show }: TransitionWrapperProps) => {
  return (
    <Transition
      show={show}
      enter="ease-out duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {children}
    </Transition>
  );
};

const TransitionWrapper = {
  displayName: "TransitionWrapper",
  Fade: TransitionFade,
};

export { TransitionWrapper };

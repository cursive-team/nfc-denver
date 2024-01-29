import { classed } from "@tw-classed/react";
import React from "react";
import { Transition } from "@headlessui/react";

interface LoadingWrapper {
  isLoading: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode; // If you want to show something else while loading
  authRequired?: boolean;
  className?: string;
  noResultsLabel?: string;
}

const NoItemLabel = classed.span("text-lg text-gray-12");

const LoadingWrapper = ({
  isLoading,
  children,
  fallback,
  className = "",
  noResultsLabel = "No items",
}: LoadingWrapper) => {
  const noItems = !isLoading && React.Children.count(children) === 0;

  return (
    <>
      {isLoading && fallback}
      <Transition
        show={!isLoading}
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={className}>
          {noItems ? <NoItemLabel>{noResultsLabel}</NoItemLabel> : children}
        </div>
      </Transition>
    </>
  );
};

LoadingWrapper.displayName = "LoadingWrapper";

export { LoadingWrapper };

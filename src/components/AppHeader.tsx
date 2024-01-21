import { Icons } from "@/components/Icons";
import { classed } from "@tw-classed/react";
import { useState } from "react";

const Title = classed.h3("text-base text-gray-12 font-light leading-5");
const description = classed.span("text-sm text-gray-11 leading-5");

const ContentWrapper = classed.div("flex flex-col gap-4");

const AppHeaderContent = () => {
  return (
    <div className="fixed top-[60px] w-full bottom-0 overflow-auto py-6">
      <div className="container">
        <ContentWrapper>
          <Title>Information</Title>
        </ContentWrapper>
        <ContentWrapper>
          <Title>FAQ</Title>
        </ContentWrapper>
      </div>
    </div>
  );
};
const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = "Username";

  return (
    <div className="flex w-full items-center justify-between p-4">
      <button type="button" className="flex gap-2 items-center">
        <Icons.iyk />
        <Icons.x />
        <Icons.jubmoji />
      </button>
      <div className="flex gap-4 items-center">
        <span className="text-gray-11">{isMenuOpen ? "Close" : username}</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <Icons.close /> : <Icons.burgher />}
        </button>
      </div>
      {isMenuOpen && <AppHeaderContent />}
    </div>
  );
};

AppHeader.displayName = "AppHeader";

export { AppHeader };

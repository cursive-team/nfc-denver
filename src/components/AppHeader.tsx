import { Icons } from "@/components/Icons";
import { classed } from "@tw-classed/react";
import { useState } from "react";

const Title = classed.h3("text-base text-gray-12 font-light leading-5");
const Subtitle = classed.h4("text-sm text-gray-12 leading-5");
const Description = classed.span("text-sm text-gray-11 leading-5");

const ContentWrapper = classed.div("flex flex-col gap-4");

interface AppHeaderContentProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
}

const AppHeaderContent = ({
  isMenuOpen,
  setIsMenuOpen,
}: AppHeaderContentProps) => {
  if (!isMenuOpen) return null;

  return (
    <div className="fixed inset-0 w-full overflow-auto px-4 z-10 h-screen bg-black-default">
      <div className="flex h-[60px]">
        <div className="flex gap-4 items-center ml-auto">
          <span className="text-gray-11">Close</span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.close /> : <Icons.burgher />}
          </button>
        </div>
      </div>
      <div className="mt-6">
        <ContentWrapper>
          <Title>Information</Title>
          <Description>
            This is a project in collaboration with IYK, Jubmoji and Art Blocks
            lorem ipsum dolor sit amet.
          </Description>
        </ContentWrapper>
        <ContentWrapper>
          <Title>FAQ</Title>
          <div className="flex flex-col gap-2">
            <Subtitle>
              Lorem ipsum dolor sit amet, consectetur adipiscing?
            </Subtitle>
            <Description>
              Curabitur ultrices faucibus urna, a gravida mi dictum sed. Nullam
              dictum quam id odio scelerisque ultrices. Nulla rhoncus tortor
              nunc, a mollis justo varius sed. Vestibulum turpis ligula,
              suscipit vel rhoncus ut.
            </Description>
          </div>
          <div className="flex flex-col gap-2">
            <Subtitle>
              Lorem ipsum dolor sit amet, consectetur adipiscing?
            </Subtitle>
            <Description>
              Curabitur ultrices faucibus urna, a gravida mi dictum sed. Nullam
              dictum quam id odio scelerisque ultrices. Nulla rhoncus tortor
              nunc, a mollis justo varius sed. Vestibulum turpis ligula,
              suscipit vel rhoncus ut.
            </Description>
          </div>
        </ContentWrapper>
        <ContentWrapper>
          <Title>Project Links</Title>
          <div className="flex flex-col gap-2">
            <Subtitle>Link 1</Subtitle>
            <Subtitle>Link 2</Subtitle>
            <Subtitle>Link 3</Subtitle>
            <Subtitle>Link 4</Subtitle>
          </div>
        </ContentWrapper>
      </div>
    </div>
  );
};

const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const username = "Username";

  return (
    <div className="flex w-full items-center p-4">
      {!isMenuOpen && (
        <button type="button" className="flex gap-2 items-center">
          <Icons.iyk />
          <Icons.x />
          <Icons.jubmoji />
        </button>
      )}
      <div className="flex gap-4 items-center ml-auto">
        <span className="text-gray-11">{isMenuOpen ? "Close" : username}</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <Icons.close /> : <Icons.burgher />}
        </button>
      </div>
      <AppHeaderContent isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </div>
  );
};

AppHeader.displayName = "AppHeader";

export { AppHeader };

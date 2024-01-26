import { Icons } from "@/components/Icons";
import { classed } from "@tw-classed/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { Button } from "./Button";
import {
  deleteAllKeys,
  deleteAllMessages,
  deleteAllUsers,
  deleteAuthToken,
  deleteProfile,
} from "@/lib/client/localStorage";
import { deleteAllLocationSignatures } from "@/lib/client/localStorage/locationSignatures";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "./Input";

const Title = classed.h3("block text-base text-gray-12 font-light leading-5");
const Subtitle = classed.h4("text-sm text-gray-12 leading-5");
const Description = classed.span("text-sm text-gray-11 leading-5");

const ContentWrapper = classed.div("flex flex-col gap-4 mt-8");

interface AppHeaderContentProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (value: boolean) => void;
  handleSignout: () => void;
}

export const AppBackHeader = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center h-[60px]">
      <button
        type="button"
        className="flex items-center gap-1"
        onClick={() => router.back()}
      >
        <Icons.arrowLeft />
        <span className="text-gray-11 text-sm">Back</span>
      </button>
    </div>
  );
};

const AppHeaderContent = ({
  isMenuOpen,
  setIsMenuOpen,
  handleSignout,
}: AppHeaderContentProps) => {
  const [showBack, setShowBack] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);

  if (!isMenuOpen) return null;

  const MenuItems: { label: string; children: ReactNode }[] = [
    {
      label: "Profile & settings",
      children: (
        <>
          <FormStepLayout actions={<Button>Save</Button>}>
            <div className="flex flex-col gap-6">
              <Input label="Display name" />
              <Input label="Email" />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-gray-12 text-sm font-light">
                  Privacy settings
                </span>
                <span className="text-gray-11 text-sm font-light">
                  This can be changed at any time
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-gray-12 text-sm font-light">
                  Social settings
                </span>
                <span className="text-gray-11 text-sm font-light">
                  You can change this each time you make a new connection
                </span>
              </div>
              <Input label="X (Optional)" />
              <Input label="Telegram (Optional)" />
              <Input label="ETH address (Optional)" />
            </div>
          </FormStepLayout>
        </>
      ),
    },
    {
      label: "Information & FAQ's",
      children: (
        <>
          <ContentWrapper>
            <Title>Information</Title>
            <Description>
              This is a project in collaboration with IYK, Jubmoji and Art
              Blocks lorem ipsum dolor sit amet.
            </Description>
          </ContentWrapper>
          <ContentWrapper>
            <Title>FAQ</Title>
            <div className="flex flex-col gap-2">
              <Subtitle>
                Lorem ipsum dolor sit amet, consectetur adipiscing?
              </Subtitle>
              <Description>
                Curabitur ultrices faucibus urna, a gravida mi dictum sed.
                Nullam dictum quam id odio scelerisque ultrices. Nulla rhoncus
                tortor nunc, a mollis justo varius sed. Vestibulum turpis
                ligula, suscipit vel rhoncus ut.
              </Description>
            </div>
          </ContentWrapper>
          <ContentWrapper>
            <Title>Project Links</Title>
            <div className="flex flex-col gap-2">
              <Subtitle>
                GitHub:{" "}
                <u>
                  <a href="https://github.com/nfc-denver/nfc-denver">
                    github.com/nfc-denver/nfc-denver
                  </a>
                </u>
              </Subtitle>
            </div>
          </ContentWrapper>
          <ContentWrapper>
            <Title>Account</Title>
            <Button size="sm" onClick={handleSignout}>
              Logout
            </Button>
          </ContentWrapper>
        </>
      ),
    },
  ];

  const onBack = () => {
    setShowBack(false);
    setActiveMenuIndex(null);
  };

  const showBackButton = activeMenuIndex !== null;

  return (
    <div className="fixed inset-0 w-full overflow-auto px-4 z-10 h-screen bg-black-default">
      <div className="flex h-[60px]">
        {showBackButton && (
          <button
            onClick={onBack}
            type="button"
            className="flex gap-2 items-center"
          >
            <Icons.arrowLeft />
            <span className="text-gray-11">Back</span>
          </button>
        )}
        <div className="flex gap-4 items-center ml-auto">
          <span className="text-gray-11">Close</span>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.close /> : <Icons.burgher />}
          </button>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex flex-col gap-6">
          {MenuItems.map((item, index) => {
            if (activeMenuIndex !== null) return null;
            return (
              <Title
                key={item.label}
                onClick={() => {
                  setActiveMenuIndex(index);
                }}
              >
                {item.label}
              </Title>
            );
          })}
        </div>

        {activeMenuIndex !== null && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              {MenuItems[activeMenuIndex].children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const username = "Username";

  const handleSignout = () => {
    deleteAuthToken();
    deleteAllKeys();
    deleteAllLocationSignatures();
    deleteAllMessages();
    deleteProfile();
    deleteAllUsers();
    window.location.href = "/";
  };

  return (
    <div className="flex w-full items-center p-4 bg-black-default z-50">
      {!isMenuOpen && (
        <Link href="/">
          <button type="button" className="flex gap-2 items-center">
            <Icons.iyk />
            <Icons.x />
            <Icons.jubmoji />
          </button>
        </Link>
      )}

      <div className="flex gap-4 items-center ml-auto">
        <span className="text-gray-11">{isMenuOpen && "Close"}</span>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <Icons.close /> : <Icons.burgher />}
        </button>
      </div>

      <AppHeaderContent
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleSignout={handleSignout}
      />
    </div>
  );
};

AppHeader.displayName = "AppHeader";

export { AppHeader };

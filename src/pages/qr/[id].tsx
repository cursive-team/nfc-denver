import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { AppBackHeader } from "@/components/AppHeader";
import { Header } from "@/components/modals/QuestRequirementModal";
import useSettings from "@/hooks/useSettings";
import { classed } from "@tw-classed/react";

const Label = classed.span("text-xs text-gray-10 font-light");
const Description = classed.span("text-gray-12 text-sm font-light");

const QRPage = () => {
  const { pageWidth } = useSettings();
  const router = useRouter();
  const { id } = router.query;

  const handleRedeem = () => {
    alert(`Button with ID: ${id} clicked!`);

    // verify user is actually a store employee before nullifying
  };

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-4">
        <Header title="Item name" />
        <div className="flex flex-col gap-4">
          <div
            className="flex bg-slate-200 rounded bg-center bg-cover"
            style={{
              width: `${pageWidth - 32}px`,
              height: `${pageWidth - 32}px`,
              backgroundImage: `url(https://picsum.photos/200/200)`,
            }}
          />
          <div className="flex flex-col">
            <Label>User</Label>
            <Description>Name of the user</Description>
          </div>
          <Button onClick={handleRedeem}>Redeem QR & nullify proof</Button>
        </div>
      </div>
    </div>
  );
};

QRPage.getInitialProps = () => {
  return { showFooter: false, showHeader: false };
};

export default QRPage;

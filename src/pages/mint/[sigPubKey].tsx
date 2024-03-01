import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { AppBackHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { getAuthToken, getKeys } from "@/lib/client/localStorage";
import { Spinner } from "@/components/Spinner";
import useRequireAdmin from "@/hooks/useRequireAdmin";

const MintQRPage = () => {
  const router = useRouter();
  const { sigPubKey } = router.query;
  const [loading, setLoading] = useState<boolean>(false);

  useRequireAdmin();

  useEffect(() => {
    if (typeof sigPubKey !== "string") {
      toast.error("Invalid QR code");
      router.push("/");
    }

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to view this page");
      router.push("/login");
      return;
    }
  }, [router, sigPubKey]);

  const handleMint = async () => {
    setLoading(true);

    const authToken = getAuthToken();

    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to mint BUIDL for a user");
      router.push("/login");
      return;
    }

    const response = await fetch(`/api/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: authToken.value, sigPubKey }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      toast.error("Error minting BUIDL");
      console.error("Error minting BUIDL: ", error);
      setLoading(false);
      return;
    }

    const { success, amount } = await response.json();
    if (success) {
      toast.success(`Successfully minted ${(amount || 0).toString()} BUIDL!`);
    } else {
      toast.error("Failed to mint BUIDL");
    }
    setLoading(false);
  };

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 items-center">
          <Button loading={loading} disabled={loading} onClick={handleMint}>
            Mint BUIDL
          </Button>
        </div>
      </div>
    </div>
  );
};

MintQRPage.getInitialProps = () => {
  return { showFooter: false, showHeader: false };
};

export default MintQRPage;

import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { AppBackHeader } from "@/components/AppHeader";
import { toast } from "sonner";
import { QRCodeResponseType } from "../api/qr";
import { useEffect, useState } from "react";
import { getAuthToken, getKeys } from "@/lib/client/localStorage";
import { encryptItemRedeemedMessage } from "@/lib/client/jubSignal";
import { MessageRequest } from "../api/messages";
import { Spinner } from "@/components/Spinner";
import { getClaveBuidlBalance } from "@/lib/shared/clave";
import useRequireAdmin from "@/hooks/useRequireAdmin";

enum QRPageDisplayState {
  DISPLAY,
  SUCCESS,
  FAILURE,
}

const QRPageDisplayStateText: Record<QRPageDisplayState, string> = {
  [QRPageDisplayState.DISPLAY]: "Redeem item & nullify QR",
  [QRPageDisplayState.SUCCESS]: "Redemption succeeded!",
  [QRPageDisplayState.FAILURE]: "Redemption failed.",
};

export type QRCodeData = {
  id: string;
  itemId: number;
  itemName: string;
  sponsor: string;
  description: string;
  buidlCost: number;
  imageUrl: string;
  userEncryptionPublicKey: string;
  claveWalletAddress?: string;
  localBuidlBalance: number;
  totalBuidlBalance: number;
};

const QRPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [displayState, setDisplayState] = useState<QRPageDisplayState>(
    QRPageDisplayState.DISPLAY
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [qrCodeData, setQRCodeData] = useState<QRCodeData>();

  useRequireAdmin();

  useEffect(() => {
    if (typeof id !== "string") {
      toast.error("Invalid QR code");
      router.push("/");
    }

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to view this page");
      router.push("/login");
      return;
    }

    const fetchQR = async () => {
      const response = await fetch(`/api/qr?id=${id}&token=${authToken.value}`);
      if (!response.ok) {
        toast.error("Invalid QR code");
        router.push("/");
        return;
      }

      const qrData: QRCodeResponseType = await response.json();
      const { questProof, buidlBalance } = qrData;
      const item = questProof.quest.item;
      if (item === null) {
        toast.error("Invalid QR code");
        router.push("/");
        return;
      }

      let totalBuidlBalance = buidlBalance;
      if (questProof.user.claveWallet) {
        try {
          totalBuidlBalance += await getClaveBuidlBalance(
            questProof.user.claveWallet
          );
        } catch (error) {
          console.error("Failed to get Clave buidl balance: ", error);
        }
      }

      setQRCodeData({
        id: questProof.id,
        itemId: item.id,
        itemName: item.name,
        sponsor: item.sponsor,
        description: item.description,
        buidlCost: item.buidlCost,
        imageUrl: item.imageUrl,
        userEncryptionPublicKey: questProof.user.encryptionPublicKey,
        claveWalletAddress: questProof.user.claveWallet
          ? questProof.user.claveWallet
          : undefined,
        localBuidlBalance: buidlBalance,
        totalBuidlBalance,
      });
    };
    fetchQR();
  }, [router, id]);

  const handleRedeem = async () => {
    setLoading(true);
    if (!qrCodeData) {
      toast.error("Must have a valid QR Code to redeem!");
      return;
    }

    const authToken = getAuthToken();
    const keys = getKeys();

    if (!authToken || authToken.expiresAt < new Date() || !keys) {
      toast.error("You must be logged in to complete a quest");
      router.push("/login");
      return;
    }

    const response = await fetch(`/api/qr/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: authToken.value, id: qrCodeData.id }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      toast.error("Error redeeming QR code");
      console.error("Error redeeming QR code: ", error);
      setLoading(false);
      return;
    }

    const { success } = await response.json();
    if (success) {
      // Send jubSignal message to user that they have redeemed an item
      try {
        const senderPrivateKey = keys.encryptionPrivateKey;
        const recipientPublicKey = qrCodeData.userEncryptionPublicKey;
        const encryptedMessage = await encryptItemRedeemedMessage({
          itemId: qrCodeData.itemId.toString(),
          itemName: qrCodeData.itemName,
          qrCodeId: qrCodeData.id,
          senderPrivateKey,
          recipientPublicKey,
        });
        const messageRequests: MessageRequest[] = [
          {
            encryptedMessage,
            recipientPublicKey,
          },
        ];

        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: authToken.value,
            messageRequests,
            shouldFetchMessages: false,
          }),
        });

        if (!response.ok) {
          throw new Error("Received bad status code from server");
        }
      } catch (error) {
        console.error("Failed to send item redeemed message: ", error);
      }
      toast.success("Successfully redeemed item for user!");
      setDisplayState(QRPageDisplayState.SUCCESS);
    } else {
      toast.error("This QR code has already been redeemed.");
      setDisplayState(QRPageDisplayState.FAILURE);
    }
    setLoading(false);
  };

  const handleMint = async () => {
    setLoading(true);
    if (!qrCodeData) {
      toast.error("Must have a valid QR Code to redeem!");
      return;
    }

    const authToken = getAuthToken();
    const keys = getKeys();

    if (!authToken || authToken.expiresAt < new Date() || !keys) {
      toast.error("You must be logged in to complete a quest");
      router.push("/login");
      return;
    }

    const response = await fetch(`/api/qr/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: authToken.value, id: qrCodeData.id }),
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

  if (!qrCodeData) {
    return (
      <div className="my-auto mx-auto">
        <Spinner label="Item redemption data is loading." />
      </div>
    );
  }

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 items-center">
          <img
            className="flex bg-slate-200 rounded bg-center bg-cover"
            alt={`${qrCodeData.sponsor} store item`}
            src={qrCodeData.imageUrl}
            width={174}
            height={174}
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col text-center">
              <span className="text-xs font-light text-gray-900">
                {qrCodeData.sponsor}
              </span>
              <h2 className="text-sm text-gray-12">{qrCodeData.itemName}</h2>
            </div>
          </div>
          {displayState === QRPageDisplayState.SUCCESS && (
            <div className="flex flex-col gap-4 items-center">
              <span className="text-lg font-light text-gray-900">
                {"Successfully redeemed item for user."}
              </span>
            </div>
          )}
          {displayState === QRPageDisplayState.FAILURE && (
            <div className="flex flex-col gap-4 items-center">
              <span className="text-lg font-light text-gray-900">
                {"Failed to redeem item for user."}
              </span>
            </div>
          )}
          <Button
            loading={loading}
            disabled={displayState !== QRPageDisplayState.DISPLAY}
            onClick={handleRedeem}
          >
            {QRPageDisplayStateText[displayState]}
          </Button>
          <Button loading={loading} disabled={loading} onClick={handleMint}>
            Mint BUIDL
          </Button>
        </div>
      </div>
    </div>
  );
};

QRPage.getInitialProps = () => {
  return { showFooter: false, showHeader: false };
};

export default QRPage;

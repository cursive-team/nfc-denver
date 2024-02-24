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

const QRPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [displayState, setDisplayState] = useState<QRPageDisplayState>(
    QRPageDisplayState.DISPLAY
  );
  const [qrCodeData, setQRCodeData] = useState<QRCodeResponseType>();

  useEffect(() => {
    if (typeof id !== "string") {
      toast.error("Invalid QR code");
      router.push("/");
    }

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to view this page");
      router.push("/login");
    }

    const fetchQR = async () => {
      const response = await fetch(`/api/qr?id=${id}`);
      if (!response.ok) {
        toast.error("Invalid QR code");
        router.push("/");
      }

      const qrData: QRCodeResponseType = await response.json();
      setQRCodeData(qrData);
    };
    fetchQR();
  }, [router, id]);

  const handleRedeem = async () => {
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
    }

    const { success } = await response.json();
    if (success) {
      // Send jubSignal message to user that they have redeemed an item
      try {
        const senderPrivateKey = keys.encryptionPrivateKey;
        const recipientPublicKey = qrCodeData.user.encryptionPublicKey;
        const encryptedMessage = await encryptItemRedeemedMessage({
          itemId: qrCodeData.item.id.toString(),
          itemName: qrCodeData.item.name,
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
  };

  if (!qrCodeData) {
    return (
      <div className="my-auto mx-auto">
        <Spinner label="Item redemption data is loading." />
      </div>
    );
  }

  const { item } = qrCodeData;

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 items-center">
          <img
            className="flex bg-slate-200 rounded bg-center bg-cover"
            alt={`${item.sponsor} store item`}
            src={item.imageUrl}
            width={174}
            height={174}
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-col text-center">
              <span className="text-xs font-light text-gray-900">
                {item.sponsor}
              </span>
              <h2 className="text-sm text-gray-12">{item.name}</h2>
            </div>
          </div>
          <Button
            disabled={displayState !== QRPageDisplayState.DISPLAY}
            onClick={handleRedeem}
          >
            {QRPageDisplayStateText[displayState]}
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

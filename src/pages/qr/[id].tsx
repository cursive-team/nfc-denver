import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { AppBackHeader } from "@/components/AppHeader";
import { Header } from "@/components/modals/QuestRequirementModal";
import { classed } from "@tw-classed/react";
import toast from "react-hot-toast";
import { QRCodeResponseType } from "../api/qr";
import { useEffect, useState } from "react";
import { getAuthToken, getKeys, getProfile } from "@/lib/client/localStorage";
import { encryptItemRedeemedMessage } from "@/lib/client/jubSignal";
import { MessageRequest } from "../api/messages";

const Label = classed.span("text-xs text-gray-10 font-light");
const Description = classed.span("text-gray-12 text-sm font-light");

enum QRPageDisplayState {
  DISPLAY,
  SUCCESS,
  FAILURE,
}

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
    return <div>Loading...</div>;
  }

  const { item } = qrCodeData;

  const getHeaderText = (): string => {
    return displayState === QRPageDisplayState.DISPLAY
      ? "Item Redemption"
      : displayState === QRPageDisplayState.SUCCESS
      ? "Item Redemption: SUCCESS"
      : "Item Redemption: FAILURE";
  };

  const getBodyComponent = () => {
    if (displayState === QRPageDisplayState.DISPLAY) {
      return (
        <div className="flex flex-col gap-4">
          <Label>
            Click the button below to redeem this item for the user.
          </Label>
          <Description>
            If this proof has already been used, redemption will not succeed.
            NOTE: You must be logged in as an admin to use this feature.
          </Description>
          <Button onClick={handleRedeem}>Redeem Item</Button>
        </div>
      );
    } else if (displayState === QRPageDisplayState.SUCCESS) {
      return (
        <div className="flex flex-col gap-4">
          <Label>Item Redemption: SUCCESS</Label>
          <Description>
            The item has been successfully redeemed for the user.
          </Description>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col gap-4">
          <Label>Item Redemption: FAILURE</Label>
          <Description>This QR code has already been redeemed.</Description>
        </div>
      );
    }
  };

  return (
    <div>
      <AppBackHeader redirectTo="/" />
      <div className="flex flex-col gap-4">
        <Header title={getHeaderText()} />
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
          {getBodyComponent()}
        </div>
      </div>
    </div>
  );
};

QRPage.getInitialProps = () => {
  return { showFooter: false, showHeader: false };
};

export default QRPage;

import { useRouter } from "next/router";
import { Button } from "@/components/Button";
import { AppBackHeader } from "@/components/AppHeader";

const QRPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-center">
        Item Redemption Console
      </h1>
      <p className="text-center text-gray-500">
        Click here to redeem an item for this user. Once this is clicked, the QR
        code will be invalidated and can no longer be used to redeem this item.
      </p>
      <div className="flex flex-col items-center min-h-screen p-4 m-0 gap-4">
        <Button onClick={() => alert(`Button with ID: ${id} clicked!`)}>
          Click Me
        </Button>
      </div>
    </div>
  );
};

export default QRPage;

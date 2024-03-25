import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import {
  getAuthToken,
  getLocationSignatures,
  getUsers,
} from "@/lib/client/localStorage";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";

const MintPage = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleMint = async (event: React.FormEvent<Element>) => {
    event.preventDefault();
    if (!walletAddress || walletAddress.slice(0, 2) !== "0x") {
      toast.error("Please enter a valid wallet address 0x...");
      return;
    }
    setLoading(true);

    const token = getAuthToken();
    if (!token) {
      toast.error("You must be logged in to mint an NFT");
      setLoading(false);
      return;
    }

    const users = getUsers();
    const userSignaturePublicKeys: string[] = Object.values(users)
      .filter((user) => user.sigPk && user.inTs)
      .map((user) => user.sigPk!);

    const locations = getLocationSignatures();
    const locationSignaturePublicKeys: string[] = Object.values(locations)
      .filter((location) => location.pk)
      .map((location) => location.pk);

    const stringifiedPublicKeys = JSON.stringify({
      users: userSignaturePublicKeys,
      locations: locationSignaturePublicKeys,
    });

    const response = await fetch("/api/mint/art", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authToken: token.value,
        walletAddress,
        stringifiedPublicKeys,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error minting NFT: ", error.messsage);
      toast.error("Error minting NFT! Please try again later.");
    } else {
      toast.info(
        "Successfully processed mint request - please wait a few days for the NFT to be minted."
      );
    }
    setLoading(false);

    router.push("/");
  };

  return (
    <FormStepLayout
      title="Mint generative art NFT"
      description="Input a wallet address to receive a unique NFT from your taps at ETHDenver! Note: this will publish the public keys of the signatures you've collected on IPFS."
      onSubmit={handleMint}
      actions={
        <div className="flex flex-col gap-4">
          <Button loading={loading} type="submit">
            Submit
          </Button>
          <Link href="/" className="link text-center">
            Back
          </Link>
        </div>
      }
    >
      <Input
        label="Wallet address"
        placeholder="0x1234..."
        type="text"
        name="walletAddress"
        value={walletAddress}
        onChange={(event) => setWalletAddress(event.target.value)}
        required
      />
    </FormStepLayout>
  );
};
export default MintPage;

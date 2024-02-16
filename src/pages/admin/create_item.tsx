import { upload } from "@vercel/blob/client";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { useRef, useState } from "react";
import { Button } from "@/components/Button";
import Link from "next/link";
import Image from "next/image";
import { getAuthToken } from "@/lib/client/localStorage";
import router from "next/router";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { InputWrapper } from "@/components/input/InputWrapper";

export default function CreateItem() {
  const [itemName, setItemName] = useState<string>("");
  const [itemSponsor, setItemSponsor] = useState<string>("");
  const [itemDescription, setItemDescription] = useState<string>("");
  const [buidlCost, setBuidlCost] = useState<number>(0);
  const [questReqIds, setQuestReqIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };
  const imageFile: any = fileInputRef.current?.files?.[0];

  const getImageUrlMutation = useMutation({
    mutationKey: ["imageBlob"],
    mutationFn: async ({
      imageFile,
      token,
    }: {
      imageFile: File;
      token: string;
    }) => {
      const newBlob = await upload(imageFile.name, imageFile, {
        access: "public",
        handleUploadUrl: `/api/item/upload?token=${token}`,
      });
      return newBlob.url;
    },
  });

  const handleItemCreation = async (event: React.FormEvent) => {
    event.preventDefault();

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      toast.error("You must be logged in to connect");
      router.push("/login");
      return;
    }

    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }

    setLoading(true);

    // Validate quest requirement ids
    const response = await fetch("/api/item/validate_requirements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questReqIds }),
    });
    if (!response.ok) {
      toast.error("Invalid quest requirement ids. Please try again.");
      setLoading(false);
      return;
    }
    const { valid } = await response.json();
    if (!valid) {
      toast.error("Invalid quest requirement ids. Please try again.");
      setLoading(false);
      return;
    }

    await getImageUrlMutation.mutateAsync(
      { imageFile, token: authToken.value },
      {
        onSuccess: async (imageUrl: string) => {
          const itemData = {
            token: authToken.value,
            name: itemName,
            sponsor: itemSponsor,
            description: itemDescription,
            buidlCost,
            questReqIds,
            imageUrl,
          };

          const response = await fetch("/api/item", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(itemData),
          });

          if (!response.ok) {
            toast.error("Error registering item. Please try again.");
            return;
          }

          const { itemId } = await response.json();
          setLoading(false);
          toast.success("Item created successfully!");
          router.push(`/items`);
        },
        onError: () => {
          toast.error("Error uploading image. Please try again.");
        },
      }
    );
  };

  return (
    <FormStepLayout
      title="Create item"
      description="Create a new item"
      onSubmit={handleItemCreation}
      actions={
        <div className="flex flex-col gap-4">
          <Button loading={loading} type="submit">
            Submit
          </Button>
          <Link href="/admin" className="link text-center">
            Cancel
          </Link>
        </div>
      }
    >
      <Input
        label="Name"
        placeholder="Name of item"
        type="text"
        name="itemName"
        value={itemName}
        onChange={(event) => setItemName(event.target.value)}
        required
      />
      <Input
        label="Sponsor"
        placeholder="Sponsor of item"
        type="text"
        name="itemSponsor"
        value={itemSponsor}
        onChange={(event) => setItemSponsor(event.target.value)}
        required
      />
      <Input
        label="Description"
        placeholder="Description of item"
        type="text"
        name="itemDescription"
        value={itemDescription}
        onChange={(event) => setItemDescription(event.target.value)}
        required
      />
      <Input
        label="Buidl Cost"
        placeholder="Buidl cost of item"
        type="number"
        name="buidlCost"
        value={buidlCost}
        onChange={(event) => setBuidlCost(parseInt(event.target.value))}
        required
      />
      <Input
        label="Quest Requirement Ids"
        placeholder="Enter quest requirement ids, comma separated"
        type="text"
        name="reqIds"
        value={questReqIds.join(",")}
        onChange={(event) => setQuestReqIds(event.target.value.split(","))}
        required
      />
      <div className="relative">
        <InputWrapper error={!imageFile ? "Please select an image." : ""}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageChange}
            className="hidden"
          />
        </InputWrapper>
      </div>
      <Button type="button" onClick={handleTakePhoto}>
        Attach photo
      </Button>
      {image && (
        <Image
          src={image}
          width={400}
          height={300}
          alt="Item"
          className="mb-4 h-48 w-full object-cover"
        />
      )}
    </FormStepLayout>
  );
}

CreateItem.getInitialProps = () => {
  return { showFooter: false, showHeader: true };
};

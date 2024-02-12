import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import toast from "react-hot-toast";
import { useRegisterLocation } from "@/hooks/useRegisterLocation";

export default function RegisterLocation() {
  const router = useRouter();
  const [cmac, setCmac] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [sponsor, setSponsor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const registerLocationMutation = useRegisterLocation();

  useEffect(() => {
    if (router.query.cmac) {
      setCmac(router.query.cmac as string);
    }
  }, [router.query.cmac]);

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

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDescription(event.target.value);
  };

  const handleSponsorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSponsor(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!cmac) {
      toast.error("Error processing tap. Please tap card again!");
      return;
    }

    if (!name || !description || !sponsor) {
      toast.error("Please fill in all fields.");
      return;
    }

    const imageFile = fileInputRef.current?.files?.[0];
    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }

    const newBlob = await upload(imageFile.name, imageFile, {
      access: "public",
      handleUploadUrl: `/api/register/location/upload?cmac=${cmac}`,
    });

    if (name.length > 64) {
      toast.error("Location name must be less than 64 characters.");
      return;
    }
    if (description.length > 256) {
      toast.error("Description must be less than 256 characters.");
      return;
    }
    if (sponsor.length > 32) {
      toast.error("Sponsor must be less than 32 characters.");
      return;
    }

    const locationData = {
      cmac: cmac,
      name: name,
      description: description,
      sponsor: sponsor,
      imageUrl: newBlob.url,
    };

    await registerLocationMutation.mutateAsync(locationData, {
      onSuccess: (locationId) => {
        router.push(`/locations/${locationId}`);
      },
    });
  };

  return (
    <FormStepLayout
      title="Registration"
      description="Set up a location chip"
      onSubmit={handleSubmit}
      actions={
        <Button loading={registerLocationMutation.isPending} type="submit">
          Submit
        </Button>
      }
    >
      <Input
        type="text"
        label="Name"
        placeholder="Name of the location"
        value={name}
        onChange={handleNameChange}
        className="mb-4 text-black"
      />
      <Input
        type="text"
        label="Description"
        placeholder="Description of location"
        value={description}
        onChange={handleDescriptionChange}
        className="mb-4 text-black"
      />
      <Input
        type="text"
        label="Sponsor"
        placeholder="Sponsor associated with location"
        value={sponsor}
        onChange={handleSponsorChange}
        className="mb-4 text-black"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="hidden"
      />
      <Button type="button" onClick={handleTakePhoto}>
        Attach photo
      </Button>
      {image && (
        <Image
          src={image}
          width={400}
          height={300}
          alt="Location"
          className="mb-4 h-48 w-full object-cover rounded"
        />
      )}
    </FormStepLayout>
  );
}

RegisterLocation.getInitialProps = () => {
  return { showFooter: false, showHeader: false };
};

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

const RegisterLocation = () => {
  const router = useRouter();
  const [cmac, setCmac] = useState<string>("");
  const [image, setImage] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [sponsor, setSponsor] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleSubmit = async () => {
    if (!cmac) {
      alert("Error processing tap. Please tap card again!");
      return;
    }

    if (!name || !description || !sponsor) {
      alert("Please fill in all fields.");
      return;
    }

    const imageFile = fileInputRef.current?.files?.[0];
    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    const newBlob = await upload(imageFile.name, imageFile, {
      access: "public",
      handleUploadUrl: `/api/register/location/upload?cmac=${cmac}`,
    });

    console.log(newBlob.url);

    if (name.length > 64) {
      alert("Location name must be less than 64 characters.");
      return;
    }
    if (description.length > 256) {
      alert("Description must be less than 256 characters.");
      return;
    }
    if (sponsor.length > 32) {
      alert("Sponsor must be less than 32 characters.");
      return;
    }

    const queryParams = new URLSearchParams({
      cmac,
      name,
      description,
      sponsor,
    });

    const response = await fetch(
      `/api/register/location?${queryParams.toString()}`,
      {
        method: "POST",
        body: imageFile,
      }
    );
    if (!response.ok) {
      alert("Error registering location. Please try again.");
      return;
    }

    const { locationId } = await response.json();
    router.push(`/locations/${locationId}`);
  };

  return (
    <div className="p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        className="hidden"
      />
      <Button
        type="button"
        onClick={handleTakePhoto}
        className="flex items-center justify-center w-full p-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
      >
        Take Photo
      </Button>
      {image && (
        <Image
          src={image}
          width={400}
          height={300}
          alt="Location"
          className="mb-4 h-48 w-full object-cover"
        />
      )}
      <Input
        type="text"
        placeholder="Location Name"
        value={name}
        onChange={handleNameChange}
        className="mb-4"
      />
      <Input
        type="text"
        placeholder="Description"
        value={description}
        onChange={handleDescriptionChange}
        className="mb-4"
      />
      <Input
        type="text"
        placeholder="Sponsor"
        value={sponsor}
        onChange={handleSponsorChange}
        className="mb-4"
      />
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
};

export default RegisterLocation;

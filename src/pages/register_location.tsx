import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  RegisterLocationSchema,
  RegisterLocationType,
} from "@/lib/schema/schema";
import { InputWrapper } from "@/components/input/InputWrapper";
import { useMutation } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { Checkbox } from "@/components/Checkbox";

export default function RegisterLocation() {
  const router = useRouter();
  const [image, setImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const iykRef = router.query.iykRef as string | undefined;
  const mockRef = router.query.mockRef as string | undefined;
  const sigPk = router.query.sigPk as string | undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<RegisterLocationType>({
    resolver: yupResolver(RegisterLocationSchema),
    defaultValues: {
      iykRef,
      mockRef,
      sigPk,
      name: "",
      description: "",
      sponsor: "",
      emailWallet: false,
    },
  });

  const emailWallet = watch("emailWallet", false);

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
      iykRef,
      mockRef,
      sigPk,
    }: {
      imageFile: File;
      iykRef?: string;
      mockRef?: string;
      sigPk?: string;
    }) => {
      if (!iykRef && !sigPk) {
        throw new Error("iykRef or sigPk must be provided");
      }

      const mockRefString = mockRef ? `&mockRef=${mockRef}` : "";
      const uploadUrlParams = iykRef
        ? `?iykRef=${iykRef}${mockRefString}`
        : `?sigPk=${sigPk}`;
      const newBlob = await upload(imageFile.name, imageFile, {
        access: "public",
        handleUploadUrl: `/api/register/location/upload${uploadUrlParams}`,
      });
      return newBlob.url;
    },
  });

  const onSubmit = async (formValues: RegisterLocationType) => {
    if (!imageFile) {
      toast.error("Please select an image.");
      return;
    }

    await getImageUrlMutation.mutateAsync(
      { imageFile, iykRef, mockRef, sigPk },
      {
        onSuccess: async (imageUrl: string) => {
          const locationData: RegisterLocationType = {
            ...formValues,
            imageUrl,
          };

          const response = await fetch("/api/register/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(locationData),
          });

          if (!response.ok) {
            toast.error("Error registering location. Please try again.");
            return;
          }

          const { locationId } = await response.json();
          router.push(`/locations/${locationId}`);
        },
        onError: () => {
          toast.error("Error uploading image. Please try again.");
        },
      }
    );
  };

  return (
    <FormStepLayout
      title="Registration"
      description="Set up a location chip"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap pt-4"
      actions={
        <Button loading={getImageUrlMutation.isPending} type="submit">
          Submit
        </Button>
      }
    >
      <div className="flex flex-col gap-8">
        <input type="hidden" {...register("iykRef")} />
        <Input
          type="text"
          label="Name"
          placeholder="Name of the location"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          type="text"
          label="Description"
          placeholder="Description of location"
          error={errors.description?.message}
          {...register("description")}
        />
        <Input
          type="text"
          label="Sponsor"
          placeholder="Sponsor associated with location"
          error={errors.sponsor?.message}
          {...register("sponsor")}
        />
        <Checkbox
          id="emailWallet"
          label="Enable experimental emailwallet.org minting"
          checked={emailWallet}
          onChange={(enabled) => {
            setValue("emailWallet", enabled);
          }}
          disabled={false}
        />
        <div className="relative">
          <InputWrapper
            error={!imageFile && isSubmitted ? "Please select an image." : ""}
          >
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
            alt="Location"
            className="mb-4 h-48 w-full object-cover"
          />
        )}
      </div>
    </FormStepLayout>
  );
}

RegisterLocation.getInitialProps = () => {
  return { showFooter: false, showHeader: false };
};

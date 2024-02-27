import { RegisterSchema } from "@/lib/schema/schema";
import { InferType } from "yup";
import { Input } from "../Input";
import { AppBackHeader } from "../AppHeader";
import { RegisterFormStepProps } from ".";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Button } from "../Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useStateMachine } from "little-state-machine";
import updateStateFromAction from "@/lib/shared/updateAction";
import { handleNickName } from "@/lib/shared/utils";

const RegisterSocialSchema = RegisterSchema.pick([
  "displayName",
  "twitterUsername",
  "telegramUsername",
  "farcasterUsername",
  "bio",
]);
type RegisterSocialProps = InferType<typeof RegisterSocialSchema>;

const RegisterSocial = ({ onBack, onSuccess }: RegisterFormStepProps) => {
  const { actions, getState } = useStateMachine({ updateStateFromAction });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterSocialProps>({
    resolver: yupResolver(RegisterSocialSchema),
    defaultValues: {
      displayName: getState()?.register?.displayName ?? "",
      twitterUsername: getState()?.register?.twitterUsername ?? "",
      telegramUsername: getState()?.register?.telegramUsername ?? "",
      farcasterUsername: getState()?.register?.farcasterUsername ?? "",
      bio: getState()?.register?.bio ?? "",
    },
  });

  const handleSocialSubmit = (data: RegisterSocialProps) => {
    actions.updateStateFromAction({
      register: {
        ...getState()?.register,
        ...data,
      },
    });
    onSuccess?.();
  };

  return (
    <div className="flex flex-col grow">
      <AppBackHeader
        label="Email"
        // no need to get back to code, redirect to email input
        onBackClick={() => {
          onBack?.();
        }}
      />
      <FormStepLayout
        title="Social settings"
        description="1/2"
        onSubmit={handleSubmit(handleSocialSubmit)}
        className="xs:pt-4"
        header={
          <div className="flex flex-col gap-6">
            <span className="text-sm text-gray-11 font-light">
              You can choose which social channels to share each time you tap
              someone else. You can change these at any time in the app.
            </span>
            <Input
              type="text"
              label="Display name"
              placeholder="Choose a display name"
              error={errors.displayName?.message}
              {...register("displayName")}
            />
            <Input
              type="text"
              label="X (Optional)"
              placeholder="twitter.com/username"
              error={errors.twitterUsername?.message}
              {...register("twitterUsername", {
                onChange: (e) => {
                  const value = e.target.value;
                  setValue("twitterUsername", handleNickName(value));
                },
              })}
            />
            <Input
              type="text"
              label="Telegram (Optional)"
              placeholder="Telegram username"
              error={errors.telegramUsername?.message}
              {...register("telegramUsername", {
                onChange: (e) => {
                  const value = e.target.value;
                  setValue("telegramUsername", handleNickName(value));
                },
              })}
            />
            <Input
              type="text"
              label="Farcaster (Optional)"
              placeholder="Farcaster username"
              error={errors.farcasterUsername?.message}
              {...register("farcasterUsername", {
                onChange: (e) => {
                  const value = e.target.value;
                  setValue("farcasterUsername", handleNickName(value));
                },
              })}
            />
            <Input
              type="text"
              label="Bio (Optional)"
              placeholder="Notes about yourself"
              error={errors.bio?.message}
              {...register("bio")}
            />
          </div>
        }
      >
        <Button type="submit">Next: Data Custody</Button>
      </FormStepLayout>
    </div>
  );
};

RegisterSocial.displayName = "RegisterSocial";

export { RegisterSocial };

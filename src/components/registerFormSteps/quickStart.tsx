import { RegisterSchema } from "@/lib/schema/schema";
import { InferType } from "yup";
import { Button } from "../Button";
import { AppBackHeader } from "../AppHeader";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Radio } from "../Radio";
import { useStateMachine } from "little-state-machine";
import updateStateFromAction from "@/lib/shared/updateAction";
import { Input } from "../Input";
import { toast } from "sonner";
import { REGISTRATION_GET_CODE_STATE } from "@/pages/api/register/get_code";
import { useState } from "react";

const RegisterQuickStartSchema = RegisterSchema.pick([
  "email",
  "displayName",
  "wantsServerCustody",
]);
type RegisterQuickStartProps = InferType<typeof RegisterQuickStartSchema>;

export interface QuickStartProps {
  iykRef: string;
  mockRef?: string;
  onSuccess?: (wantsServerCustody: boolean) => void;
  onBack?: (wantsServerCustody: boolean) => void;
  title?: string;
}

const RegisterQuickStart = ({
  iykRef,
  mockRef,
  onSuccess,
}: QuickStartProps) => {
  const { actions, getState } = useStateMachine({ updateStateFromAction });
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterQuickStartProps>({
    resolver: yupResolver(RegisterQuickStartSchema),
    defaultValues: {
      email: getState()?.register?.email,
      displayName: getState()?.register?.displayName ?? "",
      wantsServerCustody: getState()?.register?.wantsServerCustody ?? false,
    },
  });

  const wantsServerCustody = watch("wantsServerCustody");

  const handleQuickStartSubmit = async (data: RegisterQuickStartProps) => {
    // update state with current form data
    actions.updateStateFromAction({
      register: {
        ...getState()?.register,
        ...data,
      },
    });

    if (wantsServerCustody) {
      setLoading(true);
      const response = await fetch("/api/register/get_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, iykRef, mockRef }),
      });
      setLoading(false);

      if (!response.ok) {
        const { error, state } = await response.json();
        console.error("Error:", error);

        if (state === REGISTRATION_GET_CODE_STATE.CODE_INVALID) {
          toast.error("Invalid tap! Please try again.");
        } else if (state === REGISTRATION_GET_CODE_STATE.EMAIL_INVALID) {
          toast.error(
            "Please make sure you register with the same email you used to sign up for ETHDenver."
          );
        } else if (state === REGISTRATION_GET_CODE_STATE.EMAIL_REGISTERED) {
          toast.error("This email is already registered.");
        } else {
          toast.error("Error requesting email code. Please try again.");
        }
        return;
      } else {
        onSuccess?.(true); // proceed to verify code
        return;
      }
    }

    onSuccess?.(false); // proceed to password setup
  };

  return (
    <div className="flex flex-col grow">
      <FormStepLayout
        onSubmit={handleSubmit(handleQuickStartSubmit)}
        description="Tap people's badges to share socials and win prizes!"
        title="Join BUIDLQuest"
        className="pt-4"
        header={null}
      >
        <Input
          label="Email"
          placeholder="Login email address"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          type="text"
          label="Display name"
          placeholder="In-app name, can change anytime"
          error={errors.displayName?.message}
          {...register("displayName")}
        />
        <fieldset className="flex flex-col gap-3">
          <span className="text-gray-12 text-xs">
            Custody options, built with ZK tech by{" "}
            <a
              href="https://cursive.team"
              target="_blank"
              rel="noreferrer noopener"
            >
              <u>Cursive</u>
            </a>
          </span>
          <Radio
            id="serverCustody"
            type="radio"
            name="custody"
            value="server"
            label="Server custody"
            description="Your socials and contacts can be read by app server, but login by just verifying an email code."
            checked={wantsServerCustody}
            onChange={() => {
              setValue("wantsServerCustody", true, {
                shouldValidate: true,
              });
            }}
          />
          <Radio
            id="selfCustody"
            name="custody"
            value="self"
            label="Self custody"
            description="Your socials and contacts are private to you, but you must save a master password for encrypted backups. ZK is used to verifiably unlock prizes."
            checked={!wantsServerCustody}
            onChange={() => {
              setValue("wantsServerCustody", false, {
                shouldValidate: true,
              });
            }}
          />
        </fieldset>
        <Button loading={loading} type="submit">
          {wantsServerCustody ? "Verify email" : "Choose password"}
        </Button>
      </FormStepLayout>
    </div>
  );
};

RegisterQuickStart.displayName = "RegisterQuickStart";
export { RegisterQuickStart };

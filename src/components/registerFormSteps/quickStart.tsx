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

  const wantsServerCustody = watch("wantsServerCustody", false);

  const handleQuickStartSubmit = async (data: RegisterQuickStartProps) => {
    actions.updateStateFromAction({
      register: {
        ...getState()?.register,
        ...data,
      },
    });

    if (wantsServerCustody) {
      setLoading(true);
      // update state with email
      actions.updateStateFromAction({
        register: { ...getState().register, email: data.email },
      });

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
        description="Tap people's badges to connect and win prizes!"
        title="Join BUIDLQuest"
        className="pt-4"
        header={<></>}
      >
        <Input
          label="Email"
          placeholder="Your email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          type="text"
          label="Display name"
          placeholder="Choose name, can change anytime"
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
            id="selfCustody"
            name="custody"
            value="self"
            label="Self custody"
            description="ETHDenver interaction data is private to you, encrypted by a master password you must save. ZK proofs used to prove quest completion."
            checked={!wantsServerCustody}
            onChange={() => {
              setValue("wantsServerCustody", false, {
                shouldValidate: true,
              });
            }}
          />
          <Radio
            id="serverCustody"
            type="radio"
            name="custody"
            value="server"
            label="Server custody"
            description="ETHDenver interaction data can be read by app server, but login just requires verifying an email code."
            checked={wantsServerCustody}
            onChange={() => {
              setValue("wantsServerCustody", true, {
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

import { FormStepLayout } from "@/layouts/FormStepLayout";
import { AppBackHeader } from "../AppHeader";
import { Button } from "../Button";
import { Input } from "../Input";
import { RegisterFormStepProps } from ".";
import updateStateFromAction from "@/lib/shared/updateAction";
import { useStateMachine } from "little-state-machine";
import { RegisterSchema } from "@/lib/schema/schema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { toast } from "sonner";
import { verifySigninCodeResponseSchema } from "@/lib/server/auth";
import { useMutation } from "@tanstack/react-query";
import useSettings from "@/hooks/useSettings";

const RegisterCodeSchema = RegisterSchema.pick(["code"]);
type RegisterCodeProps = InferType<typeof RegisterCodeSchema>;

const RegisterStepCode = ({ onBack, onSuccess }: RegisterFormStepProps) => {
  const { eventDate } = useSettings();
  const { actions, getState } = useStateMachine({ updateStateFromAction });

  const email = getState()?.register?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCodeProps>({
    resolver: yupResolver(RegisterCodeSchema),
    defaultValues: {
      code: getState()?.register?.code,
    },
  });

  const handleCodeSubmit = async ({ code }: RegisterCodeProps) => {
    await fetch("/api/register/verify_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        const verifyCodeResponse =
          verifySigninCodeResponseSchema.validateSync(data);
        if (verifyCodeResponse.success) {
          // update state with code
          actions.updateStateFromAction({
            register: { ...getState().register, code },
          });
          onSuccess?.();
        } else {
          const errorReason = verifyCodeResponse.reason;
          if (errorReason) {
            throw new Error(errorReason);
          }
        }
      })
      .catch((error) => {
        console.error("Error: ", error);
        toast.error("Invalid email code");
      });
  };

  const handleCodeMutation = useMutation({
    mutationKey: ["verify_code"],
    mutationFn: async ({ code }: RegisterCodeProps) => {
      await handleCodeSubmit({ code });
    },
  });

  const onCodeSubmit = async (data: RegisterCodeProps) => {
    await handleCodeMutation.mutateAsync(data);
  };

  return (
    <div className="flex flex-col grow">
      <AppBackHeader label="Email" onBackClick={() => onBack?.()} />
      <FormStepLayout
        title={`We've just sent you a six digit code to ${email}`}
        description={eventDate}
        className="xs:pt-4 grow"
        onSubmit={handleSubmit(onCodeSubmit)}
      >
        <Input
          type="text"
          {...register("code")}
          error={errors.code?.message}
          label="6-digit code"
          placeholder="Confirm your 6-digit code"
        />
        <Button loading={handleCodeMutation.isPending} type="submit">
          Continue
        </Button>
      </FormStepLayout>
    </div>
  );
};

RegisterStepCode.displayName = "RegisterStepCode";

export { RegisterStepCode };

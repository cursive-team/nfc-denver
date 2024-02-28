import { FormStepLayout } from "@/layouts/FormStepLayout";
import { RegisterSchema } from "@/lib/schema/schema";
import updateStateFromAction from "@/lib/shared/updateAction";
import { yupResolver } from "@hookform/resolvers/yup";
import { useStateMachine } from "little-state-machine";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { InferType } from "yup";
import { Button } from "../Button";
import { Input } from "../Input";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import useSettings from "@/hooks/useSettings";

const RegisterEmailSchema = RegisterSchema.pick(["email"]);
type LoginFormProps = InferType<typeof RegisterEmailSchema>;

export interface RegisterFormStepProps {
  iykRef: string;
  mockRef?: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

const RegisterStepForm = ({
  iykRef,
  mockRef,
  onSuccess,
}: RegisterFormStepProps) => {
  const { eventDate } = useSettings();
  const { actions, getState } = useStateMachine({ updateStateFromAction });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormProps>({
    resolver: yupResolver(RegisterEmailSchema),
    defaultValues: {
      email: getState()?.register?.email,
    },
  });

  const onRegisterEmail = async ({ email }: LoginFormProps) => {
    if (!iykRef) {
      toast.error("Please tap your card to link it to your account.");
      return;
    }

    // update state with email
    actions.updateStateFromAction({
      register: { ...getState().register, email },
    });

    await fetch("/api/register/get_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, iykRef, mockRef }),
    })
      .then((response) => {
        if (response.ok) {
          onSuccess?.();
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error(error.message);
      });
  };

  const registerEmailMutation = useMutation({
    mutationKey: ["registerEmail"],
    mutationFn: async ({ email }: LoginFormProps) => {
      await onRegisterEmail({ email });
    },
  });

  const onSubmit = async (data: LoginFormProps) => {
    await registerEmailMutation.mutateAsync(data);
  };

  return (
    <FormStepLayout
      title="Welcome to ETHDenver"
      description={eventDate}
      className="pt-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        label="Email"
        placeholder="Your email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button loading={registerEmailMutation.isPending} type="submit">
        Continue
      </Button>
      <Link href="/login" className="link text-center">
        I already have an account
      </Link>
    </FormStepLayout>
  );
};

RegisterStepForm.displayName = "RegisterStepForm";

export { RegisterStepForm };

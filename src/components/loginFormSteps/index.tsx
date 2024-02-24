import { FormStepLayout } from "@/layouts/FormStepLayout";
import updateStateFromAction from "@/lib/shared/updateAction";
import { useMutation } from "@tanstack/react-query";
import { useStateMachine } from "little-state-machine";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../Button";
import { Input } from "../Input";
import { LoginSchema } from "@/lib/schema/schema";
import { InferType } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const LoginEmailSchema = LoginSchema.pick(["email"]);
type LoginFormProps = InferType<typeof LoginEmailSchema>;

export interface LoginFormStepProps {
  onSuccessfulLogin?: () => void;
  onSuccess?: () => void;
  onBack?: () => void;
}

const LoginFormStepIndex = ({ onSuccess }: LoginFormStepProps) => {
  const { actions, getState } = useStateMachine({ updateStateFromAction });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormProps>({
    resolver: yupResolver(LoginEmailSchema),
    defaultValues: {
      email: getState()?.login?.email,
    },
  });

  const loginMutation = useMutation({
    mutationKey: ["login"],
    mutationFn: async ({ email }: LoginFormProps) => {
      actions.updateStateFromAction({ login: { email } });
      const response = await fetch("/api/login/get_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        return Promise.reject("Error requesting code. Please try again.");
      }

      return Promise.resolve();
    },
  });

  const onSubmit = async ({ email }: LoginFormProps) => {
    await loginMutation.mutateAsync(
      { email },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: () => {
          toast.error("An unexpected error occurred. Please try again.");
        },
      }
    );
  };

  return (
    <FormStepLayout
      title="Login"
      description="Welcome to ETHDenver"
      onSubmit={handleSubmit(onSubmit)}
      className="pt-4"
    >
      <Input
        type="text"
        id="email"
        label="Email"
        placeholder="example@xyz.com"
        error={errors.email?.message}
        {...register("email")}
      />
      <Button type="submit" loading={loginMutation.isPending}>
        Send Code
      </Button>
      <Link
        href="https://pse-team.notion.site/pse-team/BUIDLQuest-One-Pager-e9ea7aba9bae483c8bc54d7b825019c1#b4b47ee6171b4626893daf5ff23ef2a0"
        className="link text-center"
        target="_blank"
        rel="noreferrer noopener"
      >
        I have not registered
      </Link>
    </FormStepLayout>
  );
};

LoginFormStepIndex.displayName = "LoginFormStepIndex";
export { LoginFormStepIndex };

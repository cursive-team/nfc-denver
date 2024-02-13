import { AppBackHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useCompleteLogin } from "@/hooks/useCompleteLogin";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { hashPassword } from "@/lib/client/utils";
import { LoginSchema } from "@/lib/schema/schema";
import { decryptBackupString } from "@/lib/shared/backup";
import updateStateFromAction from "@/lib/shared/updateAction";
import { useMutation } from "@tanstack/react-query";
import { useStateMachine } from "little-state-machine";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LoginFormStepProps } from ".";
import { InferType } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const LoginCodeSchema = LoginSchema.pick(["password"]);

type LoginFormProps = InferType<typeof LoginCodeSchema>;

const LoginStepPassword = ({
  onBack,
  onSuccessfulLogin,
}: LoginFormStepProps) => {
  const { getState } = useStateMachine({ updateStateFromAction });
  const { completeLogin } = useCompleteLogin({
    onSuccessfulLogin,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormProps>({
    resolver: yupResolver(LoginCodeSchema),
    defaultValues: {
      password: getState()?.login?.password,
    },
  });

  const handlePasswordMutation = useMutation({
    mutationKey: ["handlePassword"],
    mutationFn: async ({ password }: LoginFormProps) => {
      const {
        encryptedData,
        authenticationTag,
        iv,
        email,
        passwordSalt,
        passwordHash,
      } = getState().login;

      const derivedPasswordHash = await hashPassword(password, passwordSalt);
      if (derivedPasswordHash !== passwordHash) {
        return Promise.reject({ error: "Incorrect password!" });
      }

      const decryptedBackupData = decryptBackupString(
        encryptedData,
        authenticationTag,
        iv,
        email,
        password
      );

      return decryptedBackupData;
    },
  });

  const onSubmit = async (formValues: LoginFormProps) => {
    await handlePasswordMutation.mutateAsync(formValues, {
      onSuccess: async (data: any) => {
        await completeLogin({
          backup: data,
        });
      },
      onError: (error: any) => {
        toast.error(error.error || "Error logging in. Please try again.");
      },
    });
  };

  return (
    <>
      <AppBackHeader onBackClick={onBack} />
      <FormStepLayout
        title="Login"
        description="Welcome to ETHDenver"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          type="password"
          id="password"
          label="Password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" loading={handlePasswordMutation.isPending}>
          Login
        </Button>
      </FormStepLayout>
    </>
  );
};

LoginStepPassword.displayName = "LoginStepPassword";
export { LoginStepPassword };

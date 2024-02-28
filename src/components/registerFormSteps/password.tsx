import { RegisterSchema } from "@/lib/schema/schema";
import { InferType } from "yup";
import { Input } from "../Input";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { AppBackHeader } from "../AppHeader";
import { RegisterFormStepProps } from ".";
import { Button } from "../Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import updateStateFromAction from "@/lib/shared/updateAction";
import { useStateMachine } from "little-state-machine";

const RegisterPasswordSchema = RegisterSchema.pick([
  "password",
  "confirmPassword",
]);
type RegisterPasswordProps = InferType<typeof RegisterPasswordSchema>;

const RegisterPassword = ({ onBack, onSuccess }: RegisterFormStepProps) => {
  const { actions, getState } = useStateMachine({ updateStateFromAction });

  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<RegisterPasswordProps>({
    resolver: yupResolver(RegisterPasswordSchema),
    defaultValues: {
      password: getState()?.register?.password ?? "",
      confirmPassword: getState()?.register?.confirmPassword ?? "",
    },
  });

  const handleCreateSelfCustodyAccount = ({
    password,
  }: RegisterPasswordProps) => {
    actions.updateStateFromAction({
      register: {
        ...getState()?.register,
        password,
      },
    });
    onSuccess?.(); // proceed to next step
  };

  return (
    <div className="flex flex-col grow">
      <AppBackHeader
        label="Choose custody"
        onBackClick={() => {
          onBack?.();
        }}
      />
      <FormStepLayout
        className="xs:pt-4"
        title={<span>Master password</span>}
        onSubmit={handleSubmit(handleCreateSelfCustodyAccount)}
      >
        <Input
          type="password"
          label="Master password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          type="password"
          label="Confirm master password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <span className="text-gray-11 text-sm">
          This master password is used to encrypt a backup of your interaction
          data on our server. You are responsible for saving this password.
        </span>
        <Button type="submit">Create Account</Button>
      </FormStepLayout>
    </div>
  );
};

RegisterPassword.displayName = "RegisterPassword";
export { RegisterPassword };

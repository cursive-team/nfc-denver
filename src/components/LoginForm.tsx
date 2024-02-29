import { useState } from "react";
import { Record } from "@prisma/client/runtime/library";
import useSettings from "@/hooks/useSettings";
import { Spinner } from "./Spinner";

import { LoginFormStepIndex } from "./loginFormSteps";
import { LoginStepCode } from "./loginFormSteps/code";
import { LoginStepPassword } from "./loginFormSteps/password";

enum DisplayState {
  INPUT_EMAIL = "INPUT_EMAIL",
  INPUT_CODE = "INPUT_CODE",
  INPUT_PASSWORD = "INPUT_PASSWORD",
  LOGGING_IN = "LOGGING_IN",
}

interface LoginFormProps {
  onSuccessfulLogin: () => void;
  description?: string;
}

export default function LoginForm({
  onSuccessfulLogin,
  description,
}: LoginFormProps) {
  const { pageHeight } = useSettings();
  const [displayState, setDisplayState] = useState(DisplayState.INPUT_EMAIL);

  const onSuccessfulLoginHandler = () => {
    onSuccessfulLogin?.();
  };

  const StatusStepComponent: Record<
    keyof typeof DisplayState,
    React.ReactNode
  > = {
    INPUT_EMAIL: (
      <LoginFormStepIndex
        subtitle={description}
        onSuccess={() => {
          setDisplayState(DisplayState.INPUT_CODE);
        }}
      />
    ),
    INPUT_CODE: (
      <LoginStepCode
        onSuccessfulLogin={onSuccessfulLoginHandler}
        onSuccess={() => {
          setDisplayState(DisplayState.INPUT_PASSWORD);
        }}
        onBack={() => {
          setDisplayState(DisplayState.INPUT_EMAIL);
        }}
      />
    ),
    INPUT_PASSWORD: (
      <LoginStepPassword
        onSuccessfulLogin={onSuccessfulLoginHandler}
        onBack={() => {
          setDisplayState(DisplayState.INPUT_CODE);
        }}
      />
    ),
    LOGGING_IN: (
      <div className="flex h-screen items-center justify-center">
        <Spinner label="Logging in into your account" />
      </div>
    ),
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: `${pageHeight}px`,
      }}
    >
      {StatusStepComponent[displayState]}
    </div>
  );
}

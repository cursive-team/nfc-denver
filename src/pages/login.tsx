import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";

const LoginPage = () => {
  const router = useRouter();

  const onSuccessfulLogin = () => {
    router.push("/");
  };

  const onFailedLogin = (errorMessage: string) => {
    alert(errorMessage);
  };

  return (
    <LoginForm
      onSuccessfulLogin={onSuccessfulLogin}
      onFailedLogin={onFailedLogin}
    />
  );
};

export default LoginPage;

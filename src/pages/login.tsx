import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
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
}

LoginPage.getInitialProps = () => {
  return { fullPage: true };
};

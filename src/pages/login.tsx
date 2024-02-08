import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const onSuccessfulLogin = () => {
    router.push("/");
  };

  const onFailedLogin = (errorMessage: string) => {
    toast.error(errorMessage);
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

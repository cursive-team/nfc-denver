import { useRouter } from "next/router";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const onSuccessfulLogin = () => {
    router.push("/");
  };
  return <LoginForm onSuccessfulLogin={onSuccessfulLogin} />;
}

LoginPage.getInitialProps = () => {
  return { fullPage: true };
};

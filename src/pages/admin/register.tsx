import { useRouter } from "next/router";
import { useEffect } from "react";

const AdminRegisterPage = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRegister = async () => {
      const response = await fetch("/api/admin/register", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Error registering new user:", response.statusText);
        router.push("/admin");
        return;
      }

      const { chipId } = await response.json();
      router.push(`/tap?iykRef=${chipId}&mockRef=true`);
    };

    handleRegister();
  }, [router]);

  return <div />;
};

export default AdminRegisterPage;

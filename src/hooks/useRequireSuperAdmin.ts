import { getAuthToken } from "@/lib/client/localStorage";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { toast } from "sonner";

export default function useRequireSuperAdmin() {
  const router = useRouter();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        toast.error("You must be logged in to view this page");
        router.push("/login");
      }

      const response = await fetch(`/api/admin?token=${authToken!.value}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("You are not authorized to view this page");
        router.push("/");
      }

      const { isSuperAdmin } = await response.json();
      if (!isSuperAdmin) {
        toast.error("You are not authorized to view this page");
        router.push("/");
      }
    };

    checkSuperAdmin();
  }, [router]);
}

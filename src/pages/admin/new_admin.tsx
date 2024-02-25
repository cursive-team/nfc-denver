import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import useRequireSuperAdmin from "@/hooks/useRequireSuperAdmin";
import { getAuthToken } from "@/lib/client/localStorage";
import { toast } from "sonner";
import Link from "next/link";

export default function NewAdmin() {
  const router = useRouter();
  const [userId, setUserId] = useState<number>(0);

  useRequireSuperAdmin();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      router.push("/login");
      return;
    }

    const response = await fetch("/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: authToken.value, otherUserId: userId }),
    });

    if (!response.ok) {
      toast.error("Error making user admin.");
      console.error("Error making user admin: ", response.statusText);
      return;
    }
  };
  return (
    <FormStepLayout
      className="pt-4"
      title="Make user admin"
      onSubmit={onSubmit}
      actions={
        <div className="flex flex-col gap-4">
          <Button type="submit">Submit</Button>
          <Link href="/admin" className="link text-center">
            Back
          </Link>
        </div>
      }
    >
      <Input
        type="number"
        name="userId"
        value={userId}
        placeholder="User ID"
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setUserId(Number(event.target.value))
        }
      />
    </FormStepLayout>
  );
}

NewAdmin.getInitialProps = () => {
  return { fullPage: true };
};

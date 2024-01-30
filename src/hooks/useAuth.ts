import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface GetLoginCodeProps {
  email: string;
  code?: string;
}

export const useGetLoginCode = () => {
  return useMutation({
    mutationKey: ["useGetLoginCode"],
    mutationFn: async ({ email }: GetLoginCodeProps) => {
      const response = await fetch("/api/login/get_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      return Promise.resolve(response.ok);
    },
  });
};

export const useVerifyCode = () => {
  return useMutation({
    mutationKey: ["useVerifyCode"],
    mutationFn: async ({ email, code }: GetLoginCodeProps) => {
      const response = await fetch("/api/login/verify_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        toast.error("Error logging in. Please try again.");
        return Promise.reject();
      }

      const data = await response.json();

      return Promise.resolve(data);
    },
  });
};

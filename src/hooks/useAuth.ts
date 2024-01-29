import { useMutation } from "@tanstack/react-query";

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
      const data = await response.json();
    },
  });
};

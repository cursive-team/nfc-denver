import { hashPassword } from "@/lib/client/utils";
import { decryptBackupString } from "@/lib/shared/backup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface SubmitLoginCode {
  email: string;
  code: string;
}

export function useEmailLogin() {
  return useMutation({
    mutationKey: ["emailLogin"],
    mutationFn: async (email: string) => {
      const response = await fetch("/api/login/get_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error);
        return Promise.reject();
      }

      return Promise.resolve();
    },
  });
}

export function useLoginCodeSubmit() {
  return useMutation({
    mutationKey: ["submitLoginCode"],
    mutationFn: async ({ email, code }: SubmitLoginCode) => {
      const response = await fetch("/api/login/verify_code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error);
        return Promise.reject();
      }

      return Promise.resolve(data);
    },
  });
}

export const usePasswordLogin = () => {
  return useMutation({
    mutationKey: ["passwordLogin"],
    mutationFn: async ({
      password,
      passwordSalt,
      passwordHash,
      encryptedData,
      authenticationTag,
      iv,
      email,
    }: {
      password: string;
      passwordSalt: string;
      passwordHash: string;
      encryptedData: any;
      authenticationTag: any;
      iv: string;
      email: string;
    }) => {
      const derivedPasswordHash = await hashPassword(password, passwordSalt);
      if (derivedPasswordHash !== passwordHash) {
        toast.error("Incorrect password");
        return Promise.reject();
      }

      const decryptedBackupData = decryptBackupString(
        encryptedData,
        authenticationTag,
        iv,
        email,
        password
      );

      return Promise.resolve(decryptedBackupData);
    },
  });
};

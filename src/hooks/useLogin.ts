import { hashPassword } from "@/lib/client/utils";
import { decryptBackupString } from "@/lib/shared/backup";
import { useMutation } from "@tanstack/react-query";

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
        return Promise.reject(data);
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
        return Promise.reject(data);
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
        return Promise.reject({ error: "Incorrect password" });
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

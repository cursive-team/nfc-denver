import { number, object, string } from "yup";
import { getAuthToken } from "./localStorage";
import { getClaveBuidlBalance } from "../shared/clave";

export type ClaveInfo = {
  buidlBalance: number;
  claveWalletAddress?: string;
  claveInviteLink: string;
};

export const claveInfoSchema = object({
  buidlBalance: number().required(),
  claveWalletAddress: string().optional().default(undefined),
  claveInviteLink: string().required(),
});

export const getUserClaveInfo = async (): Promise<ClaveInfo> => {
  const authToken = getAuthToken();
  if (!authToken || authToken.expiresAt < new Date()) {
    throw new Error("No auth token found");
  }

  const response = await fetch(
    `/api/user/get_balance?token=${authToken.value}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching user balance`);
  }

  const data = await response.json();
  try {
    const serverClaveInfo = claveInfoSchema.validateSync(data);

    let claveBuidlBalance = 0;
    if (serverClaveInfo.claveWalletAddress) {
      try {
        claveBuidlBalance = await getClaveBuidlBalance(
          serverClaveInfo.claveWalletAddress
        );
      } catch (error) {
        claveBuidlBalance = 0;
      }
    }

    return {
      buidlBalance: serverClaveInfo.buidlBalance + claveBuidlBalance,
      claveWalletAddress: serverClaveInfo.claveWalletAddress,
      claveInviteLink: serverClaveInfo.claveInviteLink,
    };
  } catch (error) {
    throw new Error(`Error validating user balance response from server`);
  }
};

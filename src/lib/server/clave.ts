import jwt from "jsonwebtoken";
import dayjs from "dayjs";

export const getUserBuidlBalance = async (userId: string) => {
  return 0;
};

export const getClaveInviteLink = async (
  userEmail: string,
  userClaveInviteCode: string
) => {
  const jwt = signJwt(userEmail);

  return `https://getclave.io/link/summon?signature=${jwt}&waitlist=${userClaveInviteCode}`;
};

export function signJwt(email: string) {
  const now = dayjs();
  return jwt.sign(
    { iat: now.unix(), exp: now.add(1, "day").unix(), ethDenver: { email } },
    process.env.CLAVE_JWT_SECRET!,
    { algorithm: "HS256" }
  );
}

export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.CLAVE_JWT_SECRET!);
}

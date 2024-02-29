import jwt from "jsonwebtoken";
import dayjs from "dayjs";

export function signJwt(email: string) {
  const now = dayjs();
  return jwt.sign(
    { iat: now.unix(), exp: now.add(1, "day").unix(), ethDenver: { email } },
    process.env.SHARED_JWT_SECRET_WITH_CLAVE!,
    { algorithm: "HS256" }
  );
}

export function verifyJwt(token: string) {
  return jwt.verify(token, process.env.SHARED_JWT_SECRET_WITH_CLAVE!);
}

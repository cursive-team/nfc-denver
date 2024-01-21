export const generateSalt = (): string => {
  return window.crypto.getRandomValues(new Uint8Array(16)).toString();
};

export const hashPassword = async (
  password: string,
  salt: string
): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

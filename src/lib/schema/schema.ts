import { object, string, date, InferType, boolean } from "yup";

export const LoginSchema = object({
  email: string()
    .email("Invalid email address.")
    .required("This field is required."),
  password: string().required("This field is required."),
  code: string()
    .min(6, "Code must be 6 characters.")
    .max(6, "Code must be 6 characters.")
    .required("This field is required."),
  iv: string().default(""),
  passwordSalt: string().default(""),
  passwordHash: string().default(""),
  authToken: object({
    value: string(),
    expiresAt: date(),
  }).optional(),
  encryptedData: string().default(""),
  authenticationTag: string().default(""),
});

export const RegisterLocationSchema = object({
  cmac: string().min(1, "This field is required.").optional(),
  name: string()
    .max(64, "Location name must be less than 64 characters.")
    .required(),
  description: string()
    .max(256, "Description must be less than 256 characters.")
    .required(),
  sponsor: string()
    .max(32, "Sponsor must be less than 32 characters.")
    .required(),
  imageUrl: string().optional(),
  emailWallet: boolean().required(),
});

export type RegisterLocationType = InferType<typeof RegisterLocationSchema>;
export type LoginType = InferType<typeof LoginSchema>;

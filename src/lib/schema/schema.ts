import z from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "This field is required."),
  code: z
    .string()
    .min(6, "Code must be 6 characters.")
    .max(6, "Code must be 6 characters."),
  iv: z.string(),
  passwordSalt: z.string(),
  passwordHash: z.string(),
  authToken: z
    .object({
      value: z.string(),
      expiresAt: z.date(),
    })
    .optional(),
  encryptedData: z.string(),
  authenticationTag: z.string(),
});

export const RegisterLocationSchema = z.object({
  cmac: z.string().min(1, "This field is required.").optional(),
  name: z
    .string()
    .min(1, "This field is required.")
    .max(64, "Location name must be less than 64 characters."),
  description: z
    .string()
    .min(1, "This field is required.")
    .max(256, "Description must be less than 256 characters."),
  sponsor: z
    .string()
    .min(1, "This field is required.")
    .max(32, "Sponsor must be less than 32 characters."),
  imageUrl: z.string().optional(),
});

export type RegisterLocationType = z.infer<typeof RegisterLocationSchema>;
export type LoginType = z.infer<typeof LoginSchema>;

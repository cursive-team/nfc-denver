import prisma from "@/lib/server/prisma";
import { verifyAuthToken } from "@/lib/server/auth";
import { object } from "yup";

export type UserAdminInfo = {
  isAdmin: boolean;
  isSuperAdmin: boolean;
};

export const userAdminInfoSchema = object({
  isAdmin: object().required(),
  isSuperAdmin: object().required(),
});

export const getUserAdminInfo = async (
  token: string
): Promise<UserAdminInfo> => {
  const userId = await verifyAuthToken(token);
  if (!userId) {
    throw new Error("Invalid or expired token");
  }

  const admin = await prisma.admin.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!admin) {
    return { isAdmin: false, isSuperAdmin: false };
  }

  return { isAdmin: true, isSuperAdmin: admin.isSuperAdmin };
};

// Determine if a user is an admin
// Will return false if user is not found
export const isUserAdmin = async (token: string): Promise<boolean> => {
  try {
    const adminInfo = await getUserAdminInfo(token);
    return adminInfo.isAdmin;
  } catch (e) {
    return false;
  }
};

// Determine if a user is a superadmin
// Will return false if user is not found
export const isUserSuperAdmin = async (token: string): Promise<boolean> => {
  try {
    const adminInfo = await getUserAdminInfo(token);
    return adminInfo.isSuperAdmin;
  } catch (e) {
    return false;
  }
};

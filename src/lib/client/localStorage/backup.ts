import { object } from "yup";
import { Profile, getProfile, profileSchema, saveProfile } from "./profile";
import { Keys, getKeys, keysSchema, saveKeys } from "./keys";

export const backupSchema = object({
  profile: profileSchema.required(),
  keys: keysSchema.required(),
});

export const loadBackup = (
  backup: string
): { profile: Profile; keys: Keys } => {
  const { profile, keys } = JSON.parse(backup);

  let validatedProfile: Profile;
  try {
    console.log(profile);
    profile.allowsAnalytics = false;
    validatedProfile = profileSchema.validateSync(profile);
  } catch (e) {
    console.error(e);
    throw new Error("Invalid profile.");
  }

  let validateKeys: Keys;
  try {
    validateKeys = keysSchema.validateSync(keys);
  } catch (e) {
    throw new Error("Invalid keys.");
  }

  saveProfile(profile);
  saveKeys(keys);

  return {
    profile: validatedProfile,
    keys: validateKeys,
  };
};

export const createBackup = (): string | undefined => {
  const profile = getProfile();
  const keys = getKeys();

  // We only want to return a backup if both the profile and keys are present
  if (profile && keys) {
    return JSON.stringify({
      profile,
      keys,
    });
  }

  return undefined;
};

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Profile,
  getAuthToken,
  getKeys,
  getProfile,
} from "@/util/localStorage";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const profileData = getProfile();
    const keyData = getKeys();
    const authToken = getAuthToken();
    if (
      !profileData ||
      !keyData ||
      !authToken ||
      authToken.expiresAt < new Date()
    ) {
      router.push("/login");
    } else {
      setProfile(profileData);
    }
  }, [router]);

  if (!profile) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="mb-4">
          <div className="text-gray-700 dark:text-gray-300">Display Name:</div>
          <div className="text-lg text-gray-900 dark:text-white">
            {profile.displayName}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-gray-700 dark:text-gray-300">Email:</div>
          <div className="text-lg text-gray-900 dark:text-white">
            {profile.email}
          </div>
        </div>
        {profile.twitterUsername && (
          <div className="mb-4">
            <div className="text-gray-700 dark:text-gray-300">Twitter:</div>
            <div className="text-lg text-gray-900 dark:text-white">
              @{profile.twitterUsername}
            </div>
          </div>
        )}
        {profile.telegramUsername && (
          <div className="mb-4">
            <div className="text-gray-700 dark:text-gray-300">Telegram:</div>
            <div className="text-lg text-gray-900 dark:text-white">
              {profile.telegramUsername}
            </div>
          </div>
        )}
        <div className="mb-4">
          <div className="text-gray-700 dark:text-gray-300">
            Custody Preference:
          </div>
          <div className="text-lg text-gray-900 dark:text-white">
            {profile.wantsServerCustody ? "Server Custody" : "Self Custody"}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchUserByUUID, User } from "@/lib/client/localStorage";

const UserProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<User>();

  useEffect(() => {
    if (typeof id === "string") {
      const fetchedUser = fetchUserByUUID(id);
      setUser(fetchedUser);
    }
  }, [id]);

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            User Profile
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Personal details and application.
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2">
                {user.displayName}
              </dd>
            </div>
            <div className="bg-white dark:bg-gray-800 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Encryption Public Key
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2">
                {user.encryptionPublicKey}
              </dd>
            </div>
            {user.twitterUsername && (
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Twitter
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2">
                  @{user.twitterUsername}
                </dd>
              </div>
            )}
            {user.telegramUsername && (
              <div className="bg-white dark:bg-gray-800 px-4 py-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Telegram
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:col-span-2">
                  @{user.telegramUsername}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Profile,
  getAuthToken,
  getKeys,
  getMessages,
  getProfile,
  writeMessages,
} from "@/util/localStorage";
import { EncryptedMessage, Message, decryptMessage } from "@/lib/jubSignal";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const profileData = getProfile();
    const keyData = getKeys();
    const authToken = getAuthToken();
    const messages = getMessages();
    if (
      !profileData ||
      !keyData ||
      !authToken ||
      authToken.expiresAt < new Date()
    ) {
      router.push("/login");
    } else {
      setProfile(profileData);
      setMessages(messages);
    }
  }, [router]);

  // If user is logged in, fetch new messages
  useEffect(() => {
    const fetchMessages = async () => {
      const authToken = getAuthToken();
      if (!authToken || authToken.expiresAt < new Date()) {
        return;
      }

      const keyData = getKeys();
      if (!keyData) {
        return;
      }

      // Get all messages in past 24 hours
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);

      const response = await fetch(
        `/api/messages?token=${encodeURIComponent(
          authToken.value
        )}&startDate=${startDate.toISOString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const messages = await response.json();

        // TODO: Validate format of messages received
        const decryptedMessages = await Promise.all(
          messages.map((message: EncryptedMessage) =>
            decryptMessage(message, keyData.encryptionPrivateKey)
          )
        );

        writeMessages(decryptedMessages);
      } else {
        console.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, []);

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
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <ul className="space-y-4">
            {messages.map((message, index) => (
              <li
                key={index}
                className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4"
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  From: {message.fromDisplayName}
                </div>
                <div className="text-gray-600 dark:text-gray-300 break-words">
                  Message: {JSON.stringify(message.data)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

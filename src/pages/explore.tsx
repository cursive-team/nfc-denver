import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { decryptString, encryptString } from "@/lib/backup";

export default function Explore() {
  const router = useRouter();
  const [cardId, setCardId] = useState<string>("");

  const onTap = (event: FormEvent) => {
    event.preventDefault();

    // TEMPORARY: For testing purposes, we'll just use the card ID as the CMAC
    const cmac = cardId;
    router.push(`/tap?cmac=${cmac}`);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCardId(event.target.value);
  };

  return (
    <form
      onSubmit={onTap}
      className="bg-gray-800 text-white p-4 rounded-md dark:bg-gray-700"
    >
      <label className="block mb-2">
        Card ID:
        <input
          type="text"
          name="cardId"
          value={cardId}
          onChange={handleInputChange}
          className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700 dark:placeholder-gray-500 dark:border-gray-500"
        />
      </label>
      <input
        type="submit"
        value="Tap"
        className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
      />
    </form>
  );
}

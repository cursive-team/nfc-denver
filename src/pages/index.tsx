import { useState, FormEvent, ChangeEvent } from "react";
import {
  LocationTapResponse,
  PersonTapResponse,
  TapResponseCode,
  tapResponseSchema,
} from "./api/tap";

export default function Home() {
  const [cardId, setCardId] = useState<string>("");

  const handlePersonRegistration = (cmac: string) => {
    window.location.href = `/register?cmac=${cmac}`;
  };

  const handleLocationRegistration = (cmac: string) => {
    window.location.href = `/register_location?cmac=${cmac}`;
  };

  const handlePersonTap = async (person: PersonTapResponse) => {};

  const handleLocationTap = async (location: LocationTapResponse) => {};

  const onTap = (event: FormEvent) => {
    event.preventDefault();

    // TEMPORARY: For testing purposes, we'll just use the card ID as the CMAC
    const cmac = cardId;

    fetch(`/api/tap?cmac=${cmac}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(async (data) => {
        const tapResponse = tapResponseSchema.validateSync(data);
        switch (tapResponse.code) {
          case TapResponseCode.CMAC_INVALID:
            throw new Error("CMAC invalid!");
          case TapResponseCode.PERSON_NOT_REGISTERED:
            handlePersonRegistration(cmac);
            break;
          case TapResponseCode.LOCATION_NOT_REGISTERED:
            handleLocationRegistration(cmac);
            break;
          case TapResponseCode.VALID_PERSON:
            if (!tapResponse.person) {
              throw new Error("Person is null!");
            }
            await handlePersonTap(tapResponse.person);
            break;
          case TapResponseCode.VALID_LOCATION:
            if (!tapResponse.location) {
              throw new Error("Location is null!");
            }
            await handleLocationTap(tapResponse.location);
            break;
          default:
            throw new Error("Invalid tap response code!");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Error! Please refresh and try again.");
      });
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

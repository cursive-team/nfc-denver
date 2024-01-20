import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [cmac, setCmac] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    if (router.query.cmac) {
      setCmac(router.query.cmac as string);
    }
  }, [router.query.cmac]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        // Handle response data here
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    // TODO: Handle form submission
  };

  return (
    <div>
      <h1>Register</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 text-white p-4 rounded-md"
      >
        <label className="block mb-2">
          Email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
          />
        </label>
        <input
          type="submit"
          value="Register"
          className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        />
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { verifyCodeResponseSchema } from "./api/register/verify_code";

enum DisplayState {
  INPUT_EMAIL,
  INPUT_CODE,
  INPUT_SOCIAL,
  CHOOSE_CUSTODY,
  INPUT_PASSWORD,
  CREATING_ACCOUNT,
}

export default function Register() {
  const router = useRouter();
  const [cmac, setCmac] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.INPUT_EMAIL
  );

  useEffect(() => {
    if (router.query.cmac) {
      setCmac(router.query.cmac as string);
    }
  }, [router.query.cmac]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value);
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch("/api/register/get_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (response.ok) {
          setDisplayState(DisplayState.INPUT_CODE);
        } else {
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  };

  const handleCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetch("/api/register/verify_code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        const verifyCodeResponse = verifyCodeResponseSchema.validateSync(data);
        if (verifyCodeResponse.success) {
          setDisplayState(DisplayState.INPUT_SOCIAL);
        } else {
          const errorReason = verifyCodeResponse.reason;
          if (errorReason) {
            throw new Error(errorReason);
          }
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(error.message);
      });
  };

  // TODO: Implement form and state management for INPUT_SOCIAL, CHOOSE_CUSTODY, INPUT_PASSWORD, and CREATING_ACCOUNT states

  return (
    <div>
      <h1>Register</h1>
      {displayState === DisplayState.INPUT_EMAIL && (
        <form
          onSubmit={handleEmailSubmit}
          className="bg-gray-800 text-white p-4 rounded-md"
        >
          <label className="block mb-2">
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
            />
          </label>
          <input
            type="submit"
            value="Register"
            className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
        </form>
      )}
      {displayState === DisplayState.INPUT_CODE && (
        <form
          onSubmit={handleCodeSubmit}
          className="bg-gray-800 text-white p-4 rounded-md"
        >
          <label className="block mb-2">
            Enter the code sent to your email:
            <input
              type="text"
              name="code"
              value={code}
              onChange={handleCodeChange}
              className="w-full px-3 py-2 text-gray-500 placeholder-gray-300 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-100 focus:border-indigo-300 dark:bg-gray-700"
            />
          </label>
          <input
            type="submit"
            value="Verify Code"
            className="w-full px-3 py-2 text-white bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          />
        </form>
      )}
      {/* TODO: Add additional form components for other display states */}
    </div>
  );
}

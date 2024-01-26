import React, { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  Keys,
  Profile,
  getAuthToken,
  getKeys,
  getProfile,
} from "@/lib/client/localStorage";
import { encryptMessage } from "@/lib/client/jubSignal";

const BenchmarkPage = () => {
  const [token, setToken] = useState<string>();
  const [profile, setProfile] = useState<Profile>();
  const [keys, setKeys] = useState<Keys>();
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkStartTime, setBenchmarkStartTime] = useState<Date>();

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      return;
    }
    setToken(authToken.value);
    setProfile(getProfile());
    setKeys(getKeys());
  }, []);

  const runBenchmark = async () => {
    const NUM_BENCHMARK_MESSAGES = 10000;
    const BENCHMARK_MESSAGE_LENGTH = 1;

    if (!token || !profile || !keys) {
      alert("You must be logged in to run benchmarks.");
      return;
    }

    setIsBenchmarking(true);
    const startTime = new Date();
    setBenchmarkStartTime(startTime);
    try {
      const messages = Array(NUM_BENCHMARK_MESSAGES).fill(
        "a".repeat(BENCHMARK_MESSAGE_LENGTH)
      );
      const encryptedMessages = await Promise.all(
        messages.map((message) =>
          encryptMessage(
            "TEST",
            {
              exampleMessage: message,
            },
            keys.encryptionPrivateKey,
            profile.encryptionPublicKey
          )
        )
      );

      const response = await fetch("/api/benchmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: encryptedMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to send benchmark data to the server.");
      }

      const { numMessagesReceived } = await response.json();

      if (numMessagesReceived) {
        const benchmarkEndTime = new Date();
        const benchmarkDurationMs =
          benchmarkEndTime.getTime() - startTime.getTime();

        alert(
          `Successfully encrypted and sent ${numMessagesReceived} messages of length ${BENCHMARK_MESSAGE_LENGTH} in ${benchmarkDurationMs}ms`
        );
      } else {
        throw new Error("Failed to receive benchmark data from the server.");
      }
    } catch (error) {
      console.error("Benchmark failed: ", error);
      alert("Benchmark failed. See console for details.");
    } finally {
      setIsBenchmarking(false);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-800">
      <Button
        onClick={runBenchmark}
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
        disabled={isBenchmarking}
      >
        {isBenchmarking ? "Benchmarking..." : "Run Benchmark"}
      </Button>
    </div>
  );
};

export default BenchmarkPage;

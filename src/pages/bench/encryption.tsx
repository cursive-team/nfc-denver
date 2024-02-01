import React, { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import {
  Keys,
  Profile,
  getAuthToken,
  getKeys,
  getProfile,
} from "@/lib/client/localStorage";
import { decryptMessage, encryptMessage } from "@/lib/client/jubSignal";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";
import { Input } from "@/components/Input";
import { generateEncryptionKeyPair } from "@/lib/client/encryption";
import { BenchmarkMessage } from "@prisma/client";
import toast from "react-hot-toast";

enum DisplayState {
  ENCRYPTION,
  RESULTS,
}

const EncryptionBenchmarkPage = () => {
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.ENCRYPTION
  );
  const [numMessages, setNumMessages] = useState<number>(0);
  const [messageLength, setMessageLength] = useState<number>(0);
  const [numBatches, setNumBatches] = useState<number>(0);
  const [token, setToken] = useState<string>();
  const [profile, setProfile] = useState<Profile>();
  const [keys, setKeys] = useState<Keys>();
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [keyGenerationTime, setKeyGenerationTime] = useState<number>();
  const [encryptionTime, setEncryptionTime] = useState<number>();
  const [encryptionRequestTime, setEncryptionRequestTime] = useState<number>();
  const [decryptionRequestTime, setDecryptionRequestTime] = useState<number>();
  const [decryptionTime, setDecryptionTime] = useState<number>();
  const [totalTime, setTotalTime] = useState<number>();

  useEffect(() => {
    const authToken = getAuthToken();
    if (!authToken || authToken.expiresAt < new Date()) {
      return;
    }
    setToken(authToken.value);
    setProfile(getProfile());
    setKeys(getKeys());
  }, []);

  const handleBeginBenchmark = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token || !profile || !keys) {
      toast.error("You must be logged in to run benchmarks.");
      return;
    }

    if (numMessages === 0 || messageLength === 0 || numBatches === 0) {
      toast.error("You must fill in all fields.");
      return;
    }

    setIsBenchmarking(true);
    const startTotalTime = new Date();

    // ----- KEY GENERATION -----
    const startKeyGenerationTime = new Date();
    const encryptionPublicKeys: string[] = [];
    const encryptionPrivateKeys: string[] = [];
    for (let i = 0; i < numMessages; i++) {
      const { publicKey, privateKey } = await generateEncryptionKeyPair();
      encryptionPublicKeys.push(publicKey);
      encryptionPrivateKeys.push(privateKey);
    }
    const keyGenerationTime =
      new Date().getTime() - startKeyGenerationTime.getTime();
    setKeyGenerationTime(keyGenerationTime);
    console.log("Key generation time: ", keyGenerationTime);

    // ----- ENCRYPTION -----
    const startEncryptionTime = new Date();
    // const messages = new Array(NUM_BENCHMARK_MESSAGES).fill("a".repeat(BENCHMARK_MESSAGE_LENGTH));
    // Use a different message for each message to ensure there is no caching going on
    const messages = Array.from(
      { length: numMessages },
      (_, index) => `${index}: ${"a".repeat(messageLength)}`
    );
    const encryptedMessages = await Promise.all(
      messages.map((message, index) =>
        encryptMessage(
          "TEST", // Category of JubSignal message - can be ignored
          {
            exampleMessage: message,
          },
          encryptionPrivateKeys[index],
          profile.encryptionPublicKey
        )
      )
    );
    // console.log(encryptedMessages);
    const encryptionTime = new Date().getTime() - startEncryptionTime.getTime();
    setEncryptionTime(encryptionTime);
    console.log("Encryption time: ", encryptionTime);

    // ----- ENCRYPTION REQUEST -----
    const startEncryptionRequestTime = new Date();
    try {
      let totalNumMessages = 0;
      const batchSize = Math.floor(encryptedMessages.length / numBatches);
      for (let i = 0; i < encryptedMessages.length; i += batchSize) {
        // Record index of each message to map decryption keys
        const batch: Record<number, string> = {};
        encryptedMessages.slice(i, i + batchSize).forEach((message, index) => {
          batch[i + index] = message;
        });
        const response = await fetch("/api/benchmark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, messages: batch }),
        });

        if (!response.ok) {
          const { error } = await response.json();
          console.error("Error sending encrypted data to server: ", error);
          throw new Error("Failed to send benchmark data to the server.");
        }

        const { numMessagesReceived } = await response.json();
        // console.log(
        //   `Processed messages ${i}-${
        //     i + batchSize
        //   }, size ${numMessagesReceived}`
        // );
        totalNumMessages += numMessagesReceived;
      }

      const encryptionRequestTime =
        new Date().getTime() - startEncryptionRequestTime.getTime();
      setEncryptionRequestTime(encryptionRequestTime);
      console.log("Encryption request time: ", encryptionRequestTime);
    } catch (error) {
      console.error("Benchmark failed during encryption request: ", error);
      toast.error(
        "Failed to send encrypted messages to server. See console for details."
      );
      setIsBenchmarking(false);
      return;
    }

    // ----- DECRYPTION REQUEST -----
    let encryptedMessagesFromServer: BenchmarkMessage[] = [];
    const startDecryptionRequestTime = new Date();
    try {
      const response = await fetch(
        `/api/benchmark?token=${token}&queryTime=${startTotalTime}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const { error } = await response.json();
        console.error("Error receiving encrypted data from server: ", error);
        throw new Error("Failed to fetch benchmark data from the server.");
      }

      const { benchmarkMessages } = await response.json();
      encryptedMessagesFromServer = benchmarkMessages;
      const decryptionRequestTime =
        new Date().getTime() - startDecryptionRequestTime.getTime();
      setDecryptionRequestTime(decryptionRequestTime);
      console.log("Decryption request time: ", decryptionRequestTime);
    } catch (error) {
      console.error("Benchmark failed during decryption request: ", error);
      toast.error(
        "Benchmark failed during decryption request. See console for details."
      );
      setIsBenchmarking(false);
      return;
    }

    // ----- DECRYPTION -----
    const decryptionStartTime = new Date();
    const decryptedMessages = await Promise.all(
      encryptedMessagesFromServer.map((encryptedMessage: BenchmarkMessage) =>
        decryptMessage(
          {
            metadata: {
              toPublicKey: profile.encryptionPublicKey,
              fromPublicKey: encryptionPublicKeys[encryptedMessage.benchmarkId],
              fromDisplayName: "TEST",
              timestamp: new Date(),
            },
            encryptedContents: encryptedMessage.encryptedData,
          },
          keys.encryptionPrivateKey
        )
      )
    );
    if (decryptedMessages.length !== numMessages) {
      console.error(
        "Decrypted messages length does not match numMessages: ",
        decryptedMessages.length,
        numMessages
      );
      toast.error(
        "Decrypted messages length does not match numMessages. See console for details."
      );
    }
    // console.log(decryptedMessages);
    const decryptionTime = new Date().getTime() - decryptionStartTime.getTime();
    setDecryptionTime(decryptionTime);
    console.log("Decryption time: ", decryptionTime);

    const totalTime = new Date().getTime() - startTotalTime.getTime();
    setTotalTime(totalTime);
    console.log("Total time: ", totalTime);
    setIsBenchmarking(false);
    setDisplayState(DisplayState.RESULTS);
  };

  const handleResetBenchmark = () => {
    setDisplayState(DisplayState.ENCRYPTION);
    setIsBenchmarking(false);
    setKeyGenerationTime(undefined);
    setEncryptionTime(undefined);
    setEncryptionRequestTime(undefined);
    setDecryptionRequestTime(undefined);
    setDecryptionTime(undefined);
    setTotalTime(undefined);
  };

  return (
    <>
      {displayState === DisplayState.ENCRYPTION && (
        <FormStepLayout
          title="Encryption benchmark"
          description="This benchmark will encrypted a bunch of messages and send them to the server. 
          The subsequent page will time decryption of these messages.
          Number of Messages = how many messages to encrypt. 
          Message Length = length of each message to encrypt. 
          Number of Batches = how many backend requests to separate encrypted messages into. Each batch must have total size <1 MB.
          "
          onSubmit={handleBeginBenchmark}
          actions={
            <div className="flex flex-col gap-4">
              <Button loading={isBenchmarking} type="submit">
                Confirm
              </Button>
              <Link href="/bench" className="link text-center mb-16">
                <Button>Back</Button>
              </Link>
            </div>
          }
        >
          <Input
            label="Number of Messages"
            placeholder="Number of messages to use in the benchmark"
            type="number"
            name="numMessages"
            value={numMessages}
            onChange={(event) => setNumMessages(parseInt(event.target.value))}
            required
          />
          <Input
            label="Message Length"
            placeholder="Length of messages to use in the benchmark"
            type="number"
            name="messageLength"
            value={messageLength}
            onChange={(event) => setMessageLength(parseInt(event.target.value))}
            required
          />
          <Input
            label="Number of Batches"
            placeholder="Number of API requests to batch messages into (each batch must be <1 MB)"
            type="number"
            name="numBatches"
            className="mb-20"
            value={numBatches}
            onChange={(event) => setNumBatches(parseInt(event.target.value))}
            required
          />
        </FormStepLayout>
      )}
      {displayState === DisplayState.RESULTS && (
        <div>
          <h1 className="text-2xl text-center font-semibold">
            Encryption Benchmark Results
          </h1>
          <div className="flex flex-col m-4 gap-1">
            <p className="text-center text-gray-500">{`Number of Messages: ${numMessages}`}</p>
            <p className="text-center text-gray-500">{`Message Length: ${messageLength}`}</p>
            <p className="text-center text-gray-500">{`Number of Batches: ${numBatches}`}</p>
            <p className="text-center text-gray-500">{`Key Generation Time: ${keyGenerationTime}ms`}</p>
            <p className="text-center text-gray-500">{`Encryption Time: ${encryptionTime}ms`}</p>
            <p className="text-center text-gray-500">{`Encryption Request Time: ${encryptionRequestTime}ms`}</p>
            <p className="text-center text-gray-500">{`Decryption Request Time: ${decryptionRequestTime}ms`}</p>
            <p className="text-center text-gray-500">{`Decryption Time: ${decryptionTime}ms`}</p>
            <p className="text-center text-gray-500">{`Total Time: ${totalTime}ms`}</p>
          </div>
          <div className="flex flex-col m-4 gap-4">
            <Button onClick={handleResetBenchmark}>
              Try Another Encryption
            </Button>
            <Link href="/bench" className="link text-center">
              <Button>Back to Benches</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default EncryptionBenchmarkPage;

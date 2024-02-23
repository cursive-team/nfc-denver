import React, { useState } from "react";
import { Button } from "@/components/Button";
import { FormStepLayout } from "@/layouts/FormStepLayout";
import Link from "next/link";
import { Input } from "@/components/Input";
import init, {
  state0_bindgen,
  state1_bindgen,
  state2_bindgen,
  state3_bindgen,
  state4_bindgen,
} from "@/lib/mp_psi";
import {
  generateCipherTextRelinKeyRound2,
  generatePSIKeys,
  generateRealDecryptionShares,
} from "@/lib/client/psi";

enum DisplayState {
  MPPSI,
  RESULTS,
}

const stateDescriptions = [
  "A generates encryption + r1 relinearization key",
  "B generates ciphertext + r2 relinearization key",
  "A computes PSI using FHE + partial decryption",
  "B computes PSI using FHE + full decryption",
  "A computes full decryption",
];

const MPPSIBenchmarkPage = () => {
  const [displayState, setDisplayState] = useState<DisplayState>(
    DisplayState.MPPSI
  );
  const [hammingWeight, setHammingWeight] = useState<number>(1000);
  const [bitVectorSize, setBitVectorSize] = useState<number>(6144);
  const [totalOverlap, setTotalOverlap] = useState<number>(0);
  const [mppsiTime, setMPPSITime] = useState<number>();
  const [stateTimes, setStateTimes] = useState<number[]>([]);
  const [psiMatch, setPsiMatch] = useState<boolean>(false);

  const randomBitVector = (
    hammingWeight: number,
    size: number
  ): Uint32Array => {
    let bitVector = new Uint32Array(size).fill(0);

    for (let i = 0; i < hammingWeight; i++) {
      let sampleIndex;
      do {
        sampleIndex = Math.floor(Math.random() * size);
      } while (bitVector[sampleIndex] === 1);

      bitVector[sampleIndex] = 1;
    }
    return bitVector;
  };

  const plainPsi = (bitVector0: Uint32Array, bitVector1: Uint32Array) => {
    if (bitVector0.length !== bitVector1.length) {
      throw new Error("Both bit vectors must be of the same length");
    }

    console.log(bitVector0, bitVector1);

    return bitVector0.map((element, index) => element * bitVector1[index]);
  };

  const testInternalFunctions = async () => {
    await init();

    const {
      fhePublicKeyShare: fhePublicKeyShareA,
      fhePrivateKeyShare: fhePrivateKeyShareA,
      relinKeyPublicRound1: relinKeyPublicRound1A,
      relinKeyPrivateRound1: relinKeyPrivateRound1A,
    } = await generatePSIKeys();
    const {
      fhePublicKeyShare: fhePublicKeyShareB,
      fhePrivateKeyShare: fhePrivateKeyShareB,
      relinKeyPublicRound1: relinKeyPublicRound1B,
      relinKeyPrivateRound1: relinKeyPrivateRound1B,
    } = await generatePSIKeys();

    const bitVectorA = randomBitVector(hammingWeight, bitVectorSize);
    const bitVectorB = randomBitVector(hammingWeight, bitVectorSize);

    const cipherTextRelinKeyRound2A = await generateCipherTextRelinKeyRound2(
      bitVectorA,
      fhePrivateKeyShareA,
      relinKeyPrivateRound1A,
      fhePublicKeyShareA,
      relinKeyPublicRound1A,
      fhePublicKeyShareB,
      relinKeyPublicRound1B
    );

    const cipherTextRelinKeyRound2B = await generateCipherTextRelinKeyRound2(
      bitVectorB,
      fhePrivateKeyShareB,
      relinKeyPrivateRound1B,
      fhePublicKeyShareB,
      relinKeyPublicRound1B,
      fhePublicKeyShareA,
      relinKeyPublicRound1A
    );

    const realDecryptionSharesA = await generateRealDecryptionShares(
      fhePrivateKeyShareA,
      cipherTextRelinKeyRound2A.cipherText,
      cipherTextRelinKeyRound2A.rlkAgg,
      cipherTextRelinKeyRound2A.relinKeyRound2,
      cipherTextRelinKeyRound2A.bogusDecryptionShares,
      cipherTextRelinKeyRound2B.cipherText,
      cipherTextRelinKeyRound2B.relinKeyRound2
    );

    const realDecryptionSharesB = await generateRealDecryptionShares(
      fhePrivateKeyShareB,
      cipherTextRelinKeyRound2B.cipherText,
      cipherTextRelinKeyRound2B.rlkAgg,
      cipherTextRelinKeyRound2B.relinKeyRound2,
      cipherTextRelinKeyRound2B.bogusDecryptionShares,
      cipherTextRelinKeyRound2A.cipherText,
      cipherTextRelinKeyRound2A.relinKeyRound2
    );

    const psi_output_a = state4_bindgen(
      cipherTextRelinKeyRound2A.cipherText,
      realDecryptionSharesB.realDecryptionShares
    );

    const psi_output_b = state4_bindgen(
      cipherTextRelinKeyRound2B.cipherText,
      realDecryptionSharesA.realDecryptionShares
    );

    const expected_psi_output = plainPsi(bitVectorA, bitVectorB);
    let overlap = 0;
    let overallPsiMatch = true;
    for (let i = 0; i < bitVectorSize; i++) {
      const sum = [
        psi_output_a[i],
        psi_output_b[i],
        expected_psi_output[i],
      ].reduce((a, b) => a + b, 0);
      if (sum !== 0 && sum !== 3) {
        overallPsiMatch = false;
        break;
      } else if (sum === 3) {
        overlap++;
      }
    }
    console.log(overallPsiMatch);
  };

  const handleBeginBenchmark = async (event: React.FormEvent) => {
    event.preventDefault();

    await init();

    const startMPPSITime = new Date();
    const stateTimesTemp = [];

    const size = bitVectorSize;
    const bit_vector_b = randomBitVector(hammingWeight, size);
    const bit_vector_a = randomBitVector(hammingWeight, size);

    const startState0Time = new Date();
    const state0 = state0_bindgen();
    const state0Time = new Date().getTime() - startState0Time.getTime();
    stateTimesTemp.push(state0Time);

    const startState1Time = new Date();
    const state1 = state1_bindgen(state0.message_a_to_b, bit_vector_b);
    const state1Time = new Date().getTime() - startState1Time.getTime();
    stateTimesTemp.push(state1Time);

    const startState2Time = new Date();
    const state2 = state2_bindgen(
      state0.private_output_a,
      state0.public_output_a,
      state1.message_b_to_a,
      bit_vector_a
    );
    const state2Time = new Date().getTime() - startState2Time.getTime();
    stateTimesTemp.push(state2Time);

    const startState3Time = new Date();
    const state3 = state3_bindgen(
      state1.private_output_b,
      state1.public_output_b,
      state2.message_a_to_b
    );
    const state3Time = new Date().getTime() - startState3Time.getTime();
    stateTimesTemp.push(state3Time);

    const startState4Time = new Date();
    const psi_output_a = state4_bindgen(
      state2.public_output_a,
      state3.message_b_to_a
    );
    const state4Time = new Date().getTime() - startState4Time.getTime();
    stateTimesTemp.push(state4Time);

    const psi_output_b = state3.psi_output;

    const mppsiTime = new Date().getTime() - startMPPSITime.getTime();
    setMPPSITime(mppsiTime);
    setStateTimes(stateTimesTemp);

    const expected_psi_output = plainPsi(bit_vector_a, bit_vector_b);
    let overlap = 0;
    let overallPsiMatch = true;
    for (let i = 0; i < size; i++) {
      const sum = [
        psi_output_a[i],
        psi_output_b[i],
        expected_psi_output[i],
      ].reduce((a, b) => a + b, 0);
      if (sum !== 0 && sum !== 3) {
        overallPsiMatch = false;
        break;
      } else if (sum === 3) {
        overlap++;
      }
    }
    setPsiMatch(overallPsiMatch);
    setTotalOverlap(overlap);
    setDisplayState(DisplayState.RESULTS);
  };

  return (
    <>
      {displayState === DisplayState.MPPSI && (
        <>
          <FormStepLayout
            title="Gaussian MP-PSI benchmark"
            onSubmit={handleBeginBenchmark}
            actions={
              <div className="flex flex-col gap-4">
                <Button type="submit">Confirm</Button>
                <Link href="/admin/bench">
                  <Button>Back</Button>
                </Link>
              </div>
            }
          >
            <Input
              label="Hamming weight"
              type="number"
              name="hammingWeight"
              value={hammingWeight}
              onChange={(event) =>
                setHammingWeight(parseInt(event.target.value))
              }
              required
            />
            <Input
              label="Bitvector size"
              type="number"
              name="bitVectorSize"
              value={bitVectorSize}
              onChange={(event) =>
                setBitVectorSize(parseInt(event.target.value))
              }
              required
            />
          </FormStepLayout>
          {/* <Button onClick={testInternalFunctions}>
            Test internal functions
          </Button> */}
        </>
      )}
      {displayState === DisplayState.RESULTS && (
        <FormStepLayout
          title="2P-PSI benchmark results"
          actions={
            <div className="flex flex-col gap-4">
              <Button onClick={() => setDisplayState(DisplayState.MPPSI)}>
                Try another benchmark
              </Button>
              <Link href="/admin/bench">
                <Button>Back to benches</Button>
              </Link>
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            <p>
              <u>{`Operation breakdown`}</u>
            </p>
            {stateTimes.map((time, index) => (
              <p key={index} style={{ fontSize: "0.75em" }}>
                {`${stateDescriptions[index]} in `} <b>{`${time}ms`}</b>
              </p>
            ))}

            <p>
              <u>Total Time</u>
              {`: ${mppsiTime}ms`}
            </p>
            <p>
              <u>PSI output is correct</u> {`: ${psiMatch ? "Yes" : "No"}`}
            </p>
            <p>
              <u>Total Overlap</u> {`: ${totalOverlap}`}
            </p>
          </div>
        </FormStepLayout>
      )}
    </>
  );
};

export default MPPSIBenchmarkPage;

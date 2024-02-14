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
} from "@/lib/mp_psi"; // Import your MP-PSI function

enum DisplayState {
  MPPSI,
  RESULTS,
}

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
        <FormStepLayout
          title="2P-PSI benchmark"
          onSubmit={handleBeginBenchmark}
          actions={
            <div className="flex flex-col gap-4">
              <Button type="submit">Confirm</Button>
              <Link href="/bench">
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
            onChange={(event) => setHammingWeight(parseInt(event.target.value))}
            required
          />
          <Input
            label="Bitvector size"
            type="number"
            name="bitVectorSize"
            value={bitVectorSize}
            onChange={(event) => setBitVectorSize(parseInt(event.target.value))}
            required
          />
        </FormStepLayout>
      )}
      {displayState === DisplayState.RESULTS && (
        <FormStepLayout
          title="2P-PSI benchmark results"
          actions={
            <div className="flex flex-col gap-4">
              <Button onClick={() => setDisplayState(DisplayState.MPPSI)}>
                Try another benchmark
              </Button>
              <Link href="/bench">
                <Button>Back to benches</Button>
              </Link>
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            <p>{`2P-PSI Time: ${mppsiTime}ms`}</p>
            {stateTimes.map((time, index) => (
              <p key={index}>{`State${index} Time: ${time}ms`}</p>
            ))}
            <p>{`PSI output is correct: ${psiMatch ? "Yes" : "No"}`}</p>
            <p>{`Total Overlap: ${totalOverlap}`}</p>
          </div>
        </FormStepLayout>
      )}
    </>
  );
};

export default MPPSIBenchmarkPage;

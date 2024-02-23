import init, {
  state0_bindgen,
  state1_bindgen,
  state2_bindgen,
  state3_bindgen,
  state4_bindgen,
} from "@/lib/mp_psi";
import { getLocationSignatures, getUsers } from "./localStorage";

export const generatePSIKeys = async () => {
  const state0 = state0_bindgen();

  return {
    fhePublicKeyShare: state0.message_a_to_b.share_pk_a,
    fhePrivateKeyShare: state0.private_output_a.s_pk_a,
    relinKeyPublicRound1: state0.message_a_to_b.share_rlk_a_round1,
    relinKeyPrivateRound1: state0.private_output_a.s_rlk_a,
  };
};

export const generateSelfBitVector = (): Uint32Array => {
  let bitVector = new Uint32Array(25000).fill(0);
  let users = getUsers();
  let locations = getLocationSignatures();

  // 0-19999 reserved for users
  for (let id in users) {
    let user = users[id];
    if (user.pkId) {
      let index = parseInt(user.pkId);
      if (index < bitVector.length) {
        bitVector[index] = 1;
      }
    }
  }

  // 20001-25000 reserved for locations
  for (let id in locations) {
    let location = locations[id];
    if (location.id) {
      let index = parseInt(location.id);
      if (index < bitVector.length) {
        bitVector[20000 + index] = 1;
      }
    }
  }

  return bitVector;
};

export const generateCipherTextRelinKeyRound2 = async (
  bit_vector: Uint32Array,
  selfFhePrivateKeyShare: any,
  selfRelinKeyPrivateRound1: any,
  selfFhePublicKeyShare: any,
  selfRelinKeyPublicRound1: any,
  otherFhePublicKeyShare: any,
  otherRelinKeyPublicRound1: any
): Promise<{
  cipherText: any;
  relinKeyRound2: any;
  rlkAgg: any;
  bogusDecryptionShares: any;
}> => {
  // bogus state 1 to get ciphertext to put into state 2
  const message_a_to_b = {
    share_pk_a: otherFhePublicKeyShare,
    share_rlk_a_round1: otherRelinKeyPublicRound1,
  };
  const state1 = state1_bindgen(message_a_to_b, bit_vector);
  const private_output_a_state0 = {
    s_pk_a: selfFhePrivateKeyShare,
    s_rlk_a: selfRelinKeyPrivateRound1,
  };

  const public_output_a_state0 = {
    share_pk_a: selfFhePublicKeyShare,
    share_rlk_a_round1: selfRelinKeyPublicRound1,
  };
  const message_b_to_a = {
    share_pk_b: otherFhePublicKeyShare,
    share_rlk_b_round1: otherRelinKeyPublicRound1,
    share_rlk_b_round2: state1.message_b_to_a.share_rlk_b_round2, // bogus
    ciphertexts_b: state1.message_b_to_a.ciphertexts_b, // bogus
  };
  const state2 = state2_bindgen(
    private_output_a_state0,
    public_output_a_state0,
    message_b_to_a,
    bit_vector
  );

  return {
    cipherText: state2.message_a_to_b.ciphertexts_a,
    relinKeyRound2: state2.message_a_to_b.share_rlk_a_round2,
    rlkAgg: state2.message_a_to_b.rlk_agg_round1_h1s,
    bogusDecryptionShares: state2.message_a_to_b.decryption_shares_a,
  };
};

export const generateRealDecryptionShares = async (
  selfFhePrivateKeyShare: any,
  selfCipherText: any,
  selfRlkAgg: any,
  selfRelinKeyRound2: any,
  selfBogusDecryptionShares: any,
  otherCipherText: any,
  otherRelinKeyRound2: any
) => {
  const private_output_b_state1 = {
    s_pk_b: selfFhePrivateKeyShare,
  };
  const public_output_b_state1 = {
    ciphertexts_b: selfCipherText,
    share_rlk_b_round2: selfRelinKeyRound2,
    rlk_agg_round1_h1s: selfRlkAgg,
  };
  const message_a_to_b = {
    decryption_shares_a: selfBogusDecryptionShares,
    ciphertexts_a: otherCipherText,
    share_rlk_a_round2: otherRelinKeyRound2,
  };
  const state3 = state3_bindgen(
    private_output_b_state1,
    public_output_b_state1,
    message_a_to_b
  );

  return {
    realDecryptionShares: state3.message_b_to_a.decryption_shares_b,
    cipherTextRes: state3.message_b_to_a.ciphertexts_res,
  };
};

export const getPSIOutput = async (
  selfCipherTextRes: any,
  selfDecryptionShares: any,
  otherDecryptionShares: any
) => {
  const state4 = state4_bindgen(
    {
      deecryption_shares_a: selfDecryptionShares,
      ciphertexts_res: selfCipherTextRes,
    },
    {
      decryption_shares_b: otherDecryptionShares,
    }
  );

  return state4;
};

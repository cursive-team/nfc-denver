import init, { state0_bindgen, state1_bindgen } from "@/lib/mp_psi";
import { getLocationSignatures, getUsers } from "./localStorage";

export const generatePSIKeys = async (): Promise<{
  fhePublicKeyShare: string;
  fhePrivateKeyShare: string;
  relinKeyPublicRound1: string;
  relinKeyPrivateRound1: string;
}> => {
  await init();
  const state0 = state0_bindgen();

  return {
    fhePublicKeyShare: JSON.stringify(state0.message_a_to_b.share_pk_a),
    fhePrivateKeyShare: JSON.stringify(state0.private_output_a.s_pk_a),
    relinKeyPublicRound1: JSON.stringify(
      state0.message_a_to_b.share_rlk_a_round1
    ),
    relinKeyPrivateRound1: JSON.stringify(state0.private_output_a.s_rlk_a),
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
  selfFhePrivateKeyShare: string,
  selfRelinKeyPrivateRound1: string,
  fhePublicKeyShare: string,
  relinKeyPublicRound1: string
): Promise<void> => {
  await init();

  const selfBitVector = generateSelfBitVector();
  const message_a_to_b = {
    share_pk_a: JSON.parse(fhePublicKeyShare),
    share_rlk_a_round1: JSON.parse(relinKeyPublicRound1),
  };
  const state1 = state1_bindgen(message_a_to_b, selfBitVector);
  const private_output_a = {
    s_pk_a: JSON.parse(selfFhePrivateKeyShare),
    s_rlk_a: JSON.parse(selfRelinKeyPrivateRound1),
  };
};

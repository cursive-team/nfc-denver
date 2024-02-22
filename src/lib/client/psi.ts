import init, {
  state0_bindgen,
  state1_bindgen,
  state2_bindgen,
  state3_bindgen,
  state4_bindgen,
} from "@/lib/mp_psi";

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

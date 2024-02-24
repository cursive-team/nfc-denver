import init, { gen_keys_js } from "@/lib/mp_psi";
import { getLocationSignatures, getUsers } from "./localStorage";

export const generatePSIKeys = async () => {
  await init();
  const gen_keys_output = gen_keys_js();

  return {
    psiPrivateKeys: gen_keys_output.psi_keys,
    psiPublicKeys: gen_keys_output.message_round1,
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

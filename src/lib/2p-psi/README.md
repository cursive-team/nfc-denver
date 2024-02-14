# MP-PSI

The package contains the APIs to build a multi party private set intersection (MP-PSI) web-app. Note that the APIs are compiled specifically for web browser environments and are not compatible with a node environment. This is built in collaboration with Gaussian, and is imported from their MP-PSI repo: https://github.com/gaussian-dev/MP-PSI/tree/main.

PSI stands for Private Set Intersection. It allows two parties to compute the intersection of their sets without revealing anything else about their sets.

[BFV](https://inferati.azureedge.net/docs/inferati-fhe-bfv.pdf) is a fully homomorphic encryption scheme. It allows to perform addition and multiplication on encrypted data. The PSI protocol made available in this library uses the BFV scheme to perform the encryption of the sets, compute the intersection and decrypt the result. In particular, the multiparty protocol is based on the paper [Mouchet, Christian, et al. "Multiparty homomorphic encryption from ring-learning-with-errors."](https://eprint.iacr.org/2020/304.pdf).

## Security Notice

This is a research project and is not meant to be used in production. The code has not been audited.

## Usage in web-app

```js
import init, {
  state0_bindgen,
  state1_bindgen,
  state2_bindgen,
  state3_bindgen,
  state4_bindgen,
} from "./mp_psi.js";

init().then(() => {
  const state0 = state0_bindgen();
  const bit_vector_b = [1, 0, 1, 0, 1, 0, 1, 0, 1, 1];
  const state1 = state1_bindgen(state0.message_a_to_b, bit_vector_b);
  const bit_vector_a = [1, 1, 1, 1, 1, 0, 1, 0, 0, 0];
  const state2 = state2_bindgen(
    state0.private_output_a,
    state0.public_output_a,
    state1.message_b_to_a,
    bit_vector_a
  );
  const state3 = state3_bindgen(
    state1.private_output_b,
    state1.public_output_b,
    state2.message_a_to_b
  );
  const psi_output_a = state4_bindgen(
    state2.public_output_a,
    state3.message_b_to_a
  );
  const psi_output_b = state3.psi_output;
});
```

The `mp_psi.js` can natively be included on a web page as an ES module. An example of the usage is include in the `index.html` file.

You can test it by:

- Cloning the repo
- Serving the `pkg` directory with a local web server, (e.g. `python3 -m http.server`)
- Visit `http://localhost:8000` in your browser
- Open the console. It will show you the result of the PSI protocol.

### `state0_bindgen()`

Called by party A. Generates the public key share of A starting from a newly generated secret key. Generates the round 1 relinearization key share of A starting from a newly generated ephermeral key.

Returns:

- `message_a_to_b`: message to be sent from A to B after round 0. Contains the public key share `share_pk_a` and the round 1 relinearization key share `share_rlk_a_round1`.
- `private_output_a`: private output of A after round 0. It has to be privately stored by A. Contains the secret key `s_pk_a` behind the public key share and the ephemeral key `s_rlk_a` behind the round 1 relinearization key share.
- `public_output_a`: public output of A after round 0. It has to be stored by A (not necessarily privately). Contains the public key share `share_pk_a` and the round 1 relinearization key share `share_rlk_a_round1`.

```js
const state0 = state0_bindgen();
const { message_a_to_b, private_output_a, public_output_a } = state0;
```

### `state1_bindgen(message_a_to_b, bit_vector_b)`

Called by party B after receiving `message_a_to_b` from A. Takes as input `message_a_to_b` and the plaintext bit vector of B. This is the bit vector that B wants to find the intersection with the bit vector of A. Generates the public key share of B starting from a newly generated secret key. Generates the round 1 relinearization key share of B starting from a newly generated ephermeral key. Aggregates the received round 1 relinearization key share of A, and their own round 1 relinearization key share to generate the round 2 relinearization key share of B. Aggregates the received public key share of A and their own generated public key share to generate the collective public key used for encryption. Encrypts the bit vector of B using the collective public key.

Returns:

- `message_b_to_a`: message to be sent from B to A after round 1. Contains the public key share `share_pk_b`, the round 1 relinearization key share `share_rlk_b_round1`, the round 2 relinearization key share `share_rlk_b_round2` and the encrypted bit vector `ciphertexts_b`.
- `private_output_b`: private output of B after round 1. It has to be privately stored by B. Contains the secret key `s_pk_b` behind the public key share.
- `public_output_b`: public output of B after round 1. It has to be stored by B (not necessarily privately). Contains the encrypted bit vector `ciphertexts_b`, the round 2 relinearization key share `share_rlk_b_round2` and the round 1 aggregate relinearization key share `rlk_agg_round1_h1s`.

```js
const state1 = state1_bindgen(state0.message_a_to_b, bit_vector_b);
const { message_b_to_a, private_output_b, public_output_b } = state1;
```

### `state2_bindgen(private_output_a_state0, public_output_a_state0, message_b_to_a, bit_vector_a)`

Called by party A after receiving `message_b_to_a` from B. Takes as input `private_output_a_state0` and `public_output_a_state0` stored by A from state 0, `message_b_to_a` from state 1 and the plaintext bit vector of A. This is the bit vector that A wants to find the intersection with the bit vector of B. Aggregates the received round 1 relinearization key share of B, and their own round 1 relinearization key share to generate the round 2 relinearization key share of A. Aggregates the received round 2 relinearization key share of B, and their own round 2 relinearization key share to generate the collective relinearization key. Aggregates the received public key share of B and their own generated public key share to generate the collective public key used for encryption. Encrypts the bit vector of A using the collective public key. Performs Private Set Intersection (PSI) on the encrypted bit vectors of A and B to get a new ciphertext. The collective relinearization key is used to reduce the size of the ciphertext. Perform partial decryption of the ciphertext (result of the PSI) using their own secret key.

Returns:

- `message_a_to_b`: message to be sent from A to B after round 2. Contains the partial decryption of the ciphertext (result of the PSI) `decryption_shares_a`, the encrypted bit vector `ciphertexts_a` and the round 2 relinearization key share `share_rlk_a_round2`.
- `public_output_a`: public output of A after round 2. It has to be stored by A (not necessarily privately). Contains the partial decryption of the ciphertext (result of the PSI) `decryption_shares_a` and the result of the PSI `ciphertexts_res`

```js
const state2 = state2_bindgen(
  state0.private_output_a,
  state0.public_output_a,
  state1.message_b_to_a,
  bit_vector_a
);
const { message_a_to_b, public_output_a } = state2;
```

### `state3_bindgen(private_output_b_state1, public_output_b_state1, message_a_to_b)`

Called by party B after receiving `message_a_to_b` from A. Takes as input `private_output_b_state1` and `public_output_b_state1` stored by B from state 1 and `message_a_to_b` from state 2. Aggregates the received round 2 relinearization key share of A, and their own round 2 relinearization key share to generate the collective relinearization key. Performs Private Set Intersection (PSI) on the encrypted bit vectors of A and B to get a new ciphertext. The collective relinearization key is used to reduce the size of the ciphertext. Performs partial decryption of the ciphertext (result of the PSI) using their own secret key. Aggregates the partial decryption share of A and their own partial decryption share to fully decrypt the ciphertext and obtain the intersection of the two vectors.

Returns:

- `message_b_to_a`: message to be sent from B to A after round 3. Contains the partial decryption of the ciphertext (result of the PSI) `decryption_shares_b`.
- `psi_output`: the intersection of the bit vectors of A and B.

```js
const state3 = state3_bindgen(
  state1.private_output_b,
  state1.public_output_b,
  state2.message_a_to_b
);
const { message_b_to_a, psi_output } = state3;
```

### `state4_bindgen(public_output_a_state2, message_b_to_a)`

Called by party A after receiving `message_b_to_a` from B. Takes as input `public_output_a_state2` stored by A from state 2 and `message_b_to_a` from state 3. Aggregates the partial decryption share of B and their own partial decryption share to fully decrypt the ciphertext and obtain the intersection of the two vectors.

Returns:

- `psi_output`: the intersection of the bit vectors of A and B.

```js
const state4 = state4_bindgen(state2.public_output_a, state3.message_b_to_a);
const psi_output = state4;
```

Note that the `psi_output` returned by `state3_bindgen` and `state4_bindgen` should be the same. It is the intersection of the bit vectors of A and B.

### Benchmarks in web-app

The benchmark relates to a PSI protocol are based on the following `bfv` parameters:

- `ciphertext_moduli`: `[1032193, 1073692673]`
- `extension_moduli` : `[995329, 1073668097]`
- `plaintext_modulus`: `40961`
- `ring_size`: `2048`

The bit vector size, which is the subject of the PSI protocol, is set to `ring_size * 3`

**Runtime**

The benchmarks are run on M2 Macbook Pro with 12 cores and 32GB of RAM. The browser used is Brave v1.61.116 Chromium:120.0.6099.217. The benchmark code is also part of `index.html`.

| Operation      | Time (ms) |
| -------------- | --------- |
| state0_bindgen | 13.86     |
| state1_bindgen | 33.25     |
| state2_bindgen | 53.91     |
| state3_bindgen | 38.12     |
| state4_bindgen | 11.44     |

**Communication Bandwidth**

The following benchmarks measure the size in terms of bytes of the output of each state. The benchmark code can be found inside `src/lib.rs` and reproduced by running `cargo test --release -- --nocapture`.

| State   | Output             | Size in Bytes |
| ------- | ------------------ | ------------- |
| State 0 | `private_output_a` | 1026          |
| State 0 | `public_output_a`  | 84495         |
| State 0 | `message_a_to_b`   | 84495         |
| State 1 | `private_output_b` | 513           |
| State 1 | `public_output_b`  | 323636        |
| State 1 | `message_b_to_a`   | 374333        |
| State 2 | `public_output_a`  | 384060        |
| State 2 | `message_a_to_b`   | 417858        |
| State 3 | `message_b_to_a`   | 128020        |
| State 3 | `psi_output_b`     | 2560          |
| State 4 | `psi_output_a`     | 2560          |

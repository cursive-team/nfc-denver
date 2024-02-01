import path from "path";
import { isNode, bytesToHex } from "babyjubjub-ecdsa";
const crypto = require("crypto");

// In our current configuration, this is the path to the circuits directory for client side proving
export const getClientPathToCircuits = (): string => {
  return __dirname + "circuits/";
};

// In our current configuration, this is the path to the circuits directory for server side proving
export const getServerPathToCircuits = (): string => {
  return path.resolve(process.cwd(), "public", "circuits") + "/";
};

// Generates randomness for nullifiers
// Uses Crypto Web API in browser and Node.js Crypto module in Node.js
export const getRandomNullifierRandomness = (): string => {
  const numBytes = 30; // Generate a number of bytes smaller than the size of a field element

  if (isNode()) {
    return crypto.randomBytes(numBytes).toString("hex");
  } else {
    return bytesToHex(self.crypto.getRandomValues(new Uint8Array(numBytes)));
  }
};

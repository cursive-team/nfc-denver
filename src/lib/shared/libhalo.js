/**
 * Example script to verify a dynamic URL based off the BJJ curve
 * Copyright by Arx Research, Inc., a Delaware corporation
 * License: MIT
 */

const { Buffer } = require("buffer");

const BJJ_ORDER =
  0x060c89ce5c263405370a08b6d0302b0bab3eedb83920ee0a677297dc392126f1n;

function parseSig(res, curveOrder) {
  if (res[0] !== 0x30 || res[2] !== 0x02) {
    throw new Error("Unable to parse signature, unexpected header (1).");
  }

  let rLen = res[3];

  if (res[rLen + 4] !== 0x02) {
    throw new Error("Unable to parse signature, unexpected header (2).");
  }

  let sLen = res[rLen + 5];

  if (res.length < rLen + 4 + 2 + sLen) {
    throw new Error("Unable to parse signature, unexpected length.");
  }

  let r = res.slice(4, rLen + 4);
  let s = res.slice(rLen + 4 + 2, rLen + 4 + 2 + sLen);
  let rn = BigInt("0x" + r.toString("hex"));
  let sn = BigInt("0x" + s.toString("hex"));

  rn %= curveOrder;
  sn %= curveOrder;

  if (sn > curveOrder / 2n) {
    // malleable signature, not compliant with Ethereum's EIP-2
    // we need to flip s value in the signature
    sn = -sn + curveOrder;
  }

  return {
    r: rn.toString(16).padStart(64, "0"),
    s: sn.toString(16).padStart(64, "0"),
  };
}

function sigToDer(sig) {
  let r = BigInt("0x" + sig.r);
  let s = BigInt("0x" + sig.s);

  let padR = r.toString(16).length % 2 ? "0" : "";
  let padS = s.toString(16).length % 2 ? "0" : "";

  let encR = Buffer.from(padR + r.toString(16), "hex");
  let encS = Buffer.from(padS + s.toString(16), "hex");

  if (encR[0] & 0x80) {
    // add zero to avoid interpreting this as negative integer
    encR = Buffer.concat([Buffer.from([0x00]), encR]);
  }

  if (encS[0] & 0x80) {
    // add zero to avoid interpreting this as negative integer
    encS = Buffer.concat([Buffer.from([0x00]), encS]);
  }

  encR = Buffer.concat([Buffer.from([0x02, encR.length]), encR]);
  encS = Buffer.concat([Buffer.from([0x02, encS.length]), encS]);

  return Buffer.concat([
    Buffer.from([0x30, encR.length + encS.length]),
    encR,
    encS,
  ]);
}

// input: string; DER-encoded signature from HaLo tag as hex string
// output: string; fixed DER-encoded signature as hex string
function fixBJJSig(sig) {
  let sigBuf = Buffer.from(sig, "hex");
  return sigToDer(parseSig(sigBuf, BJJ_ORDER)).toString("hex");
}

module.exports = {
  fixBJJSig,
};

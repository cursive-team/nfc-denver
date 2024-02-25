// @ts-ignore
import { execHaloCmdWeb } from "@arx-research/libhalo/api/web.js";
import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { getECDSAMessageHash } from "babyjubjub-ecdsa";

export type ArxRawSignature = {
  r: string;
  s: string;
  v: 27 | 28;
};

// Result of signing a message with an Arx card
export type ArxSignMessageResult = {
  digest: string;
  rawSig: ArxRawSignature;
  pubKey: string;
};

export type ForegroundTapModalProps = {
  message: string;
  onTap: (args: ArxSignMessageResult) => Promise<void>;
  onClose?: () => void;
};

export default function ForegroundTapModal({
  message,
  onTap,
  onClose,
}: ForegroundTapModalProps) {
  const [statusText, setStatusText] = useState("Waiting for NFC setup...");

  useEffect(() => {
    async function runScan() {
      const messageHash = getECDSAMessageHash(message);
      let command = {
        name: "sign",
        keyNo: 1,
        digest: messageHash,
      };

      let res;
      try {
        // --- request NFC command execution ---
        res = await execHaloCmdWeb(command, {
          statusCallback: (cause: any) => {
            if (cause === "init") {
              setStatusText(
                "Please tap the tag to the back of your smartphone and hold it..."
              );
            } else if (cause === "retry") {
              setStatusText(
                "Something went wrong, please try to tap the tag again..."
              );
            } else if (cause === "scanned") {
              setStatusText(
                "Tag scanned successfully, post-processing the result..."
              );
            } else {
              setStatusText(cause);
            }
          },
        });

        await onTap({
          digest: res.input.digest,
          rawSig: res.signature.raw,
          pubKey: res.publicKey,
        });
        setStatusText("Tapped card! Process result...");
      } catch (error) {
        console.error(error);
        setStatusText("Scanning failed, please try again.");
      }
    }

    runScan();
  }, [onTap, message]);

  return (
    <Modal isOpen={true} setIsOpen={() => {}} onClose={onClose}>
      <div className="flex flex-col w-full justify-center text-center gap-5">
        <span className="text-xl text-gray-12">
          Place the NFC card on your phone.
        </span>

        <span className="text-xs text-gray-10">{statusText}</span>
        <span className="text-center text-sm">
          {"If you still can't tap, check out the "}
          <a
            href="https://pse-team.notion.site/Card-tapping-instructions-ac5cae2f72e34155ba67d8a251b2857c?pvs=4"
            target="_blank"
            className="underline"
          >
            troubleshooting guide
          </a>
          .
        </span>
      </div>
    </Modal>
  );
}

import { useEffect } from "react";
import { Card } from "../cards/Card";
import { ArtworkSnapshotProps } from "./ArtworkSnapshot";
import { getProfile } from "@/lib/client/localStorage";
import { useScripts } from "@/hooks/useScripts";

type ArtworkProfileProps = Omit<ArtworkSnapshotProps, "slider">;

const ArtworkProfile = ({ height, width }: ArtworkProfileProps) => {
  const isLoaded = useScripts();
  const profile = getProfile();

  useEffect(() => {
    const pubKey = profile?.signaturePublicKey;
    if (!pubKey) return;
    if (!isLoaded) return;

    window.params = {
      fill: false,
      stroke: true,
      abstract: false,
      upToPubKey: 1,
    };

    window.signatures = [
      {
        pubKey,
        timestamp: new Date().getTime(),
      },
    ];

    const dataURL = window.stamp(pubKey, width, height).getImage();
    console.log("dataURL", dataURL);
  }, []);

  if (!profile) return null;
  return (
    <Card.Artwork
      style={{
        width: width ?? 200,
        height: height ?? 200,
      }}
    >
      <canvas
        className="artwork-webgl flex p-0 m-0 border border-white rounded-[8px]"
        id="artwork-webgl"
      ></canvas>
    </Card.Artwork>
  );
};

ArtworkProfile.displayName = "ArtworkProfile";

export { ArtworkProfile };

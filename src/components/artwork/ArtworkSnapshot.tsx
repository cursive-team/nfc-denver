import { useScripts } from "@/hooks/useScripts";
import {
  getLocationSignatures,
  getProfile,
  getUsers,
} from "@/lib/client/localStorage";
import { classed } from "@tw-classed/react";
import { ChangeEvent, useEffect, useState } from "react";
import { Card } from "../cards/Card";
import { Icons } from "../Icons";
import { cn } from "@/lib/client/utils";

const Label = classed.span("text-gray-10 text-xs font-light");
const Description = classed.span("text-center text-gray-12 text-sm font-light");

export interface ArtworkSnapshotProps
  extends React.HTMLAttributes<HTMLCanvasElement> {
  width?: number;
  height?: number;
  pubKey?: string;
  slider?: boolean;
  isVisible?: boolean;
}

type PubKeyArrayElement = {
  pubKey: string;
  timestamp: number;
  name: string;
  person: boolean;
};

type Direction = "left" | "right";
interface ArtworkSnapshotArrowProps
  extends React.HTMLAttributes<Omit<HTMLButtonElement, "onClick">> {
  onClick: () => void;
  direction: Direction;
  disabled?: boolean;
}

const ArtworkSnapshotArrow = ({
  onClick,
  direction,
  disabled,
  ...props
}: ArtworkSnapshotArrowProps) => {
  const onHandleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  return (
    <button onClick={onHandleClick} {...props}>
      <Icons.arrowRight
        className={cn("duration-200", {
          "rotate-180": direction === "left",
          "opacity-30": disabled,
        })}
        size={30}
      />
    </button>
  );
};

interface ProfileCardArtworkProps {
  size?: number;
  image?: string;
}

const ProfileCardArtwork = ({ size, image }: ProfileCardArtworkProps) => {
  return (
    <Card.Artwork
      className={cn({ "bg-skeleton": !image })}
      style={{
        backgroundImage: `url(${image})`,
        height: `${size}px`,
        width: `${size}px`,
      }}
    />
  );
};

const ArtworkSnapshot = ({
  width,
  height,
  pubKey,
  slider,
  isVisible = true,
  ...props
}: ArtworkSnapshotProps) => {
  const isLoaded = useScripts();
  const [rangeValue, setRangeValue] = useState<number>(1);
  const [signatures, setSignatures] = useState<PubKeyArrayElement[]>([]);
  const [dataURL, setDataURL] = useState<string>("");

  const HAS_PROFILE_PUB_KEY = !!pubKey;

  useEffect(() => {
    // define global variables for the artwork
    window.artworkWidth = width ?? 200;
    window.artworkHeight = height ?? 200;
  }, []);

  const renderRangeStep = (newIndex: number) => {
    setRangeValue(newIndex);
    window.params.upToPubKey = newIndex;
  };

  const onRangeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);

    setRangeValue(newValue); // Update state on change

    renderRangeStep(newValue);
  };

  useEffect(() => {
    const profile = getProfile();
    const combined: PubKeyArrayElement[] = [];
    if (!pubKey) {
      const users = getUsers();
      for (const userKey in users) {
        const user = users[userKey];
        if (profile && user.sigPk === profile?.signaturePublicKey) continue;
        const ts = user.inTs;
        const pk = user.sigPk;
        if (ts && pk) {
          combined.push({
            pubKey: pk,
            timestamp: new Date(ts).getTime(),
            name: user.name,
            person: true,
          });
        }
      }

      const locationSignatures = getLocationSignatures();
      for (const locationKey in locationSignatures) {
        const location = locationSignatures[locationKey];
        const ts = new Date(location.ts).getTime();
        const pk = location.pk;
        if (ts && pk) {
          combined.push({
            pubKey: pk,
            timestamp: ts,
            name: location.name,
            person: false,
          });
        }
      }

      combined.sort((a, b) => a.timestamp - b.timestamp);
      const signaturePublicKey = profile?.signaturePublicKey ?? "0";
      window.myPubKey = signaturePublicKey;
    } else {
      window.myPubKey = pubKey;
      combined.push({
        pubKey,
        timestamp: new Date().getTime(),
        name: "You",
        person: true,
      });
    }
    setSignatures(combined);
  }, [pubKey]);

  useEffect(() => {
    if (pubKey === "" || !isLoaded || signatures.length === 0) return;

    window.params = {
      fill: false,
      stroke: true,
      abstract: false,
      upToPubKey: rangeValue,
    };

    window.signatures = signatures.map((s) => ({
      pubKey: s.pubKey,
      timestamp: s.timestamp,
    }));

    if (HAS_PROFILE_PUB_KEY) {
      const dataURL = window.stamp(pubKey, width, height).getImage();
      setDataURL(dataURL);
    } else {
      window?.render(); // render the artwork
    }
  }, [
    height,
    isLoaded,
    width,
    pubKey,
    signatures,
    slider,
    rangeValue,
    HAS_PROFILE_PUB_KEY,
  ]);

  // no signatures, canvas is empty
  if (signatures?.length === 0) return;

  // if profile public key is available, use the dataURL
  if (HAS_PROFILE_PUB_KEY || pubKey === "") {
    return <ProfileCardArtwork size={width ?? 200} image={dataURL} />;
  }

  return (
    <>
      {isVisible && (
        <canvas
          className="artwork-webgl flex p-0 m-0 border border-white rounded-[8px]"
          id="artwork-webgl"
          {...props}
        ></canvas>
      )}
      {slider && (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-4 w-full mt-4">
            <div className="label p-0">
              <Label className="label-text">Start</Label>
              <Label className="label-text-alt">Present</Label>
            </div>
            <input
              type="range"
              min={1}
              max={signatures.length + 1}
              value={rangeValue} // Bind the value to state
              onChange={onRangeChange}
              className="w-full h-0.5 bg-gray-700 accent-gray-12 appearance-none"
            />
          </label>
          <div className="flex flex-col">
            {rangeValue === 1 ? (
              <div className="relative">
                <div className="absolute inset-0 flex flex-col gap-1 w-full">
                  <Description>Your personal stamp</Description>
                  <Label className="text-center ">
                    Navigate to see your stamp collection develop!
                  </Label>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 flex flex-col gap-1 w-full">
                  <Description>
                    {`Snapshot when ${
                      signatures[rangeValue - 2].person
                        ? `you met ${signatures[rangeValue - 2].name}`
                        : `you went to ${signatures[rangeValue - 2].name}`
                    }`}
                  </Description>
                  <Label className="text-center ">
                    {new Date(
                      signatures[rangeValue - 2].timestamp
                    ).toLocaleString()}
                  </Label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

ArtworkSnapshot.displayName = "ArtworkSnapshot";

export { ArtworkSnapshot };

import {
  getLocationSignatures,
  getProfile,
  getUsers,
} from "@/lib/client/localStorage";
import { classed } from "@tw-classed/react";
import { useEffect, useRef, useState } from "react";

const Label = classed.span("text-gray-10 text-xs font-light");
const Description = classed.span("text-center text-gray-12 text-sm font-light");

const scripts = ["/bundle.js"];

function loadScript(url: string) {
  return new Promise((resolve: any, reject: any) => {
    let script: any = document.createElement("script");
    script.type = "text/javascript";
    script.onload = function () {
      resolve();
    };
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
}

const useScripts = () => {
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all(scripts.map((script) => loadScript(script))).then(() =>
      setLoaded(true)
    );
  }, []);

  return isLoaded;
};

interface ArtworkCanvasProps extends React.HTMLAttributes<HTMLCanvasElement> {
  width?: number;
  height?: number;
  pubKey?: string;
  slider?: boolean;
}

type PubKeyArrayElement = {
  pubKey: string;
  timestamp: number;
  name: string;
  person: boolean;
};

const ArtworkCanvas = ({
  width,
  height,
  pubKey,
  slider,
  ...props
}: ArtworkCanvasProps) => {
  const isLoaded = useScripts();
  const firstRenderRef = useRef<boolean>(false);
  const [rangeValue, setRangeValue] = useState<number>(1);
  const [signatures, setSignatures] = useState<PubKeyArrayElement[]>([]);

  useEffect(() => {
    // define global variables for the artwork
    window.artworkWidth = width ?? 200;
    window.artworkHeight = height ?? 200;
  }, []);

  const renderRangeStep = (newIndex: number) => {
    if (newIndex < rangeValue) return;
    setRangeValue(newIndex);

    // change the params for the artwork
    window.params.upToPubKey = newIndex;
    // params changed so we need to re-render
    window?.render();
  };

  useEffect(() => {
    const combined: PubKeyArrayElement[] = [];
    if (!pubKey) {
      const users = getUsers();
      for (const userKey in users) {
        const user = users[userKey];
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

      combined.sort((a, b) => b.timestamp - a.timestamp);

      const profile = getProfile();
      if (profile?.signaturePublicKey) {
        window.myPubKey = profile.signaturePublicKey;
      } else {
        window.myPubKey = "0";
      }
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
    if (pubKey === "") return;
    if (signatures?.length === 0) return;
    if (!isLoaded) return;

    // prevent after first render to run again
    if (firstRenderRef.current) return;

    firstRenderRef.current = true;

    window.params = {
      fill: false,
      stroke: true,
      abstract: false,
      upToPubKey: 1, // slider ? rangeValue : signatures.length,
    };

    window.signatures = signatures.map((s) => ({
      pubKey: s.pubKey,
      timestamp: s.timestamp,
    }));

    window?.render(); // render the artwork
  }, [height, isLoaded, width, pubKey, signatures, slider]);

  const onRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    renderRangeStep(newValue);
  };

  const currentRangeIndex = rangeValue - 1;

  // no signatures, canvas is empty
  if (signatures?.length === 0) return;

  return pubKey === "" ? (
    <div
      className={`flex h-[${height?.toString() ?? "200"}px] w-[${
        width?.toString() ?? "200"
      }px] p-0 m-0 border border-white rounded-[8px]`}
    ></div>
  ) : (
    <>
      <canvas
        className="artwork-webgl flex p-0 m-0 border border-white rounded-[8px]"
        id="artwork-webgl"
        {...props}
      ></canvas>
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
              max={signatures.length}
              value={rangeValue} // Bind the value to state
              onChange={onRangeChange}
              className="w-full h-0.5 bg-gray-700 accent-gray-12 appearance-none"
            />
          </label>
          <div className="flex flex-col">
            {rangeValue === 1 ? (
              <>
                <Description>Your personal stamp</Description>
                <Label className="text-center ">
                  Slide to the right to see your stamp collection develop!
                </Label>
              </>
            ) : (
              <>
                <Description>
                  Snapshot when{" "}
                  {signatures[currentRangeIndex]?.person
                    ? `you met ${signatures[currentRangeIndex].name}`
                    : `you went to ${signatures[currentRangeIndex].name}`}
                </Description>
                <Label className="text-center ">
                  {new Date(
                    signatures[currentRangeIndex].timestamp
                  ).toLocaleString()}
                </Label>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

ArtworkCanvas.displayName = "ArtworkCanvas";

export { ArtworkCanvas };

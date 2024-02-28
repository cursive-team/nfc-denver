import { useEffect, useState } from "react";

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
}

const ArtworkCanvas = ({ width, height, ...props }: ArtworkCanvasProps) => {
  const isLoaded = useScripts();

  useEffect(() => {
    window.params = {
      fill: false,
      stroke: true,
      abstract: false,
      upToPubKey: 50,
    };

    window.artworkWidth = width ?? 200;
    window.artworkHeight = height ?? 200;
    const generateHash = (random = Math.random) => {
      let hash = "";
      for (var i = 0; i < 130; i++)
        hash += Math.floor(random() * 16).toString(16);

      return hash;
    };

    window.myPubKey = generateHash();
    window.signatures = Array.from({ length: 1000 }, (_) => ({
      pubKey: generateHash(),
      timestamp: Date.now(),
    }));

    if (!isLoaded) {
      return;
    }

    window?.render(); // render the artwork
  }, [height, isLoaded, width]);

  return (
    <canvas
      className="artwork-webgl flex p-0 m-0 border border-white rounded-[8px]"
      id="artwork-webgl"
      {...props}
    ></canvas>
  );
};

ArtworkCanvas.displayName = "ArtworkCanvas";

export { ArtworkCanvas };

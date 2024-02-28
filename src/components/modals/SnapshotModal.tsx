import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ProfileImage } from "../ProfileImage";
import { ModalProps, Modal } from "./Modal";
import { classed } from "@tw-classed/react";
import Image from "next/image";

const Label = classed.span("text-gray-10 text-xs font-light");
const Description = classed.span("text-center text-gray-12 text-sm font-light");

interface SnapshotModalProps extends ModalProps {}

const SnapshotModal = ({ isOpen, setIsOpen }: SnapshotModalProps) => {
  const [pageWidth, setPageWidth] = useState(0);

  const params = useParams();
  const userId = params?.id;

  const isLoggedUser = Number(userId) === 2;

  // useEffect(() => {
  //   setPageWidth(window?.innerWidth);
  //   window.artworkHeight = window?.innerWidth - 50;
  //   window.artworkWidth = window?.innerWidth - 50;
  //   const generateHash = (random = Math.random) => {
  //     let hash = "";
  //     for (var i = 0; i < 130; i++)
  //       hash += Math.floor(random() * 16).toString(16);

  //     return hash;
  //   };

  //   window.signatures = Array.from({ length: 1000 }, (_) => ({
  //     pubKey: generateHash(),
  //     timestamp: Date.now(),
  //   }));

  //   console.log(window);

  //   window.onload = (_) => {
  //     window.render();

  //     // let stampPFP = window.stamp(myPubKey, 512, 512);
  //     // // console.log(stampPFP.fillColor);
  //     // // console.log(stampPFP.strokeColor);
  //     // // console.log(stampPFP.background);
  //     // console.log(`MyPubKey img\n`, stampPFP.getImage());

  //     // let index = 49;
  //     // let stamp = window.stampWithIndex(index, window.signatures[index - 1].pubKey);
  //     // console.log(`Hash ${index - 1} img\n`, stamp.getImage());
  //   };
  // }, []);

  const cardSize = pageWidth - 50;

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex flex-col gap-10 mt-10">
        <div className="flex flex-col gap-4">
          <ProfileImage
            className="mx-auto"
            style={{
              width: `${cardSize}px`,
              height: `${cardSize}px`,
            }}
          >
            <canvas
              className="bg-black p-0 m-auto block absolute inset-0"
              id="artwork-webgl"
            ></canvas>
          </ProfileImage>
          <div className="flex flex-col">
            {!isLoggedUser && (
              <Description>Snapshot at the time you met [XXX]</Description>
            )}
            <Label className="text-center ">Jan [XX], 11:10</Label>
          </div>
        </div>
        {isLoggedUser && (
          <label className="flex flex-col gap-4 w-full">
            <div className="label p-0">
              <Label className="label-text">What is your name?</Label>
              <Label className="label-text-alt">Top Right label</Label>
            </div>
            <input
              type="range"
              name=""
              min={1}
              max={10}
              className="w-full h-0.5 bg-gray-700 accent-gray-12 appearance-none"
            />
          </label>
        )}
      </div>
    </Modal>
  );
};

SnapshotModal.displayName = "SnapshotModal";
export { SnapshotModal };

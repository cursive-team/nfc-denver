import { useParams } from "next/navigation";
import { ModalProps, Modal } from "./Modal";
import { classed } from "@tw-classed/react";
import { ArtworkCanvas } from "../ArtworkCanvas";
import useSettings from "@/hooks/useSettings";

const Label = classed.span("text-gray-10 text-xs font-light");
const Description = classed.span("text-center text-gray-12 text-sm font-light");

interface SnapshotModalProps extends ModalProps {
  size?: number;
}

const SnapshotModal = ({
  isOpen,
  setIsOpen,
  size = 320,
}: SnapshotModalProps) => {
  const params = useParams();
  const userId = params?.id;

  const isLoggedUser = Number(userId) === 2;

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex flex-col gap-10 mt-10">
        <div className="flex flex-col gap-4">
          <div className="mx-auto">
            <ArtworkCanvas width={size ?? 320} height={size ?? 320} />
          </div>
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

import { ModalProps, Modal } from "./Modal";
import { ArtworkCanvas } from "../ArtworkCanvas";

interface SnapshotModalProps extends ModalProps {
  size?: number;
}

const SnapshotModal = ({
  isOpen,
  setIsOpen,
  size = 320,
}: SnapshotModalProps) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} withBackButton>
      <div className="flex flex-col gap-10 mt-10">
        <div className="flex flex-col gap-4">
          <div className="mx-auto">
            <ArtworkCanvas
              width={size ?? 320}
              height={size ?? 320}
              slider={true}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

SnapshotModal.displayName = "SnapshotModal";
export { SnapshotModal };

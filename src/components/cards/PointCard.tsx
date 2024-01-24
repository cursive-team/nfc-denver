import Image from "next/image";
import { Card } from "./Card";

interface PointCardProps {
  label?: string;
  point: number;
  onClick?: () => void;
}

const PointCard = ({ label, point = 0, onClick }: PointCardProps) => {
  return (
    <button
      className="flex items-center gap-1"
      type="button"
      onClick={() => {
        onClick?.();
      }}
    >
      {label && (
        <span className="text-gray-10 text-xs font-light">{label}</span>
      )}
      <Card.Base className="bg-gray-100/10 px-1 py-0.5 flex items-center gap-[6px]">
        <Image width={15} height={15} src="/icons/bittle.png" alt="bittle" />
        <span className="text-gray-100 text-xs font-thin">{`${point} BUILD`}</span>
      </Card.Base>
    </button>
  );
};

PointCard.displayName = "PointCard";
export { PointCard };

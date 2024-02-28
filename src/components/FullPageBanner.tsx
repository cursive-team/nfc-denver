import { APP_CONFIG } from "@/shared/constants";
import { Icons } from "./Icons";
import { Card } from "./cards/Card";
import useSettings from "@/hooks/useSettings";

interface FullPageBannerProps {
  description: string;
  iconSize?: number;
}

const FullPageBanner = ({
  description,
  iconSize = 80,
}: FullPageBannerProps) => {
  const { pageHeight } = useSettings();
  return (
    <div
      style={{
        minHeight: `${pageHeight}px`,
      }}
      className="flex text-center h-full"
    >
      <div className="flex flex-col gap-8 my-auto mx-auto px-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 mx-auto">
            <Icons.iyk size={iconSize} />
            <Icons.x size={12} />
            <Icons.cursive size={iconSize} />
          </div>
          <span className="text-[36px] font-giorgio text-center">
            {APP_CONFIG.APP_NAME}
          </span>
        </div>

        <Card.Base className="p-2">
          <Card.Description>
            <span className=" text-sm">{description}</span>
          </Card.Description>
        </Card.Base>
      </div>
    </div>
  );
};

FullPageBanner.displayName = "FullPageBanner";

export { FullPageBanner };

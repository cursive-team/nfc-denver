import { APP_CONFIG } from "@/shared/constants";
import { Icons } from "./Icons";
import { Card } from "./cards/Card";

interface FullPageBannerProps {
  description: string;
}

const FullPageBanner = ({ description }: FullPageBannerProps) => {
  return (
    <div className="flex text-center h-screen">
      <div className="flex flex-col gap-8 my-auto mx-auto px-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4 mx-auto">
            <Icons.iyk size={80} />
            <Icons.x size={12} />
            <Icons.cursive size={80} />
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

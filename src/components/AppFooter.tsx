import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Icons } from "./Icons";
import { cn } from "@/lib/client/utils";
import { usePathname } from "next/navigation";

interface RouterItem {
  label: string;
  href: string;
  icon: string;
  isActive?: boolean;
}

const TabItem = ({ label, href, icon, isActive }: RouterItem) => {
  const Icon: any = icon;

  return (
    <Link href={href}>
      <div className="flex flex-col text-center items-center justify-center gap-2">
        <Icon
          size={24}
          className={cn(
            "duration-200",
            isActive ? "text-white" : "text-gray-10"
          )}
        />
        <span
          className={cn(
            "duration-200 delay-100 text-sm font-light mt-auto",
            isActive ? "text-white" : "text-gray-10"
          )}
        >
          {label}
        </span>
      </div>
    </Link>
  );
};

const AppFooter = () => {
  const router = useRouter();
  const [_activeRoute, setActiveRoute] = useState<string>("/");

  const pathname = usePathname();

  useEffect(() => {
    setActiveRoute(router.route);
  }, [router]);

  const routerItems: RouterItem[] = [
    {
      label: "Home",
      href: "/",
      icon: Icons.home,
    },
    {
      label: "Quests",
      href: "/quests",
      icon: Icons.quest,
    },
    {
      label: "Store",
      href: "/store",
      icon: Icons.store,
    },
  ];

  return (
    <footer
      id="footer"
      className="sticky border-t border-t-shark-700 w-full bottom-0 mt-4"
    >
      <div className="bg-gray-200 md:container grid grid-cols-3 bottom-0 pt-4 pb-3 xs:py-4">
        {routerItems?.map((route, index) => {
          const isActive = pathname === route.href;
          return <TabItem key={index} {...route} isActive={isActive} />;
        })}
      </div>
    </footer>
  );
};

AppFooter.displayName = "AppFooter";
export { AppFooter };

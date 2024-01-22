import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Icons } from "./Icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface RouterItem {
  label: string;
  href: string;
  icon: string;
  iconActive: string;
  isActive?: boolean;
}

const TabItem = ({ label, href, icon, iconActive, isActive }: RouterItem) => {
  const Icon: any = isActive ? iconActive : icon;

  return (
    <Link href={href}>
      <div className="flex flex-col text-center items-center justify-center gap-2">
        <Icon height={24} />
        <span
          className={cn(
            "text-sm font-light mt-auto",
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
      label: "Social",
      href: "/social",
      icon: Icons.social,
      iconActive: Icons.socialActive,
    },
    {
      label: "Quests",
      href: "/quests",
      icon: Icons.quest,
      iconActive: Icons.questActive,
    },
  ];

  console.log("pathname", pathname);
  return (
    <footer
      id="footer"
      className="fixed border-t border-t-shark-700 bg-gray-200 w-full bottom-0"
    >
      <div className="md:container grid grid-cols-2 bottom-0 pt-4 pb-3 xs:py-4">
        {routerItems?.map((route, index) => {
          const isActive = pathname?.startsWith(route.href);
          return <TabItem key={index} {...route} isActive={isActive} />;
        })}
      </div>
    </footer>
  );
};

AppFooter.displayName = "AppFooter";
export { AppFooter };

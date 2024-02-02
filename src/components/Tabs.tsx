import { Tab } from "@headlessui/react";
import { classed } from "@tw-classed/react";

interface TabProps {
  label: string;
  badge?: number;
  children: React.ReactNode;
}

export interface TabsProps {
  items: TabProps[];
}

const TabButton = classed.div("pb-4", {
  variants: {
    selected: {
      true: "text-gray-12",
      false: "text-gray-11",
    },
  },
  defaultVariants: {
    selected: false,
  },
});

const TabBadge = classed.div(
  "absolute -top-0.5 -right-2 bg-red-400 rounded-full text-white px-1 py-[0.2px] text-[8px]"
);

const Tabs = ({ items }: TabsProps) => {
  return (
    <Tab.Group>
      <Tab.List className="flex gap-8 relative">
        {items.map(({ label, badge }, index) => {
          return (
            <Tab className="outline-none" key={index}>
              {({ selected }) => (
                <div className="relative">
                  <TabButton selected={selected}>
                    <span className="relative">
                      {label}
                      {badge && <TabBadge>{badge}</TabBadge>}
                    </span>
                  </TabButton>
                  {selected && (
                    <div className="absolute bg-gray-12 bottom-0 h-[1px] w-full z-[1]"></div>
                  )}
                </div>
              )}
            </Tab>
          );
        })}
        <div className="absolute bg-gray-400 bottom-0 h-[1px] w-full z-0"></div>
      </Tab.List>
      <Tab.Panels className="pt-4">
        {items.map(({ children }, index) => {
          return <Tab.Panel key={index}>{children}</Tab.Panel>;
        })}
      </Tab.Panels>
    </Tab.Group>
  );
};

Tabs.displayName = "Tabs";

export { Tabs };

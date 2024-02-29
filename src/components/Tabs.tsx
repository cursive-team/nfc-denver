import { Tab } from "@headlessui/react";
import { classed } from "@tw-classed/react";
import { useStateMachine } from "little-state-machine";

interface TabProps {
  label: string;
  id: string;
  badge?: boolean;
  children: React.ReactNode;
}

export interface TabsProps {
  onChange?: (currentActive: string) => void;
  items: TabProps[];
  defaultTab?: string;
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
  "absolute -top-0.5 -right-2 bg-[#D40018] rounded-full text-white w-[6px] h-[6px] text-[8px]"
);

const Tabs = ({ items, defaultTab, onChange }: TabsProps) => {
  const defaultTabIndex = items.findIndex((item) => item.id === defaultTab);

  return (
    <Tab.Group defaultIndex={defaultTabIndex}>
      <Tab.List className="flex gap-8 relative">
        {items.map(({ label, badge, id }, index) => {
          return (
            <Tab className="outline-none" key={index}>
              {({ selected }) => (
                <div className="relative">
                  <TabButton
                    selected={selected}
                    onClick={() => {
                      onChange?.(id);
                    }}
                  >
                    <span className="relative">
                      {label}
                      {badge && <TabBadge />}
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
      <Tab.Panels className="pt-2 xs:pt-4">
        {items.map(({ children }, index) => {
          return <Tab.Panel key={index}>{children}</Tab.Panel>;
        })}
      </Tab.Panels>
    </Tab.Group>
  );
};

Tabs.displayName = "Tabs";

export { Tabs };

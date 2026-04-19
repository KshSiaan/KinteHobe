"use client";

import { ReactNode, useLayoutEffect, useRef, useState } from "react";

import { motion } from "motion/react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TabItem {
  name: string;
  value: string;
  content: ReactNode;
}

interface UnderlineTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
}

const defaultTabs: TabItem[] = [
  {
    name: "Explore",
    value: "explore",
    content: (
      <>
        Discover{" "}
        <span className="text-foreground font-semibold">fresh ideas</span>,
        trending topics, and hidden gems curated just for you. Start exploring
        and let your curiosity lead the way!
      </>
    ),
  },
  {
    name: "Favorites",
    value: "favorites",
    content: (
      <>
        All your{" "}
        <span className="text-foreground font-semibold">favorites</span> are
        saved here. Revisit articles, collections, and moments you love, any
        time you want a little inspiration.
      </>
    ),
  },
  {
    name: "Surprise Me",
    value: "surprise",
    content: (
      <>
        <span className="text-foreground font-semibold">Surprise!</span>{" "}
        Here&apos;s something unexpected—a fun fact, a quirky tip, or a daily
        challenge. Come back for a new surprise every day!
      </>
    ),
  },
];

const UnderlineTabs = ({
  tabs = defaultTabs,
  defaultTab = tabs[0]?.value,
}: UnderlineTabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const activeIndex = tabs.findIndex((tab) => tab.value === activeTab);
    const activeTabElement = tabRefs.current[activeIndex];

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;

      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab, tabs]);

  return (
    <div className="w-full ">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4 ">
        <div className="border-b">
          <TabsList className="bg-background relative rounded-none border-b p-0">
            {tabs.map((tab, index) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                className="bg-background dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:text-primary data-[state=active]:shadow-none!"
              >
                {tab.name}
              </TabsTrigger>
            ))}

            <motion.div
              className="bg-primary absolute bottom-0 z-20 h-0.5"
              layoutId="underline"
              style={{
                left: underlineStyle.left,
                width: underlineStyle.width,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
              }}
            />
          </TabsList>
        </div>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <p className="text-muted-foreground text-sm">{tab.content}</p>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default UnderlineTabs;

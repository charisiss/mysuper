"use client";

import React from "react";

import { ShoppingCart, Tag, Package } from "lucide-react";

import { HomeTab } from "@/contexts/HomeContext";

interface HomeTabNavigationProps {
  activeTab: HomeTab;
  options: { key: HomeTab; label: string }[];
  onSelect: (tab: HomeTab) => void;
}

const iconMap: Record<HomeTab, typeof Package> = {
  products: Package,
  shopping: ShoppingCart,
  offers: Tag,
};

const HomeTabNavigation: React.FC<HomeTabNavigationProps> = ({
  activeTab,
  options,
  onSelect,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/70 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between px-4">
        {options.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            className={`flex flex-1 flex-col items-center rounded-t-2xl pb-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-primary via-cyan-400 to-sky-500 text-white shadow-md shadow-primary/30"
                : "text-gray-500 bg-transparent"
            }`}
            aria-pressed={activeTab === tab.key}
          >
            {iconMap[tab.key] && (
              <span
                className={`flex h-11 w-16 items-center justify-center text-base transition`}
              >
                {React.createElement(iconMap[tab.key], {
                  className: `h-5 w-5 ${
                    activeTab === tab.key ? "text-white" : "text-gray-400"
                  }`,
                })}
              </span>
            )}
            <span className={activeTab === tab.key ? "text-white" : ""}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default HomeTabNavigation;



"use client";

import React from "react";

import { HomeTab } from "@/contexts/HomeContext";

interface HomeTabNavigationProps {
  activeTab: HomeTab;
  options: { key: HomeTab; label: string }[];
  onSelect: (tab: HomeTab) => void;
}

const HomeTabNavigation: React.FC<HomeTabNavigationProps> = ({
  activeTab,
  options,
  onSelect,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white shadow-lg">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {options.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-sm font-semibold transition ${
              activeTab === tab.key ? "text-primary" : "text-gray-500"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`h-1 w-10 rounded-full ${
                activeTab === tab.key ? "bg-primary" : "bg-transparent"
              }`}
            />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default HomeTabNavigation;



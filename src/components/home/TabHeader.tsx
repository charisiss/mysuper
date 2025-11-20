"use client";

import React, { useEffect, useState } from "react";
type TabHeaderProps = React.PropsWithChildren<{
  title: string | React.ReactNode;
  actionSlot?: React.ReactNode;
}>;

const TabHeader: React.FC<TabHeaderProps> = ({
  title,
  actionSlot,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className={`sticky top-0 left-0 right-0 z-20 flex w-full flex-col gap-4 border-b border-white/60 bg-gradient-to-b from-white via-white/70 to-white/40 px-6 pb-6 pt-8 shadow-sm backdrop-blur-xl transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        {typeof title === "string" ? (
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
        ) : (
          title
        )}
        {actionSlot}
      </div>
      {children && <div className="w-full">{children}</div>}
    </div>
  );
};

export default TabHeader;


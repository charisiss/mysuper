"use client";

import React from "react";
type TabHeaderProps = React.PropsWithChildren<{
  title: string | React.ReactNode;
  actionSlot?: React.ReactNode;
}>;

const TabHeader: React.FC<TabHeaderProps> = ({
  title,
  actionSlot,
  children,
}) => {
  return (
    <div className="sticky top-0 left-0 right-0 z-20 flex w-full flex-col gap-4 border-b border-white/60 bg-gradient-to-b from-white via-white/95 to-white/70 px-6 pb-6 pt-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl">
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


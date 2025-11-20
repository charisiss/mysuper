"use client";

import React from "react";
import Image from "next/image";

interface TabHeaderProps {
  title: string;
  iconSrc: string;
  iconAlt?: string;
  actionSlot?: React.ReactNode;
}

const TabHeader: React.FC<TabHeaderProps> = ({
  title,
  iconSrc,
  iconAlt = "Section icon",
  actionSlot,
}) => {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <span className="h-12 w-12">
          <Image src={iconSrc} alt={iconAlt} width={50} height={50} />
        </span>
        <h1 className="text-xl font-bold">{title}</h1>
      </span>
      {actionSlot}
    </div>
  );
};

export default TabHeader;


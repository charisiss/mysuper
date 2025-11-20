"use client";

import React from "react";

import ProductList from "@/components/ProductList";
import { Product } from "@/types/Product";
import TabHeader from "./TabHeader";
import VoiceToggleButton, { VoiceControls } from "./VoiceToggleButton";

interface ShoppingTabProps {
  products: Product[];
  totalCost: number;
  onEdit: (product: Product) => void;
  onDelete: (
    product: Product,
    fromList: "available" | "shopping" | "offer",
  ) => void;
  onClearList: (list: "shopping" | "offer" | "available") => Promise<void> | void;
  onAddToList: (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number,
  ) => Promise<void> | void;
  voiceControls?: VoiceControls;
  voiceError?: string | null;
}

const ShoppingTab: React.FC<ShoppingTabProps> = ({
  products,
  totalCost,
  onEdit,
  onDelete,
  onClearList,
  onAddToList,
  voiceControls,
  voiceError,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-24 pt-2">
      <TabHeader
        title="SHOPPING LIST"
        iconSrc="/images/productslist.png"
        iconAlt="Shopping list icon"
        actionSlot={
          voiceControls ? <VoiceToggleButton {...voiceControls} /> : undefined
        }
      />
      {voiceControls && voiceError && (
        <p className="text-sm text-red-600">{voiceError}</p>
      )}

      <div className="rounded-2xl bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Items</h2>
          <p className="text-sm text-gray-500">
            {products.length} item{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <ProductList
          products={products}
          totalCost={totalCost}
          onEdit={onEdit}
          onDelete={onDelete}
          onClearList={onClearList}
          onAddToList={onAddToList}
          currentList="shopping"
        />
      </div>
    </div>
  );
};

export default ShoppingTab;


"use client";

import React from "react";

import ProductList from "@/components/ProductList";
import { Product } from "@/types/Product";
import TabHeader from "./TabHeader";
import { VoiceControls } from "./VoiceToggleButton";
import VoiceMicButton from "./VoiceMicButton";

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
  const currencyFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }),
    [],
  );

  const formatPrice = (price: number) => currencyFormatter.format(price);

  return (
    <div className="flex flex-col">
      <TabHeader
        title="Shopping List"
        actionSlot={<VoiceMicButton voiceControls={voiceControls} />}
      >
        <p className="text-sm text-slate-500">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </TabHeader>
      {voiceControls && voiceError && (
        <p className="px-6 pb-2 text-sm text-red-600">{voiceError}</p>
      )}

      <div className="flex flex-col gap-3 p-2.5">
        <ProductList
          products={products}
          totalCost={totalCost}
          onEdit={onEdit}
          onDelete={onDelete}
          onClearList={onClearList}
          onAddToList={onAddToList}
          currentList="shopping"
        />

        <div
          className="rounded-3xl bg-white/90 px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] animate-fade-up animate-duration-500 animate-delay-200 animate-ease-out animate-fill-forwards animate-once opacity-0"
          style={{
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">Total</p>
            <p className="text-xl font-bold text-slate-900">
              {formatPrice(totalCost)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingTab;


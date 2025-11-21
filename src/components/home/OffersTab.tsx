"use client";

import React, { useRef, useState } from "react";

import ProductList, { ProductListHandle } from "@/components/ProductList";
import { Product } from "@/types/Product";
import TabHeader from "./TabHeader";
import { VoiceControls } from "./VoiceToggleButton";
import VoiceMicButton from "./VoiceMicButton";

interface OffersTabProps {
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

const OffersTab: React.FC<OffersTabProps> = ({
  products,
  totalCost,
  onEdit,
  onDelete,
  onClearList,
  onAddToList,
  voiceControls,
  voiceError,
}) => {
  const productListRef = useRef<ProductListHandle>(null);
  const [checkedCount, setCheckedCount] = useState(0);

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

  const handleClearChecked = async () => {
    if (productListRef.current) {
      productListRef.current.clearCheckedItems();
    }
  };

  return (
    <div className="flex flex-col">
      <TabHeader
        title="Offers List"
        actionSlot={<VoiceMicButton voiceControls={voiceControls} />}
      >
        <p className="text-sm text-slate-500">
          {products.length} offer{products.length === 1 ? "" : "s"}
        </p>
      </TabHeader>
      {voiceControls && voiceError && (
        <p className="px-6 pb-2 text-sm text-red-600">{voiceError}</p>
      )}

      <div className="flex flex-col gap-3 p-5">
        <ProductList
          ref={productListRef}
          products={products}
          totalCost={totalCost}
          onEdit={onEdit}
          onDelete={onDelete}
          onClearList={onClearList}
          onAddToList={onAddToList}
          currentList="offer"
          onCheckedCountChange={setCheckedCount}
        />

        <div
          className={`sticky bottom-20 bg-gradient-to-r from-primary via-cyan-400 to-sky-500 px-5 py-5 text-white shadow-xl shadow-primary/30 animate-fade-up animate-duration-500 animate-delay-200 animate-ease-out animate-fill-forwards animate-once opacity-0 ${checkedCount > 0 ? "rounded-2xl" : "rounded-3xl"}`}
          style={{
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-white/95">Total</p>
            <p className="text-xl font-bold text-white">
              {formatPrice(totalCost)}
            </p>
          </div>
          {checkedCount > 0 && (
            <button
              onClick={handleClearChecked}
              className="mt-4 w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 active:bg-red-700"
            >
              Clear All Selected ({checkedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffersTab;


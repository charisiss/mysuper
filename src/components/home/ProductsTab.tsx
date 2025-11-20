"use client";

import React from "react";
import ProductList from "@/components/ProductList";
import { Product } from "@/types/Product";
import TabHeader from "./TabHeader";
import { PlusIcon } from "lucide-react";
type ListType = "shopping" | "offer" | "available";

interface ProductsTabProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAddProduct: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product, fromList: ListType) => void;
  onAddToList: (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number,
  ) => Promise<void> | void;
  onClearList: (list: ListType) => Promise<void> | void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  searchTerm,
  onSearchChange,
  onAddProduct,
  onEdit,
  onDelete,
  onAddToList,
  onClearList,
}) => {
  return (
    <div className="flex flex-col">
      <TabHeader
        title="Products"
        actionSlot={
          <button
            onClick={onAddProduct}
            className="rounded-full bg-primary p-2.5 font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5 hover:shadow-primary/50"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        }
      >
        <label className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-base text-slate-600 shadow-sm focus-within:border-emerald-300">
          <svg
            className="h-5 w-5 text-emerald-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search products..."
            className="w-full bg-transparent text-base text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </label>
      </TabHeader>

      <div className="px-4">
        <ProductList
          products={products}
          onEdit={onEdit}
          onDelete={onDelete}
          onClearList={onClearList}
          onAddToList={onAddToList}
          currentList="available"
          totalCost={0}
        />
      </div>
    </div>
  );
};

export default ProductsTab;


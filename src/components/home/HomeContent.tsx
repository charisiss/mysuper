"use client";

import React from "react";

import ProductModal from "@/components/ProductModal";
import OffersTab from "@/components/home/OffersTab";
import ProductsTab from "@/components/home/ProductsTab";
import ShoppingTab from "@/components/home/ShoppingTab";
import { HomeTab, useHomeContext } from "@/contexts/HomeContext";

import HomeTabNavigation from "./HomeTabNavigation";
import VoiceFeedback from "./VoiceFeedback";

const TAB_OPTIONS: { key: HomeTab; label: string }[] = [
  { key: "products", label: "Products" },
  { key: "shopping", label: "Shopping" },
  { key: "offers", label: "Offers" },
];

const HomeContent: React.FC = () => {
  const {
    activeTab,
    shoppingList,
    offerList,
    sortedAvailableProducts,
    searchTerm,
    modalOpen,
    currentProduct,
    availableCategories,
    voiceControls,
    voiceError,
    voiceMessage,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleAddToList,
    handleClearList,
    handleSearchChange,
    handleTabChange,
    handleSaveProduct,
    handleCreateCategory,
    calculateTotalCost,
    closeModal,
  } = useHomeContext();

  return (
    <div className="relative min-h-svh bg-gradient-to-b from-emerald-50/60 via-white to-white pb-24">
      <div className="">
        {activeTab === "shopping" && (
          <ShoppingTab
            products={shoppingList}
            totalCost={calculateTotalCost(shoppingList)}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onClearList={handleClearList}
            onAddToList={handleAddToList}
            voiceControls={voiceControls}
            voiceError={voiceError}
          />
        )}

        {activeTab === "offers" && (
          <OffersTab
            products={offerList}
            totalCost={calculateTotalCost(offerList)}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onClearList={handleClearList}
            onAddToList={handleAddToList}
            voiceControls={voiceControls}
            voiceError={voiceError}
          />
        )}

        {activeTab === "products" && (
          <ProductsTab
            products={sortedAvailableProducts}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddProduct={handleAddProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAddToList={handleAddToList}
            onClearList={handleClearList}
          />
        )}
      </div>

      <HomeTabNavigation
        activeTab={activeTab}
        options={TAB_OPTIONS}
        onSelect={handleTabChange}
      />

      <VoiceFeedback message={voiceMessage} />

      <ProductModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSaveProduct}
        initialProduct={currentProduct}
        availableCategories={availableCategories}
        onCreateCategory={handleCreateCategory}
        onDelete={handleDeleteProduct}
      />
    </div>
  );
};

export default HomeContent;



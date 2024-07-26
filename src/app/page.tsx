"use client";
import React, { useState } from "react";
import { Product } from "@/types/Product";
import ProductList from "@/components/ProductList";
import ProductModal from "@/components/ProductModal";
import {
  Box,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Home: React.FC = () => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([
    { id: 1, name: "Γάλα", price: 1.2, fromList: "available" },
    { id: 2, name: "Ψωμί", price: 0.8, fromList: "available" },
    { id: 3, name: "Τυρί", price: 2.5, fromList: "available" },
  ]);
  const [shoppingList, setShoppingList] = useState<Product[]>([]);
  const [offerList, setOfferList] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<string | false>("shopping");

  const calculateTotalCost = (products: Product[]) => {
    return products.reduce((total, product) => {
      const productQuantity = product.quantity || 1;
      return total + product.price * productQuantity;
    }, 0);
  };

  const handleAddToList = (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number
  ) => {
    const productWithQuantity = { ...product, quantity };
    if (listType === "shopping") {
      setShoppingList((prev) => {
        const existingProductIndex = prev.findIndex(
          (p) => p.id === productWithQuantity.id
        );
        if (existingProductIndex > -1) {
          const updatedList = [...prev];
          updatedList[existingProductIndex] = {
            ...updatedList[existingProductIndex],
            quantity: updatedList[existingProductIndex].quantity
              ? updatedList[existingProductIndex].quantity + quantity
              : quantity,
          };
          return updatedList;
        }
        return [...prev, productWithQuantity];
      });
    } else {
      setOfferList((prev) => {
        const existingProductIndex = prev.findIndex(
          (p) => p.id === productWithQuantity.id
        );
        if (existingProductIndex > -1) {
          const updatedList = [...prev];
          updatedList[existingProductIndex] = {
            ...updatedList[existingProductIndex],
            quantity: updatedList[existingProductIndex].quantity
              ? updatedList[existingProductIndex].quantity + quantity
              : quantity,
          };
          return updatedList;
        }
        return [...prev, productWithQuantity];
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = (
    product: Product,
    fromList: "available" | "shopping" | "offer"
  ) => {
    if (fromList === "available") {
      setAvailableProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else if (fromList === "shopping") {
      setShoppingList((prev) => prev.filter((p) => p.id !== product.id));
    } else if (fromList === "offer") {
      setOfferList((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const handleMoveToOffers = (product: Product) => {
    setShoppingList((prev) => prev.filter((p) => p.id !== product.id));
    setOfferList((prev) => [...prev, product]);
  };

  const handleSaveProduct = (product: Product) => {
    if (currentProduct) {
      // Edit existing product
      setAvailableProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
      setShoppingList((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
      setOfferList((prev) =>
        prev.map((p) => (p.id === product.id ? product : p))
      );
    } else {
      // Add new product
      if (!product.id) {
        product.id = Date.now(); // Αυτόματη δημιουργία ID αν δεν υπάρχει
      }
      setAvailableProducts((prev) => [...prev, product]);
    }
    setCurrentProduct(undefined);
    setModalOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = availableProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-5">
      <div className="pb-5">
        <div className="flex gap-2 pb-5 w-full items-center justify-between">
          <h1 className="text-xl font-bold">ΛΙΣΤΕΣ</h1>
        </div>

        {/* Accordion for Shopping List */}
        <Accordion
          expanded={expanded === "shopping"}
          onChange={() =>
            setExpanded(expanded === "shopping" ? false : "shopping")
          }
          sx={{ margin: 0 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Λίστα Αγορών</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ProductList
              products={shoppingList}
              totalCost={calculateTotalCost(shoppingList)}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onMoveToOffers={handleMoveToOffers}
              onAddToList={handleAddToList}
              currentList="shopping"
            />
          </AccordionDetails>
        </Accordion>

        {/* Accordion for Offer List */}
        <Accordion
          expanded={expanded === "offer"}
          onChange={() => setExpanded(expanded === "offer" ? false : "offer")}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Λίστα Προσφορών</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ProductList
              products={offerList}
              totalCost={calculateTotalCost(offerList)}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onMoveToOffers={handleMoveToOffers}
              onAddToList={handleAddToList}
              currentList="offer"
            />
          </AccordionDetails>
        </Accordion>

        <div className="flex gap-2 pt-5 w-full items-center justify-between">
          <h1 className="text-xl font-bold">ΠΡΟΙΟΝΤΑ</h1>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#00d6d6] p-2 rounded-lg uppercase text-white font-bold"
          >
            Προσθηκη
          </button>
        </div>
        <TextField
          label="Αναζήτηση"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        {/* Available Products List */}
        <ProductList
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onMoveToOffers={handleMoveToOffers}
          onAddToList={handleAddToList}
          currentList="available"
          totalCost={0}
        />

        {/* Product Modal */}
        <ProductModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProduct}
          initialProduct={currentProduct}
        />
      </div>
    </div>
  );
};

export default Home;

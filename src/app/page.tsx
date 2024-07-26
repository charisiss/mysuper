"use client";
import React, { useState } from "react";
import { Product } from "@/types/Product";
import ProductList from "@/components/ProductList";
import ProductModal from "@/components/ProductModal";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "next/image";

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
    undefined,
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
    quantity: number,
  ) => {
    const productWithQuantity = { ...product, quantity };
    const updateList = (prev: Product[]) => {
      const existingProductIndex = prev.findIndex(
        (p) => p.id === productWithQuantity.id,
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
    };

    if (listType === "shopping") {
      setShoppingList(updateList);
    } else {
      setOfferList(updateList);
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = (
    product: Product,
    fromList: "available" | "shopping" | "offer",
  ) => {
    const updateList = (prev: Product[]) =>
      prev.filter((p) => p.id !== product.id);

    if (fromList === "available") {
      setAvailableProducts(updateList);
    } else if (fromList === "shopping") {
      setShoppingList(updateList);
    } else if (fromList === "offer") {
      setOfferList(updateList);
    }
  };

  const handleMoveToOffers = (product: Product) => {
    setShoppingList((prev) => prev.filter((p) => p.id !== product.id));
    setOfferList((prev) => [...prev, product]);
  };

  const handleSaveProduct = (product: Product) => {
    const updateProduct = (prev: Product[]) =>
      prev.map((p) => (p.id === product.id ? product : p));

    if (currentProduct) {
      setAvailableProducts(updateProduct);
      setShoppingList(updateProduct);
      setOfferList(updateProduct);
    } else {
      if (!product.id) {
        product.id = Date.now();
      }
      setAvailableProducts((prev) => [...prev, product]);
    }
    setCurrentProduct(undefined);
    setModalOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const normalizeString = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const filteredProducts = availableProducts.filter((product) =>
    [normalizeString(product.name), product.id.toString()].some((term) =>
      term.includes(normalizeString(searchTerm)),
    ),
  );

  return (
    <div className="p-5">
      <div className="pb-5">
        <div className="flex w-full items-center justify-start gap-2 pb-5">
          <span className="h-12 w-12">
            <Image
              src={"/images/productslist.png"}
              alt="My Super Image"
              width={50}
              height={50}
            />
          </span>
          <h1 className="text-xl font-bold">LISTS</h1>
        </div>

        <Accordion
          expanded={expanded === "shopping"}
          onChange={() =>
            setExpanded(expanded === "shopping" ? false : "shopping")
          }
          className="rounded-t-2xl"
          sx={{
            "&:before": {
              display: "none",
            },
          }}
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Shopping List</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
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

        <Accordion
          expanded={expanded === "offer"}
          onChange={() => setExpanded(expanded === "offer" ? false : "offer")}
          className="rounded-b-2xl"
          sx={{
            "&:before": {
              display: "none",
            },
          }}
          disableGutters
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Offers List</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
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

        <div className="flex w-full items-center justify-between gap-2 pt-5">
          <span className="flex items-center gap-2">
            <Image
              src={"/images/mysuper.png"}
              alt="My Super Image"
              width={50}
              height={50}
            />
            <h1 className="text-xl font-bold">PRODUCTS</h1>
          </span>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary rounded-lg px-4 py-2 font-bold uppercase text-white"
          >
            ADD
          </button>
        </div>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={handleSearchChange}
        />

        <ProductList
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onMoveToOffers={handleMoveToOffers}
          onAddToList={handleAddToList}
          currentList="available"
          totalCost={0}
        />

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

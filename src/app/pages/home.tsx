"use client";
import React, { useState, useEffect } from "react";
import { Product } from "@/types/Product";
import ProductList from "@/components/ProductList";
import ProductModal from "@/components/ProductModal";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Image from "next/image";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/app/firebaseConfig";
import { useAuth } from "@/app/AuthContext";
import Login from "@/components/Login";

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<Product[]>([]);
  const [offerList, setOfferList] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>(
    undefined,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<string | false>("shopping");

  const allowedEmail = "charisissam@gmail.com";

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Product, "id">;
        return {
          ...data,
          id: doc.id,
        };
      });
      setAvailableProducts(products.filter((p) => p.fromList === "available"));
      setShoppingList(products.filter((p) => p.fromList === "shopping"));
      setOfferList(products.filter((p) => p.fromList === "offer"));
    };

    fetchProducts();
  }, []);

  const calculateTotalCost = (products: Product[]) => {
    return products.reduce((total, product) => {
      const productQuantity = product.quantity || 1;
      return total + product.price * productQuantity;
    }, 0);
  };

  const handleAddProduct = () => {
    setCurrentProduct(undefined);
    setModalOpen(true);
  };

  const handleAddToList = async (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number,
  ) => {
    const productWithQuantity = { ...product, quantity, fromList: listType };

    const updateList = async (prev: Product[]) => {
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

        const productToUpdate = updatedList[existingProductIndex];
        await updateDoc(doc(db, "products", productToUpdate.id), {
          quantity: productToUpdate.quantity,
        });
        return updatedList;
      } else {
        const docRef = await addDoc(
          collection(db, "products"),
          productWithQuantity,
        );
        productWithQuantity.id = docRef.id;
        return [...prev, productWithQuantity];
      }
    };

    if (listType === "shopping") {
      setShoppingList(await updateList(shoppingList));
    } else {
      setOfferList(await updateList(offerList));
    }
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  };

  const handleDeleteProduct = async (
    product: Product,
    fromList: "available" | "shopping" | "offer",
  ) => {
    const updateList = (prev: Product[]) =>
      prev.filter((p) => p.id !== product.id);

    if (fromList === "available") {
      setAvailableProducts(updateList(availableProducts));
    } else if (fromList === "shopping") {
      setShoppingList(updateList(shoppingList));
    } else if (fromList === "offer") {
      setOfferList(updateList(offerList));
    }

    await deleteDoc(doc(db, "products", product.id));
  };

  const handleSaveProduct = async (product: Product) => {
    const updateProduct = (prev: Product[]) =>
      prev.map((p) => (p.id === product.id ? product : p));

    if (currentProduct) {
      setAvailableProducts(updateProduct(availableProducts));
      setShoppingList(updateProduct(shoppingList));
      setOfferList(updateProduct(offerList));
    } else {
      if (!product.id) {
        product.id = Date.now().toString(); // Ensure ID is a string
      }
      await addDoc(collection(db, "products"), product);
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

  const handleMoveToOffers = (product: Product) => {
    setShoppingList((prev) => prev.filter((p) => p.id !== product.id));
    setOfferList((prev) => [...prev, product]);
  };

  if (loading)
    return (
      <div className="flex h-svh flex-col items-center justify-center">
        <CircularProgress />
      </div>
    );

  if (!user) return <Login />;

  if (user.email !== allowedEmail) {
    return (
      <div className="flex h-svh flex-col justify-center">
        <p className="text-center text-2xl font-bold">ACCESS DENIED</p>
        <p className="text-center">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

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
            onClick={handleAddProduct}
            className="rounded-lg bg-primary px-4 py-2 font-bold uppercase text-white"
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

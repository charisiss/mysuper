"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import MicIcon from "@mui/icons-material/Mic";
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

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const normalizeString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const getLevenshteinDistance = (a: string, b: string) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  matrix[0] = Array.from({ length: a.length + 1 }, (_, j) => j);

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] =
          Math.min(
            matrix[i - 1][j],
            matrix[i][j - 1],
            matrix[i - 1][j - 1],
          ) + 1;
      }
    }
  }

  return matrix[b.length][a.length];
};

const getSimilarityScore = (a: string, b: string) => {
  if (!a.length || !b.length) return 0;
  if (a === b) return 1;

  const distance = getLevenshteinDistance(a, b);
  return 1 - distance / Math.max(a.length, b.length);
};

const dedupeProducts = (products: Product[]) => {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
};

const findBestMatchingProduct = (query: string, products: Product[]) => {
  const normalizedQuery = normalizeString(query);
  if (!normalizedQuery) return null;

  let bestProduct: Product | null = null;
  let bestScore = 0;

  products.forEach((product) => {
    const normalizedName = normalizeString(product.name);
    if (!normalizedName) return;

    let score = 0;
    if (normalizedName === normalizedQuery) {
      score = 1;
    } else if (
      normalizedName.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedName)
    ) {
      score = 0.92;
    } else {
      score = getSimilarityScore(normalizedName, normalizedQuery);
    }

    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  });

  return bestScore >= 0.6 ? bestProduct : null;
};

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
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<"el-GR" | "en-US">("el-GR");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const pendingLangRef = useRef<"el-GR" | "en-US" | null>(null);
  const latestListsRef = useRef({
    availableProducts,
    shoppingList,
    offerList,
  });

  const allowedEmails = ["charisissam@gmail.com", "panos9409@gmail.com"];

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

  const handleAddToListRef = useRef(handleAddToList);

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
    if (currentProduct) {
      if (product.id) {
        const { id, ...productData } = product;
        await updateDoc(doc(db, "products", id), productData);

        const updateProduct = (prev: Product[]) =>
          prev.map((p) => (p.id === id ? { ...p, ...productData } : p));

        setAvailableProducts(updateProduct(availableProducts));
        setShoppingList(updateProduct(shoppingList));
        setOfferList(updateProduct(offerList));
      } else {
        console.error("Product ID is missing");
      }
    } else {
      const { id, ...productData } = product;
      const docRef = await addDoc(collection(db, "products"), productData);
      product.id = docRef.id;

      setAvailableProducts((prev) => [...prev, product]);
    }

    // Close the modal and reset currentProduct
    setCurrentProduct(undefined);
    setModalOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    latestListsRef.current = {
      availableProducts,
      shoppingList,
      offerList,
    };
  }, [availableProducts, offerList, shoppingList]);

  useEffect(() => {
    handleAddToListRef.current = handleAddToList;
  }, [handleAddToList]);

  const processTranscript = useCallback(async (rawTranscript: string) => {
    const transcript = rawTranscript.trim();
    if (!transcript) {
      setVoiceMessage("No product was heard. Try again.");
      return;
    }

    const combinedProducts = dedupeProducts([
      ...latestListsRef.current.availableProducts,
      ...latestListsRef.current.shoppingList,
      ...latestListsRef.current.offerList,
    ]);

    const matchedProduct = findBestMatchingProduct(transcript, combinedProducts);

    if (!matchedProduct) {
      setVoiceMessage(`No product was found for "${transcript}".`);
      return;
    }

    const productToAdd = matchedProduct as Product;

    try {
      await handleAddToListRef.current(productToAdd, "shopping", 1);
      setVoiceError(null);
      setVoiceMessage(`"${productToAdd.name}" was added to the list.`);
    } catch (error) {
      console.error("Voice add error", error);
      setVoiceError("Failed to add product. Try again.");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const speechWindow = window as typeof window & {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognitionClass: SpeechRecognitionConstructor | undefined =
      speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsVoiceSupported(false);
      setVoiceError("The browser does not support speech recognition.");
      return;
    }

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass();
    recognition.lang = speechLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: SpeechRecognitionEventLike) => {
      const transcript = event.results[0][0]?.transcript ?? "";
      await processTranscript(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied.");
      } else {
        setVoiceError("An error occurred while listening.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (pendingLangRef.current && recognitionRef.current) {
        const nextLang = pendingLangRef.current;
        pendingLangRef.current = null;
        recognitionRef.current.lang = nextLang;
        try {
          recognitionRef.current.start();
          setSpeechLang(nextLang);
          setIsListening(true);
          setVoiceMessage(
            `Speak in ${nextLang === "el-GR" ? "Greek" : "English"} to add a product...`,
          );
          return;
        } catch (error) {
          console.error("Speech restart error", error);
          setVoiceError("Unable to switch language.");
        }
      }
      setIsListening(false);
      setSpeechLang("el-GR");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [processTranscript]);

  const startListeningWith = (lang: "el-GR" | "en-US") => {
    if (!recognitionRef.current) return;

    recognitionRef.current.lang = lang;
    try {
      recognitionRef.current.start();
      setSpeechLang(lang);
      setIsListening(true);
      setVoiceMessage(
        `Speak in ${lang === "el-GR" ? "Greek" : "English"} to add a product...`,
      );
    } catch (error) {
      console.error("Speech start error", error);
      setVoiceError("Unable to start listening.");
      setIsListening(false);
    }
  };

  const switchListeningLanguage = (lang: "el-GR" | "en-US") => {
    if (!recognitionRef.current) return;
    pendingLangRef.current = lang;
    setSpeechLang(lang);
    setVoiceMessage(
      `Speak in ${lang === "el-GR" ? "Greek" : "English"} to add a product...`,
    );
    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error("Speech stop error", error);
      pendingLangRef.current = null;
      setVoiceError("Unable to switch language.");
    }
  };

  const handleMicClick = () => {
    if (!isVoiceSupported || !recognitionRef.current) {
      setVoiceError("Voice input is not available.");
      return;
    }

    setVoiceError(null);

    if (!isListening) {
      startListeningWith("el-GR");
      return;
    }

    if (speechLang === "el-GR") {
      switchListeningLanguage("en-US");
      return;
    }

    try {
      pendingLangRef.current = null;
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceMessage("Voice input stopped.");
      setSpeechLang("el-GR");
    } catch (error) {
      console.error("Speech stop error", error);
      setVoiceError("Unable to stop listening.");
    }
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

  const handleClearList = async (list: "shopping" | "offer" | "available") => {
    if (list === "shopping") {
      await Promise.all(
        shoppingList.map((product) =>
          deleteDoc(doc(db, "products", product.id)),
        ),
      );
      setShoppingList([]);
    } else if (list === "offer") {
      await Promise.all(
        offerList.map((product) => deleteDoc(doc(db, "products", product.id))),
      );
      setOfferList([]);
    } else if (list === "available") {
      await Promise.all(
        availableProducts.map((product) =>
          deleteDoc(doc(db, "products", product.id)),
        ),
      );
      setAvailableProducts([]);
    }
  };

  if (loading)
    return (
      <div className="flex h-svh flex-col items-center justify-center">
        <CircularProgress />
      </div>
    );

  if (!user) return <Login />;

  if (!allowedEmails.includes(user.email ?? "")) {
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
        <div className="flex flex-col gap-3 pb-5">
          <div className="flex w-full items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="h-12 w-12">
                <Image
                  src={"/images/productslist.png"}
                  alt="My Super Image"
                  width={50}
                  height={50}
                />
              </span>
              <h1 className="text-xl font-bold">LISTS</h1>
            </span>
            <button
              type="button"
              onClick={handleMicClick}
              disabled={!isVoiceSupported}
              aria-pressed={isListening}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                !isVoiceSupported
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  : !isListening
                    ? "border-gray-300 bg-white text-gray-700"
                    : speechLang === "el-GR"
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-green-400 bg-green-50 text-green-700"
              }`}
              title={
                !isVoiceSupported
                  ? "Voice input not supported"
                  : !isListening
                    ? "Click to listen in Greek"
                    : speechLang === "el-GR"
                      ? "Click to switch to English"
                      : "Click to stop listening"
              }
            >
              <MicIcon fontSize="small" />
              {!isVoiceSupported
                ? "Voice unavailable"
                : !isListening
                  ? "Speak in Greek"
                  : speechLang === "el-GR"
                    ? "Switch to English"
                    : "Stop voice"}
            </button>
          </div>
          {voiceError && (
            <p className="text-sm text-red-600">{voiceError}</p>
          )}
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
              onAddToList={handleAddToList}
              onClearList={handleClearList}
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
              onAddToList={handleAddToList}
              onClearList={handleClearList}
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
          products={filteredProducts.sort((a, b) =>
            a.name.localeCompare(b.name),
          )}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          onClearList={handleClearList}
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

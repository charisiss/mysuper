"use client";

import React, {
  ChangeEvent,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/app/firebaseConfig";
import { VoiceControls } from "@/components/home/VoiceToggleButton";
import { Product } from "@/types/Product";

export type HomeTab = "products" | "shopping" | "offers";

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

interface HomeContextValue {
  availableProducts: Product[];
  shoppingList: Product[];
  offerList: Product[];
  activeTab: HomeTab;
  searchTerm: string;
  modalOpen: boolean;
  currentProduct?: Product;
  sortedAvailableProducts: Product[];
  availableCategories: string[];
  voiceControls: VoiceControls;
  voiceError: string | null;
  voiceMessage: string | null;
  handleAddProduct: () => void;
  handleEditProduct: (product: Product) => void;
  handleDeleteProduct: (
    product: Product,
    fromList: "available" | "shopping" | "offer",
  ) => Promise<void>;
  handleAddToList: (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number,
  ) => Promise<void>;
  handleClearList: (
    list: "shopping" | "offer" | "available",
  ) => Promise<void>;
  handleSaveProduct: (product: Product) => Promise<void>;
  handleCreateCategory: (categoryName: string) => Promise<void>;
  handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTabChange: (tab: HomeTab) => void;
  calculateTotalCost: (products: Product[]) => number;
  closeModal: () => void;
}

const HomeContext = createContext<HomeContextValue | null>(null);

export const useHomeContext = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHomeContext must be used within a HomeProvider");
  }
  return context;
};

const DEFAULT_CATEGORY = "Groceries";

const normalizeString = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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
          Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]) +
          1;
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

const findBestMatchingProduct = (
  query: string,
  products: Product[],
): Product | null => {
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

export const HomeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<Product[]>([]);
  const [offerList, setOfferList] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<HomeTab>("products");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceMessage, setVoiceMessage] = useState<string | null>(null);
  const [speechLang, setSpeechLang] = useState<"el-GR" | "en-US">("el-GR");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const pendingLangRef = useRef<"el-GR" | "en-US" | null>(null);
  const latestListsRef = useRef({
    availableProducts: [] as Product[],
    shoppingList: [] as Product[],
    offerList: [] as Product[],
  });

  useEffect(() => {
    latestListsRef.current = {
      availableProducts,
      shoppingList,
      offerList,
    };
  }, [availableProducts, shoppingList, offerList]);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const products = querySnapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data() as Omit<Product, "id">;
        return {
          ...data,
          category: data.category || DEFAULT_CATEGORY,
          id: docSnapshot.id,
        };
      });

      setAvailableProducts(products.filter((p) => p.fromList === "available"));
      setShoppingList(products.filter((p) => p.fromList === "shopping"));
      setOfferList(products.filter((p) => p.fromList === "offer"));
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetchedCategories = querySnapshot.docs.map((docSnapshot) => {
          const data = docSnapshot.data();
          return data.name as string;
        });
        
        const defaultCategories = [
          "Fruits",
          "Vegetables",
          "Bakery",
          "Dairy",
          "Pantry",
          "Groceries",
        ];
        
        // If no categories exist, initialize with defaults
        if (fetchedCategories.length === 0) {
          const initPromises = defaultCategories.map((name) =>
            addDoc(collection(db, "categories"), {
              name,
              createdAt: new Date(),
            })
          );
          await Promise.all(initPromises);
          setCategories(defaultCategories.sort());
          return;
        }
        
        // Merge defaults with fetched categories, using Set to avoid duplicates
        const allCategories = [
          ...new Set([...defaultCategories, ...fetchedCategories]),
        ].sort();
        
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories on error
        setCategories([
          "Fruits",
          "Vegetables",
          "Bakery",
          "Dairy",
          "Pantry",
          "Groceries",
        ]);
      }
    };

    fetchCategories();
  }, []);

  const calculateTotalCost = useCallback(
    (products: Product[]) =>
      products.reduce((total, product) => {
        const productQuantity = product.quantity || 1;
        return total + product.price * productQuantity;
      }, 0),
    [],
  );

  const handleAddProduct = useCallback(() => {
    setCurrentProduct(undefined);
    setModalOpen(true);
  }, []);

  const handleEditProduct = useCallback((product: Product) => {
    setCurrentProduct(product);
    setModalOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(
    async (
      product: Product,
      fromList: "available" | "shopping" | "offer",
    ) => {
      const updateList = (updater: React.Dispatch<React.SetStateAction<Product[]>>) =>
        updater((prev) => prev.filter((p) => p.id !== product.id));

      if (fromList === "available") {
        updateList(setAvailableProducts);
      } else if (fromList === "shopping") {
        updateList(setShoppingList);
      } else {
        updateList(setOfferList);
      }

      await deleteDoc(doc(db, "products", product.id));
    },
    [],
  );

  const handleSaveProduct = useCallback(
    async (product: Product) => {
      const productWithCategory = {
        ...product,
        category: product.category || DEFAULT_CATEGORY,
      };

      if (currentProduct) {
        if (productWithCategory.id) {
          const { id, ...productData } = productWithCategory;
          await updateDoc(doc(db, "products", id), productData);

          const updateProduct = (prev: Product[]) =>
            prev.map((p) => (p.id === id ? { ...p, ...productData } : p));

          setAvailableProducts(updateProduct);
          setShoppingList(updateProduct);
          setOfferList(updateProduct);
        } else {
          console.error("Product ID is missing");
        }
      } else {
        const { id, ...productData } = productWithCategory;
        const docRef = await addDoc(collection(db, "products"), productData);
        const newProduct = { ...productWithCategory, id: docRef.id };
        setAvailableProducts((prev) => [...prev, newProduct]);
      }

      setCurrentProduct(undefined);
      setModalOpen(false);
    },
    [currentProduct],
  );

  const handleCreateCategory = useCallback(
    async (categoryName: string) => {
      const trimmedName = categoryName.trim();
      if (!trimmedName) return;

      // Check if category already exists
      if (categories.includes(trimmedName)) {
        return;
      }

      try {
        // Check if category exists in database
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const existingCategories = categoriesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return data.name as string;
        });

        if (existingCategories.includes(trimmedName)) {
          // Category exists in DB but not in state, update state
          setCategories((prev) => {
            const updated = [...prev, trimmedName];
            return updated.sort();
          });
          return;
        }

        // Create new category in database
        await addDoc(collection(db, "categories"), {
          name: trimmedName,
          createdAt: new Date(),
        });

        // Update state
        setCategories((prev) => {
          const updated = [...prev, trimmedName];
          return updated.sort();
        });
      } catch (error) {
        console.error("Error creating category:", error);
        throw error;
      }
    },
    [categories],
  );

  const closeModal = useCallback(() => {
    setCurrentProduct(undefined);
    setModalOpen(false);
  }, []);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [],
  );

  const handleTabChange = useCallback((tab: HomeTab) => {
    setActiveTab(tab);
  }, []);

  const handleAddToList = useCallback(
    async (product: Product, listType: "shopping" | "offer", quantity: number) => {
      const productWithCategory = {
        ...product,
        category: product.category || DEFAULT_CATEGORY,
      };
      const setter =
        listType === "shopping" ? setShoppingList : setOfferList;
      const currentList =
        listType === "shopping"
          ? latestListsRef.current.shoppingList
          : latestListsRef.current.offerList;

      const existingProduct = currentList.find((p) => p.id === product.id);

      if (existingProduct) {
        const updatedQuantity =
          existingProduct.quantity ? existingProduct.quantity + quantity : quantity;
        await updateDoc(doc(db, "products", existingProduct.id), {
          quantity: updatedQuantity,
        });

        const updatedProduct = {
          ...existingProduct,
          quantity: updatedQuantity,
        };

        setter((prev) =>
          prev.map((item) => (item.id === existingProduct.id ? updatedProduct : item)),
        );
        return;
      }

      const payload = {
        ...productWithCategory,
        quantity,
        fromList: listType,
      };

      const docRef = await addDoc(collection(db, "products"), payload);
      const productToAdd: Product = {
        ...payload,
        id: docRef.id,
      };

      setter((prev) => [...prev, productToAdd]);
    },
    [],
  );

  const handleAddToListRef = useRef(handleAddToList);

  useEffect(() => {
    handleAddToListRef.current = handleAddToList;
  }, [handleAddToList]);

  const handleClearList = useCallback(
    async (list: "shopping" | "offer" | "available") => {
      if (list === "shopping") {
        await Promise.all(
          shoppingList.map((product) =>
            deleteDoc(doc(db, "products", product.id)),
          ),
        );
        setShoppingList([]);
      } else if (list === "offer") {
        await Promise.all(
          offerList.map((product) =>
            deleteDoc(doc(db, "products", product.id)),
          ),
        );
        setOfferList([]);
      } else {
        await Promise.all(
          availableProducts.map((product) =>
            deleteDoc(doc(db, "products", product.id)),
          ),
        );
        setAvailableProducts([]);
      }
    },
    [availableProducts, offerList, shoppingList],
  );

  const processTranscript = useCallback(async (rawTranscript: string) => {
    const transcript = rawTranscript.trim();
    if (!transcript) {
      setVoiceMessage("No product was heard. Try again.");
      return;
    }

    const combinedProducts: Product[] = dedupeProducts([
      ...latestListsRef.current.availableProducts,
      ...latestListsRef.current.shoppingList,
      ...latestListsRef.current.offerList,
    ]);

    const matchedProduct = findBestMatchingProduct(transcript, combinedProducts);

    if (!matchedProduct) {
      setVoiceMessage(`No product was found for "${transcript}".`);
      return;
    }

    try {
      await handleAddToListRef.current?.(matchedProduct, "shopping", 1);
      setVoiceError(null);
      setVoiceMessage(`"${matchedProduct.name}" was added to the list.`);
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
      // Ignore errors during language switching
      if (pendingLangRef.current) {
        return;
      }
      
      if (event.error === "not-allowed") {
        setVoiceError("Microphone access denied.");
      } else if (event.error === "aborted" || event.error === "network") {
        // These errors are common during language switching, ignore them
        return;
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
        setVoiceError(null);
        
        // Add a small delay before restarting to ensure recognition is ready
        setTimeout(() => {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setSpeechLang(nextLang);
              setIsListening(true);
              setVoiceMessage(
                `Speak in ${nextLang === "el-GR" ? "Greek" : "English"} to add a product...`,
              );
            } catch (error) {
              console.error("Speech restart error", error);
              setVoiceError("Unable to switch language.");
              setIsListening(false);
            }
          }
        }, 100);
        return;
      }
      setIsListening(false);
      setSpeechLang("el-GR");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [processTranscript, speechLang]);

  const startListeningWith = useCallback((lang: "el-GR" | "en-US") => {
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
  }, []);

  const switchListeningLanguage = useCallback((lang: "el-GR" | "en-US") => {
    if (!recognitionRef.current) return;
    pendingLangRef.current = lang;
    setSpeechLang(lang);
    setVoiceError(null);
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
  }, []);

  const handleMicClick = useCallback(() => {
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
  }, [isListening, isVoiceSupported, speechLang, startListeningWith, switchListeningLanguage]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeString(searchTerm);
    if (!normalizedSearch) {
      return availableProducts;
    }

    return availableProducts.filter((product) =>
      [
        normalizeString(product.name),
        normalizeString(product.category || ""),
        normalizeString(product.id),
        product.barcode ? product.barcode.toString() : "",
      ].some((term) => term.includes(normalizedSearch)),
    );
  }, [availableProducts, searchTerm]);

  const sortedAvailableProducts = useMemo(
    () => [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name)),
    [filteredProducts],
  );

  const availableCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const voiceControls = useMemo<VoiceControls>(
    () => ({
      isVoiceSupported,
      isListening,
      speechLang,
      onMicClick: handleMicClick,
    }),
    [handleMicClick, isListening, isVoiceSupported, speechLang],
  );

  const contextValue = useMemo<HomeContextValue>(
    () => ({
      availableProducts,
      shoppingList,
      offerList,
      activeTab,
      searchTerm,
      modalOpen,
      currentProduct,
      sortedAvailableProducts,
      availableCategories,
      voiceControls,
      voiceError,
      voiceMessage,
      handleAddProduct,
      handleEditProduct,
      handleDeleteProduct,
      handleAddToList,
      handleClearList,
      handleSaveProduct,
      handleCreateCategory,
      handleSearchChange,
      handleTabChange,
      calculateTotalCost,
      closeModal,
    }),
    [
      availableProducts,
      shoppingList,
      offerList,
      activeTab,
      searchTerm,
      modalOpen,
      currentProduct,
      sortedAvailableProducts,
      availableCategories,
      voiceControls,
      voiceError,
      voiceMessage,
      handleAddProduct,
      handleEditProduct,
      handleDeleteProduct,
      handleAddToList,
      handleClearList,
      handleSaveProduct,
      handleCreateCategory,
      handleSearchChange,
      handleTabChange,
      calculateTotalCost,
      closeModal,
    ],
  );

  return (
    <HomeContext.Provider value={contextValue}>
      {children}
    </HomeContext.Provider>
  );
};



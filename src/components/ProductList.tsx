import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { Product } from "@/types/Product";
import { IconButton, Checkbox, styled } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import Image from "next/image";
import PlusToCheckIcon from "./PlusToCheckIcon";

interface ProductListProps {
  products: Product[];
  totalCost: number;
  onEdit: (product: Product) => void;
  onDelete: (
    product: Product,
    fromList: "available" | "shopping" | "offer",
  ) => void | Promise<void>;
  onClearList: (
    list: "shopping" | "offer" | "available",
  ) => void | Promise<void>;
  onAddToList: (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number,
  ) => void;
  currentList: "shopping" | "offer" | "available";
  onCheckedCountChange?: (count: number) => void;
}

export interface ProductListHandle {
  clearCheckedItems: () => Promise<void>;
  getCheckedCount: () => number;
}

const CATEGORY_KEYWORDS = [
  { label: "Fruits", keywords: ["apple", "banana", "orange", "berry"] },
  { label: "Vegetables", keywords: ["tomato", "carrot", "lettuce", "pepper"] },
  { label: "Bakery", keywords: ["bread", "baguette", "roll", "bun"] },
  { label: "Dairy", keywords: ["milk", "cheese", "yogurt", "butter"] },
  { label: "Pantry", keywords: ["rice", "pasta", "oil", "sauce"] },
];

const inferCategoryFromName = (productName: string) => {
  const normalizedName = productName.toLowerCase();
  const match = CATEGORY_KEYWORDS.find((category) =>
    category.keywords.some((keyword) => normalizedName.includes(keyword)),
  );

  return match ? match.label : "Groceries";
};

const resolveCategory = (product: Product) => {
  const explicitCategory = product.category?.trim();
  if (explicitCategory) {
    return explicitCategory;
  }
  return inferCategoryFromName(product.name);
};

const RoundedCheckbox = styled(Checkbox)({
  color: "#00d6d6",
  "&.Mui-checked": {
    color: "#00d6d6",
  },
  "& .MuiSvgIcon-root": {
    fontSize: 28,
  },
});

const ProductList = forwardRef<ProductListHandle, ProductListProps>(({
  products,
  totalCost,
  onEdit,
  onDelete,
  onClearList,
  onAddToList,
  currentList,
  onCheckedCountChange,
}, ref) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [checkedProducts, setCheckedProducts] = useState<Set<string>>(
    new Set(),
  );
  const [animatingProducts, setAnimatingProducts] = useState<Set<string>>(
    new Set(),
  );
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Notify parent when checked count changes
  useEffect(() => {
    if (onCheckedCountChange) {
      onCheckedCountChange(checkedProducts.size);
    }
  }, [checkedProducts.size, onCheckedCountChange]);

  // Clean up checked products that no longer exist
  useEffect(() => {
    const productIds = new Set(products.map((p) => p.id));
    setCheckedProducts((prev) => {
      const cleaned = new Set<string>();
      prev.forEach((id) => {
        if (productIds.has(id)) {
          cleaned.add(id);
        }
      });
      return cleaned;
    });
  }, [products]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    clearCheckedItems: async () => {
      if (currentList === "available") return;
      
      const checkedProductIds = Array.from(checkedProducts);
      const deletePromises = checkedProductIds
        .map((productId) => products.find((p) => p.id === productId))
        .filter((product): product is Product => product !== undefined)
        .map((product) => onDelete(product, currentList));
      
      await Promise.all(deletePromises);
      setCheckedProducts(new Set());
    },
    getCheckedCount: () => checkedProducts.size,
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setListModalOpen(false);
      }
    };

    if (listModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [listModalOpen]);


  const handleCheckboxChange = (product: Product) => {
    if (currentList !== "available") {
      setCheckedProducts((prev) => {
        const newCheckedProducts = new Set(prev);
        if (newCheckedProducts.has(product.id)) {
          newCheckedProducts.delete(product.id);
        } else {
          newCheckedProducts.add(product.id);
        }
        return newCheckedProducts;
      });
    } else {
      setSelectedProduct(product);
      setQuantity(1);
      setListModalOpen(true);
    }
  };

  const handleAddToList = (listType: "shopping" | "offer") => {
    if (selectedProduct) {
      onAddToList({ ...selectedProduct, quantity }, listType, quantity);
    }
    setListModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteFromList = (
    otherProduct?: Product,
    otherCurrentList?: "available" | "shopping" | "offer",
  ) => {
    if (otherProduct && otherCurrentList) {
      onDelete(otherProduct, otherCurrentList);
    }
    if (selectedProduct) {
      onDelete(selectedProduct, currentList);
    }
    setListModalOpen(false);
  };

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
      }),
    [],
  );

  const formatPrice = (price: number) => currencyFormatter.format(price);

  const parsePrice = (price: string | number): number => {
    return typeof price === "string" ? parseFloat(price) : price;
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        {products.map((product, index) => {
          const productQuantity = product.quantity || 1;
          const productPrice = parsePrice(product.price);
          const displayPrice = formatPrice(productPrice * productQuantity);
          const isAvailableList = currentList === "available";

          const shouldAnimate = index < 30;
          
          return (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              className={`group flex w-full items-center justify-between rounded-3xl bg-white/90 px-5 py-4 text-left shadow-[0px_0px_6px_0px_rgba(0,_0,_0,_0.1)] transition ${shouldAnimate ? 'animate-fade-up animate-duration-500 animate-ease-out' : ''}`}
              style={shouldAnimate ? {
                animationDelay: `${index * 60}ms`,
                animationFillMode: "backwards",
              } : undefined}
              onClick={() => handleCheckboxChange(product)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleCheckboxChange(product);
                }
              }}
            >
              {isAvailableList ? (
                <>
                  <div className="flex flex-col gap-1">
                    <p className="text-base font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <span className="text-sm text-slate-400">
                      {resolveCategory(product)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {productQuantity > 1 && (
                      <span className="text-xs font-medium text-slate-400">
                        {productQuantity} pcs
                      </span>
                    )}
                    <IconButton
                      onClick={async (e) => {
                        e.stopPropagation();
                        setAnimatingProducts((prev) => new Set(prev).add(product.id));
                        await onAddToList({ ...product, quantity: 1 }, "shopping", 1);
                        // Reset animation after animation completes (0.5s animation + 3s hold = 3.5s)
                        setTimeout(() => {
                          setAnimatingProducts((prev) => {
                            const next = new Set(prev);
                            next.delete(product.id);
                            return next;
                          });
                        }, 3500);
                      }}
                      className="text-gray-400 transition hover:text-primary"
                    >
                      <PlusToCheckIcon
                        active={animatingProducts.has(product.id)}
                      />
                    </IconButton>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center space-x-4">
                    <RoundedCheckbox
                      checked={checkedProducts.has(product.id)}
                      className="!accent-primary !text-primary"
                      icon={
                        <CheckBoxOutlineBlankRoundedIcon
                          sx={{ color: "#00d6d6", fontSize: 28 }}
                          className="!text-primary"
                        />
                      }
                      checkedIcon={
                        <CheckBoxRoundedIcon sx={{ color: "#00d6d6", fontSize: 28 }} />
                      }
                    />
                    <div className="flex flex-col gap-1">
                      <p className="text-base font-semibold text-slate-900">
                        {productQuantity > 1 && `${productQuantity}x `}
                        {product.name}
                      </p>
                      <span className="text-sm font-medium text-slate-600">
                        {displayPrice}
                      </span>
                    </div>
                  </div>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFromList(product, currentList);
                    }}
                    className="text-gray-400 transition hover:text-gray-700"
                  >
                    <ClearIcon />
                  </IconButton>
                </>
              )}
            </div>
          );
        })}
      </div>

      {listModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setListModalOpen(false)}
        >
          <div
            ref={modalRef}
            className="w-80 animate-fade-up rounded-2xl bg-white p-8 animate-duration-500 animate-once animate-ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <span className="flex items-center gap-2">
                <span className="flex flex-col">
                  <h2 className="text-2xl font-bold">{selectedProduct?.name}</h2>
                  <p className="">
                    {selectedProduct != undefined &&
                      formatPrice(parsePrice(selectedProduct.price || 0))}
                    €
                  </p>
                </span>
              </span>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedProduct) {
                    setListModalOpen(false);
                    onEdit(selectedProduct);
                  }
                }}
                className="text-gray-400 transition hover:text-primary"
              >
                <EditIcon />
              </IconButton>
            </div>

            {/* QUANTITY */}
            <div className="mb-4 mt-8 flex items-center justify-center">
            <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-12 rounded-l-lg border border-gray-300 p-2"
              >
                <RemoveIcon />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-12 w-10 border-y border-gray-300 p-2 text-center"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-12 rounded-r-lg border border-gray-300 p-2"
              >
                <AddIcon />
              </button>
              <span className="ml-2.5 flex h-12 w-full items-center justify-center gap-1 rounded-lg border border-gray-300 p-2 text-center">
                <p>Total:</p>
                <p className="font-bold">
                  {formatPrice(
                    parsePrice(selectedProduct?.price || 0) * quantity,
                  )}
                  €
                </p>
              </span>
            </div>

            {/* BUTTONS */}
            <div className="flex w-full flex-col gap-2">
              <button
                className="w-full rounded-lg border border-primary bg-primary px-4 py-2 font-bold uppercase text-white"
                onClick={() => handleAddToList("shopping")}
              >
                ADD TO SHOPPING
              </button>
              <button
                className="w-full rounded-lg bg-gray-200 px-4 py-2 font-bold uppercase text-black"
                onClick={() => handleAddToList("offer")}
              >
                ADD TO OFFERS
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
});

ProductList.displayName = "ProductList";

export default ProductList;

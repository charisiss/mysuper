import React, { useState } from "react";
import { Product } from "@/types/Product";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  Modal,
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface ProductListProps {
  products: Product[];
  totalCost: number; // Added total cost prop
  onEdit: (product: Product) => void;
  onDelete: (
    product: Product,
    fromList: "available" | "shopping" | "offer"
  ) => void;
  onMoveToOffers: (product: Product) => void;
  onAddToList: (
    product: Product,
    listType: "shopping" | "offer",
    quantity: number
  ) => void;
  currentList: "shopping" | "offer" | "available"; // Added prop to indicate current list
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  totalCost,
  onEdit,
  onDelete,
  onMoveToOffers,
  onAddToList,
  currentList,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProduct, setSelectedProduct] = useState<null | Product>(null);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [quantity, setQuantity] = useState<number>(1); // State for quantity

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    product: Product
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleEdit = () => {
    if (selectedProduct) {
      onEdit(selectedProduct);
    }
    handleMenuClose();
  };

  const handleCheckboxChange = (product: Product) => {
    if (currentList === "available") {
      // If the product is only in the "Available Products" list, open the modal
      setSelectedProduct(product);
      setQuantity(1); // Reset quantity to 1 when opening the modal
      setListModalOpen(true);
    } else {
      // If the product is in another list, remove it from that list
      onDelete(product, currentList);
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
    listType: "available" | "shopping" | "offer"
  ) => {
    if (selectedProduct) {
      onDelete(selectedProduct, listType);
    }
    setListModalOpen(false);
  };

  // Utility function to format price safely
  const formatPrice = (price: any) => {
    return typeof price === "number" ? price.toFixed(2) : "0.00";
  };

  return (
    <>
      <List>
        {products.map((product) => {
          const productQuantity = product.quantity || 1;
          return (
            <ListItem key={product.id}>
              <Checkbox
                edge="start"
                checked={currentList !== "available"} // Checkbox is checked if not in "available" list
                onChange={() => handleCheckboxChange(product)}
              />
              <ListItemText
                primary={
                  <>
                    {product.name}{" "}
                    {productQuantity > 1 && `x${productQuantity}`}
                  </>
                }
                secondary={`Τιμή: ${formatPrice(
                  product.price * productQuantity
                )}€`}
              />
              {currentList !== "shopping" && currentList !== "offer" && (
                <IconButton
                  edge="end"
                  onClick={(event) => handleMenuOpen(event, product)}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem
                  onClick={() => {
                    if (selectedProduct) {
                      const fromList =
                        products.find((p) => p.id === selectedProduct.id)
                          ?.fromList || "available";
                      handleDeleteFromList(fromList);
                    }
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </ListItem>
          );
        })}
      </List>

      {currentList !== "available" && (
        <Typography variant="h6" sx={{ marginTop: 2 }}>
          Σύνολο: {formatPrice(totalCost)}€
        </Typography>
      )}

      <Modal open={listModalOpen} onClose={() => setListModalOpen(false)}>
        <Box
          sx={{
            padding: 4,
            backgroundColor: "white",
            margin: "auto",
            marginTop: "10%",
            borderRadius: 2,
            width: 300,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {selectedProduct?.name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Τιμή: {formatPrice(selectedProduct?.price || 0)}€
          </Typography>
          <Typography variant="body1" gutterBottom>
            Συνολικό Κόστος:
            {formatPrice((selectedProduct?.price || 0) * quantity)}€
          </Typography>
          <div className="flex justify-center">
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
              <IconButton
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                type="number"
                variant="outlined"
                margin="normal"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                inputProps={{ min: 1 }}
                sx={{ width: 80, textAlign: "center" }}
              />
              <IconButton
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Increase quantity"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </div>
          <div className="flex gap-2.5 mt-5">
            <button
              className="bg-[#00d6d6] px-2 py-3 h-full w-full rounded-lg uppercase text-md text-white font-bold"
              onClick={() => handleAddToList("shopping")}
            >
              ΑΓΟΡΕΣ
            </button>
            <button
              className="text-black border h-full py-3 border-[#00d6d6] px-2 w-full rounded-lg uppercase text-md font-medium"
              onClick={() => handleAddToList("offer")}
            >
              ΠΡΟΣΦΟΡΕΣ
            </button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default ProductList;

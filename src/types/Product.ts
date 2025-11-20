export interface Product {
  barcode: number;
  id: string;
  name: string;
  price: number;
  category?: string;
  fromList: "available" | "shopping" | "offer";
  quantity?: number;
}

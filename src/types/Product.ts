export interface Product {
  barcode: number;
  id: string;
  name: string;
  fullName?: string;
  price: number;
  category?: string;
  fromList: "available" | "shopping" | "offer";
  quantity?: number;
}

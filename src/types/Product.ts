export interface Product {
  barcode: number;
  id: string;
  name: string;
  price: number;
  fromList: "available" | "shopping" | "offer";
  quantity?: number;
}

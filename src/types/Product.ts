export interface Product {
  id: number;
  name: string;
  price: number;
  fromList: "available" | "shopping" | "offer";
  quantity?: number;
}

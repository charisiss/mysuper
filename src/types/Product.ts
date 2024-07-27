export interface Product {
  id: string;
  name: string;
  price: number;
  fromList: "available" | "shopping" | "offer";
  quantity?: number;
}

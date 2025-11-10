import { components } from "./api-types";

// export type Product = components["schemas"]["Product"];

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  images: string[];
  description: string;
  category: string;
  brand: string;
  // screenType: string;
  // screenSize: string;
  // storageOptions: string[];
  rating: number;
  stock: number;
  sold: number;
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductSpec {
  name: string;
  value: string;
}

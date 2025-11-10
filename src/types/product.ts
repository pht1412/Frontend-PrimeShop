
export interface ProductCardType {
  slug: string;
  name: string;
  brand: string;
  price: number;
  discountPrice: number;
  isDiscounted: boolean;
  discountPercent: number;
  imageUrl: string;
  sold: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  discountPrice: number;
  isDiscounted: boolean;
  discountPercent: number;
  imageUrl: string[];
  imageUrls: string[];
  description: string;
  category: string;
  brand: string;
  rating: number;
  stock: number;
  sold: number;
  specs: ProductSpecs[];
  seller: SellerProfile;
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductSpecs {
  name: string;
  value: string;
}

export interface SellerProfile {
  id: string;
  shopName: string;
  identityCard: string;
  phone: string;
  description: string;
  status: String;
}

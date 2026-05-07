export type ApiList<T> = { pagenation?: { currentPage: number; limit: number; totalPages: number; next?: number; prev?: number }; length: number; data: T[] };
export type ApiSingle<T> = { data: T };
export type Category = { _id: string; name: string; image?: string };
export type Subcategory = { _id: string; name: string; image?: string; category?: string | Category };
export type Product = {
  _id: string; name: string; description?: string; category?: string | Category; subcategory?: string | Subcategory; price: number; discount?: number;
  priceAfterDiscount?: number; quantity?: number; sold?: number; rateAvg?: number; rating?: number; cover?: string; images?: string[]; createdAt?: string; reviews?: Review[];
};
export type Review = { _id: string; comment: string; rate: number; user?: { name?: string; _id?: string; username?: string; image?: string }; product?: string; createdAt?: string };
export type User = { _id: string; username: string; name: string; email: string; role?: string; active?: boolean; image?: string; hasPassword?: boolean; googleId?: string; address?: Address[]; wishlist?: Product[] | string[] };
export type Address = { _id: string; street: string; city: string; state: string; zip: string };
export type Cart = { items: { product: Pick<Product, '_id' | 'name' | 'cover' | 'quantity'>; price: number; quantity: number }[]; totelPrice: number; taxPrice?: number; totelPriceAfterDiscount?: number; user?: string };
export type Order = {
  _id: string;
  items: Cart["items"];
  itemsPrice: number;
  taxPrice: number;
  totalPrice: number;
  address?: Address;
  createdAt?: string;
};

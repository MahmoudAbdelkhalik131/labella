import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { ApiSingle, Cart, Product } from "@/services/types";
import { useAuth } from "./AuthContext";

type ShopValue = { cartCount: number; wishlistIds: Set<string>; cartPulse: boolean; addToCart: (p: Product, quantity?: number) => Promise<void>; toggleWishlist: (p: Product) => Promise<void>; refreshWishlist: () => Promise<void>; refreshCart: () => Promise<void> };
const ShopContext = createContext<ShopValue | null>(null);
export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth();
  const [cartCount, setCartCount] = useState(0); const [cartPulse, setCartPulse] = useState(false); const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const requireLogin = () => { if (!isAuthed) { toast.info("Please log in to continue"); return false; } return true; };
  const refreshCart = async () => { if (!isAuthed) return; try { const cart = await api.get<Cart>("/cart"); setCartCount(cart.items?.reduce((s, i) => s + i.quantity, 0) || 0); } catch { /* handled */ } };
  const refreshWishlist = async () => { if (!isAuthed) return; try { const res = await api.get<{ data: Product[] }>("/wishlist"); setWishlistIds(new Set((res.data || []).map((p) => p._id))); } catch { /* handled */ } };
  const addToCart = async (p: Product, quantity = 1) => { if (!requireLogin()) return; await api.post<ApiSingle<Cart>>("/cart/add", { productId: p._id, quantity }); setCartCount((c) => c + quantity); setCartPulse(true); window.setTimeout(() => setCartPulse(false), 500); toast.success("Added to cart"); };
  const toggleWishlist = async (p: Product) => { if (!requireLogin()) return; const next = new Set(wishlistIds); if (next.has(p._id)) { await api.del(`/wishlist/${p._id}`); next.delete(p._id); toast("Removed from wishlist"); } else { await api.post("/wishlist", { productId: p._id }); next.add(p._id); toast.success("Saved to wishlist"); } setWishlistIds(next); };
  const value = useMemo(() => ({ cartCount, wishlistIds, cartPulse, addToCart, toggleWishlist, refreshWishlist, refreshCart }), [cartCount, wishlistIds, cartPulse, isAuthed]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
export const useShop = () => { const ctx = useContext(ShopContext); if (!ctx) throw new Error("useShop must be used inside ShopProvider"); return ctx; };

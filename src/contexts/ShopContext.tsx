import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ApiSingle, Cart, Product } from "@/services/types";
import { useAuth } from "./AuthContext";

type ShopValue = { 
  cartCount: number; 
  wishlistIds: Set<string>; 
  cartPulse: boolean; 
  addToCart: (p: Product, quantity?: number) => void; 
  toggleWishlist: (p: Product) => void; 
  refreshWishlist: () => Promise<void>; 
  refreshCart: () => Promise<void> 
};
const ShopContext = createContext<ShopValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { isAuthed } = useAuth();
  const queryClient = useQueryClient();
  const [cartPulse, setCartPulse] = useState(false);

  // Fetch Cart and Wishlist using React Query
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get<{ data: Cart }>("/cart"),
    enabled: isAuthed,
  });

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => api.get<{ data: Product[] }>("/wishlist"),
    enabled: isAuthed,
  });

  const cartCount = useMemo(() => {
    return cartQuery.data?.data?.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  }, [cartQuery.data]);

  const wishlistIds = useMemo(() => {
    return new Set((wishlistQuery.data?.data || []).map((p) => p._id));
  }, [wishlistQuery.data]);

  const requireLogin = () => {
    if (!isAuthed) {
      toast.info("Please log in to continue");
      return false;
    }
    return true;
  };

  // Mutations
  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.post<ApiSingle<Cart>>("/cart/add", { productId, quantity }),
    onMutate: async ({ quantity }) => {
      // Optimistic Feedback
      setCartPulse(true);
      window.setTimeout(() => setCartPulse(false), 500);
      toast.success("Added to cart");

      // We could manually update the ["cart"] cache here if we wanted even more detail,
      // but for now, the Navbar badge is what matters most for global reactivity.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: () => {
      toast.error("Failed to add to cart");
    }
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: ({ productId, action }: { productId: string; action: "add" | "remove" }) =>
      action === "add" 
        ? api.post("/wishlist", { productId }) 
        : api.del(`/wishlist/${productId}`),
    onMutate: async ({ productId, action }) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData<{ data: Product[] }>(["wishlist"]);

      // Optimistically update the cache
      queryClient.setQueryData<{ data: Product[] }>(["wishlist"], (old) => {
        if (!old) return old;
        if (action === "add") {
          // This is a bit tricky since we don't have the full Product object here, 
          // but for wishlistIds Set (the reactive part), we just need the list of IDs.
          // In a real app, we'd pass the whole product.
          return { ...old, data: [...old.data, { _id: productId } as Product] };
        } else {
          return { ...old, data: old.data.filter(p => p._id !== productId) };
        }
      });

      if (action === "add") toast.success("Saved to wishlist");
      else toast("Removed from wishlist");

      return { previousWishlist };
    },
    onError: (err, variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    }
  });

  const addToCart = (p: Product, quantity = 1) => {
    if (!requireLogin()) return;
    addToCartMutation.mutate({ productId: p._id, quantity });
  };

  const toggleWishlist = (p: Product) => {
    if (!requireLogin()) return;
    const action = wishlistIds.has(p._id) ? "remove" : "add";
    toggleWishlistMutation.mutate({ productId: p._id, action });
  };

  const value = useMemo(() => ({
    cartCount,
    wishlistIds,
    cartPulse,
    addToCart,
    toggleWishlist,
    refreshWishlist: async () => { await queryClient.invalidateQueries({ queryKey: ["wishlist"] }); },
    refreshCart: async () => { await queryClient.invalidateQueries({ queryKey: ["cart"] }); }
  }), [cartCount, wishlistIds, cartPulse, isAuthed]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
};

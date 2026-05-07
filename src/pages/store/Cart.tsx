import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { api } from "@/services/api";
import type { Cart as CartType } from "@/services/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/storefront/StoreUi";
import { money } from "@/components/storefront/ProductCard";
import { toast } from "sonner";

import { useShop } from "@/contexts/ShopContext";
import { useTranslation } from "@/locales/TranslationContext";

export default function Cart() {
  const { t } = useTranslation();
  const { refreshCart } = useShop();
  const queryClient = useQueryClient();
  
  const cart = useQuery({ 
    queryKey: ["cart"], 
    queryFn: () => api.get<{ data: CartType }>("/cart") 
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      api.patch("/cart/update", { productId, quantity }),
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<{ data: CartType }>(["cart"]);

      queryClient.setQueryData<{ data: CartType }>(["cart"], (old) => {
        if (!old?.data?.items) return old;
        const items = old.data.items.map((i: any) => 
          i.product._id === productId ? { ...i, quantity } : i
        );
        const totelPrice = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
        return { ...old, data: { ...old.data, items, totelPrice } };
      });

      return { previousCart };
    },
    onSuccess: () => {
      refreshCart();
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to update quantity");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => api.patch("/cart/remove", { productId }),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<{ data: CartType }>(["cart"]);

      queryClient.setQueryData<{ data: CartType }>(["cart"], (old) => {
        if (!old?.data?.items) return old;
        const items = old.data.items.filter((i: any) => i.product._id !== productId);
        const totelPrice = items.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
        return { ...old, data: { ...old.data, items, totelPrice } };
      });

      toast("Removed from cart");
      return { previousCart };
    },
    onSuccess: () => {
      refreshCart();
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const clearMutation = useMutation({
    mutationFn: () => api.del("/cart"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData<{ data: CartType }>(["cart"]);
      queryClient.setQueryData(["cart"], { data: { items: [], totelPrice: 0 } });
      return { previousCart };
    },
    onSuccess: () => {
      refreshCart();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    }
  });

  const c = cart.data?.data;
  if (!c?.items?.length) return (
    <div className="section-shell py-16">
      <EmptyState 
        title={t.cart.empty} 
        text={t.cart.empty_desc} 
        action={<Button asChild variant="hero"><Link to="/shop">{t.cart.continue}</Link></Button>} 
      />
    </div>
  );

  return (
    <div className="section-shell py-10">
      <h1 className="mb-8 text-5xl font-bold text-secondary">{t.cart.title}</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {c.items.map(i => (
            <div key={i.product._id} className="grid grid-cols-[80px_1fr] gap-4 rounded-2xl glass-panel p-4 md:grid-cols-[96px_1fr_auto]">
              <img src={i.product.cover || "/placeholder.svg"} alt={i.product.name} className="h-24 w-24 rounded-xl object-contain bg-muted/20" />
              <div>
                <h3 className="font-bold text-secondary">{i.product.name}</h3>
                <p className="text-muted-foreground">{money(i.price)} {t.cart.each}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="glass" size="sm" onClick={() => updateMutation.mutate({ productId: i.product._id, quantity: Math.max(1, i.quantity - 1) })}>-</Button>
                  <span>{i.quantity}</span>
                  <Button variant="glass" size="sm" onClick={() => updateMutation.mutate({ productId: i.product._id, quantity: i.quantity + 1 })}>+</Button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <strong>{money(i.price * i.quantity)}</strong>
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(i.product._id)}><Trash2 /></Button>
              </div>
            </div>
          ))}
        </div>
        <aside className="h-fit rounded-2xl glass-panel p-6">
          <h2 className="mb-4 text-2xl font-bold text-secondary">{t.cart.summary}</h2>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span>{t.cart.subtotal}</span><b>{money(c.totelPrice)}</b></p>
            <p className="flex justify-between"><span>{t.cart.tax}</span><b>{money(c.taxPrice || c.totelPrice * 0.07)}</b></p>
            {c.totelPriceAfterDiscount && <p className="flex justify-between"><span>{t.cart.discount_total}</span><b>{money(c.totelPriceAfterDiscount)}</b></p>}
            <p className="flex justify-between border-t border-border pt-3 text-lg"><span>{t.cart.total}</span><b>{money(c.totelPriceAfterDiscount || ((c.totelPrice || 0) + (c.taxPrice || 0)))}</b></p>
          </div>
          <Button asChild variant="hero" className="mt-6 w-full"><Link to="/checkout">{t.cart.checkout}</Link></Button>
          <Button variant="glass" className="mt-3 w-full" onClick={() => clearMutation.mutate()}>{t.cart.clear}</Button>
        </aside>
      </div>
    </div>
  );
}


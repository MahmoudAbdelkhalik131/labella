import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/services/types";
import { useShop } from "@/contexts/ShopContext";

export const money = (n?: number) => typeof n === "number" ? new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(n) : "—";
export function Stars({ value = 0, count }: { value?: number; count?: number }) { return <div className="flex items-center gap-1 text-xs text-muted-foreground">{[1,2,3,4,5].map((i)=><Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/40")} />)}<span className="ml-1">{value?.toFixed?.(1) || "0.0"}{count ? ` (${count})` : ""}</span></div>; }
export function ProductCard({ product, onQuickView }: { product: Product; onQuickView?: (product: Product) => void }) {
  const { addToCart, toggleWishlist, wishlistIds } = useShop(); const sale = product.priceAfterDiscount && product.priceAfterDiscount < product.price; const wished = wishlistIds.has(product._id); const out = product.quantity === 0;
  return <article className="group relative overflow-hidden rounded-2xl glass-panel transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
    <Link to={`/products/${product._id}`} className="block overflow-hidden bg-muted aspect-[4/5]"><img src={product.cover || product.images?.[0] || "/placeholder.svg"} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></Link>
    {sale && <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">Sale</span>}
    {out && <span className="absolute inset-x-4 top-1/3 rounded-xl bg-secondary/85 py-2 text-center text-sm font-semibold text-secondary-foreground backdrop-blur">Out of Stock</span>}
    <Button aria-label="Toggle wishlist" variant="glass" size="icon" className={cn("absolute right-3 top-3 rounded-full", wished && "animate-heart text-secondary")} onClick={() => toggleWishlist(product)}><Heart className={cn(wished && "fill-current")} /></Button>
    <div className="space-y-3 p-4"><div><Link to={`/products/${product._id}`} className="line-clamp-2 font-semibold text-foreground hover:text-secondary">{product.name}</Link><Stars value={product.rateAvg} count={product.rating} /></div><div className="flex items-end justify-between gap-3"><div className="flex flex-wrap items-baseline gap-2"><span className="font-bold text-secondary">{money(product.priceAfterDiscount || product.price)}</span>{sale && <span className="text-sm text-muted-foreground line-through">{money(product.price)}</span>}</div><div className="flex gap-2"><Button variant="glass" size="icon" aria-label="Quick view" onClick={() => onQuickView?.(product)}><Eye /></Button><Button variant="default" size="icon" aria-label="Add to cart" disabled={out} onClick={() => addToCart(product)}><ShoppingBag /></Button></div></div></div>
  </article>;
}

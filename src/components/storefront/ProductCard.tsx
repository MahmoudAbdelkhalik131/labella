import { memo } from "react";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/services/types";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/locales/TranslationContext";
import { api } from "@/services/api";

export const money = (n?: number) => typeof n === "number" ? new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(n) : "—";
export const Stars = memo(({ value = 0, count }: { value?: number; count?: number }) => { return <div className="flex items-center gap-1 text-xs text-muted-foreground">{[1,2,3,4,5].map((i)=><Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(value) ? "fill-accent text-accent" : "text-muted-foreground/40")} />)}<span className="ml-1">{value?.toFixed?.(1) || "0.0"}{count ? ` (${count})` : ""}</span></div>; });
export const ProductCard = memo(({ product, onQuickView }: { product: Product; onQuickView?: (product: Product) => void }) => {
  const { t, isAr }=useTranslation(); 
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlistIds } = useShop(); 
  const isAdminArea = user?.role === "admin" || user?.role === "employee";
  const sale = product.priceAfterDiscount && product.priceAfterDiscount < product.price; 
  const wished = wishlistIds.has(product._id); 
  const out = product.quantity === 0;
  
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl glass-panel hover:shadow-glow-lg border border-white/5"
    >
      <Link to={`/products/${product._id}`} className="block overflow-hidden bg-muted/30 aspect-[4/5]">
        <motion.img 
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.6 }}
          src={api.imgUrl(product.cover || product.images?.[0])} 
          alt={product.name} 
          loading="lazy" 
          decoding="async" 
          className="h-full w-full object-contain p-4" 
        />
      </Link>
      
      {sale && (
        <motion.span 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute left-3 top-3 rounded-full bg-accent/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground backdrop-blur-sm z-10"
        >
          {isAr ? "خصم" : "Sale"}
        </motion.span>
      )}
      
      {out && (
        <div className="absolute inset-x-4 top-1/3 z-20 rounded-xl bg-secondary/90 py-2 text-center text-sm font-semibold text-secondary-foreground backdrop-blur-md shadow-xl border border-white/10">
          {t.product.out_stock}
        </div>
      )}
      
      {!isAdminArea && (
        <Button 
          aria-label="Toggle wishlist" 
          variant="glass" 
          size="icon" 
          className={cn("absolute right-3 top-3 z-10 rounded-full transition-all duration-300", wished ? "bg-white/20 text-red-500" : "bg-white/10")} 
          onClick={() => toggleWishlist(product)}
        >
          <Heart className={cn("w-5 h-5 transition-all duration-300", wished && "fill-current scale-110")} />
        </Button>
      )}

      <div className="space-y-3 p-4">
        <div className="min-h-[60px]">
          <Link to={`/products/${product._id}`} className="line-clamp-2 text-sm font-bold text-foreground hover:text-secondary transition-colors leading-tight">
            {product.name}
          </Link>
          <div className="mt-1">
            <Stars value={product.rateAvg} count={product.rating} />
          </div>
        </div>
        
        <div className="flex items-end justify-between gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-col">
            {sale && <span className="text-[10px] text-muted-foreground line-through opacity-70">{money(product.price)}</span>}
            <span className="font-bold text-secondary text-lg">{money(product.priceAfterDiscount || product.price)}</span>
          </div>
          
          <div className="flex gap-2">
            <motion.div whileTap={{ scale: 0.9 }} className="hidden md:block">
              <Button variant="glass" size="icon" className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10" aria-label="Quick view" onClick={() => onQuickView?.(product)}>
                <Eye className="w-4 h-4" />
              </Button>
            </motion.div>
            {!isAdminArea && (
              <motion.div whileTap={{ scale: 0.9 }} className="hidden md:block">
                <Button variant="default" size="icon" className="w-9 h-9 rounded-xl shadow-lg" aria-label="Add to cart" disabled={out} onClick={() => addToCart(product)}>
                  <ShoppingBag className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
});


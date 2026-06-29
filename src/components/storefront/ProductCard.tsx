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

export const money = (n?: number) => typeof n === "number" ? new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(n) : "—";
export const Stars = memo(({ value = 0, count }: { value?: number; count?: number }) => {
  return (
    <div className="flex items-center gap-1 text-xs text-black">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => {
          if (i <= Math.floor(value)) {
            return (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
              />
            );
          } else if (i - 1 < value) {
            const percentage = (value - Math.floor(value)) * 100;
            return (
              <div key={i} className="relative h-3.5 w-3.5">
                <Star className="absolute top-0 left-0 h-3.5 w-3.5 text-black/20" />
                <div
                  className="absolute top-0 left-0 overflow-hidden h-full"
                  style={{ width: `${percentage}%` }}
                >
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 max-w-none" />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className="h-3.5 w-3.5 text-black/20"
              />
            );
          }
        })}
      </div>
      <span className="ml-1 font-medium">
        {value?.toFixed?.(1) || "0.0"}
        {count ? ` (${count})` : ""}
      </span>
    </div>
  );
});
export const ProductCard = memo(({ product, onQuickView, noAnimate }: { product: Product; onQuickView?: (product: Product) => void; noAnimate?: boolean }) => {
  const { t, isAr }=useTranslation(); 
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlistIds } = useShop(); 
  const isAdminArea = user?.role === "admin" || user?.role === "employee";
  const sale = product.priceAfterDiscount && product.priceAfterDiscount < product.price; 
  const wished = wishlistIds.has(product._id); 
  const out = product.quantity === 0;
  
  return (
    <motion.article 
      layout={!noAnimate}
      initial={noAnimate ? undefined : { opacity: 0, y: 20 }}
      whileInView={noAnimate ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-md"
    >
      <Link to={`/products/${product._id}`} className="block overflow-hidden aspect-[4/5] flex items-center justify-center p-4">
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6 }}
          src={api.imgUrl(product.cover || product.images?.[0])} 
          alt={product.name} 
          loading="lazy" 
          decoding="async" 
          className="h-full w-full object-contain mix-blend-multiply" 
        />
      </Link>
      
      {sale && (
        <span 
          className="absolute left-3 top-3 rounded-sm bg-green-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white z-10"
        >
          {"SALE"}
        </span>
      )}
      
      {out && (
        <div className="absolute inset-x-4 top-1/3 z-20 rounded-xl bg-secondary/90 py-2 text-center text-sm font-semibold text-secondary-foreground backdrop-blur-md shadow-xl border border-white/10">
          {t.product.out_stock}
        </div>
      )}
      
      {!isAdminArea && (
        <Button 
          aria-label="Toggle wishlist" 
          variant="ghost" 
          size="icon" 
          className={cn("absolute right-2 top-2 z-10 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100", wished ? "text-red-500 opacity-100" : "text-black hover:text-black")} 
          onClick={() => toggleWishlist(product)}
        >
          <Heart className={cn("w-5 h-5 transition-all duration-300", wished && "fill-current scale-110")} />
        </Button>
      )}

      <div className="flex flex-col space-y-1.5 p-4 pt-2 items-start text-start">
        <Link to={`/products/${product._id}`} className="line-clamp-2 text-sm font-extrabold uppercase tracking-widest text-black hover:text-black/70 transition-colors leading-tight w-full">
          {product.name}
        </Link>
        <div className="w-full">
          <Stars value={product.rateAvg} count={product.rating} />
        </div>
        
        <div className="flex items-center gap-2 pt-1 w-full text-black">
          <span className="font-semibold text-sm">{money(product.priceAfterDiscount || product.price)}</span>
          {sale && <span className="text-[10px] text-black/60 line-through">{money(product.price)}</span>}
        </div>
      </div>
    </motion.article>
  );
});


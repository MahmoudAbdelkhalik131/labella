import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Heart, ShoppingBag, Trash2, Clock, CheckCircle, Package } from "lucide-react";
import { api } from "@/services/api";
import type { ApiList, ApiSingle, Product, Review } from "@/services/types";
import { Button } from "@/components/ui/button";
import { money, ProductCard, Stars } from "@/components/storefront/ProductCard";
import { ProductSkeletonGrid, SectionTitle } from "@/components/storefront/StoreUi";
import { useShop } from "@/contexts/ShopContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/locales/TranslationContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const { t, isAr } = useTranslation();
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, wishlistIds } = useShop();
  const { isAuthed, user } = useAuth();
  const [main, setMain] = useState("");
  const [comment, setComment] = useState("");
  const [rate, setRate] = useState(5);

  const product = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get<ApiSingle<Product>>(`/products/${id}`)
  });

  const reviews = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.get<ApiList<Review>>(`/products/${id}/reviews`)
  });

  const related = useQuery({
    queryKey: ["related"],
    queryFn: () => api.get<ApiList<Product>>("/products?limit=20")
  });

  const p = product.data?.data;
  const images = useMemo(() => [p?.cover, ...(p?.images || [])].filter(Boolean) as string[], [p]);
  const current = main || images[0] || "/placeholder.svg";

  const rel = useMemo(() => {
    if (!p) return [];
    return (related.data?.data || [])
      .filter(x => x._id !== p._id && (typeof x.category === 'string' ? x.category : x.category?._id) === (typeof p.category === 'string' ? p.category : p.category?._id))
      .slice(0, 4);
  }, [related.data, p]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthed) return toast.info("Please log in to write a review");
    try {
      await api.post(`/products/${id}/reviews`, { comment, rate });
      setComment("");
      toast.success("Review submitted");
      reviews.refetch();
    } catch (err) {
      // Error handled by api.ts
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (confirm(isAr ? "هل أنت متأكد من حذف التقييم؟" : "Are you sure you want to delete this review?")) {
      try {
        await api.del(`/reviews/${reviewId}`);
        toast.success(isAr ? "تم الحذف" : "Review deleted");
        reviews.refetch();
      } catch (err) {
        toast.error("Failed to delete review");
      }
    }
  };

  if (product.isLoading || !p) return <div className="section-shell py-12"><ProductSkeletonGrid count={2} /></div>;

  return (
    <div className="section-shell py-10" dir={isAr ? "rtl" : "ltr"}>
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Gallery */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4"
        >
          <div className="group overflow-hidden rounded-[2.5rem] glass-panel bg-white/40 shadow-warm relative aspect-[4/5] max-h-[500px] lg:max-h-[650px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.img 
                key={current}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                src={api.imgUrl(current)} 
                alt={p.name} 
                className="absolute inset-0 h-full w-full object-contain p-6 transition-transform duration-700 hover:scale-110" 
              />
            </AnimatePresence>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-center">
            {images.map((img, i) => (
              <motion.button 
                key={img} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setMain(img)} 
                className={cn(
                  "h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                  current === img ? "border-secondary shadow-md scale-105" : "border-border/40 hover:border-secondary/40"
                )}
              >
                <img src={api.imgUrl(img)} alt={p.name} className="h-full w-full object-contain bg-white p-2" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center space-y-6"
        >
          <div className="space-y-3">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent/80">Labella / {t.nav.shop}</p>
            <h1 className="text-3xl font-extrabold text-secondary md:text-5xl lg:text-6xl tracking-tight leading-tight">{p.name}</h1>
            <div className="flex items-center gap-4">
              <Stars value={p.rateAvg} count={p.rating} />
              <span className="h-4 w-[1px] bg-border" />
              <span className="text-sm text-muted-foreground">{p.sold || 0} {isAr ? "بيعت" : "sold"}</span>
            </div>
          </div>

          <p className="text-base md:text-lg leading-relaxed text-muted-foreground line-clamp-4 hover:line-clamp-none transition-all duration-300 cursor-default">{p.description}</p>

          <div className="space-y-3">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-secondary">{money(p.priceAfterDiscount || p.price)}</span>
              {p.priceAfterDiscount && p.priceAfterDiscount < p.price && (
                <span className="text-xl text-muted-foreground line-through opacity-50">{money(p.price)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={cn("h-2.5 w-2.5 rounded-full", (p.quantity || 0) > 0 ? "bg-green-500" : "bg-destructive")} />
              <p className="font-bold text-secondary text-sm">
                {(p.quantity || 0) > 0 ? `${p.quantity} ${t.product.in_stock}` : t.product.out_stock}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2">
            <div className="flex h-14 items-center gap-4 rounded-2xl border border-border bg-background/40 px-4 w-fit">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="w-8 text-center text-lg font-bold">{qty}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
            
            <div className="flex flex-1 gap-3">
              <motion.div whileTap={{ scale: 0.95 }} className="flex-[3]">
                <Button variant="hero" size="lg" className="h-14 w-full shadow-glow rounded-2xl text-base md:text-lg" onClick={() => addToCart(p, qty)}>
                  <ShoppingBag className="mr-2 h-5 w-5" /> {t.product.add_cart}
                </Button>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
                <Button variant="glass" size="icon" className="h-14 w-full rounded-2xl border border-border/50" onClick={() => toggleWishlist(p)}>
                  <Heart className={cn("w-6 h-6", wishlistIds.has(p._id) && "fill-current text-red-500")} />
                </Button>
              </motion.div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-border pt-8">
             {[
               { Icon: Clock, label: "Fast Delivery" },
               { Icon: CheckCircle, label: "100% Original" },
               { Icon: Package, label: "Safe Packing" }
             ].map(({ Icon, label }, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.5 + i * 0.1 }}
                 className="text-center"
               >
                 <Icon className="mx-auto mb-2 h-5 w-5 text-accent" />
                 <p className="text-[10px] font-bold uppercase text-muted-foreground">{label}</p>
               </motion.div>
             ))}
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      <section className="mt-24 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <SectionTitle eyebrow="Community" title={t.product.reviews} />
          <div className="mt-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {reviews.data?.data?.map((r, i) => (
                <motion.div 
                  key={r._id} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative rounded-[2rem] glass-panel p-8 shadow-warm transition-all hover:shadow-glow border border-white/5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">{(r.user?.name || "C")[0]}</div>
                      <div>
                        <p className="font-bold text-secondary">{r.user?.name || r.user?.username || "Customer"}</p>
                        <Stars value={r.rate} />
                      </div>
                    </div>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground/90">{r.comment}</p>
                  {(user?.role === 'admin' || user?.role === 'employee' || user?._id === r.user?._id) && (
                    <button onClick={() => deleteReview(r._id)} className="absolute top-8 right-8 text-destructive opacity-0 transition-opacity group-hover:opacity-100">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {(!reviews.data?.data || reviews.data.data.length === 0) && (
              <ScrollReveal>
                <div className="rounded-[2rem] border-2 border-dashed border-border py-20 text-center italic text-muted-foreground bg-muted/5">
                  {isAr ? "كن أول من يكتب تقييماً!" : "Be the first to write a review!"}
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>

        <ScrollReveal direction="left">
          <div className="h-fit space-y-6">
            <form onSubmit={submit} className="rounded-[2.5rem] glass-panel p-8 shadow-warm border border-white/5">
              <h3 className="text-2xl font-bold text-secondary">{t.product.write_review}</h3>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "التقييم" : "Rating"}</label>
                  <select className="mt-2 w-full rounded-2xl border border-input bg-background/50 p-4 font-bold" value={rate} onChange={e => setRate(Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map(x => <option key={x} value={x}>{x} {isAr ? "نجوم" : "stars"}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "تعليقك" : "Comment"}</label>
                  <textarea className="mt-2 min-h-[160px] w-full rounded-2xl border border-input bg-background/50 p-4 text-lg" value={comment} onChange={e => setComment(e.target.value)} placeholder={t.common.review_placeholder} />
                </div>
                <Button className="h-14 w-full text-lg shadow-glow rounded-2xl" size="lg">{t.product.submit}</Button>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </section>

      {/* Related */}
      <section className="mt-24">
        <SectionTitle eyebrow="You might like" title={t.product.related} />
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {rel.map(x => <ProductCard key={x._id} product={x} />)}
        </div>
      </section>
    </div>
  );
}

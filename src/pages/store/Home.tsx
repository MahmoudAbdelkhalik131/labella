import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShieldCheck, RotateCcw, LockKeyhole, ArrowRight } from "lucide-react";
import hero from "@/assets/make-it-real-hero.jpg";
import { api } from "@/services/api";
import type { ApiList, Category, Product } from "@/services/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState, ProductSkeletonGrid, QuickView, SectionTitle } from "@/components/storefront/StoreUi";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "@/locales/TranslationContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { motion } from "framer-motion";

export default function Home() {
  const { t, isAr } = useTranslation();
  const [quick, setQuick] = useState<Product | null>(null);
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<ApiList<Category>>("/categories"),
  });
  const trending = useQuery({
    queryKey: ["products", "trending"],
    queryFn: () => api.get<ApiList<Product>>("/products?sort=-sold&limit=4"),
  });
  const arrivals = useQuery({
    queryKey: ["products", "arrivals"],
    queryFn: () => api.get<ApiList<Product>>("/products?sort=-createdAt&limit=4"),
  });
  const sale = (arrivals.data?.data || []).filter(
    (p) => p.priceAfterDiscount && p.priceAfterDiscount < p.price
  );

  return (
    <>
      <section className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-7"
        >
          <p className="font-semibold uppercase tracking-wider text-secondary">{t.home.hero_eyebrow}</p>
          <h1 className={cn("text-5xl font-extrabold leading-tight text-secondary md:text-7xl", isAr && "font-arabic")}>
            {t.home.hero_title}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">{t.home.hero_desc}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/shop">
                {t.home.shop_now} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg">
              <Link to="/categories">{t.home.explore}</Link>
            </Button>
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-[2rem] bg-blush opacity-70 blur-2xl" />
          <img
            src={hero}
            alt="Labella cosmetics collection"
            width={1600}
            height={960}
            className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-glow"
          />
        </motion.div>
      </section>

      <div className="overflow-hidden border-y border-border bg-secondary py-3 text-secondary-foreground">
        <div className="flex w-max animate-marquee gap-10 text-sm font-semibold uppercase tracking-widest" style={{ willChange: "transform" }}>
          <span>Free Shipping • New Arrivals • Best Sellers • Clean Glow Picks • Free Returns • Secure Payment • </span>
          <span>Free Shipping • New Arrivals • Best Sellers • Clean Glow Picks • Free Returns • Secure Payment • </span>
        </div>
      </div>

      <ScrollReveal>
        <section className="section-shell py-16">
          <SectionTitle eyebrow="Browse" title={t.nav.categories} />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {categories.data?.data?.map((c, i) => (
              <motion.div 
                key={c._id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/shop?category=${c._id}`} className="group block min-w-48 overflow-hidden rounded-2xl glass-panel border border-white/5">
                  <img
                    src={api.imgUrl(c.image, hero)}
                    alt={c.name}
                    loading="lazy"
                    className="h-40 w-full object-cover transition-transform group-hover:scale-110 duration-500"
                  />
                  <div className="p-4 font-bold text-secondary">{c.name}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="section-shell py-10">
          <SectionTitle eyebrow="Loved now" title={t.home.trending}>
            <Button asChild variant="glass">
              <Link to="/shop?sort=-sold">{t.home.view_all}</Link>
            </Button>
          </SectionTitle>
          {trending.isLoading ? (
            <ProductSkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {trending.data?.data?.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={setQuick} />
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="section-shell py-10">
          <SectionTitle eyebrow="Fresh drops" title={t.home.new_arrivals} />
          {arrivals.isLoading ? (
            <ProductSkeletonGrid />
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {arrivals.data?.data?.map((p) => (
                <ProductCard key={p._id} product={p} onQuickView={setQuick} />
              ))}
            </div>
          )}
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="section-shell py-12">
          <div className="rounded-[2rem] bg-plum p-8 text-secondary-foreground shadow-glow md:p-12 border border-white/10 relative overflow-hidden group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="relative z-10"
            >
              <h2 className="text-4xl font-bold">{t.home.offers_title}</h2>
              <p className="mt-3 max-w-2xl opacity-90">{t.home.offers_desc}</p>
              <div className="mt-6">
                {sale[0] ? (
                  <Button asChild variant="gold" size="lg" className="rounded-full px-8 shadow-xl">
                    <Link to={`/products/${sale[0]._id}`}>{t.home.shop_offer}</Link>
                  </Button>
                ) : (
                  <Button asChild variant="gold" size="lg" className="rounded-full px-8 shadow-xl">
                    <Link to="/shop">{t.home.find_offers}</Link>
                  </Button>
                )}
              </div>
            </motion.div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors" />
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="left">
        <section className="section-shell grid gap-4 py-12 md:grid-cols-3">
          {[
            { Icon: ShieldCheck, label: t.home.authentic },
            { Icon: RotateCcw, label: t.home.returns },
            { Icon: LockKeyhole, label: t.home.secure },
          ].map(({ Icon, label }, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="rounded-2xl glass-panel p-6 text-center border border-white/5"
            >
              <Icon className="mx-auto mb-3 h-8 w-8 text-secondary" />
              <h3 className="font-bold text-secondary">{label}</h3>
            </motion.div>
          ))}
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="section-shell py-12">
          <EmptyState
            title={t.home.join_list}
            text={t.home.join_desc}
            action={
              <div className="mx-auto flex max-w-md gap-2">
                <input
                  className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4 h-12"
                  placeholder={t.common.placeholder_email}
                />
                <Button className="h-12 px-8 rounded-xl">{t.common.subscribe}</Button>
              </div>
            }
          />
        </section>
      </ScrollReveal>

      <QuickView product={quick} open={!!quick} onOpenChange={(o) => !o && setQuick(null)} />
    </>
  );
}

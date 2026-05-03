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
        <div className="animate-fade-up space-y-7">
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
        </div>
        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="absolute -inset-4 rounded-[2rem] bg-blush opacity-70 blur-2xl" />
          <img
            src={hero}
            alt="Labella cosmetics collection"
            width={1600}
            height={960}
            className="relative aspect-[5/4] w-full rounded-[2rem] object-cover shadow-glow"
          />
        </div>
      </section>

      <div className="overflow-hidden border-y border-border bg-secondary py-3 text-secondary-foreground">
        <div className="flex w-max animate-marquee gap-10 text-sm font-semibold uppercase tracking-widest" style={{ willChange: "transform" }}>
          <span>Free Shipping • New Arrivals • Best Sellers • Clean Glow Picks • Free Returns • Secure Payment • </span>
          <span>Free Shipping • New Arrivals • Best Sellers • Clean Glow Picks • Free Returns • Secure Payment • </span>
        </div>
      </div>

      <section className="section-shell py-16">
        <SectionTitle eyebrow="Browse" title={t.nav.categories} />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categories.data?.data?.map((c) => (
            <Link key={c._id} to={`/shop?category=${c._id}`} className="group min-w-48 overflow-hidden rounded-2xl glass-panel">
              <img
                src={api.imgUrl(c.image, hero)}
                alt={c.name}
                loading="lazy"
                className="h-40 w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="p-4 font-bold text-secondary">{c.name}</div>
            </Link>
          ))}
        </div>
      </section>

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

      <section className="section-shell py-12">
        <div className="rounded-[2rem] bg-plum p-8 text-secondary-foreground shadow-glow md:p-12">
          <h2 className="text-4xl font-bold">{t.home.offers_title}</h2>
          <p className="mt-3 max-w-2xl opacity-90">{t.home.offers_desc}</p>
          <div className="mt-6">
            {sale[0] ? (
              <Button asChild variant="gold">
                <Link to={`/products/${sale[0]._id}`}>{t.home.shop_offer}</Link>
              </Button>
            ) : (
              <Button asChild variant="gold">
                <Link to="/shop">{t.home.find_offers}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-4 py-12 md:grid-cols-3">
        {[
          [ShieldCheck, t.home.authentic],
          [RotateCcw, t.home.returns],
          [LockKeyhole, t.home.secure],
        ].map(([Icon, label]) => (
          <div key={String(label)} className="rounded-2xl glass-panel p-6 text-center">
            <Icon className="mx-auto mb-3 h-8 w-8 text-secondary" />
            <h3 className="font-bold text-secondary">{String(label)}</h3>
          </div>
        ))}
      </section>

      <section className="section-shell py-12">
        <EmptyState
          title={t.home.join_list}
          text={t.home.join_desc}
          action={
            <div className="mx-auto flex max-w-md gap-2">
              <input
                className="min-w-0 flex-1 rounded-xl border border-input bg-background px-4"
                placeholder={t.common.placeholder_email}
              />
              <Button>{t.common.subscribe}</Button>
            </div>
          }
        />
      </section>

      <QuickView product={quick} open={!!quick} onOpenChange={(o) => !o && setQuick(null)} />
    </>
  );
}

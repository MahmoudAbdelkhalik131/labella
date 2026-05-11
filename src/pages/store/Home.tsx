import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShieldCheck, RotateCcw, LockKeyhole, ArrowRight, Play } from "lucide-react";
import hero from "@/assets/make-it-real-hero.jpg";
import heroVideo from "@/assets/d_c_e_d_a_fba_c_c_mp_.mp4";
import { api } from "@/services/api";
import type { ApiList, Category, Product } from "@/services/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState, ProductSkeletonGrid, QuickView, SectionTitle } from "@/components/storefront/StoreUi";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/locales/TranslationContext";
import { ScrollReveal } from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { t, isAr } = useTranslation();
  const [quick, setQuick] = useState<Product | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const stopAtSeconds = 8.0;

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

  const handleHeroTimeUpdate = () => {
    const video = heroVideoRef.current;
    if (!video) return;
    
    if (video.currentTime >= stopAtSeconds || video.ended) {
      video.pause();
      if (video.currentTime > stopAtSeconds) video.currentTime = stopAtSeconds;
      setIsVideoFinished(true);
    }
  };

  const handleReplay = () => {
    const video = heroVideoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play();
      setIsVideoFinished(false);
    }
  };

  return (
    <>
      <section className="relative w-full h-[calc(100vh-11.25rem)] min-h-[790px] flex items-center overflow-hidden bg-secondary">
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            ref={heroVideoRef}
            src={heroVideo}
            aria-label="Labella cosmetics collection"
            className="h-full w-full object-cover"
            muted
            playsInline
            autoPlay
            preload="auto"
            onTimeUpdate={handleHeroTimeUpdate}
            onEnded={handleHeroTimeUpdate}
          />
          
          {/* Overlays for depth and readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 via-secondary/40 to-transparent z-10" />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={isVideoFinished ? { opacity: 0.3 } : { opacity: 0 }}
            className="absolute inset-0 bg-black z-20 pointer-events-none"
          />
        </div>

        {/* Content Reveal */}
        <div className="section-shell relative z-30 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={isVideoFinished ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl space-y-8"
          >
            <div className="space-y-4">
              <p className="font-semibold uppercase tracking-widest text-accent/90">Beauty that feels like you</p>
              <h1 className={cn("text-5xl font-extrabold leading-tight text-secondary-foreground md:text-8xl", isAr && "font-arabic")}>
                Discover Your True Glow
              </h1>
              <p className="max-w-xl text-xl text-secondary-foreground/80 leading-relaxed">
                Curated makeup, skin rituals, and glow essentials wrapped in a warm luxury shopping experience.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="hero" size="lg" className="rounded-full px-10 h-14 text-lg shadow-glow">
                <Link to="/shop">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg" className="rounded-full px-10 h-14 text-lg">
                <Link to="/categories">Explore Categories</Link>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Replay Button */}
        <AnimatePresence>
          {isVideoFinished && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleReplay}
              className="absolute bottom-10 right-10 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl transition-all hover:bg-white/20 hover:scale-110 border border-white/20 shadow-2xl"
              title="Replay Reveal"
            >
              <RotateCcw className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </section>

      <div className="overflow-hidden border-y border-border bg-background py-4 text-secondary">
        <div className="flex w-max animate-marquee gap-10 text-sm font-semibold uppercase tracking-widest" style={{ willChange: "transform" }}>
          <span>Free Shipping • New Arrivals • Best Sellers • Clean Glow Picks • Free Returns • Secure Payment • </span>
          <span>Free Shipping • New Arrivals • Best Sellers • Clean Glow Picks • Free Returns • Secure Payment • </span>
        </div>
      </div>

      <ScrollReveal className="perf-optimized">
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

      <ScrollReveal className="perf-optimized">
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

      <ScrollReveal className="perf-optimized">
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

      <ScrollReveal className="perf-optimized">
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

      <QuickView product={quick} open={!!quick} onOpenChange={(o) => !o && setQuick(null)} />
    </>
  );
}

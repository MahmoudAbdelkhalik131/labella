import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, Play, ZoomIn, ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import hero from "@/assets/make-it-real-hero.jpg";
import heroVideoLight from "@/assets/d_c_e_d_a_fba_c_c_mp_.mp4";
import heroVideoDark from "@/assets/I_need_the_same_video_but_with.mp4";
import { useTheme } from "next-themes";
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

// Dynamically import all review and result images
const reviewImages = Object.values(
  import.meta.glob("@/assets/Reviews/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { eager: true, import: "default" })
) as string[];

const resultImages = Object.values(
  import.meta.glob("@/assets/Result/*.{png,jpg,jpeg,PNG,JPG,JPEG}", { eager: true, import: "default" })
) as string[];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.98,
    zIndex: 0
  })
};

interface ImageSliderProps {
  images: string[];
  onImageClick: (img: string) => void;
  aspectClass?: string;
  maxWClass?: string;
}

function ImageSlider({ images, onImageClick, aspectClass = "aspect-[3/4]", maxWClass = "max-w-2xl" }: ImageSliderProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [index, isHovered, images.length]);

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[index];

  return (
    <div 
      className={`relative mx-auto w-full flex flex-col items-center bg-card/45 border border-border/40 rounded-[2.5rem] p-6 shadow-warm backdrop-blur-md ${maxWClass}`}
      dir="ltr"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slider Frame */}
      <div 
        onClick={() => onImageClick(currentImage)}
        className={`relative w-full ${aspectClass} overflow-hidden rounded-[1.75rem] cursor-zoom-in bg-black/10 group border border-border/30`}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={currentImage}
            src={currentImage}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 260, damping: 28 },
              opacity: { duration: 0.25 },
              scale: { duration: 0.25 }
            }}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </AnimatePresence>

        {/* Hover zoom icon indicator */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
            className="rounded-full bg-white/10 text-white p-4 backdrop-blur-md border border-white/20 shadow-xl"
          >
            <ZoomIn className="h-6 w-6" />
          </motion.div>
        </div>
      </div>

      {/* Navigation Buttons outside the main card container */}
      <Button
        variant="glass"
        size="icon"
        className="absolute -left-4 md:-left-16 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-border/40 bg-background/50 hover:bg-secondary/15 hover:scale-105 active:scale-95 transition-all shadow-md z-20"
        onClick={(e) => {
          e.stopPropagation();
          handlePrev();
        }}
      >
        <ChevronLeft className="h-5 w-5 text-secondary" />
      </Button>

      <Button
        variant="glass"
        size="icon"
        className="absolute -right-4 md:-right-16 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full border border-border/40 bg-background/50 hover:bg-secondary/15 hover:scale-105 active:scale-95 transition-all shadow-md z-20"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
      >
        <ChevronRight className="h-5 w-5 text-secondary" />
      </Button>

      {/* Dots Page Indicator */}
      <div className="flex gap-2 mt-6">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setDirection(idx > index ? 1 : -1);
              setIndex(idx);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === index ? "w-6 bg-secondary" : "w-2 bg-secondary/35"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { t, isAr } = useTranslation();
  const [quick, setQuick] = useState<Product | null>(null);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const stopAtSeconds = 8.0;

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [activeTab, setActiveTab] = useState<"testimonies" | "achievements">("testimonies");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const videoSrc = mounted && resolvedTheme === "dark" ? heroVideoDark : heroVideoLight;

  useEffect(() => {
    setIsVideoFinished(false);
  }, [videoSrc]);

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
            key={videoSrc}
            ref={heroVideoRef}
            src={videoSrc}
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
                <Link to="/collections">{isAr ? "استكشاف المجموعات" : "Explore Collections"}</Link>
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
              <Play className="h-6 w-6" />
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

      {/* Testimonies & Achievements Section - Replaces the three cards at the end of the page */}
      <ScrollReveal>
        <section className="section-shell py-16 space-y-10 border-t border-border/30">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-secondary/5 p-1.5 border border-border/40 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("testimonies")}
                className={`relative rounded-full px-8 py-3 text-base font-bold transition-all ${
                  activeTab === "testimonies" ? "text-primary-foreground font-semibold" : "text-muted-foreground hover:text-secondary"
                }`}
              >
                {activeTab === "testimonies" && (
                  <motion.div
                    layoutId="active-home-tab"
                    className="absolute inset-0 rounded-full bg-secondary shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{isAr ? "شهادات وآراء العملاء" : "Testimonies"}</span>
              </button>
              
              <button
                onClick={() => setActiveTab("achievements")}
                className={`relative rounded-full px-8 py-3 text-base font-bold transition-all ${
                  activeTab === "achievements" ? "text-primary-foreground font-semibold" : "text-muted-foreground hover:text-secondary"
                }`}
              >
                {activeTab === "achievements" && (
                  <motion.div
                    layoutId="active-home-tab"
                    className="absolute inset-0 rounded-full bg-secondary shadow-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{isAr ? "إنجازاتنا" : "Our Achievements"}</span>
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === "testimonies" ? (
                <motion.div
                  key="testimonies-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.1 }}
                  className="space-y-8 animate-in fade-in duration-100"
                >
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
                      {isAr ? "الشهادات وآراء العملاء" : "Testimonies"}
                    </h2>
                    <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
                      {isAr ? "تجارب حقيقية شاركها من أحبوا منتجاتنا" : "Real experiences shared by those who love our products"}
                    </p>
                  </div>

                  {reviewImages.length > 0 && (
                    <ImageSlider images={reviewImages} onImageClick={setSelectedImage} aspectClass="aspect-[3/4]" maxWClass="max-w-md" />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="achievements-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.1 }}
                  className="space-y-8 animate-in fade-in duration-100"
                >
                  <div className="text-center max-w-3xl mx-auto space-y-4">
                    <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
                      {isAr ? "إنجازاتنا" : "Our Achievements"}
                    </h2>
                    <div className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-accent-foreground bg-accent/20 px-4 py-1.5 rounded-full">
                      <Sparkles className="h-4 w-4 text-accent-foreground" />
                      <span>{isAr ? "أثر حقيقي ملموس" : "Remarkable Product Impact"}</span>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                      {isAr
                        ? "نفخر بتقديم نتائج مثبتة ومميزة. استكشفي التحولات الحقيقية وشاهدي الأثر الرائع لمنتجاتنا على من قاموا بتجربتها بانتظام."
                        : "Showcasing the incredible effect and visible difference our products have on those who tried them. Clean formulas, real skin transformations."}
                    </p>
                  </div>

                  {resultImages.length > 0 && (
                    <ImageSlider images={resultImages} onImageClick={setSelectedImage} aspectClass="aspect-[4/3]" />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </ScrollReveal>

      {/* Image Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-h-[90vh] max-w-[95vw] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white border border-white/10 transition-all hover:bg-black/80 hover:scale-110"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedImage}
                alt="Expanded Preview"
                className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QuickView product={quick} open={!!quick} onOpenChange={(o) => !o && setQuick(null)} />
    </>
  );
}

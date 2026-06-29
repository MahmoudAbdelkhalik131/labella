import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/services/api";
import type { ApiList, Category, Product, Subcategory } from "@/services/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductSkeletonGrid, QuickView, SectionTitle } from "@/components/storefront/StoreUi";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import { motion, AnimatePresence } from "framer-motion";

interface FilterProps {
  t: any;
  categories: Category[];
  subcategories: Subcategory[];
  category: string;
  subcategory: string;
  max: number;
  rating: number;
  onCategoryChange: (cid: string) => void;
  onSubcategoryChange: (sid: string) => void;
  onMaxChange: (val: number) => void;
  onRatingChange: (val: number) => void;
  isAr: boolean;
}

const FiltersContent = ({ 
  t, 
  categories, 
  subcategories,
  category, 
  subcategory, 
  max, 
  rating, 
  onCategoryChange, 
  onSubcategoryChange,
  onMaxChange, 
  onRatingChange 
}: FilterProps) => (
  <div className="space-y-6">
    <div>
      <label className="text-sm font-semibold text-secondary">{t.shop.category}</label>
      <select 
        className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm" 
        value={category} 
        onChange={e => onCategoryChange(e.target.value)}
      >
        <option value="">{t.common.all}</option>
        {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>
    </div>

    {category && (
      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        <label className="text-sm font-semibold text-secondary">{t.shop.subcategory}</label>
        <select 
          className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm" 
          value={subcategory} 
          onChange={e => onSubcategoryChange(e.target.value)}
        >
          <option value="">{t.common.all}</option>
          {subcategories?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>
    )}

    <div>
      <label className="block text-sm font-semibold text-secondary">{t.shop.max_price}: ${max}</label>
      <input 
        className="mt-2 w-full accent-secondary" 
        type="range" 
        min="10" 
        max="5000" 
        step="100"
        value={max} 
        onChange={e => onMaxChange(Number(e.target.value))}
      />
    </div>

    <div>
      <label className="block text-sm font-semibold text-secondary">{t.shop.min_rating}</label>
      <select 
        className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm" 
        value={rating} 
        onChange={e => onRatingChange(Number(e.target.value))}
      >
        <option value="0">{t.shop.any}</option>
        <option value="4">{t.shop.stars_4}</option>
        <option value="3">{t.shop.stars_3}</option>
      </select>
    </div>
  </div>
);

export default function Shop() { 
  const { t, isAr }=useTranslation(); 
  const [params,setParams]=useSearchParams(); 
  const [quick,setQuick]=useState<Product|null>(null); 
  const [max,setMax]=useState(5000); 
  const [rating,setRating]=useState(0); 
  const [showFilters, setShowFilters] = useState(false);
  const [cols, setCols] = useState(typeof window !== "undefined" && window.innerWidth >= 1280 ? 4 : 2);

  useEffect(() => {
    const handleResize = () => setCols(window.innerWidth >= 1280 ? 4 : 2);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sort = params.get("sort") || "-createdAt"; 
  const search = params.get("search") || ""; 
  const category = params.get("category") || ""; 
  const subcategory = params.get("subcategory") || ""; 
  const page = parseInt(params.get("page") || "1", 10);

  const products = useQuery({
    queryKey: ["products", sort, search, category, subcategory, page],
    queryFn: () => {
      const queryParams = new URLSearchParams({
        sort,
        search,
        page: page.toString(),
        limit: "8"
      });
      if (category) queryParams.set("category", category);
      if (subcategory) queryParams.set("subcategory", subcategory);
      return api.get<ApiList<Product>>(`/products?${queryParams.toString()}`);
    },
    placeholderData: keepPreviousData
  }); 

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<ApiList<Category>>("/categories")
  }); 

  const subcategories = useQuery({
    queryKey: ["subcategories", category],
    enabled: !!category,
    queryFn: () => api.get<ApiList<Subcategory>>(`/categories/${category}/subcategories`)
  });

  const filtered = useMemo(() => {
    return (products.data?.data || []).filter(p => {
      const cid = typeof p.category === "string" ? p.category : p.category?._id; 
      const sid = typeof p.subcategory === "string" ? p.subcategory : p.subcategory?._id; 
      return (!category || cid === category) && 
             (!subcategory || sid === subcategory) && 
             ((p.priceAfterDiscount || p.price || 0) <= max) && 
             ((p.rateAvg || 0) >= rating);
    });
  }, [products.data, category, subcategory, max, rating]);

  const handleCategoryChange = (cid: string) => {
    setParams({ sort, search, category: cid, subcategory: "" });
  };

  const handleSubcategoryChange = (sid: string) => {
    setParams({ sort, search, category, subcategory: sid });
  };

  const handlePageChange = (newPage: number) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", newPage.toString());
    setParams(nextParams);
  };

  const sharedFilterProps = {
    t,
    categories: categories.data?.data || [],
    subcategories: subcategories.data?.data || [],
    category,
    subcategory,
    max,
    rating,
    onCategoryChange: handleCategoryChange,
    onSubcategoryChange: handleSubcategoryChange,
    onMaxChange: setMax,
    onRatingChange: setRating,
    isAr
  };

  return (
    <div className="section-shell py-10" dir="rtl">
      <SectionTitle eyebrow={t.nav.shop} title={t.shop.title}>
        <div className="flex items-center gap-2">
          <Button 
            variant="glass" 
            size="sm" 
            className="lg:hidden" 
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t.shop.filters}
          </Button>

          <select 
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm" 
            value={sort} 
            onChange={e => setParams({sort: e.target.value, search, category, subcategory})}
          >
            <option value="-createdAt">{t.shop.sort.newest}</option>
            <option value="-sold">{t.shop.sort.sold}</option>
            <option value="-rateAvg">{t.shop.sort.rate}</option>
            <option value="-price">{t.shop.sort.price_desc}</option>
          </select>
        </div>
      </SectionTitle>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar */}
        <ScrollReveal direction="right" className="hidden lg:block">
          <aside className="h-fit rounded-3xl glass-panel p-6 border border-white/5">
            <h3 className="mb-6 flex items-center gap-2 font-bold text-secondary text-xl">
              <SlidersHorizontal className="h-5 w-5" />
              {t.shop.filters}
            </h3>
            <FiltersContent {...sharedFilterProps} />
          </aside>
        </ScrollReveal>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-secondary/30 backdrop-blur-sm lg:hidden">
            <div className={cn(
              "absolute inset-y-0 w-full max-w-sm bg-background p-6 shadow-warm transition-all duration-300",
              "left-0"
            )}>
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-secondary">{t.shop.filters}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X />
                </Button>
              </div>
              <FiltersContent {...sharedFilterProps} />
              <Button className="mt-8 w-full" onClick={() => setShowFilters(false)}>
                {"إظهار النتائج"}
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {products.isLoading ? (
            <ProductSkeletonGrid count={12} />
          ) : filtered.length === 0 ? (
            <ScrollReveal>
              <div className="rounded-[3rem] border-2 border-dashed border-border py-20 text-center bg-muted/5">
                <p className="text-muted-foreground">{"لا توجد منتجات مطابقة."}</p>
                <Button variant="ghost" className="mt-4" onClick={() => setParams({})}>
                  {"إعادة تعيين"}
                </Button>
              </div>
            </ScrollReveal>
          ) : (
            <motion.div 
              layout
              className={cn(
                "grid grid-cols-2 gap-4 xl:grid-cols-4 transition-opacity duration-300",
                products.isFetching ? "opacity-60" : "opacity-100"
              )}
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => {
                  const row = Math.floor(i / cols);
                  const col = i % cols;
                  const entryDelay = row * 0.25 + col * 0.06;
                  const exitDelay = row * 0.15 + col * 0.04;
                  return (
                    <motion.div
                      key={p._id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ 
                        opacity: 0, 
                        x: -20,
                        transition: { duration: 0.2, delay: exitDelay } 
                      }}
                      transition={{ duration: 0.3, delay: entryDelay }}
                    >
                      <ProductCard product={p} onQuickView={setQuick} noAnimate />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {products.data?.pagenation && (
            <div className="mt-12 flex justify-center gap-2">
              <Button 
                variant="glass" 
                disabled={!products.data.pagenation.prev} 
                onClick={() => handlePageChange(products.data?.pagenation?.prev || 1)}
              >
                {t.common.prev}
              </Button>
              <Button variant="glass" className="bg-primary/20 text-secondary">
                {t.common.page} {products.data.pagenation.currentPage}
              </Button>
              <Button 
                variant="glass" 
                disabled={!products.data.pagenation.next} 
                onClick={() => handlePageChange(products.data?.pagenation?.next || 1)}
              >
                {t.common.next}
              </Button>
            </div>
          )}
        </div>
      </div>

      <QuickView product={quick} open={!!quick} onOpenChange={(o) => !o && setQuick(null)} />
    </div>
  );
}

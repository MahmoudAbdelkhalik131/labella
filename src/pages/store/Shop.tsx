import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";
import { api } from "@/services/api";
import type { ApiList, Category, Product } from "@/services/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductSkeletonGrid, QuickView, SectionTitle } from "@/components/storefront/StoreUi";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";

export default function Shop() { 
  const { t, isAr }=useTranslation(); 
  const [params,setParams]=useSearchParams(); 
  const [quick,setQuick]=useState<Product|null>(null); 
  const [max,setMax]=useState(50000); 
  const [rating,setRating]=useState(0); 
  const [showFilters, setShowFilters] = useState(false);

  const sort = params.get("sort") || "-createdAt"; 
  const search = params.get("search") || ""; 
  const category = params.get("category") || ""; 
  const subcategory = params.get("subcategory") || ""; 

  const products = useQuery({
    queryKey: ["products", sort, search, category, subcategory],
    queryFn: () => api.get<ApiList<Product>>(`/products?sort=${sort}&search=${encodeURIComponent(search)}&page=1&limit=100`)
  }); 

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<ApiList<Category>>("/categories")
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

  const FiltersContent = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-semibold text-secondary">{t.shop.category}</label>
        <select 
          className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm" 
          value={category} 
          onChange={e => setParams({sort, search, category: e.target.value, subcategory})}
        >
          <option value="">{t.common.all}</option>
          {categories.data?.data?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-secondary">{t.shop.max_price}: ${max}</label>
        <input 
          className="mt-2 w-full accent-secondary" 
          type="range" 
          min="10" 
          max="50000" 
          step="100"
          value={max} 
          onChange={e => setMax(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-secondary">{t.shop.min_rating}</label>
        <select 
          className="mt-2 w-full rounded-xl border border-input bg-background p-3 text-sm" 
          value={rating} 
          onChange={e => setRating(Number(e.target.value))}
        >
          <option value="0">{t.shop.any}</option>
          <option value="4">{t.shop.stars_4}</option>
          <option value="3">{t.shop.stars_3}</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="section-shell py-10" dir={isAr ? "rtl" : "ltr"}>
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
        <aside className="hidden h-fit rounded-3xl glass-panel p-6 lg:block">
          <h3 className="mb-6 flex items-center gap-2 font-bold text-secondary text-xl">
            <SlidersHorizontal className="h-5 w-5" />
            {t.shop.filters}
          </h3>
          <FiltersContent />
        </aside>

        {/* Mobile Filter Drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-secondary/30 backdrop-blur-sm lg:hidden">
            <div className={cn(
              "absolute inset-y-0 w-full max-w-sm bg-background p-6 shadow-warm transition-all duration-300",
              isAr ? "left-0" : "right-0"
            )}>
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-secondary">{t.shop.filters}</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                  <X />
                </Button>
              </div>
              <FiltersContent />
              <Button className="mt-8 w-full" onClick={() => setShowFilters(false)}>
                {isAr ? "إظهار النتائج" : "Show Results"}
              </Button>
            </div>
          </div>
        )}

        <div>
          {products.isLoading ? (
            <ProductSkeletonGrid count={12} />
          ) : filtered.length === 0 ? (
            <div className="rounded-[3rem] border-2 border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground">{isAr ? "لا توجد منتجات مطابقة." : "No matching products found."}</p>
              <Button variant="ghost" className="mt-4" onClick={() => setParams({})}>
                {isAr ? "إعادة تعيين" : "Reset Filters"}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {filtered.map(p => <ProductCard key={p._id} product={p} onQuickView={setQuick}/>)}
            </div>
          )}

          <div className="mt-12 flex justify-center gap-2">
            <Button variant="glass" disabled>{t.common.prev}</Button>
            <Button variant="glass" className="bg-primary/20 text-secondary">{t.common.page} 1</Button>
            <Button variant="glass" disabled>{t.common.next}</Button>
          </div>
        </div>
      </div>

      <QuickView product={quick} open={!!quick} onOpenChange={(o) => !o && setQuick(null)} />
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ApiList, Category, Subcategory } from "@/services/types";
import { SectionTitle } from "@/components/storefront/StoreUi";
import { useTranslation } from "@/locales/TranslationContext";

export default function Categories() {
  const { t, isAr } = useTranslation();
  const [active, setActive] = useState<string | null>(null);
  
  const cats = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<ApiList<Category>>("/categories")
  });
  
  const subs = useQuery({
    queryKey: ["subcategories", active],
    enabled: !!active,
    queryFn: () => api.get<ApiList<Subcategory>>(`/categories/${active}/subcategories`)
  });

  return (
    <div className="section-shell py-12">
      <SectionTitle 
        eyebrow={isAr ? "استكشاف" : "Explore"} 
        title={isAr ? "فئات الجمال" : "Beauty Categories"}
      />
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cats.data?.data?.map((c) => (
          <button 
            key={c._id} 
            onClick={() => setActive(c._id)} 
            className="group overflow-hidden rounded-3xl glass-panel text-left transition-all hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="overflow-hidden bg-muted">
              <img 
                src={api.imgUrl(c.image)} 
                alt={c.name} 
                className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <div className="p-6 text-xl font-bold text-secondary">
              {c.name}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-12 rounded-[2rem] glass-panel p-8 shadow-warm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl font-bold text-secondary">
              {cats.data?.data?.find(c => c._id === active)?.name} - {isAr ? "الفئات الفرعية" : "Subcategories"}
            </h3>
            <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-secondary">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {subs.data?.data?.map((s) => (
              <Link 
                key={s._id} 
                to={`/shop?category=${active}&subcategory=${s._id}`} 
                className="rounded-full bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-all hover:bg-secondary/80 hover:shadow-md"
              >
                {s.name}
              </Link>
            ))}
            {subs.data?.data?.length === 0 && (
              <p className="text-muted-foreground italic">
                {isAr ? "لا توجد فئات فرعية حالياً." : "No subcategories found for this category."}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { X } from "lucide-react";

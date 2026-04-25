import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Product } from "@/services/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState, SectionTitle } from "@/components/storefront/StoreUi";
import { useTranslation } from "@/locales/TranslationContext";
export default function Wishlist(){const { t }=useTranslation(); const list=useQuery({queryKey:["wishlist"],queryFn:()=>api.get<{data:Product[]}>("/wishlist")}); const data=list.data?.data||[]; return <div className="section-shell py-10"><SectionTitle eyebrow={t.wishlist.title} title={t.wishlist.title}/>{data.length?<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{data.map(p=><ProductCard key={p._id} product={p}/>)}</div>:<EmptyState title={t.wishlist.empty} text={t.wishlist.empty_desc} action={<Button asChild variant="hero"><Link to="/shop">{t.wishlist.find}</Link></Button>}/>}</div>}

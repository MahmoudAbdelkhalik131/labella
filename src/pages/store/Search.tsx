import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ApiList, Product } from "@/services/types";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState, ProductSkeletonGrid, SectionTitle } from "@/components/storefront/StoreUi";
export default function SearchPage(){const [params]=useSearchParams(); const q=params.get("search")||""; const products=useQuery({queryKey:["search",q],enabled:!!q,queryFn:()=>api.get<ApiList<Product>>(`/products?search=${encodeURIComponent(q)}`)}); return <div className="section-shell py-10"><SectionTitle eyebrow="Search" title={`Results for “${q}”`}/>{products.isLoading?<ProductSkeletonGrid/>:products.data?.data?.length?<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{products.data.data.map(p=><ProductCard key={p._id} product={p}/>)}</div>:<EmptyState title="No glow found" text="Try a different product, shade, or beauty category."/>}</div>}

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { Product } from "@/services/types";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/ProductCard";
import { EmptyState, SectionTitle } from "@/components/storefront/StoreUi";
export default function Wishlist(){const list=useQuery({queryKey:["wishlist"],queryFn:()=>api.get<{data:Product[]}>("/wishlist")}); const data=list.data?.data||[]; return <div className="section-shell py-10"><SectionTitle eyebrow="Saved" title="Wishlist"/>{data.length?<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{data.map(p=><ProductCard key={p._id} product={p}/>)}</div>:<EmptyState title="No favorites yet" text="Tap the heart on products you love." action={<Button asChild variant="hero"><Link to="/shop">Find favorites</Link></Button>}/>}</div>}

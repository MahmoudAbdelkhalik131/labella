import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import type { ApiList, Category, Subcategory } from "@/services/types";
import { SectionTitle } from "@/components/storefront/StoreUi";

export default function Categories(){const [active,setActive]=useState<string|null>(null); const cats=useQuery({queryKey:["categories"],queryFn:()=>api.get<ApiList<Category>>("/categories")}); const subs=useQuery({queryKey:["subcategories",active],enabled:!!active,queryFn:()=>api.get<ApiList<Subcategory>>(`/categories/${active}/subcategories`)}); return <div className="section-shell py-10"><SectionTitle eyebrow="Explore" title="Beauty Categories"/><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cats.data?.data?.map(c=><button key={c._id} onClick={()=>setActive(c._id)} className="overflow-hidden rounded-2xl glass-panel text-left transition hover:-translate-y-1"><img src={c.image||"/placeholder.svg"} alt={c.name} className="h-56 w-full object-cover"/><div className="p-5 text-xl font-bold text-secondary">{c.name}</div></button>)}</div>{active&&<div className="mt-10 rounded-2xl glass-panel p-6"><h3 className="mb-4 text-2xl font-bold text-secondary">Subcategories</h3><div className="flex flex-wrap gap-3">{subs.data?.data?.map(s=><Link key={s._id} to={`/shop?subcategory=${s._id}`} className="rounded-full bg-primary/40 px-4 py-2 font-semibold text-secondary">{s.name}</Link>)}</div></div>}</div>}

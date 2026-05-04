import { Heart, Home as HomeIcon, LayoutDashboard, Menu, Search, ShoppingBag, Store, User, X, Instagram, Facebook, Twitter } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useShop } from "@/contexts/ShopContext";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Layout() { const { t, language, setLanguage }=useTranslation(); const [menu,setMenu]=useState(false); const [q,setQ]=useState(""); const navigate=useNavigate(); const { user, logout }=useAuth(); const { cartCount, wishlistIds, cartPulse }=useShop(); const isAdminArea = user?.role === "admin" || user?.role === "employee"; const submit=(e:React.FormEvent)=>{e.preventDefault(); if(q.trim()) navigate(`/search?search=${encodeURIComponent(q.trim())}`)};
  const nav = [{ to: "/", label: t.nav.home }, { to: "/shop", label: t.nav.shop }, { to: "/categories", label: t.nav.categories }, { to: "/about", label: t.nav.about }];
  return <div className="min-h-screen pb-20 md:pb-0"><header className="sticky top-0 z-40 border-b border-border/60 bg-glass/80 backdrop-blur-md"><div className="section-shell flex h-20 items-center gap-4"><Button variant="ghost" size="icon" className="md:hidden" onClick={()=>setMenu(true)}><Menu/></Button><Link to="/" className="mr-2 font-script text-4xl text-secondary link-focus">Labella</Link><nav className="hidden flex-1 items-center justify-center gap-2 md:flex">{nav.map(n=><NavLink key={n.to} to={n.to} className={({isActive})=>cn("rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary/30", isActive && "bg-primary/40 text-secondary")}>{n.label}</NavLink>)}</nav><form onSubmit={submit} className="hidden max-w-xs flex-1 items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 lg:flex"><Search className="h-4 w-4 text-muted-foreground"/><Input value={q} onChange={(e)=>setQ(e.target.value)} placeholder={t.common.search} className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"/></form><Button variant="glass" size="sm" onClick={()=>setLanguage(language === "EN" ? "AR" : "EN")}>{language}</Button><ThemeToggle />{isAdminArea && (
  <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-secondary" title={language === "AR" ? "لوحة الإدارة" : "Admin"}>
    <Link to="/admin" aria-label="Admin">
      <LayoutDashboard className="h-4 w-4" />
    </Link>
  </Button>
)}<Button asChild variant="glass" size="icon"><Link to="/wishlist" aria-label="Wishlist"><Heart/><span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">{wishlistIds.size}</span></Link></Button><Button asChild variant="glass" size="icon" className={cn(cartPulse && "animate-cart")}><Link to="/cart" aria-label="Cart"><ShoppingBag/><span className="absolute -right-1 -top-1 rounded-full bg-secondary px-1.5 text-[10px] font-bold text-secondary-foreground">{cartCount}</span></Link></Button>{user && <Button variant="ghost" size="sm" onClick={logout} className="hidden md:flex text-muted-foreground hover:text-secondary font-semibold">{t.nav.logout}</Button>}<Button asChild variant="hero" size="sm"><Link to={user ? "/profile" : "/auth/login"}>{user ? user.name?.split(" ")[0] || t.nav.profile : t.nav.login}</Link></Button></div></header>{menu && <div className="fixed inset-0 z-50 bg-secondary/30 backdrop-blur-sm md:hidden"><aside className="h-full w-80 max-w-[86vw] bg-background p-5 shadow-warm"><div className="mb-8 flex items-center justify-between"><span className="font-script text-4xl text-secondary">Labella</span><Button variant="ghost" size="icon" onClick={()=>setMenu(false)}><X/></Button></div><nav className="grid gap-2">
              {nav.map(n=><Link key={n.to} to={n.to} onClick={()=>setMenu(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-primary/30">{n.label}</Link>)}
              {isAdminArea && <Link to="/admin" onClick={()=>setMenu(false)} className="rounded-xl px-4 py-3 font-semibold text-secondary hover:bg-primary/30">{language === "AR" ? "لوحة التحكم" : "Admin Dashboard"}</Link>}
              {user && <button onClick={logout} className="rounded-xl px-4 py-3 text-left font-semibold hover:bg-primary/30">{t.nav.logout}</button>}
            </nav>
          </aside>
        </div>
      }
      <main><Outlet /></main>
      <footer className="mt-20 border-t border-border bg-card/70">
        <div className="section-shell grid gap-8 py-12 md:grid-cols-4">
          <div>
            <h3 className="font-script text-4xl text-secondary">Labella</h3>
            <p className="mt-3 text-sm text-muted-foreground">{language === "AR" ? "مكياج فاخر، عناية بالبشرة، وأدوات للتوهج الذي تختارينه بنفسك." : "Luxurious makeup, skincare, and tools for the glow you make your own."}</p>
          </div>
          {[[t.nav.categories, [t.nav.shop, t.nav.categories, t.home.new_arrivals]], ["Customer Service", ["Free Returns", "Secure Payment", "Support"]], ["Newsletter", []]].map(([h,links],i)=><div key={String(h)}><h4 className="mb-3 font-bold text-secondary">{String(h)}</h4><div className="grid gap-2 text-sm text-muted-foreground">{(links as string[]).map(x=><Link key={x} to="/shop">{x}</Link>)}{i===2 && <><p>{language === "AR" ? "ملاحظات الجمال، العروض، وتنبيهات الإطلاق." : "Beauty notes, offers, and launch alerts."}</p><div className="flex gap-2"><Instagram/><Facebook/><Twitter/></div></>}</div></div>)}
        </div>
        <div className="border-t border-border py-5 text-center text-sm text-muted-foreground">© 2026 Labella. {t.common.all_rights}.</div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-glass/90 py-2 backdrop-blur-md md:hidden">
        {[
          ["/", HomeIcon, t.nav.home],
          ["/shop", Store, t.nav.shop],
          ["/cart", ShoppingBag, t.nav.cart],
          ["/wishlist", Heart, t.nav.wishlist],
          ["/profile", User, t.nav.profile]
        ].map(([to, Icon, label], idx) => (
          <Link key={idx} to={String(to)} className="flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <Icon className="h-5 w-5" />
            {String(label)}
          </Link>
        ))}
      </nav>
    </div>
}


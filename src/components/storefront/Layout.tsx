import {
  Heart,
  Home as HomeIcon,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingBag,
  Store,
  User,
  X,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useShop } from "@/contexts/ShopContext";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";


export function Layout() {
  const { t, language, setLanguage, isAr } = useTranslation();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount, wishlistIds, cartPulse } = useShop();
  const isAdminArea = user?.role === "admin" || user?.role === "employee";
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?search=${encodeURIComponent(q.trim())}`);
  };
  const nav = [
    { to: "/", label: t.nav.home },
    { to: "/shop", label: t.nav.shop },
    { to: "/collections", label: t.nav.categories },
    { to: "/about", label: t.nav.about },
  ];
  return (
    <div className="min-h-screen pb-20 md:pb-0" dir={"rtl"}>
      <header className="sticky top-0 z-40 bg-glass/80 backdrop-blur-md">
        <div className="section-shell flex h-20 items-center justify-between gap-4">
          {/* Right Group (Menu + Title + Nav) */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMenu(true)}
              >
                <Menu />
              </Button>
              <Link
                to="/"
                className="font-script text-3xl md:text-4xl text-secondary link-focus"
              >
                Labella
              </Link>
            </div>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary/30",
                      isActive && "bg-primary/40 text-secondary",
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Middle Group (Search) */}
          <div className="flex-1 flex justify-center max-w-md">
            <form
              onSubmit={submit}
              className="hidden w-full flex-1 items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1.5 lg:flex"
            >
              <Search className="h-4 w-4 text-black" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.common.search}
                className="h-8 border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </form>
          </div>

          {/* Left Group (Icons & Profile) */}
          <div className="flex items-center gap-2">
            {isAdminArea && (
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-secondary"
                title={language === "AR" ? "لوحة الإدارة" : "Admin"}
              >
                <Link to="/admin" aria-label="Admin">
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
              </Button>
            )}
            {!isAdminArea && (
              <>
                <Button asChild variant="glass" size="icon">
                  <Link to="/wishlist" aria-label="Wishlist">
                    <Heart />
                    <span className="absolute -right-1 -top-1 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                      {wishlistIds.size}
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="glass"
                  size="icon"
                  className={cn(cartPulse && "animate-cart")}
                >
                  <Link to="/cart" aria-label="Cart">
                    <ShoppingBag />
                    <span className="absolute -right-1 -top-1 rounded-full bg-secondary px-1.5 text-[10px] font-bold text-secondary-foreground">
                      {cartCount}
                    </span>
                  </Link>
                </Button>
              </>
            )}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="hidden md:flex text-muted-foreground hover:text-secondary font-semibold"
              >
                {t.nav.logout}
              </Button>
            )}
            <Button
              asChild
              variant="hero"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link to={user ? "/profile" : "/auth/login"}>
                {user ? user.name?.split(" ")[0] || t.nav.profile : t.nav.login}
              </Link>
            </Button>
          </div>
        </div>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-secondary/30 backdrop-blur-sm md:hidden">
          <aside className="h-full w-80 max-w-[86vw] bg-background p-5 shadow-warm">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-script text-4xl text-secondary">
                Labella
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMenu(false)}
              >
                <X />
              </Button>
            </div>
            <nav className="grid gap-2">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenu(false)}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-primary/30"
                >
                  {n.label}
                </Link>
              ))}
              {isAdminArea && (
                <Link
                  to="/admin"
                  onClick={() => setMenu(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-secondary hover:bg-primary/30"
                >
                  {language === "AR" ? "لوحة التحكم" : "Admin Dashboard"}
                </Link>
              )}
              {!user && (
                <Link
                  to="/auth/login"
                  onClick={() => setMenu(false)}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-primary/30 text-secondary"
                >
                  {t.nav.login}
                </Link>
              )}
              {user && (
                <button
                  onClick={logout}
                  className="rounded-xl px-4 py-3 text-start font-semibold hover:bg-primary/30 w-full"
                >
                  {t.nav.logout}
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}
      <main>
        <Outlet />
      </main>
      <footer className="mt-20 bg-card/70">
        <div className="section-shell grid gap-8 py-12 md:grid-cols-4">
          <div>
            <h3 className="font-script text-4xl text-secondary">Labella</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              {language === "AR"
                ? " عناية بالبشرة، وأدوات للتوهج الذي تختارينه بنفسك."
                : " skincare, and tools for the glow you make your own."}
            </p>
          </div>
          {[
            {
              heading: t.nav.categories,
              links: [
                { label: t.nav.shop, to: "/shop" },
                { label: t.nav.categories, to: "/collections" },
                { label: t.home.new_arrivals, to: "/shop?sort=-createdAt" },
              ]
            },
            {
              heading: "Customer Service",
              links: [
                { label: "Free Returns", to: "/support" },
                { label: "Secure Payment", to: "/support" },
                { label: "Support", to: "/support" },
              ]
            },
            {
              heading: "Newsletter",
              links: []
            }
          ].map((section, i) => (
            <div key={String(section.heading)}>
              <h4 className="mb-3 font-bold text-secondary">{String(section.heading)}</h4>
              <div className="grid gap-2 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <Link key={link.label} to={link.to}>
                    {link.label}
                  </Link>
                ))}
                {i === 2 && (
                  <>
                    <p>
                      {language === "AR"
                        ? "ملاحظات الجمال، العروض، وتنبيهات الإطلاق."
                        : "Beauty notes, offers, and launch alerts."}
                    </p>
                    <div className="flex gap-2">
                      <a
                        href="https://www.instagram.com/la.bella026?igsh=MXc4ZGVjM3ZuODdnbg=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-black/70 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                      <a
                        href="https://www.facebook.com/share/14fzYoMBGue/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:text-black/70 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border py-6 flex flex-col items-center justify-center gap-1.5 text-sm text-muted-foreground sm:flex-row sm:gap-3">
          <div className="flex items-center gap-1.5">
            <span>© 2026</span>
            <span className="font-semibold text-secondary">Mahmoud Abdelkhalik</span>
          </div>
          <span className="hidden sm:inline-block opacity-50">•</span>
          <span>{t.common.all_rights}</span>
        </div>
      </footer>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-glass/90 py-2 backdrop-blur-md md:hidden">
        {[
          ["/", HomeIcon, t.nav.home],
          ["/shop", Store, t.nav.shop],
          ["/cart", ShoppingBag, t.nav.cart],
          ["/wishlist", Heart, t.nav.wishlist],
          ["/profile", User, t.nav.profile],
        ]
          .filter(
            ([to]) => (!isAdminArea || (to !== "/cart" && to !== "/wishlist")) && (user || to !== "/profile")
          )
          .map(([to, Icon, label], idx) => (
            <Link
              key={idx}
              to={String(to)}
              className="flex flex-col items-center gap-1 text-xs text-black flex-1"
            >
              <Icon className="h-5 w-5" />
              {String(label)}
            </Link>
          ))}
      </nav>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/201093757278?text=${encodeURIComponent("ساعدني اعمل الاوردر المناسب ليا")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white animate-pulse-shadow-green hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label="Chat on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-8 w-8"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
}

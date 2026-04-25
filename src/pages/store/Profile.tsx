import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, User as UserIcon, Shield, MapPin, Trash2, LogOut, Camera, X, Check, Loader2, ShoppingBag, ChevronRight, Package, Clock } from "lucide-react";
import { api } from "@/services/api";
import type { Address, ApiSingle, User } from "@/services/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";
import { money } from "@/components/storefront/ProductCard";


export default function Profile() {
  const { t, isAr } = useTranslation();
  const { user, refresh, logout, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    image: ""
  });
  
  const [pw, setPw] = useState({
    currantPassword: "",
    password: "",
    confirmPassword: ""
  });

  // Sync profile state when user is loaded or changed
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        username: user.username || "",
        image: user.image || ""
      });
    }
  }, [user]);

  const addresses = useQuery({
    queryKey: ["profile-addresses"],
    queryFn: () => api.get<{ data?: Address[] } | Address[]>("/address"),
    enabled: !!user
  });

  const orders = useQuery({
    queryKey: ["profile-orders"],
    queryFn: () => api.get<any>("/order"),
    enabled: !!user
  });

  if (authLoading && !user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-secondary">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-xl font-medium">{isAr ? "جاري التحميل..." : "Loading your profile..."}</p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("name", profile.name);
        formData.append("username", profile.username);
        formData.append("image", selectedFile);
        await api.put<ApiSingle<User>>("/profile/updateMe", formData);
      } else {
        await api.put<ApiSingle<User>>("/profile/updateMe", profile);
      }
      
      toast.success(isAr ? "تم تحديث الملف الشخصي" : "Profile updated");
      setIsEditing(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      refresh();
    } catch (err) {
      toast.error(isAr ? "فشل التحديث" : "Update failed");
    }
  };

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put("/profile/change-password", pw);
      toast.success(isAr ? "تم تغيير كلمة المرور" : "Password changed");
      setPw({ currantPassword: "", password: "", confirmPassword: "" });
    } catch (err) {
      // Error handled by api/toast
    }
  };

  const del = async () => {
    if (confirm(t.profile.confirm_delete)) {
      await api.del("/profile/delete");
      logout();
    }
  };

  const addressList = Array.isArray(addresses.data) ? addresses.data : addresses.data?.data || [];

  return (
    <div className="section-shell py-12" dir={isAr ? "rtl" : "ltr"}>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-5xl font-bold text-secondary">{t.profile.title}</h1>
          <p className="mt-2 text-muted-foreground">{user?.email}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" /> {t.nav.logout}
          </Button>
          <Button variant="destructive" onClick={del} className="gap-2">
            <Trash2 className="h-4 w-4" /> {t.profile.delete_acc}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Personal Info Card */}
        <div className="flex flex-col gap-6">
          <form onSubmit={update} className="relative overflow-hidden rounded-3xl glass-panel p-8 shadow-warm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-secondary">
                <UserIcon className="h-6 w-6" />
                <h2 className="text-2xl font-bold">{t.profile.info}</h2>
              </div>
              {!isEditing ? (
                <Button 
                  type="button" 
                  variant="glass" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit2 className="h-4 w-4" /> {isAr ? "تعديل" : "Edit"}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (user) {
                        setProfile({ 
                          name: user.name || "", 
                          username: user.username || "", 
                          image: user.image || "" 
                        });
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button type="submit" variant="hero" size="sm" className="gap-2">
                    <Check className="h-4 w-4" /> {t.profile.save}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="group relative">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
                <div 
                  className={cn(
                    "h-32 w-32 overflow-hidden rounded-full border-4 border-primary/20 bg-muted shadow-lg transition-all",
                    isEditing && "cursor-pointer ring-offset-4 hover:ring-2 hover:ring-secondary"
                  )}
                  onClick={() => isEditing && fileInputRef.current?.click()}
                >
                  <img 
                    src={previewUrl || profile.image || "/user-default.jpg"} 
                    alt="Avatar" 
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => (e.currentTarget.src = "/user-default.jpg")}
                  />
                </div>
                {isEditing && (
                  <div 
                    className="absolute bottom-1 right-1 rounded-full bg-secondary p-2 text-secondary-foreground shadow-md cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-4 w-full">
                {["name", "username"].map((k) => (
                  <div key={k} className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                      {t.auth.placeholder[k as keyof typeof t.auth.placeholder] || k}
                    </label>
                    {isEditing ? (
                      <input
                        className="w-full rounded-xl border border-border bg-background/50 p-3 transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        placeholder={t.auth.placeholder[k as keyof typeof t.auth.placeholder] || k}
                        value={(profile as any)[k]}
                        onChange={(e) => setProfile({ ...profile, [k]: e.target.value })}
                      />
                    ) : (
                      <div className="p-3 text-lg font-medium text-secondary/80">
                        {(profile as any)[k] || "---"}
                      </div>
                    )}
                  </div>
                ))}
                
                {isEditing && !selectedFile && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
                      {isAr ? "رابط الصورة (اختياري)" : "Image URL (Optional)"}
                    </label>
                    <input
                      className="w-full rounded-xl border border-border bg-background/50 p-3 transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                      placeholder="https://..."
                      value={profile.image}
                      onChange={(e) => setProfile({ ...profile, image: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          </form>

          {/* Addresses Card */}
          <section className="rounded-3xl glass-panel p-8 shadow-warm">
            <div className="mb-6 flex items-center gap-3 text-secondary">
              <MapPin className="h-6 w-6" />
              <h2 className="text-2xl font-bold">{t.profile.addresses}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {addressList.map((a) => (
                <div key={a._id} className="group relative rounded-2xl border border-border bg-background/40 p-4 transition-all hover:border-secondary/30 hover:bg-background/60">
                  <div className="text-sm font-medium text-secondary">
                    <p className="font-bold">{a.street}</p>
                    <p className="text-muted-foreground">{a.city}, {a.state} {a.zip}</p>
                  </div>
                  <button 
                    onClick={async () => {
                      await api.del(`/address/${a._id}`);
                      addresses.refetch();
                    }}
                    className="absolute top-2 right-2 rounded-full p-2 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {addressList.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground italic">
                  {isAr ? "لا توجد عناوين مسجلة." : "No addresses found."}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Password Card */}
        <form onSubmit={change} className="h-fit rounded-3xl glass-panel p-8 shadow-warm">
          <div className="mb-6 flex items-center gap-3 text-secondary">
            <Shield className="h-6 w-6" />
            <h2 className="text-2xl font-bold">{t.profile.change_pw}</h2>
          </div>
          <div className="space-y-4">
            {[
              { id: "currantPassword", label: t.profile.placeholder.current_pw },
              { id: "password", label: t.profile.placeholder.new_pw },
              { id: "confirmPassword", label: t.profile.placeholder.confirm_pw }
            ].map((f) => (
              <div key={f.id} className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{f.label}</label>
                <input
                  className="w-full rounded-xl border border-border bg-background/50 p-3 transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                  type="password"
                  placeholder={f.label}
                  value={(pw as any)[f.id]}
                  onChange={(e) => setPw({ ...pw, [f.id]: e.target.value })}
                />
              </div>
            ))}
          </div>
          
          {user?.hasPassword === false && (
            <div className="mt-4 rounded-xl bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
              {isAr ? "حسابك مرتبط بجوجل، إنشاء كلمة مرور غير متاح حالياً." : "Your account is linked via Google. Direct password management is limited."}
            </div>
          )}
          
          <Button className="mt-8 w-full shadow-glow" variant="hero">
            {t.profile.update_pw}
          </Button>
        </form>
      </div>

      {/* Orders Section */}
      <div className="mt-12">
        <div className="mb-6 flex items-center gap-3 text-secondary">
          <ShoppingBag className="h-6 w-6" />
          <h2 className="text-3xl font-bold">{isAr ? "طلباتي" : "My Orders"}</h2>
        </div>
        
        <div className="grid gap-4">
          {((orders.data as any)?.data || []).map((o: any) => (
            <div key={o._id} className="overflow-hidden rounded-3xl glass-panel shadow-warm transition-all hover:shadow-glow">
              <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(o.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { dateStyle: 'long' })}
                    <span className="mx-2 opacity-30">|</span>
                    #{o._id.slice(-8).toUpperCase()}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {o.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 rounded-xl bg-secondary/5 p-2 pr-3">
                        <img 
                          src={api.imgUrl(item.product?.cover)} 
                          className="h-8 w-8 rounded-lg object-cover" 
                          alt="" 
                        />
                        <span className="text-sm font-medium">{item.product?.name}</span>
                        <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 md:border-l md:pl-6 md:rtl:border-l-0 md:rtl:border-r md:rtl:pl-0 md:rtl:pr-6">
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "الإجمالي" : "Total"}</p>
                    <p className="text-xl font-bold text-secondary">{money(o.totalPrice)}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                      o.isPaid ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                    )}>
                      <Check className={cn("h-3 w-3", !o.isPaid && "opacity-30")} />
                      {o.isPaid ? (isAr ? "تم الدفع" : "Paid") : (isAr ? "بانتظار الدفع" : "Pending Payment")}
                    </div>
                    <div className={cn(
                      "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold",
                      o.isDelivered ? "bg-blue-500/10 text-blue-600" : "bg-secondary/10 text-secondary/60"
                    )}>
                      <Package className={cn("h-3 w-3", !o.isDelivered && "opacity-30")} />
                      {o.isDelivered ? (isAr ? "تم التوصيل" : "Delivered") : (isAr ? "جاري التوصيل" : "In Delivery")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {((orders.data as any)?.data || []).length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-border py-20 text-center">
              <div className="mb-4 rounded-full bg-secondary/5 p-6">
                <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-secondary">{isAr ? "لا توجد طلبات بعد" : "No orders yet"}</h3>
              <p className="mt-2 text-muted-foreground">{isAr ? "ابدأ التسوق لتظهر طلباتك هنا." : "Start shopping to see your orders here."}</p>
              <Button asChild variant="hero" className="mt-6">
                <a href="/shop">{isAr ? "تسوق الآن" : "Shop Now"}</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

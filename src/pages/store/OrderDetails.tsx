import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Package, Check, CreditCard, MapPin, Loader2, User } from "lucide-react";
import { api } from "@/services/api";
import { useTranslation } from "@/locales/TranslationContext";
import { money } from "@/components/storefront/ProductCard";
import { cn } from "@/lib/utils";

export default function OrderDetails() {
  const { id } = useParams();
  const { t, isAr } = useTranslation();

  const orderQuery = useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<any>(`/order/${id}`),
  });

  const o = orderQuery.data?.data;

  if (orderQuery.isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-secondary">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="text-xl font-medium">{"جاري تحميل الطلب..."}</p>
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="section-shell py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">{"حدث خطأ أثناء تحميل الطلب"}</h1>
        <p className="mb-6 text-muted-foreground">{(orderQuery.error as Error)?.message || "Unknown error"}</p>
        <Link to="/profile" className="text-primary hover:underline">
          {"العودة إلى الملف الشخصي"}
        </Link>
      </div>
    );
  }

  if (!o) {
    return (
      <div className="section-shell py-12 text-center">
        <h1 className="text-3xl font-bold text-secondary mb-4">{"الطلب غير موجود"}</h1>
        <Link to="/profile" className="text-primary hover:underline">
          {"العودة إلى الملف الشخصي"}
        </Link>
      </div>
    );
  }

  const renderDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString("ar-EG", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <div className="section-shell py-12" dir="rtl">
      <Link to="/profile" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
        <ArrowLeft className={cn("h-4 w-4", "rotate-180")} />
        {"العودة إلى الطلبات"}
      </Link>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-secondary">{"تفاصيل الطلب"}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono uppercase">#{o?._id || "---"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {renderDate(o?.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm",
            o.isPaid ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
          )}>
            <Check className={cn("h-4 w-4", !o.isPaid && "opacity-30")} />
            {o.isPaid ? ("تم الدفع") : ("بانتظار الدفع")}
          </div>
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm",
            o.isDelivered ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600"
          )}>
            <Package className={cn("h-4 w-4", !o.isDelivered && "opacity-30")} />
            {o.isDelivered ? ("تم التوصيل") : ("جاري التوصيل")}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Items */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-warm">
            <h2 className="mb-6 text-2xl font-bold text-secondary">{"المنتجات"}</h2>
            <div className="flex flex-col gap-4">
              {o?.cartItems?.map((item: any, idx: number) => {
                if (!item) return null;
                return (
                  <div key={idx} className="flex items-center gap-4 rounded-2xl bg-background/40 p-4 border border-border/50">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                      <img 
                        src={api.imgUrl(item?.product?.cover)} 
                        alt={item?.product?.name || "Product"}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-secondary text-lg">{item?.product?.name || "Product"}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {"الكمية:"} <span className="font-semibold text-foreground">{item?.quantity || 1}</span>
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 text-xl font-bold text-secondary">
                        {money(item?.price || 0)}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!o?.cartItems || o.cartItems.length === 0) && o?.items?.map((item: any, idx: number) => {
                if (!item) return null;
                return (
                  <div key={idx} className="flex items-center gap-4 rounded-2xl bg-background/40 p-4 border border-border/50">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                      <img 
                        src={api.imgUrl(item?.product?.cover)} 
                        alt={item?.product?.name || "Product"}
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="font-bold text-secondary text-lg">{item?.product?.name || "Product"}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {"الكمية:"} <span className="font-semibold text-foreground">{item?.quantity || 1}</span>
                        </p>
                      </div>
                      <div className="mt-2 sm:mt-0 text-xl font-bold text-secondary">
                        {money(item?.price || 0)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-3xl glass-panel p-6 shadow-warm">
            <h2 className="mb-6 text-xl font-bold text-secondary">{"ملخص الطلب"}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{"طريقة الدفع"}</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground uppercase">
                  <CreditCard className="h-4 w-4" />
                  {o.payment || "cash"}
                </span>
              </div>
              
              <div className="my-4 h-px w-full bg-border" />
              
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{"المجموع الفرعي"}</span>
                <span>{money((o?.totalPrice || 0) - (o?.shippingPrice || 0) - (o?.taxPrice || 0))}</span>
              </div>
              
              {(o?.taxPrice || 0) > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{"الضريبة"}</span>
                  <span>{money(o?.taxPrice || 0)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{"الشحن"}</span>
                <span>{money(o?.shippingPrice || 0)}</span>
              </div>
              
              <div className="my-4 h-px w-full bg-border" />
              
              <div className="flex items-center justify-between text-xl font-bold text-secondary">
                <span>{"الإجمالي"}</span>
                <span>{money(o?.totalPrice || 0)}</span>
              </div>
              
              {o?.DepositeAmount != null && (
                <div className="mt-2 flex items-center justify-between text-lg font-bold text-orange-500">
                  <span>{"قيمة الديبوزت"}</span>
                  <div className="flex flex-col items-end">
                    <span>{money(o.DepositeAmount)}</span>
                    <span className="text-xs font-normal opacity-80">
                      {o.isDepositePaid ? "تم الدفع" : "بانتظار الدفع"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer Info */}
          {o?.user && (
            <div className="rounded-3xl glass-panel p-6 shadow-warm">
              <h2 className="mb-4 text-xl font-bold text-secondary flex items-center gap-2">
                <User className="h-5 w-5" />
                {"معلومات العميل"}
              </h2>
              <div className="rounded-2xl bg-background/40 p-4 border border-border/50 text-sm">
                <div className="space-y-1.5">
                  <p className="font-bold text-foreground text-base">
                    {o.user?.name || o.user?.username || "Guest"}
                  </p>
                  {o.user?.phone && (
                    <p className="text-muted-foreground">
                      {"الهاتف: "}
                      <span className="font-mono text-foreground font-semibold">{o.user.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {o?.address && (
            <div className="rounded-3xl glass-panel p-6 shadow-warm">
              <h2 className="mb-4 text-xl font-bold text-secondary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {"عنوان الشحن"}
              </h2>
              <div className="rounded-2xl bg-background/40 p-4 border border-border/50 text-sm">
                <div className="space-y-1.5">
                  <p className="font-bold text-foreground text-base">
                    {o.address?.alias || o.user?.name || ("العنوان")}
                  </p>
                  <p className="text-muted-foreground">{o.address?.details || o.address?.street || ""}</p>
                  <p className="text-muted-foreground">
                    {[o.address?.city, o.address?.state, o.address?.zip, o.address?.phone].filter(Boolean).join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

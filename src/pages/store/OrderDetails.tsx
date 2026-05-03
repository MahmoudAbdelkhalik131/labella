import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Package, Check, CreditCard, MapPin, Loader2 } from "lucide-react";
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
        <p className="text-xl font-medium">{isAr ? "جاري تحميل الطلب..." : "Loading order details..."}</p>
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <div className="section-shell py-12 text-center">
        <h1 className="text-3xl font-bold text-destructive mb-4">{isAr ? "حدث خطأ أثناء تحميل الطلب" : "Error Loading Order"}</h1>
        <p className="mb-6 text-muted-foreground">{(orderQuery.error as Error)?.message || "Unknown error"}</p>
        <Link to="/profile" className="text-primary hover:underline">
          {isAr ? "العودة إلى الملف الشخصي" : "Back to Profile"}
        </Link>
      </div>
    );
  }

  if (!o) {
    return (
      <div className="section-shell py-12 text-center">
        <h1 className="text-3xl font-bold text-secondary mb-4">{isAr ? "الطلب غير موجود" : "Order Not Found"}</h1>
        <Link to="/profile" className="text-primary hover:underline">
          {isAr ? "العودة إلى الملف الشخصي" : "Back to Profile"}
        </Link>
      </div>
    );
  }

  const renderDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleString(isAr ? "ar-EG" : "en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  return (
    <div className="section-shell py-12" dir={isAr ? "rtl" : "ltr"}>
      <Link to="/profile" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
        <ArrowLeft className={cn("h-4 w-4", isAr && "rotate-180")} />
        {isAr ? "العودة إلى الطلبات" : "Back to Orders"}
      </Link>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-secondary">{isAr ? "تفاصيل الطلب" : "Order Details"}</h1>
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
            {o.isPaid ? (isAr ? "تم الدفع" : "Paid") : (isAr ? "بانتظار الدفع" : "Pending Payment")}
          </div>
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold shadow-sm",
            o.isDelivered ? "bg-blue-500/10 text-blue-600" : "bg-secondary/10 text-secondary/60"
          )}>
            <Package className={cn("h-4 w-4", !o.isDelivered && "opacity-30")} />
            {o.isDelivered ? (isAr ? "تم التوصيل" : "Delivered") : (isAr ? "جاري التوصيل" : "In Delivery")}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Items */}
        <div className="space-y-6">
          <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-warm">
            <h2 className="mb-6 text-2xl font-bold text-secondary">{isAr ? "المنتجات" : "Items"}</h2>
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
                          {isAr ? "الكمية:" : "Qty:"} <span className="font-semibold text-foreground">{item?.quantity || 1}</span>
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
                          {isAr ? "الكمية:" : "Qty:"} <span className="font-semibold text-foreground">{item?.quantity || 1}</span>
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
            <h2 className="mb-6 text-xl font-bold text-secondary">{isAr ? "ملخص الطلب" : "Order Summary"}</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isAr ? "طريقة الدفع" : "Payment Method"}</span>
                <span className="flex items-center gap-1.5 font-medium text-foreground uppercase">
                  <CreditCard className="h-4 w-4" />
                  {o.payment || "cash"}
                </span>
              </div>
              
              <div className="my-4 h-px w-full bg-border" />
              
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isAr ? "المجموع الفرعي" : "Subtotal"}</span>
                <span>{money((o?.totalPrice || 0) - (o?.shippingPrice || 0) - (o?.taxPrice || 0))}</span>
              </div>
              
              {(o?.taxPrice || 0) > 0 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>{isAr ? "الضريبة" : "Tax"}</span>
                  <span>{money(o?.taxPrice || 0)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{isAr ? "الشحن" : "Shipping"}</span>
                <span>{money(o?.shippingPrice || 0)}</span>
              </div>
              
              <div className="my-4 h-px w-full bg-border" />
              
              <div className="flex items-center justify-between text-xl font-bold text-secondary">
                <span>{isAr ? "الإجمالي" : "Total"}</span>
                <span>{money(o?.totalPrice || 0)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {o?.address && (
            <div className="rounded-3xl glass-panel p-6 shadow-warm">
              <h2 className="mb-4 text-xl font-bold text-secondary flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {isAr ? "عنوان الشحن" : "Shipping Address"}
              </h2>
              <div className="rounded-2xl bg-background/40 p-4 border border-border/50 text-sm">
                <div className="space-y-1.5">
                  <p className="font-bold text-foreground text-base">
                    {o.address?.alias || o.user?.name || (isAr ? "العنوان" : "Address")}
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

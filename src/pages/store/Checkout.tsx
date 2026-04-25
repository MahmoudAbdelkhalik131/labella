import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Address, ApiSingle, Cart, Order } from "@/services/types";
import { Button } from "@/components/ui/button";
import { money } from "@/components/storefront/ProductCard";
import { cn } from "@/lib/utils";

import { useTranslation } from "@/locales/TranslationContext";

export default function Checkout() {
  const { t, isAr } = useTranslation();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState("");
  const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "" });
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.get<ApiSingle<Address[]> | { data?: Address[] }>("/address"),
  });
  const cart = useQuery({
    queryKey: ["checkout-cart"],
    queryFn: () => api.get<ApiSingle<Cart>>("/cart"),
  });

  const list = Array.isArray(addresses.data) ? addresses.data : addresses.data?.data || [];
  const bag = cart.data?.data;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/address", { address });
    toast.success("Address saved");
    setAddress({ street: "", city: "", state: "", zip: "" });
    addresses.refetch();
  };

  const place = async () => {
    if (!selected) return toast.error("Save and select an address first");
    const res = await api.post<ApiSingle<Order>>("/order", { address: selected });
    setPlacedOrder(res.data);
    toast.success("Order placed");
    setStep(3);
  };

  return (
    <div className="section-shell py-10">
      <h1 className="mb-8 text-5xl font-bold text-secondary">{t.checkout.title}</h1>
      <div className="mb-8 grid gap-3 md:grid-cols-3">
        {t.checkout.steps.map((s, i) => (
          <div key={s} className="rounded-2xl glass-panel p-4 font-bold text-secondary">
            <span className={cn(isAr ? "ml-2" : "mr-2")}>{i + 1}</span>
            {s}
          </div>
        ))}
      </div>
      {step < 3 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="rounded-2xl glass-panel p-6">
            <h2 className="text-2xl font-bold text-secondary">{t.checkout.saved}</h2>
            <div className="mt-4 grid gap-3">
              {list.map((a) => (
                <label key={a._id} className="flex gap-3 rounded-xl border border-border p-4">
                  <input
                    type="radio"
                    name="address"
                    value={a._id}
                    onChange={() => setSelected(a._id)}
                  />
                  <span>
                    {a.street}, {a.city}, {a.state} {a.zip}
                  </span>
                </label>
              ))}
            </div>
            <form onSubmit={save} className="mt-6 grid gap-3 sm:grid-cols-2">
              <input
                required
                placeholder={t.checkout.placeholder.street}
                className="rounded-xl border border-input bg-background p-3"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
              />
              <input
                required
                placeholder={t.checkout.placeholder.city}
                className="rounded-xl border border-input bg-background p-3"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <input
                required
                placeholder={t.checkout.placeholder.state}
                className="rounded-xl border border-input bg-background p-3"
                value={address.state}
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
              />
              <input
                required
                placeholder={t.checkout.placeholder.zip}
                className="rounded-xl border border-input bg-background p-3"
                value={address.zip}
                onChange={(e) => setAddress({ ...address, zip: e.target.value })}
              />
              <Button className="sm:col-span-2" variant="glass">
                {t.checkout.save_btn}
              </Button>
            </form>
          </section>
          <aside className="h-fit rounded-2xl glass-panel p-6">
            <h2 className="text-2xl font-bold text-secondary">{t.checkout.cod}</h2>
            <p className="mt-2 text-muted-foreground">{t.checkout.cod_desc}</p>
            <div className="mt-6 space-y-2 text-sm">
              {bag?.items?.map((i) => (
                <p key={i.product._id} className="flex justify-between">
                  <span>
                    {i.product.name} × {i.quantity}
                  </span>
                  <b>{money(i.price * i.quantity)}</b>
                </p>
              ))}
              <p className="flex justify-between border-t border-border pt-3 text-lg">
                <span>{t.cart.total}</span>
                <b>
                  {money(
                    bag?.totelPriceAfterDiscount != null
                      ? bag.totelPriceAfterDiscount
                      : (bag?.totelPrice || 0) + (bag?.taxPrice || 0)
                  )}
                </b>
              </p>
            </div>
            <Button variant="hero" className="mt-6 w-full" onClick={place}>
              {t.checkout.place}
            </Button>
          </aside>
        </div>
      ) : (
        <div className="rounded-3xl glass-panel p-10 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
          <h2 className="mt-4 text-4xl font-bold text-secondary">{t.checkout.confirmed}</h2>
          <p className="mt-2 text-muted-foreground">{t.checkout.confirmed_desc}</p>
          {placedOrder && (
            <div className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm">
              <p className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <b>{money(placedOrder.itemsPrice)}</b>
              </p>
              <p className="flex justify-between">
                <span>{t.cart.tax}</span>
                <b>{money(placedOrder.taxPrice)}</b>
              </p>
              <p className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
                <span>{t.cart.total}</span>
                <b>{money(placedOrder.totalPrice)}</b>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

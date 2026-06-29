import { SectionTitle } from "@/components/storefront/StoreUi";

export default function Support() {
  return (
    <div className="section-shell py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <SectionTitle title="الدعم الفني والشكاوي" />
      <div className="max-w-md mx-auto p-8 rounded-2xl bg-white shadow-warm border border-border/40 mt-8">
        <p className="text-lg text-black font-semibold mb-6">
          للشكاوي او الاستفسار عن المنتجات يرجي التواصل علي هذا الرقم
        </p>
        <a 
          href="https://wa.me/201093757278" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-green-500 text-white px-8 py-3 rounded-full font-bold text-xl hover:bg-green-600 transition-colors shadow-md"
        >
          01093757278
        </a>
      </div>
    </div>
  );
}

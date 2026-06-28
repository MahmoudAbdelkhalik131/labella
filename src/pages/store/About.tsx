import { Sparkles, Leaf, ShieldCheck, Droplet, Heart, Compass } from "lucide-react";
import { useTranslation } from "@/locales/TranslationContext";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function About() {
  const { isAr } = useTranslation();

  return (
    <div className="section-shell py-16 space-y-20" dir={"rtl"}>
      {/* Hero Section */}
      <ScrollReveal>
        <div className="rounded-[2.5rem] glass-panel p-8 md:p-16 relative overflow-hidden border border-white/5 shadow-warm">
          {/* Subtle glowing effect background */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-6">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.25em] text-accent-foreground/90 bg-accent/30 w-fit px-4 py-1.5 rounded-full">
              <Sparkles className="h-4 w-4 text-accent-foreground" />
              <span>{" الجمال الواعي"}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-secondary tracking-tight leading-tight">
              {"لابيلّا: نقاء الطبيعة وفعالية العلم"}
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground font-medium">
              {"لابيلّا هي ملاذ فاخر مخصص لمستحضرات العناية بالبشرة، العناية بالشعر، والعناية بالجسم فائقة الجودة. نبتكر تركيباتنا بعناية فائقة، مستخلصين أنقى المكونات النباتية والفعالة لنمنح جسدكِ التغذية والإشراقة الطبيعية التي يستحقها."}
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* Core Sectors */}
      <div className="space-y-8">
        <ScrollReveal>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
              {" الرعاية الشاملة لدينا"}
            </h2>
            <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">
              {"مجموعات فاخرة مصممة لكل احتياجاتك"}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Droplet,
              titleEn: "Skincare",
              titleAr: "العناية بالبشرة",
              descEn: "Deeply nourishing, dermatologist-tested formulas that repair the skin barrier, lock in hydration, and unveil a luminous, dewy complexion.",
              descAr: "تركيبات مغذية للغاية ومختبرة من قبل أطباء الجلد، تعمل على إصلاح حاجز البشرة وحبس الترطيب لتكشف عن بشرة مشرقة ونضرة.",
              bg: "bg-primary/10 hover:bg-primary/20",
            },
            {
              icon: Sparkles,
              titleEn: "Haircare",
              titleAr: "العناية بالشعر",
              descEn: "Fortifying botanical treatments and daily essentials engineered to strengthen strands from root to tip, enhance natural shine, and restore bounce.",
              descAr: "علاجات نباتية مقوية ومستحضرات يومية مصممة لتقوية خصلات الشعر من الجذور إلى الأطراف، تعزيز اللمعان الطبيعي، واستعادة الحيوية.",
              bg: "bg-accent/15 hover:bg-accent/25",
            },
            {
              icon: Heart,
              titleEn: "Body Care",
              titleAr: "العناية بالجسم",
              descEn: "Indulgent textures and soothing aromatics that turn your daily shower and moisture routine into a blissful, revitalizing home spa ritual.",
              descAr: "قوام غني وفاخر وروائح عطرية مهدئة تحول روتين الاستحمام والترطيب اليومي إلى طقس سبا منزلي مريح ومجدد للنشاط.",
              bg: "bg-primary/10 hover:bg-primary/20",
            },
          ].map((item, idx) => (
            <ScrollReveal key={idx} direction={idx === 0 ? "right" : idx === 2 ? "left" : "up"}>
              <div className="rounded-[2rem] glass-panel p-8 h-full flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-glow border border-white/5">
                <div className="space-y-6">
                  <div className={`p-4 rounded-2xl w-fit ${item.bg} text-secondary transition-colors`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-secondary">
                    {item.titleAr}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.descAr}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Our Philosophy & Commitment */}
      <ScrollReveal>
        <div className="rounded-[2.5rem] glass-panel p-8 md:p-12 grid gap-10 md:grid-cols-2 items-center border border-white/5 shadow-warm">
          <div className="space-y-6">
            <div className="p-3 rounded-2xl bg-accent/20 w-fit text-accent-foreground">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-secondary tracking-tight">
              {"قصتنا والتزامنا"}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground font-medium">
              {"بدأت رحلتنا بدافع الشغف بالعافية الشمولية والجمال النظيف. نحن في لابيلّا نؤمن بأن العناية بشعرك وبشرتك وجسدك ليست ترفاً، بل هي طقس يومي من طقوس حب الذات وتعزيز الثقة. تمثل كل زجاجة ومرطب ننتجه وعداً بالنقاء والاستدامة والفعالية الفائقة دون مساومة."}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Leaf,
                titleEn: "Vegan & Cruelty Free",
                titleAr: "نباتي وخالٍ من القسوة",
                descEn: "100% plant-based formulation.",
                descAr: "تركيبات نباتية 100% بدون تجارب على الحيوانات.",
              },
              {
                icon: ShieldCheck,
                titleEn: "Derm Tested",
                titleAr: "مختبر جلدياً",
                descEn: "Safe for sensitive skin.",
                descAr: "آمن ومناسب للبشرة الحساسة.",
              },
              {
                icon: Sparkles,
                titleEn: "Clean Ingredients",
                titleAr: "مكونات نظيفة ونقية",
                descEn: "No parabens or toxins.",
                descAr: "خالٍ تماماً من البارابين والسموم.",
              },
              {
                icon: Leaf,
                titleEn: "Eco-Conscious",
                titleAr: "صديق للبيئة",
                descEn: "Sustainable packaging.",
                descAr: "عبوات مستدامة وقابلة لإعادة التدوير.",
              },
            ].map((pillar, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-secondary/5 border border-border/40 hover:border-secondary/20 transition-all duration-300">
                <pillar.icon className="h-6 w-6 text-secondary mb-3" />
                <h4 className="font-bold text-secondary text-sm">
                  {pillar.titleAr}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {pillar.descAr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

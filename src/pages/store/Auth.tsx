import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Sparkles, CheckCircle2, XCircle, X, Eye, EyeOff, Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "@/locales/TranslationContext";
import { cn } from "@/lib/utils";
import heroImg from "../../assets/Gemini_Generated_Image_clwbjeclwbjeclwbm.png";

export default function Auth() {
  const { t, isAr, language, setLanguage } = useTranslation();
  const [params] = useSearchParams();
  const location = useLocation();
  const nav = useNavigate();
  const { login } = useAuth();
  
  const mode = params.get("mode") || location.pathname.split('/').pop() || "login";
  
  const [form, setForm] = useState<any>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [resetToken, setResetToken] = useState("");
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  // Check state for signupSuccess from redirect
  useEffect(() => {
    if (location.state?.signupSuccess) {
      setShowSignupSuccess(true);
      // Clean up state so page refresh doesn't keep showing it
      nav(location.pathname, { replace: true, state: {} });
    }
  }, [location, nav]);

  const set = (k: string, v: string) => setForm({ ...form, [k]: v });
  
  const markTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const togglePasswordVisibility = (field: string) => {
    setVisiblePasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getFieldError = (name: string) => {
    const value = form[name] || "";
    
    // Required check
    if (!value || value.trim() === "") {
      return t.auth.validation.required;
    }
    
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return t.auth.validation.email_invalid;
      }
    }
    
    if (name === "password") {
      if (value.length < 6 || value.length > 20) {
        return t.auth.validation.password_invalid;
      }
    }
    
    if (name === "confirmPassword") {
      if (value !== form.password) {
        return t.auth.validation.confirm_invalid;
      }
    }
    
    if (name === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length < 11 || digits.length > 15) {
        return t.auth.validation.phone_length;
      }
    }
    
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine fields to validate based on mode
    const fieldsToValidate = mode === "register"
      ? ["name", "username", "phone", "email", "password", "confirmPassword"]
      : mode === "forgot"
      ? ["email"]
      : ["email", "password"];
      
    const newTouched: Record<string, boolean> = {};
    let hasErrors = false;
    
    fieldsToValidate.forEach(field => {
      newTouched[field] = true;
      if (getFieldError(field)) {
        hasErrors = true;
      }
    });
    
    setTouched(newTouched);
    
    if (hasErrors) {
      toast.error(isAr ? "يرجى تصحيح الأخطاء في النموذج" : "Please correct the errors in the form");
      return;
    }
    
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        nav("/");
      } else if (mode === "register") {
        await api.signup({
          name: form.name,
          username: form.username,
          phone: form.phone,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        });
        // Success redirect to login with signupSuccess state
        nav("/auth/login", { state: { signupSuccess: true } });
      } else if (mode === "forgot") {
        const r = await api.forgot(form.email);
        setResetToken(r.Token);
        toast.success(r.message);
      }
    } catch (err) {
      // Handled by apiFetch toast
    }
  };

  // Helper to render input fields with floating border label & validation indicators
  const renderInput = (name: string, placeholderText: string, type = "text") => {
    const isTouched = !!touched[name];
    const error = getFieldError(name);
    const hasError = isTouched && error;
    const isValid = isTouched && !error;
    
    const inputType = type === "password" && visiblePasswords[name] ? "text" : type;

    return (
      <div className="relative mt-2 w-full">
        <input
          id={name}
          type={inputType}
          value={form[name] || ""}
          onChange={e => {
            set(name, e.target.value);
            markTouched(name);
          }}
          onBlur={() => markTouched(name)}
          placeholder=" "
          className={cn(
            "peer w-full rounded-xl border bg-background/50 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 placeholder-transparent pr-10 rtl:pr-4 rtl:pl-10",
            hasError
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : isValid
              ? "border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20"
              : "border-input focus:border-secondary focus:ring-secondary/20 dark:focus:border-primary dark:focus:ring-primary/20"
          )}
          required
        />
        <label
          htmlFor={name}
          className="absolute left-3 top-0 -translate-y-1/2 bg-card px-1.5 text-xs text-muted-foreground transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-secondary dark:peer-focus:text-primary rtl:left-auto rtl:right-3 cursor-text select-none"
        >
          {placeholderText}
        </label>
        
        {/* Right side indicators (badges and toggles) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 rtl:left-3 rtl:right-auto">
          {type === "password" && (
            <button
              type="button"
              onClick={() => togglePasswordVisibility(name)}
              className="text-muted-foreground hover:text-secondary focus:outline-none mr-1 rtl:mr-0 rtl:ml-1"
            >
              {visiblePasswords[name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {isTouched && (
            error ? (
              <XCircle className="h-4.5 w-4.5 text-destructive shrink-0" />
            ) : (
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            )
          )}
        </div>
        
        {/* Error message text below the field */}
        {hasError && (
          <p className="mt-1 text-xs text-destructive px-1 animate-in fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="section-shell py-10 min-h-[calc(100vh-5rem)] flex items-center justify-center">
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden glass-panel border border-border/60 grid lg:grid-cols-12 min-h-[640px] shadow-warm bg-card">
        
        {/* Left Side: Brand Visual */}
        <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-8 text-white select-none overflow-hidden bg-secondary/20">
          <img
            src={heroImg}
            alt="Labella Beauty Backdrop"
            className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plum/90 via-plum/45 to-transparent dark:from-background/95 dark:via-background/50 dark:to-transparent z-10" />
          
          <div className="relative z-20 font-script text-4xl text-primary-foreground font-semibold tracking-wide">
            Labella
          </div>
          
          <div className="relative z-20 flex flex-col gap-4 mt-auto">
            {/* Glow Index Card */}
            <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/25 dark:border-white/10 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-transform hover:scale-[1.03] duration-300">
              <div className="p-2.5 rounded-xl bg-primary/25 text-primary-foreground dark:text-primary shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-80">{isAr ? "مؤشر التوهج" : "Glow Index"}</p>
                <p className="text-lg font-bold font-display leading-tight">+88% {isAr ? "إشراق" : "Radiance"}</p>
                <span className="text-[10px] text-emerald-400 font-medium">✓ {isAr ? "تعزيز ترطيب البشرة" : "Skin Hydration Boost"}</span>
              </div>
            </div>

            {/* Essentials Card */}
            <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/25 dark:border-white/10 p-4 rounded-2xl flex items-center gap-3 shadow-lg transition-transform hover:scale-[1.03] duration-300">
              <div className="p-2.5 rounded-xl bg-accent/25 text-accent-foreground dark:text-primary shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider opacity-80">{isAr ? "أساسيات طبيعية" : "Essentials"}</p>
                <p className="text-lg font-bold font-display leading-tight">100% {isAr ? "عضوي" : "Organic"}</p>
                <span className="text-[10px] text-emerald-400 font-medium">✓ {isAr ? "معتمد كمنتج نباتي" : "Vegan Certified"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between bg-card/65 backdrop-blur-md">
          {/* Header Section */}
          <div className="flex justify-between items-center w-full mb-8">
            <Link to="/" className="font-script text-3xl text-secondary lg:hidden link-focus">
              Labella
            </Link>
            
            <div className="flex items-center gap-2 ml-auto rtl:mr-auto rtl:ml-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "EN" ? "AR" : "EN")}
                className="flex items-center gap-2 rounded-full border border-border bg-background/50 hover:bg-primary/20 text-xs px-3 py-1.5 text-secondary"
              >
                <span className="text-sm font-semibold">{language === "EN" ? "🇬🇧 EN" : "🇸🇦 AR"}</span>
              </Button>
            </div>
          </div>

          {/* Form Area */}
          <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto">
            {mode !== "forgot" && (
              /* Toggle Capsule Switcher */
              <div className="bg-muted/70 p-1 rounded-full flex w-full max-w-[280px] mx-auto mb-8 border border-border">
                <Link
                  to="/auth/register"
                  onClick={() => setShowSignupSuccess(false)}
                  className={cn(
                    "flex-1 text-center py-2 text-xs font-semibold rounded-full transition-all duration-300",
                    mode === "register"
                      ? "bg-secondary text-secondary-foreground dark:bg-primary dark:text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.auth.signup.toUpperCase()}
                </Link>
                <Link
                  to="/auth/login"
                  className={cn(
                    "flex-1 text-center py-2 text-xs font-semibold rounded-full transition-all duration-300",
                    mode === "login"
                      ? "bg-secondary text-secondary-foreground dark:bg-primary dark:text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.auth.login.toUpperCase()}
                </Link>
              </div>
            )}

            {/* Signup Success Alert message */}
            {showSignupSuccess && mode === "login" && (
              <div className="mb-6 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 flex items-start gap-3 relative animate-in fade-in slide-in-from-top-4 duration-300">
                <Sparkles className="h-5 w-5 mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm leading-none">{t.auth.signup_success_title}</h4>
                  <p className="text-xs opacity-90 mt-1">{t.auth.signup_success}</p>
                </div>
                <button
                  onClick={() => setShowSignupSuccess(false)}
                  className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 transition-opacity absolute right-3 top-3 rtl:left-3 rtl:right-auto"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <h1 className="text-3xl font-display font-bold text-secondary text-center mb-1">
              {mode === "register"
                ? t.auth.register
                : mode === "forgot"
                ? t.auth.forgot
                : t.auth.welcome}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-8">
              {mode === "register"
                ? (isAr ? "أنشئي حسابكِ للبدء بجمال فريد" : "Create your account to start a unique beauty journey")
                : mode === "forgot"
                ? (isAr ? "أدخلي بريدكِ الإلكتروني لاستعادة حسابكِ" : "Enter your email to recover your account")
                : (isAr ? "سجلي الدخول لتتبع طلباتكِ المفضلة" : "Sign in to track your favorite orders")}
            </p>

            <form onSubmit={submit} className="grid gap-5">
              {mode === "register" && (
                <>
                  {renderInput("name", t.auth.placeholder.name)}
                  {renderInput("username", t.auth.placeholder.username)}
                  {renderInput("phone", t.auth.placeholder.phone, "tel")}
                </>
              )}
              
              {renderInput("email", t.auth.placeholder.email, "email")}
              
              {mode !== "forgot" && renderInput("password", t.auth.placeholder.password, "password")}
              
              {mode === "register" && renderInput("confirmPassword", t.auth.placeholder.confirm, "password")}

              <Button variant="hero" size="lg" className="w-full mt-2 font-semibold">
                {mode === "register"
                  ? t.auth.signup
                  : mode === "forgot"
                  ? t.auth.send_code
                  : t.auth.login}
              </Button>
            </form>

            {/* Password Reset OTP flow container */}
            {mode === "forgot" && resetToken && (
              <div className="mt-6 rounded-2xl border border-border p-5 bg-background/40 backdrop-blur-sm animate-in fade-in duration-300">
                <h3 className="text-sm font-semibold mb-4 text-secondary">
                  {isAr ? "تحقق من الرمز المستلم" : "Verify Reset Code"}
                </h3>
                <div className="grid gap-4">
                  {renderInput("resetcode", t.auth.placeholder.code)}
                  <Button
                    type="button"
                    variant="glass"
                    onClick={() =>
                      api.verifyCode(resetToken, form.resetcode).then(() => {
                        toast.success(isAr ? "تم التحقق من الرمز بنجاح" : "Code verified successfully");
                      })
                    }
                  >
                    {t.auth.verify}
                  </Button>
                  
                  {renderInput("newPassword", t.auth.placeholder.password, "password")}
                  <Button
                    type="button"
                    className="bg-secondary text-secondary-foreground dark:bg-primary dark:text-primary-foreground hover:opacity-90 animate-pulse-once"
                    onClick={() =>
                      api
                        .resetPassword(resetToken, {
                          password: form.newPassword,
                          confirmPassword: form.newPassword,
                        })
                        .then(() => {
                          toast.success(isAr ? "تم إعادة تعيين كلمة المرور بنجاح" : "Password reset successfully");
                          nav("/auth/login");
                        })
                    }
                  >
                    {t.auth.reset_btn}
                  </Button>
                </div>
              </div>
            )}

            {/* Links Section at the bottom */}
            <div className="mt-8 flex flex-wrap justify-between items-center gap-3 text-xs border-t border-border/40 pt-4">
              {mode !== "login" && (
                <Link to="/auth/login" className="text-secondary hover:underline font-semibold">
                  {isAr ? "← تسجيل الدخول" : "← Back to Login"}
                </Link>
              )}
              {mode !== "register" && (
                <Link to="/auth/register" className="text-secondary hover:underline font-semibold">
                  {isAr ? "إنشاء حساب جديد" : "Create an Account"}
                </Link>
              )}
              {mode === "login" && (
                <Link to="/auth/forgot" className="text-secondary hover:underline font-semibold">
                  {t.auth.forgot_link}
                </Link>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

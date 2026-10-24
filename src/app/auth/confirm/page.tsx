"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw, 
  Mail, 
  ShieldCheck,
  Home
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlStatus = searchParams.get("status");
  const urlMessage = searchParams.get("message");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";

  const [state, setState] = useState<"loading" | "success" | "error">(
    urlStatus === "success" ? "success" : urlStatus === "error" ? "error" : "loading"
  );
  const [errorMessage, setErrorMessage] = useState(urlMessage || "");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown effect
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle client-side tokens and hashes
  useEffect(() => {
    // Si l'état a déjà été statué par l'URL
    if (urlStatus === "success") {
      setState("success");
      return;
    }
    if (urlStatus === "error") {
      setState("error");
      setErrorMessage(urlMessage || "Le lien de confirmation est invalide ou a expiré.");
      return;
    }

    const processVerification = async () => {
      const supabase = createClient();

      try {
        // 1. Cas Token Hash & Type (OTP)
        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            setState("error");
            setErrorMessage(error.message);
          } else {
            setState("success");
          }
          return;
        }

        // 2. Cas Code PKCE
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setState("error");
            setErrorMessage(error.message);
          } else {
            setState("success");
          }
          return;
        }

        // 3. Cas Hash Fragment (Implicit flow ou URL redirect de Supabase)
        if (typeof window !== "undefined" && window.location.hash) {
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get("access_token");
          const errorDesc = params.get("error_description");

          if (errorDesc) {
            setState("error");
            setErrorMessage(decodeURIComponent(errorDesc));
            return;
          }

          if (accessToken) {
            const { data } = await supabase.auth.getUser();
            if (data?.user?.email_confirmed_at) {
              setState("success");
              return;
            }
          }
        }

        // 4. Vérifier si l'utilisateur en cours est déjà confirmé
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email_confirmed_at) {
          setState("success");
        } else {
          // Aucun paramètre valide trouvé
          setState("error");
          setErrorMessage("Aucun jeton de vérification valide n'a été détecté dans le lien.");
        }
      } catch (err: any) {
        setState("error");
        setErrorMessage(err?.message || "Une erreur inattendue est survenue.");
      }
    };

    processVerification();
  }, [urlStatus, urlMessage, token_hash, type, code]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim() || cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setResendFeedback(null);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: resendEmail.trim(),
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        setResendFeedback({
          type: "error",
          text: error.message || "Impossible de renvoyer l'e-mail pour le moment.",
        });
      } else {
        setResendFeedback({
          type: "success",
          text: `Nouveau lien envoyé avec succès à ${resendEmail.trim()}. Consultez votre messagerie.`,
        });
        setCooldown(60);
      }
    } catch (err: any) {
      setResendFeedback({
        type: "error",
        text: err?.message || "Une erreur est survenue lors du renvoi.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {state === "loading" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Vérification de votre compte en cours...
            </h1>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Nous validons votre lien de confirmation auprès de nos services sécurisés AFriGain.
            </p>
          </div>
        )}

        {state === "success" && (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-slate-900">
                E-mail confirmé avec succès !
              </h1>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Votre adresse a été vérifiée. Votre compte AFriGain est désormais entièrement activé et vos accès sont débloqués.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={next}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all"
              >
                Accéder à mon espace
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                Accueil
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                Échec de la confirmation
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Le lien de vérification est invalide, a déjà été utilisé ou sa durée de validité a expiré.
              </p>
            </div>

            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage || "Impossible de valider ce jeton de sécurité."}</span>
            </div>

            {/* Formulaire direct de renvoi */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="space-y-1">
                <span className="font-bold text-xs text-slate-900 block">
                  Recevoir un nouveau lien de confirmation :
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Saisissez votre e-mail d'inscription pour générer un lien valide.
                </span>
              </div>

              {resendFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    resendFeedback.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {resendFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span>{resendFeedback.text}</span>
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-2">
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="contact@exemple.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resendLoading || cooldown > 0 || !resendEmail.trim()}
                  className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? "animate-spin" : ""}`} />
                  {resendLoading
                    ? "Envoi en cours..."
                    : cooldown > 0
                    ? `Patienter (${cooldown}s)`
                    : "Renvoyer l'e-mail de confirmation"}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <Link
                href="/auth/login"
                className="text-brand-600 hover:underline font-semibold"
              >
                Se connecter avec mes identifiants
              </Link>
              <Link
                href="/auth/register"
                className="text-slate-600 hover:underline"
              >
                Créer un autre compte
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Chargement...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}

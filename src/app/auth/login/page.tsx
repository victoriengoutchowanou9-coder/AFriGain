"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2 
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setIsEmailUnconfirmed(false);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const lowerMsg = error.message.toLowerCase();
        if (lowerMsg.includes("email not confirmed") || lowerMsg.includes("email unconfirmed")) {
          setIsEmailUnconfirmed(true);
          setErrorMsg("Votre adresse e-mail n'a pas encore été confirmée. Veuillez vérifier votre messagerie pour activer votre compte.");
        } else if (lowerMsg.includes("invalid login credentials")) {
          setErrorMsg("Adresse e-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      // Vérification du statut de l'e-mail dans la session
      if (data?.user && !data.user.email_confirmed_at) {
        setIsEmailUnconfirmed(true);
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&required=1`);
        return;
      }

      // Connexion réussie et e-mail confirmé
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur inattendue est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim() || resending) return;
    setResending(true);
    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setResendSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Échec du renvoi de l'e-mail.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 font-bold text-xl rounded-xl mx-auto flex items-center justify-center">
            AF
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion à AFriGain</h1>
          <p className="text-xs text-slate-500">
            Accédez à vos missions, factures et à votre assistant Business Coach.
          </p>
        </div>

        {errorMsg && (
          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            isEmailUnconfirmed 
              ? "bg-amber-50 border-amber-200 text-amber-800" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {isEmailUnconfirmed ? (
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            )}
            <div className="space-y-2 flex-1">
              <span>{errorMsg}</span>
              {isEmailUnconfirmed && (
                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[11px] transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                    {resending ? "Envoi..." : "Renvoyer le lien par e-mail"}
                  </button>
                  <Link
                    href={`/auth/verify-email?email=${encodeURIComponent(email)}&required=1`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-amber-900 hover:underline text-[11px] font-medium"
                  >
                    Voir la page d'attente
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>Un nouveau lien de confirmation a été envoyé à {email}.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Adresse e-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">Mot de passe</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Se connecter"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="font-semibold text-brand-600 hover:underline">
            Créer un compte gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Chargement...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

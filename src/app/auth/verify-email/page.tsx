"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Clock, 
  ArrowLeft,
  Inbox
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const isRequired = searchParams.get("required") === "1";

  const [email, setEmail] = useState(initialEmail);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Vérifier la session actuelle et écouter si l'e-mail a été validé dans un autre onglet
  useEffect(() => {
    const supabase = createClient();

    const checkCurrentStatus = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        if (!initialEmail && data.user.email) {
          setEmail(data.user.email);
        }
        setCurrentUserEmail(data.user.email || "");

        // Si l'utilisateur est déjà confirmé, le rediriger directement vers le dashboard
        if (data.user.email_confirmed_at) {
          setIsConfirmed(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
      }
    };

    checkCurrentStatus();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email_confirmed_at) {
        setIsConfirmed(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [initialEmail, router]);

  // Gestion du décompte cooldown pour le renvoi d'e-mail
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResendEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || cooldown > 0 || sending) return;

    setSending(true);
    setFeedback(null);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/confirm?next=/dashboard`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("over_email_send_rate_limit")) {
          setFeedback({
            type: "error",
            text: "Trop de demandes en peu de temps. Veuillez patienter une minute avant de redemander un lien.",
          });
          setCooldown(60);
        } else {
          setFeedback({
            type: "error",
            text: error.message || "Impossible de renvoyer l'e-mail. Veuillez réessayer plus tard.",
          });
        }
      } else {
        setFeedback({
          type: "success",
          text: `Un nouvel e-mail de confirmation a été envoyé à ${email.trim()}. Vérifiez également vos dossiers Spams ou Indésirables.`,
        });
        setCooldown(60);
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "Une erreur inattendue est survenue lors de l'envoi.",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCheckNow = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (data?.user?.email_confirmed_at) {
      setIsConfirmed(true);
      router.push("/dashboard");
    } else {
      setFeedback({
        type: "error",
        text: "Votre adresse e-mail n'est pas encore confirmée. Veuillez cliquer sur le lien reçu dans votre boîte de réception.",
      });
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Adresse e-mail confirmée !</h1>
          <p className="text-sm text-slate-600">
            Votre compte est désormais validé. Redirection vers votre tableau de bord AFriGain...
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm transition-all"
            >
              Accéder au tableau de bord
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {isRequired && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-800">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-900">Accès restreint aux fonctionnalités</span>
              Pour des raisons de sécurité et de conformité sur la plateforme AFriGain, la confirmation de votre adresse e-mail est obligatoire avant d'accéder au tableau de bord et de publier des missions.
            </div>
          </div>
        )}

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
            <Mail className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Vérifiez votre boîte de réception</h1>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Nous avons envoyé un lien de confirmation à :
          </p>
          <div className="inline-block px-3.5 py-1.5 bg-slate-100 rounded-lg text-slate-900 font-semibold text-sm border border-slate-200">
            {email || "votre adresse e-mail"}
          </div>
        </div>

        {feedback && (
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Inbox className="w-4 h-4 text-brand-600" />
            <span>Instructions de validation :</span>
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
            <li>Ouvrez l'e-mail ayant pour objet <strong className="text-slate-800">« Confirmez votre adresse e-mail — AFriGain »</strong>.</li>
            <li>Cliquez sur le bouton ou le lien de confirmation sécurisé.</li>
            <li>Une fois confirmé, votre session sera instantanément débloquée.</li>
          </ol>
          <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-200">
            Pensez à inspecter le dossier <em>Courrier indésirable / Spam</em> si vous ne voyez pas l'e-mail dans les 2 minutes.
          </div>
        </div>

        {/* Section Renvoi d'e-mail */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre-email@exemple.com"
              className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={() => handleResendEmail()}
              disabled={sending || cooldown > 0 || !email.trim()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:border-brand-500 text-slate-800 text-xs font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin text-brand-600" : ""}`} />
              {sending
                ? "Envoi en cours..."
                : cooldown > 0
                ? `Renvoyer (${cooldown}s)`
                : "Renvoyer l'e-mail"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleCheckNow}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            J'ai déjà confirmé mon e-mail, actualiser mon statut
          </button>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-brand-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour à la connexion
          </Link>
          <Link
            href="/auth/register"
            className="text-brand-600 hover:underline font-medium"
          >
            Changer d'adresse
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Chargement de la page de vérification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

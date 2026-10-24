"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const verifySession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push(`/auth/login?next=${encodeURIComponent(pathname)}`);
          return;
        }

        setUser(user);

        // Si l'e-mail n'est pas confirmé, bloquer et rediriger vers la page de vérification
        if (!user.email_confirmed_at) {
          router.push(`/auth/verify-email?email=${encodeURIComponent(user.email || "")}&required=1`);
          return;
        }
      } catch (err) {
        console.error("Erreur vérification session dashboard:", err);
      } finally {
        setChecking(false);
      }
    };

    verifySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/auth/login");
      } else if (!session.user.email_confirmed_at) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(session.user.email || "")}&required=1`);
      } else {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  const handleQuickResend = async () => {
    if (!user?.email || resending) return;
    setResending(true);
    setResendSuccess(false);

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/confirm?next=/dashboard`;

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo,
        },
      });

      if (!error) {
        setResendSuccess(true);
      }
    } catch (err) {
      console.error("Erreur renvoi rapide:", err);
    } finally {
      setResending(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Sécurisation et vérification des accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {user && !user.email_confirmed_at && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Adresse e-mail non vérifiée :</strong> Votre compte ({user.email}) est en attente de confirmation. Certaines actions sont restreintes.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleQuickResend}
                disabled={resending || resendSuccess}
                className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded font-semibold text-white transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                {resendSuccess ? "E-mail envoyé !" : resending ? "Envoi..." : "Renvoyer le lien"}
              </button>
              <Link
                href={`/auth/verify-email?email=${encodeURIComponent(user.email || "")}&required=1`}
                className="underline font-semibold hover:text-amber-100"
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

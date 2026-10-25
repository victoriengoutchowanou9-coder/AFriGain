"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, RefreshCw, CheckCircle2, ArrowRight, UserCheck, LogIn, Sparkles } from "lucide-react";
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
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const verifySession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // Mode invité / démo pour permettre l'exploration fluide des outils de gestion
          setIsGuestMode(true);
          setUser(null);
        } else {
          setUser(user);
          setIsGuestMode(false);
        }
      } catch (err) {
        console.error("Erreur vérification session dashboard:", err);
        setIsGuestMode(true);
      } finally {
        setChecking(false);
      }
    };

    verifySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsGuestMode(false);
      } else {
        setUser(null);
        setIsGuestMode(true);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (checking) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement de votre espace de travail...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Bannière Mode Invité si non connecté */}
      {isGuestMode && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Vous explorez les outils AfriGain en accès libre. Pour sauvegarder vos devis et candidatures, connectez-vous.</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/auth/login?next=${encodeURIComponent(pathname)}`}
              className="px-3 py-1 bg-white text-amber-800 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/auth/register"
              className="px-3 py-1 bg-amber-600 text-white rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      )}

      {/* Avertissement email si connecté mais email non vérifié */}
      {user && !user.email_confirmed_at && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Votre adresse e-mail n'a pas encore été confirmée. Veuillez vérifier votre boîte pour activer toutes les fonctionnalités.</span>
          </div>
          <Link
            href={`/auth/verify-email?email=${encodeURIComponent(user.email || "")}`}
            className="font-bold underline hover:text-amber-900"
          >
            Vérifier maintenant
          </Link>
        </div>
      )}

      {children}
    </div>
  );
}

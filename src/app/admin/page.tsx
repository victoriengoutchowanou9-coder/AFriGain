"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { AdminVerificationConsole } from "@/components/AdminVerificationConsole";

export default function AdminPortalPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAdminAccess() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (!userData?.user) {
          router.replace("/auth/login?next=/admin");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userData.user.id)
          .single();

        // Seul le rôle 'admin' est autorisé. Les autres utilisateurs sont redirigés sans laisser de trace.
        if (profile?.role === "admin") {
          setIsAdmin(true);
        } else {
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Accès refusé administration:", err);
        router.replace("/dashboard");
      } finally {
        setChecking(false);
      }
    }

    checkAdminAccess();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Vérification des privilèges de gouvernance...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'espace utilisateur
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Session Admin Active • Zéro Empreinte Publique
        </span>
      </div>

      <AdminVerificationConsole />
    </div>
  );
}

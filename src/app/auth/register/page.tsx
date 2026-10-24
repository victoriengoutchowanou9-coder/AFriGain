"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Briefcase, Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"entrepreneur" | "client">("entrepreneur");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const emailRedirectTo = `${origin}/auth/confirm?next=/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("user already registered")) {
          setErrorMsg("Un compte existe déjà avec cette adresse e-mail. Vous pouvez vous connecter ou demander un renvoi de lien.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      // Si l'inscription a réussi :
      // Lorsque la confirmation par e-mail est activée dans Supabase, data.session est null
      // et l'utilisateur doit impérativement confirmer son adresse.
      if (data?.user && !data.session) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      } else if (data?.user?.email_confirmed_at) {
        router.push("/dashboard");
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur inattendue est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-100 text-brand-700 font-bold text-xl rounded-xl mx-auto flex items-center justify-center">
            AF
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Rejoindre AFriGain</h1>
          <p className="text-xs text-slate-500">
            Choisissez votre profil pour commencer sur la plateforme.
          </p>
        </div>

        {/* Sélecteur de Rôle */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("entrepreneur")}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
              role === "entrepreneur"
                ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <Briefcase className={`w-5 h-5 ${role === "entrepreneur" ? "text-brand-600" : "text-slate-500"}`} />
              {role === "entrepreneur" && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
            </div>
            <div>
              <span className="font-bold text-sm block text-slate-900">Je suis Prestataire</span>
              <span className="text-[11px] text-slate-500">Entrepreneur, indépendant, talent</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole("client")}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
              role === "client"
                ? "border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <Building2 className={`w-5 h-5 ${role === "client" ? "text-brand-600" : "text-slate-500"}`} />
              {role === "client" && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
            </div>
            <div>
              <span className="font-bold text-sm block text-slate-900">Je suis Entreprise</span>
              <span className="text-[11px] text-slate-500">Donneur d'ordre, TPE, recruteur</span>
            </div>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Nom complet ou Raison Sociale</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={role === "entrepreneur" ? "Ex: Mensah Dossou" : "Ex: Société AgroBénin"}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Adresse e-mail professionnelle</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@exemple.com"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Mot de passe (8 caractères minimum)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 leading-normal">
            En créant un compte, vous acceptez les Conditions Générales et la Politique de Confidentialité d'AFriGain. Aucune fausse promesse de gain garanti.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer mon compte"}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-600 hover:underline">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}

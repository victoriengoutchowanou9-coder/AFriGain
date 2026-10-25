"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  Briefcase, 
  FileText, 
  Bot, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  LogOut, 
  PlusCircle,
  Building2,
  Package,
  Layers,
  Sparkles,
  Compass,
  ChevronDown,
  MessageSquare
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { NotificationCenter } from "./NotificationCenter";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              AF
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                AFri<span className="text-brand-600">Gain</span>
              </span>
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
                Afrique & International
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (9 Rubriques Section 21) */}
          <nav className="hidden xl:flex items-center gap-4 text-xs font-semibold text-slate-700">
            <Link href="/emplois" className="hover:text-brand-600 transition-colors py-1">
              Emplois
            </Link>

            <Link href="/missions" className="hover:text-brand-600 transition-colors py-1">
              Missions
            </Link>

            <Link href="/services" className="hover:text-brand-600 transition-colors py-1">
              Services & Talents
            </Link>

            <Link href="/entreprises" className="hover:text-brand-600 transition-colors py-1">
              Entreprises
            </Link>

            <Link href="/fournisseurs" className="hover:text-brand-600 transition-colors py-1">
              Fournisseurs B2B
            </Link>

            <Link href="/opportunites" className="hover:text-brand-600 transition-colors py-1">
              Opportunités
            </Link>

            <Link href="/tarifs" className="hover:text-brand-600 transition-colors py-1 font-bold text-slate-800">
              Tarifs
            </Link>

            <Link href="/dashboard/quotes" className="hover:text-brand-600 transition-colors py-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-brand-500" />
              Devis & Factures
            </Link>

            <Link
              href="/dashboard/coach-ia"
              className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80 hover:bg-amber-100 transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-amber-600" />
              AfriGain AI
            </Link>

            <Link
              href="/commencer"
              className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 hover:bg-emerald-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Je commence
            </Link>
          </nav>

          {/* Navigation compacte pour écrans moyens (lg) */}
          <nav className="hidden lg:flex xl:hidden items-center gap-3 text-xs font-semibold text-slate-700">
            <Link href="/emplois" className="hover:text-brand-600 transition-colors">
              Emplois
            </Link>
            <Link href="/missions" className="hover:text-brand-600 transition-colors">
              Missions
            </Link>
            <Link href="/services" className="hover:text-brand-600 transition-colors">
              Talents
            </Link>
            <Link href="/fournisseurs" className="hover:text-brand-600 transition-colors">
              Fournisseurs
            </Link>
            <Link href="/tarifs" className="hover:text-brand-600 transition-colors font-bold">
              Tarifs
            </Link>
            <Link href="/dashboard/quotes" className="hover:text-brand-600 transition-colors">
              Devis
            </Link>
            <Link href="/dashboard/coach-ia" className="text-amber-800 font-bold">
              IA Coach
            </Link>
            <Link href="/commencer" className="text-emerald-700 font-bold">
              Débutants
            </Link>
          </nav>

          {/* CTA & Auth Desktop */}
          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            {user && (
              <>
                <Link
                  href="/messages"
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  title="Messagerie instantanée"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <NotificationCenter />
              </>
            )}

            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-brand-600" />
              Mon Espace
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/missions/create"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Publier
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-2 py-1"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <Link
              href="/dashboard"
              className="p-1.5 text-slate-700 hover:text-brand-600"
              title="Mon espace"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in text-sm font-medium">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <Link
              href="/emplois"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              💼 Emplois & Métiers
            </Link>
            <Link
              href="/missions"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              🎯 Missions Ouvertes
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              🎨 Services & Talents
            </Link>
            <Link
              href="/entreprises"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              🏢 Entreprises
            </Link>
            <Link
              href="/fournisseurs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              📦 Fournisseurs B2B
            </Link>
            <Link
              href="/opportunites"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              ✨ Opportunités
            </Link>
            <Link
              href="/tarifs"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              💎 Tarifs & Services
            </Link>
            <Link
              href="/dashboard/quotes"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              📄 Devis & Factures
            </Link>
            <Link
              href="/messages"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-900 hover:bg-brand-50 font-bold text-xs"
            >
              💬 Messagerie Privée
            </Link>
            <Link
              href="/dashboard/coach-ia"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs"
            >
              🤖 AfriGain AI
            </Link>
          </div>

          <Link
            href="/commencer"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Parcours Débutants : Je commence sans expérience
          </Link>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center bg-slate-900 text-white font-bold rounded-xl text-xs"
            >
              Accéder à Mon Espace
            </Link>
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center border border-slate-300 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 text-center bg-brand-600 text-white font-bold rounded-xl text-xs"
                >
                  Créer un compte
                </Link>
              </div>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full py-2 text-center text-rose-600 font-semibold text-xs"
              >
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

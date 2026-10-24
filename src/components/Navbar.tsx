"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Briefcase, FileText, Bot, Menu, X, ShieldCheck, User, LogOut, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              AF
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                AFri<span className="text-brand-600">Gain</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                Bénin & International
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/missions"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-brand-500" />
              Missions
            </Link>
            <Link
              href="/services"
              className="text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              Services & Talents
            </Link>
            <Link
              href="/dashboard/quotes"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-brand-600 transition-colors"
            >
              <FileText className="w-4 h-4 text-brand-500" />
              Devis & Factures
            </Link>
            <Link
              href="/dashboard/coach-ia"
              className="flex items-center gap-1.5 text-sm font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 hover:bg-amber-100 transition-colors"
            >
              <Bot className="w-4 h-4 text-amber-600" />
              Business Coach IA
            </Link>
          </nav>

          {/* CTA & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/missions/create"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Publier une mission
                </Link>
                <Link
                  href={user.email_confirmed_at ? "/dashboard" : `/auth/verify-email?email=${encodeURIComponent(user.email || "")}&required=1`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                    !user.email_confirmed_at
                      ? "border-amber-300 bg-amber-50 text-amber-800 hover:border-amber-400"
                      : "border-slate-200 hover:border-brand-500 text-slate-800"
                  }`}
                  title={!user.email_confirmed_at ? "Adresse e-mail à confirmer" : "Mon espace"}
                >
                  <User className={`w-3.5 h-3.5 ${!user.email_confirmed_at ? "text-amber-600" : "text-brand-600"}`} />
                  <span className="truncate max-w-[130px]">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </span>
                  {!user.email_confirmed_at && (
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                      À valider
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2"
                >
                  Connexion
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm hover:shadow transition-all"
                >
                  Créer un profil
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/missions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Trouver une mission
          </Link>
          <Link
            href="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Catalogue de services
          </Link>
          <Link
            href="/dashboard/quotes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Gérer mes devis & factures
          </Link>
          <Link
            href="/dashboard/coach-ia"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-amber-700"
          >
            Assistant Business Coach IA
          </Link>

          {user ? (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 bg-slate-100 text-slate-800 font-medium rounded-lg"
              >
                Mon Espace ({user.user_metadata?.full_name || user.email})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full text-center py-2 text-red-600 font-medium border border-red-200 rounded-lg"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-slate-700 font-medium border border-slate-300 rounded-lg"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 bg-brand-600 text-white font-medium rounded-lg shadow-sm"
              >
                Créer un profil
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

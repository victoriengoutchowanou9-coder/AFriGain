"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  FileText, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  Bot,
  DollarSign,
  Loader2,
  Inbox,
  UserCheck,
  Building,
  ShieldCheck,
  Sparkles,
  Users,
  Compass,
  AlertTriangle,
  Settings,
  Eye,
  Star,
  CheckCircle,
  BellRing
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { CompanyGalleryManager } from "@/components/CompanyGalleryManager";
import { AdminVerificationConsole } from "@/components/AdminVerificationConsole";

export default function DashboardPage() {
  const [activeRole, setActiveRole] = useState<"jeune" | "prestataire" | "entreprise" | "admin">("jeune");
  const [userName, setUserName] = useState("Entrepreneur AfriGain");
  const [userId, setUserId] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(75);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          setUserId(userData.user.id);
          setUserName(userData.user.user_metadata?.full_name || userData.user.email?.split("@")[0] || "Utilisateur");

          const { data: p } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userData.user.id)
            .single();

          if (p) {
            setUserProfile(p);
            if (p.role === "admin") {
              setIsAdmin(true);
            }
          }
        }
      } catch (e) {
        // Mode démo
      }
    }
    loadUser();
  }, []);

  const baseRoles = [
    { id: "jeune", label: "Jeune / Indépendant", icon: UserCheck },
    { id: "prestataire", label: "Prestataire / Artisan", icon: Briefcase },
    { id: "entreprise", label: "Entreprise / Recruteur", icon: Building },
  ];

  // Le rôle admin est strictement masqué aux utilisateurs normaux (aucun bouton visible sur la plateforme)
  const availableRoles = isAdmin
    ? [...baseRoles, { id: "admin", label: "Administration Plateforme", icon: Settings }]
    : baseRoles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête avec sélecteur de rôle (Section 18) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Espace Personnalisé • Section 18 AfriGain
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bonjour, {userName} 👋
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm">
            Basculez facilement entre vos différents rôles pour piloter vos activités économiques.
          </p>
        </div>

        {/* Sélecteur de rôle adaptatif (Section 18) - Le rôle admin n'apparaît que si l'utilisateur est authentifié comme admin */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Paramètres</span>
          </Link>

          <Link
            href="/dashboard/verification"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {userProfile?.identity_status === "verified"
                ? "Identité Certifiée ✓"
                : "Certifier mon compte / Identité"}
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            {availableRoles.map((role) => {
              const Icon = role.icon;
              const active = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setActiveRole(role.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. TABLEAU DE BORD DU JEUNE / INDÉPENDANT (Section 18.1) */}
      {activeRole === "jeune" && (
        <div className="space-y-6">
          {/* Complétude de profil & Compétences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase">Complétude du Profil</span>
                <span className="text-sm font-black text-brand-600">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Ajoutez un lien de portfolio ou une réalisation concrète pour atteindre 100% et maximiser vos chances de sélection.
              </p>
              <Link
                href="/dashboard/profile"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Compléter mon profil <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase block">Mes Compétences Déclarées</span>
              <div className="flex flex-wrap gap-1.5">
                {userProfile?.skills && userProfile.skills.length > 0 ? (
                  userProfile.skills.map((s: string, idx: number) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">Aucune compétence sélectionnée.</span>
                )}
              </div>
              <Link
                href="/dashboard/settings"
                className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 pt-1"
              >
                <Settings className="w-3.5 h-3.5" /> Gérer mes compétences
              </Link>
              <Link
                href="/dashboard/coach-ia"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 pt-1"
              >
                <Compass className="w-3.5 h-3.5" /> Lancer un diagnostic IA de compétences
              </Link>
            </div>

            <div className="bg-gradient-to-br from-brand-600 to-emerald-600 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-brand-100 font-bold uppercase">Prochaine action utile recommandée par l'IA</span>
                <h3 className="text-base font-extrabold leading-snug">
                  Postulez à 2 offres accessibles aux débutants aujourd'hui
                </h3>
              </div>
              <Link
                href="/emplois"
                className="px-4 py-2 bg-white text-brand-800 text-xs font-bold rounded-xl text-center hover:bg-brand-50 shadow-sm"
              >
                Découvrir les offres débutants
              </Link>
            </div>
          </div>

          {/* Candidatures en cours & Missions recommandées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Mes Candidatures & Propositions (2)</h3>
                <Link href="/emplois" className="text-xs text-brand-600 font-semibold hover:underline">
                  Voir tout
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Comptable Junior / TPE</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      En cours d'examen
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">Cabinet Conseil Fiduciaire Bénin • Envoyé le 24/10/2026</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Identité visuelle gamme jus</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Proposition reçue
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">BioSaveurs Bénin • Budget proposé : 120 000 FCFA</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Missions Recommandées pour vous</h3>
                <Link href="/missions" className="text-xs text-brand-600 font-semibold hover:underline">
                  Explorer
                </Link>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Saisie de factures et rapprochement bancaire</span>
                    <span className="font-bold text-brand-700 text-xs">75 000 FCFA</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Quincaillerie Moderne Porto-Novo • Accessible débutants</p>
                  <Link href="/missions" className="text-[11px] font-semibold text-brand-600 flex items-center gap-1">
                    Faire une proposition <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TABLEAU DE BORD DU PRESTATAIRE / ARTISAN (Section 18.2) */}
      {activeRole === "prestataire" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Services Actifs</span>
              <div className="text-2xl font-black text-slate-900 mt-1">2</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Demandes reçues</span>
              <div className="text-2xl font-black text-brand-600 mt-1">4</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Missions en cours</span>
              <div className="text-2xl font-black text-amber-600 mt-1">1</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Avis clients</span>
              <div className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1">
                4.9 <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Gestion Financière Directe</h3>
                <Link href="/dashboard/quotes" className="text-xs text-brand-600 font-semibold hover:underline">
                  Ouvrir devis
                </Link>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-3 bg-slate-50 rounded-xl">
                  <span>Devis en attente de signature :</span>
                  <strong className="text-slate-900">280 250 FCFA</strong>
                </div>
                <div className="flex justify-between p-3 bg-emerald-50 rounded-xl text-emerald-900">
                  <span>Factures encaissées ce mois :</span>
                  <strong className="text-emerald-700">120 000 FCFA</strong>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/dashboard/quotes"
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold text-center"
                >
                  Créer un devis
                </Link>
                <Link
                  href="/dashboard/invoices"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold text-center"
                >
                  Suivi factures
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Statistiques de visibilité de ma vitrine</h3>
                <span className="text-[11px] text-slate-400">7 derniers jours</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Vues de votre profil :</span>
                  <strong className="text-slate-900">142 consultations</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Clics sur "Demander un devis" :</span>
                  <strong className="text-brand-600">6 demandes</strong>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                  💡 <strong>Astuce :</strong> Les profils avec au moins 2 photos de réalisations concrètes reçoivent 3 fois plus de demandes.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TABLEAU DE BORD DE L'ENTREPRISE (Section 18.3) */}
      {activeRole === "entreprise" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Offres Publiées</span>
              <div className="text-2xl font-black text-slate-900 mt-1">2 actives</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Candidatures reçues</span>
              <div className="text-2xl font-black text-brand-600 mt-1">11 dossiers</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Missions en cours</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">1 prestataire</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Fournisseurs suivis</span>
              <div className="text-2xl font-black text-slate-800 mt-1">3 partenaires</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Actions rapides Recrutement & Prestataires</h3>
              <div className="flex flex-col gap-2">
                <Link
                  href="/emplois"
                  className="p-3 bg-slate-50 hover:bg-brand-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between"
                >
                  <span>Gérer mes offres d'emploi & candidatures</span>
                  <ArrowUpRight className="w-4 h-4 text-brand-600" />
                </Link>
                <Link
                  href="/missions/create"
                  className="p-3 bg-slate-50 hover:bg-brand-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between"
                >
                  <span>Publier une nouvelle mission ponctuelle</span>
                  <ArrowUpRight className="w-4 h-4 text-brand-600" />
                </Link>
                <Link
                  href="/fournisseurs"
                  className="p-3 bg-slate-50 hover:bg-brand-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 flex items-center justify-between"
                >
                  <span>Trouver des fournisseurs de matières premières</span>
                  <ArrowUpRight className="w-4 h-4 text-brand-600" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Badge & Conformité Entreprise</h3>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Statut : {userProfile?.professional_status === "verified" ? "Entreprise Officiellement Certifiée" : "En cours de validation (RCCM / IFU)"}
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Vos annonces bénéficient d'un classement prioritaire de confiance auprès des jeunes diplômés et artisans.
                </p>
                <Link
                  href="/dashboard/verification"
                  className="inline-block mt-1 text-xs font-bold text-brand-700 hover:underline"
                >
                  Mettre à jour mes pièces d'entreprise →
                </Link>
              </div>
            </div>
          </div>

          {/* Gestionnaire de Galerie d'Activité de l'Entreprise (Section 7 : Limite stricte de 5 photos) */}
          {userId && (
            <CompanyGalleryManager
              userId={userId}
              initialPhotos={userProfile?.company_gallery_urls || []}
              onSaved={(newPhotos) => {
                setUserProfile((prev: any) => ({ ...prev, company_gallery_urls: newPhotos }));
              }}
            />
          )}
        </div>
      )}

      {/* 4. CONSOLE D'ADMINISTRATION RIGOUROUSE (Section 12, 13, 14 - Accessible uniquement au rôle admin authentifié) */}
      {activeRole === "admin" && isAdmin && (
        <AdminVerificationConsole />
      )}
    </div>
  );
}

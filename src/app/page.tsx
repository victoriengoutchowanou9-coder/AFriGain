import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  Briefcase, 
  FileSpreadsheet, 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles,
  Users,
  Compass
} from "lucide-react";

export default function HomePage() {
  const categories = [
    { name: "Développement Web & Mobile", count: 18, icon: "💻", slug: "dev-web-mobile" },
    { name: "Design Graphique & UI/UX", count: 24, icon: "🎨", slug: "design-graphique" },
    { name: "Marketing & Réseaux Sociaux", count: 15, icon: "📢", slug: "marketing-digital" },
    { name: "Rédaction & Traduction", count: 12, icon: "✍️", slug: "redaction-contenu" },
    { name: "Gestion & Comptabilité TPE", count: 9, icon: "📊", slug: "gestion-comptabilite" },
  ];

  const highlights = [
    {
      title: "Missions réelles vérifiées",
      description: "Des entreprises clientes identifiées. Aucune fausse mission, zéro fausse promesse d'enrichissement facile.",
      icon: ShieldCheck,
      color: "text-brand-600 bg-brand-50 border-brand-100",
    },
    {
      title: "Gestion complète & Factures",
      description: "Créez vos devis et factures aux normes locales en FCFA / EUR / USD et suivez vos encaissements réels.",
      icon: FileSpreadsheet,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "Business Coach IA",
      description: "Structurez vos offres, calculez vos prix avec une marge réaliste et préparez vos propositions commerciales.",
      icon: Bot,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Plateforme SaaS • Lancement Pilote Bénin & Afrique de l'Ouest
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Trouvez des missions. <br />
              <span className="text-brand-600">Gérez votre activité.</span> <br />
              Bâtissez des revenus durables.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              AFriGain connecte les jeunes entrepreneurs et indépendants avec des entreprises sérieuses, avec les outils intégrés de devis, factures et coaching IA pour réussir chaque mission.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/missions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-md hover:shadow-lg transition-all"
              >
                <Briefcase className="w-5 h-5" />
                Découvrir les missions
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 shadow-sm transition-all"
              >
                <Users className="w-5 h-5 text-slate-600" />
                Recruter un prestataire
              </Link>
            </div>

            {/* Note de confiance absolue */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Priorité aux relations professionnelles réelles — Aucune promesse de gains non fondés</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pilliers Fonctionnels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Tout pour structurer et faire grandir votre activité
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            De la négociation de la première mission jusqu'à l'encaissement et la fidélisation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4"
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${h.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{h.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  {h.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Catégories de Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Catégories de services populaires
            </h2>
            <p className="text-sm text-slate-600">
              Les compétences les plus recherchées par les entreprises clientes au Bénin et à l'international.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            Explorer tout le catalogue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c, i) => (
            <Link
              key={i}
              href={`/missions?category=${c.slug}`}
              className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-brand-500 hover:shadow-sm transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors text-sm">
                    {c.name}
                  </h4>
                  <span className="text-xs text-slate-500">Missions disponibles</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Prêt à développer votre clientèle et sécuriser vos revenus ?
            </h2>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Créez votre profil professionnel dès aujourd'hui, configurez vos premiers devis et échangez directement avec les entreprises donneuses d'ordre.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/auth/register"
              className="px-6 py-3.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-xl text-center text-sm shadow-md transition-all"
            >
              Créer mon compte gratuitement
            </Link>
            <Link
              href="/dashboard/coach-ia"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl text-center text-sm transition-all"
            >
              Tester le Coach IA
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

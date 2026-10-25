"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  MapPin, 
  Globe2, 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Send, 
  CheckCircle2, 
  ExternalLink,
  Phone,
  Mail,
  Award,
  Sparkles,
  ArrowRight,
  X,
  Camera,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from "lucide-react";
import { FraudReportModal } from "@/components/FraudReportModal";

interface CompanyProfile {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  city: string;
  country: string;
  teamSize: string;
  verified: boolean;
  services: string[];
  products: string[];
  references: string[];
  zones: string[];
  email: string;
  phone: string;
  website?: string;
  openJobsCount: number;
  openMissionsCount: number;
  newsTitle?: string;
  newsContent?: string;
  galleryUrls?: string[]; // Section 7 : 5 photos maximum de présentation
}

const INITIAL_COMPANIES: CompanyProfile[] = [
  {
    id: "comp-1",
    name: "Sahel Fintech Solutions",
    tagline: "Plateforme de paiement mobile et d'inclusion financière pour l'Afrique de l'Ouest",
    sector: "Technologies & Fintech",
    city: "Abomey-Calavi",
    country: "Bénin",
    teamSize: "15-30 collaborateurs",
    verified: true,
    services: ["Intégration d'APIs de paiement Mobile Money", "Développement SaaS sur mesure", "Audit de cybersécurité"],
    products: ["Passerelle AfriPay", "Terminal commerçant QR Code"],
    references: ["Plus de 250 commerçants connectés", "Partenaire agréé des opérateurs télécoms"],
    zones: ["Bénin", "Togo", "Côte d'Ivoire", "Sénégal"],
    email: "contact@sahelfintech.bj",
    phone: "+229 97 10 20 30",
    website: "https://sahelfintech.bj",
    openJobsCount: 1,
    openMissionsCount: 2,
    newsTitle: "Ouverture de notre nouvelle API de paiement QR Code pour TPE",
    newsContent: "Intégrez le paiement instantané sur votre site ou application en moins de 24h avec un taux réduit.",
    galleryUrls: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "comp-2",
    name: "Cabinet Conseil Fiduciaire Bénin",
    tagline: "Expertise comptable, déclarations fiscales et structuration de PME",
    sector: "Comptabilité & Conseil Juridique",
    city: "Cotonou",
    country: "Bénin",
    teamSize: "10-20 experts",
    verified: true,
    services: ["Tenue comptable SYSCOHADA", "Assistance fiscale et sociale", "Montage de dossiers de crédit bancaire"],
    products: ["Pack Clôture Annuelle TPE", "Audit de conformité CNSS/DGI"],
    references: ["Membre de l'Ordre des Experts-Comptables", "Accompagnement de plus de 80 PME"],
    zones: ["Cotonou", "Porto-Novo", "Parakou", "International"],
    email: "direction@fiduciaire-benin.bj",
    phone: "+229 95 44 22 11",
    openJobsCount: 1,
    openMissionsCount: 1,
    newsTitle: "Nouveau guide fiscal 2026 pour micro-entrepreneurs",
    newsContent: "Téléchargez les bonnes pratiques pour optimiser vos déclarations sans pénalités.",
    galleryUrls: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "comp-3",
    name: "Énergie Verte Afrique",
    tagline: "Ingénierie solaire, pompage photovoltaïque et autonomie énergétique",
    sector: "Énergie & Travaux",
    city: "Parakou",
    country: "Bénin",
    teamSize: "20-50 techniciens",
    verified: true,
    services: ["Dimensionnement solaire résidentiel & agricole", "Installation de pompes solaires immergées", "Maintenance industrielle"],
    products: ["Kits solaires autonomes 3kVA à 20kVA", "Onduleurs hybrides intelligents"],
    references: ["120 fermes agricoles équipées dans le Borgou et l'Alibori", "Garantie matériel 5 ans"],
    zones: ["Bénin (National)", "Niger", "Burkina Faso"],
    email: "info@energieverte-afrique.com",
    phone: "+229 96 55 66 77",
    openJobsCount: 1,
    openMissionsCount: 0,
    newsTitle: "Campagne d'électrification des fermes maraîchères 2026",
    newsContent: "Facilités de paiement en 3 fois sans frais pour les exploitants agricoles enregistrés sur AfriGain.",
    galleryUrls: [
      "https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    id: "comp-4",
    name: "Studio Digital Créatif",
    tagline: "Agence de branding, communication de marque et production de contenu digital",
    sector: "Marketing, Design & Médias",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    teamSize: "8 créatifs",
    verified: true,
    services: ["Identité visuelle & Logotypes", "Stratégie de contenu réseaux sociaux", "Shooting photos produits"],
    products: ["Pack Identité Visuelle Express", "Abonnement Community Management Mensuel"],
    references: ["Plus de 40 marques accompagnées en Afrique de l'Ouest", "Trophée Créativité Digitale 2025"],
    zones: ["Côte d'Ivoire", "Bénin", "Sénégal", "France"],
    email: "bonjour@studiocreatif.ci",
    phone: "+225 07 08 09 10 11",
    openJobsCount: 1,
    openMissionsCount: 1,
    galleryUrls: [
      "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=800&q=80"
    ],
  },
];

export default function EntreprisesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [companies, setCompanies] = useState<CompanyProfile[]>(INITIAL_COMPANIES);

  // Modale contact / demande de devis
  const [contactCompany, setContactCompany] = useState<CompanyProfile | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccess, setContactSuccess] = useState(false);

  // Modale Galerie 5 photos d'activité (Section 7)
  const [galleryCompany, setGalleryCompany] = useState<CompanyProfile | null>(null);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState<string | null>(null);

  // Modale Signalement Anti-Arnaque (Section 14)
  const [reportCompany, setReportCompany] = useState<CompanyProfile | null>(null);

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.services.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.products.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSector = selectedSector === "all" || c.sector.includes(selectedSector);
    const matchesCity = selectedCity === "all" || c.city === selectedCity;

    return matchesSearch && matchesSector && matchesCity;
  });

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactCompany(null);
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-2">
          <Building2 className="w-3.5 h-3.5 text-slate-700" />
          Annuaire Entreprises & Partenariats • Section 10 AfriGain
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Entreprises & Partenaires Professionnels
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-3xl">
          Découvrez les entreprises enregistrées sur AfriGain, explorez leurs réalisations, leurs offres de services et contactez directement leurs équipes pour des partenariats ou des demandes de devis.
        </p>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Rechercher par nom d'entreprise, produit, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">Tous les secteurs d'activité</option>
            <option value="Technologies">Technologies & Fintech</option>
            <option value="Comptabilité">Comptabilité & Juridique</option>
            <option value="Énergie">Énergie, Travaux & BTP</option>
            <option value="Marketing">Marketing, Design & Médias</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="all">Toutes les villes</option>
            <option value="Cotonou">Cotonou (Bénin)</option>
            <option value="Abomey-Calavi">Abomey-Calavi (Bénin)</option>
            <option value="Parakou">Parakou (Bénin)</option>
            <option value="Abidjan">Abidjan (Côte d'Ivoire)</option>
          </select>
        </div>
      </div>

      {/* Grille des Entreprises */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    {c.name}
                    {c.verified && (
                      <span title="Entreprise vérifiée"><ShieldCheck className="w-4 h-4 text-brand-600" /></span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.city}, {c.country}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {c.teamSize}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {c.sector.split("&")[0]}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {c.tagline}
              </p>

              {/* Services & Produits phares */}
              <div className="space-y-2 pt-1 text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">Prestations de services :</span>
                  <div className="flex flex-wrap gap-1">
                    {c.services.map((s, idx) => (
                      <span key={idx} className="bg-brand-50/60 text-brand-800 border border-brand-100 px-2 py-0.5 rounded text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {c.products.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">Produits / Solutions :</span>
                    <div className="flex flex-wrap gap-1">
                      {c.products.map((p, idx) => (
                        <span key={idx} className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actualité commerciale si présente (Section 10) */}
              {c.newsTitle && (
                <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    Actualité commerciale
                  </span>
                  <h4 className="font-bold text-amber-950">{c.newsTitle}</h4>
                  <p className="text-slate-600 text-[11px] leading-snug">{c.newsContent}</p>
                </div>
              )}
            </div>

            {/* Galerie d'activité 5 photos max (Section 7) & Actions */}
            <div className="flex items-center justify-between pt-2">
              {c.galleryUrls && c.galleryUrls.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setGalleryCompany(c);
                    setGalleryActiveIndex(0);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-brand-600" />
                  <span>Galerie ({c.galleryUrls.length}/5 photos)</span>
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Galerie en cours de mise en ligne</span>
              )}

              <button
                type="button"
                onClick={() => setReportCompany(c)}
                className="text-slate-400 hover:text-rose-600 text-[11px] flex items-center gap-1 p-1 transition-colors"
                title="Signaler ce profil suspect"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Signaler</span>
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {c.openJobsCount > 0 && (
                  <Link
                    href="/emplois"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100"
                  >
                    {c.openJobsCount} offre active
                  </Link>
                )}
                {c.openMissionsCount > 0 && (
                  <Link
                    href="/missions"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 hover:bg-brand-100"
                  >
                    {c.openMissionsCount} mission
                  </Link>
                )}
              </div>

              <button
                onClick={() => setContactCompany(c)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                Contacter / Devis <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE GALERIE D'ACTIVITÉ ENTREPRISE (Section 7 : Affichage public 5 photos max, responsive, zoom, proportions respectées) */}
      {galleryCompany && galleryCompany.galleryUrls && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col relative">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                  Galerie d'Activité Officielle • 5 Photos Maximum
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{galleryCompany.name}</h3>
                <span className="text-xs text-slate-500">{galleryCompany.city}, {galleryCompany.country}</span>
              </div>
              <button
                onClick={() => setGalleryCompany(null)}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu photo grande image */}
            <div className="p-4 sm:p-6 bg-slate-950 flex flex-col items-center justify-center relative select-none">
              <div className="relative aspect-[16/9] w-full max-h-[50vh] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={galleryCompany.galleryUrls[galleryActiveIndex]}
                  alt={`${galleryCompany.name} - Photo ${galleryActiveIndex + 1}`}
                  className="w-full h-full object-contain cursor-pointer"
                  onClick={() => setZoomPhotoUrl(galleryCompany.galleryUrls![galleryActiveIndex])}
                />

                <div className="absolute top-3 left-3 bg-black/60 text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
                  Photo {galleryActiveIndex + 1} / {galleryCompany.galleryUrls.length}
                </div>

                <button
                  type="button"
                  onClick={() => setZoomPhotoUrl(galleryCompany.galleryUrls![galleryActiveIndex])}
                  className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-xl transition-colors"
                  title="Agrandir en haute définition"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {galleryCompany.galleryUrls.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setGalleryActiveIndex((prev) =>
                          prev === 0 ? galleryCompany.galleryUrls!.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setGalleryActiveIndex((prev) =>
                          prev === galleryCompany.galleryUrls!.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Miniatures */}
              <div className="flex items-center gap-2 pt-4 overflow-x-auto max-w-full">
                {galleryCompany.galleryUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGalleryActiveIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === galleryActiveIndex
                        ? "border-brand-500 scale-105"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>* Présentation des locaux, ateliers, installations et réalisations professionnelles.</span>
              <button
                type="button"
                onClick={() => {
                  const comp = galleryCompany;
                  setGalleryCompany(null);
                  setContactCompany(comp);
                }}
                className="font-bold text-brand-700 hover:underline"
              >
                Demander un devis à cette entreprise →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom HD */}
      {zoomPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomPhotoUrl(null)}
        >
          <button
            onClick={() => setZoomPhotoUrl(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={zoomPhotoUrl}
            alt="Plein écran"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal Signalement Anti-Fraude */}
      {reportCompany && (
        <FraudReportModal
          isOpen={true}
          onClose={() => setReportCompany(null)}
          targetId={reportCompany.id}
          targetType="profile"
          targetTitle={reportCompany.name}
        />
      )}

      {/* Modale Demande de devis ou de contact */}
      {contactCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase">Mise en relation directe</span>
                <h3 className="text-lg font-bold text-slate-900">{contactCompany.name}</h3>
                <span className="text-xs text-slate-500">{contactCompany.city}, {contactCompany.country}</span>
              </div>
              <button onClick={() => setContactCompany(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Message transmis avec succès !</h4>
                <p className="text-xs text-slate-600">
                  Votre demande a été envoyée aux équipes de {contactCompany.name}. Vous recevrez une réponse sur vos coordonnées renseignées.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom complet ou Entreprise *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Christian Adjovi"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="christian@adjovi.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+229 97 00 00 00"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre besoin ou demande de devis *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Décrivez votre projet, vos objectifs, les prestations visées et vos contraintes de calendrier..."
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactCompany(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Transmettre la demande
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

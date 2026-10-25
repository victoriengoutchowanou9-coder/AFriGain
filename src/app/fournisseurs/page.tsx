"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  MapPin, 
  Package, 
  Truck, 
  ShieldCheck, 
  Send, 
  PlusCircle, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  DollarSign,
  Boxes,
  Clock,
  PhoneCall,
  Mail,
  Camera,
  AlertTriangle,
  Eye,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { SupplierProductGalleryModal, RichSupplierProduct } from "@/components/SupplierProductGalleryModal";
import { FraudReportModal } from "@/components/FraudReportModal";

interface Supplier {
  id: string;
  name: string;
  category: "agri" | "textile" | "materiaux" | "technologie" | "emballages" | "services_b2b";
  city: string;
  country: string;
  servedZones: string[];
  products: string[];
  minOrderQuantity: string;
  leadTime: string;
  paymentTerms: string;
  verified: boolean;
  contactEmail: string;
  contactPhone: string;
  description: string;
  detailedProducts?: RichSupplierProduct[]; // Section 8 : Au moins 5 photos par produit
}

interface SupplyNeed {
  id: string;
  title: string;
  buyer: string;
  location: string;
  quantityNeeded: string;
  frequency: string;
  budgetEstimated?: string;
  postedDate: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "AgroBénin Appro & Matières Premières",
    category: "agri",
    city: "Parakou",
    country: "Bénin",
    servedZones: ["Bénin", "Togo", "Niger", "Burkina Faso"],
    products: ["Soja non OGM certifié", "Maïs grain nettoyé", "Noix de cajou brutes", "Manioc séché"],
    minOrderQuantity: "1 tonne (1 000 kg)",
    leadTime: "3 à 5 jours ouvrés",
    paymentTerms: "30% à la commande, 70% à la pesée/livraison",
    verified: true,
    contactEmail: "appro@agrobenin.bj",
    contactPhone: "+229 97 22 11 00",
    description: "Fournisseur direct de coopératives agricoles du Nord Bénin. Qualité calibrée avec certificats phytosanitaires disponibles.",
    detailedProducts: [
      {
        id: "prod-soja-1",
        name: "Soja non OGM certifié Bénin (Qualité Export UEMOA)",
        supplierName: "AgroBénin Appro",
        supplierCity: "Parakou",
        supplierCountry: "Bénin",
        supplierVerified: true,
        category: "Matières Premières Agricoles",
        description: "Graines de soja jaune récoltées dans les fermes du Borgou. Taux d'humidité contrôlé inférieur à 10%, calibrage homogène et absence d'impuretés. Idéal pour unités de transformation en huile, tourteau ou lait de soja.",
        minOrderQuantity: "1 tonne (sacs de 50 kg ou 100 kg)",
        leadTime: "3 à 5 jours ouvrés",
        paymentTerms: "Acompte 30%, solde à la pesée contradictoire",
        galleryUrls: [
          "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80"
        ]
      }
    ]
  },
  {
    id: "sup-2",
    name: "Atelier Textile & Confection Éco-Wax",
    category: "textile",
    city: "Cotonou",
    country: "Bénin",
    servedZones: ["Bénin", "Côte d'Ivoire", "Sénégal", "France"],
    products: ["Tissus teints artisanalement", "Uniformes de travail pour PME", "Sacs en toile de jute", "Linge professionnel"],
    minOrderQuantity: "50 pièces",
    leadTime: "7 à 10 jours",
    paymentTerms: "Acompte 40%, solde à la livraison",
    verified: true,
    contactEmail: "contact@ecowax-atelier.bj",
    contactPhone: "+229 95 33 44 55",
    description: "Atelier de confection semi-industriel et artisanal pour créateurs, hôtels et uniformes d'entreprises.",
    detailedProducts: [
      {
        id: "prod-wax-1",
        name: "Tissus teints artisanalement & Wax haute résistance",
        supplierName: "Atelier Éco-Wax",
        supplierCity: "Cotonou",
        supplierCountry: "Bénin",
        supplierVerified: true,
        category: "Textile & Confection",
        description: "Rouleaux de tissus 100% coton teints avec pigments naturels et fixateurs durables. Motifs traditionnels et contemporains. Résistance prouvée au lavage intensif.",
        minOrderQuantity: "50 mètres ou 20 pièces",
        leadTime: "7 à 10 jours",
        paymentTerms: "40% commande, 60% livraison",
        galleryUrls: [
          "https://images.unsplash.com/photo-1528458876885-544243324950?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
        ]
      }
    ]
  },
  {
    id: "sup-3",
    name: "AfriPack Solutions Emballages",
    category: "emballages",
    city: "Abomey-Calavi",
    country: "Bénin",
    servedZones: ["Bénin", "Togo", "Ghana"],
    products: ["Cartons d'expédition sur mesure", "Bocaux en verre alimentaire", "Poches kraft avec fenêtre", "Étiquettes adhésives"],
    minOrderQuantity: "200 unités",
    leadTime: "48 heures pour stock standard",
    paymentTerms: "Paiement comptant ou à 15 jours pour comptes vérifiés",
    verified: true,
    contactEmail: "ventes@afripack.bj",
    contactPhone: "+229 96 11 22 33",
    description: "Fabrication et distribution de solutions d'emballage écoresponsables pour transformateurs agroalimentaires et e-commerçants.",
    detailedProducts: [
      {
        id: "prod-pack-1",
        name: "Cartons double cannelure & Poches Kraft thermosoudables",
        supplierName: "AfriPack Solutions",
        supplierCity: "Abomey-Calavi",
        supplierCountry: "Bénin",
        supplierVerified: true,
        category: "Emballages & Packaging",
        description: "Emballages recyclables résistants aux chocs climatiques tropicaux. Personnalisables avec logo en sérigraphie à base d'encre végétale.",
        minOrderQuantity: "200 unités",
        leadTime: "48h stock / 5j personnalisation",
        paymentTerms: "Comptant ou virement 15j",
        galleryUrls: [
          "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80"
        ]
      }
    ]
  },
  {
    id: "sup-4",
    name: "BTP Matériaux & Quincaillerie Centrale",
    category: "materiaux",
    city: "Porto-Novo",
    country: "Bénin",
    servedZones: ["Ouémé", "Plateau", "Littoral", "Atlantique"],
    products: ["Ciment de classe supérieure", "Fers à béton normes CE/UEMOA", "Peintures professionnelles", "Câbles électriques"],
    minOrderQuantity: "Selon produit (Détail & Gros)",
    leadTime: "Livraison sur chantier en 24h",
    paymentTerms: "Virement ou Mobile Money sécurisé",
    verified: true,
    contactEmail: "commandes@btp-centrale.bj",
    contactPhone: "+229 94 88 77 66",
    description: "Grossiste en fournitures pour artisans électriciens, plombiers, menuisiers et constructeurs.",
    detailedProducts: [
      {
        id: "prod-btp-1",
        name: "Fers à béton crantés FE500 & Ciment CPJ 42.5",
        supplierName: "BTP Quincaillerie Centrale",
        supplierCity: "Porto-Novo",
        supplierCountry: "Bénin",
        supplierVerified: true,
        category: "BTP & Construction",
        description: "Matériaux de gros œuvre certifiés conformes aux normes UEMOA. Stockage au sec, livraison rapide directement par camion plateau sur chantier.",
        minOrderQuantity: "2 tonnes fers ou 50 sacs ciment",
        leadTime: "24h sur chantier",
        paymentTerms: "Mobile Money sécurisé ou chèque certifié",
        galleryUrls: [
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80"
        ]
      }
    ]
  },
];

const INITIAL_SUPPLY_NEEDS: SupplyNeed[] = [
  {
    id: "need-1",
    title: "Recherche fournisseur régulier de carton ondulé double cannelure",
    buyer: "Cosmétique Naturelle Bénin",
    location: "Cotonou",
    quantityNeeded: "1 500 unités / mois",
    frequency: "Mensuelle récurrente",
    budgetEstimated: "450 000 FCFA / lot",
    postedDate: "23/10/2026",
  },
  {
    id: "need-2",
    title: "Besoin de 5 tonnes d'ananas de table Pain de Sucre calibrés pour jus",
    buyer: "Unité de Pressage Allada",
    location: "Allada / Atlantique",
    quantityNeeded: "5 tonnes",
    frequency: "Bi-hebdomadaire",
    budgetEstimated: "1 250 000 FCFA",
    postedDate: "24/10/2026",
  },
];

export default function FournisseursPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");

  const [activeTab, setActiveTab] = useState<"suppliers" | "supply_needs">("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [supplyNeeds, setSupplyNeeds] = useState<SupplyNeed[]>(INITIAL_SUPPLY_NEEDS);

  // Modale devis fournisseur
  const [rfqSupplier, setRfqSupplier] = useState<Supplier | null>(null);
  const [rfqQuantity, setRfqQuantity] = useState("");
  const [rfqMessage, setRfqMessage] = useState("");
  const [rfqSenderName, setRfqSenderName] = useState("");
  const [rfqSenderContact, setRfqSenderContact] = useState("");
  const [rfqSuccess, setRfqSuccess] = useState(false);

  // Modale Galerie Produit Fournisseur (Section 8 : Au moins 5 photos par produit)
  const [selectedProductForGallery, setSelectedProductForGallery] = useState<RichSupplierProduct | null>(null);

  // Modale Signalement Anti-Arnaque (Section 14)
  const [reportingSupplier, setReportingSupplier] = useState<Supplier | null>(null);

  // Modale publier besoin d'approvisionnement
  const [isNeedModalOpen, setIsNeedModalOpen] = useState(false);
  const [needTitle, setNeedTitle] = useState("");
  const [needBuyer, setNeedBuyer] = useState("");
  const [needLocation, setNeedLocation] = useState("Cotonou");
  const [needQuantity, setNeedQuantity] = useState("");
  const [needBudget, setNeedBudget] = useState("");

  const filteredSuppliers = suppliers.filter((sup) => {
    const matchesSearch =
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.products.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sup.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || sup.category === selectedCategory;
    const matchesZone = selectedZone === "all" || sup.servedZones.includes(selectedZone) || sup.country === selectedZone;

    return matchesSearch && matchesCategory && matchesZone;
  });

  const handleSendRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    setRfqSuccess(true);
    setTimeout(() => {
      setRfqSuccess(false);
      setRfqSupplier(null);
      setRfqQuantity("");
      setRfqMessage("");
    }, 1800);
  };

  const handleCreateNeed = (e: React.FormEvent) => {
    e.preventDefault();
    const created: SupplyNeed = {
      id: `need-${Date.now()}`,
      title: needTitle,
      buyer: needBuyer,
      location: needLocation,
      quantityNeeded: needQuantity,
      frequency: "Commande ponctuelle / récurrente",
      budgetEstimated: needBudget || "À convenir selon offre",
      postedDate: new Date().toLocaleDateString("fr-FR"),
    };
    setSupplyNeeds([created, ...supplyNeeds]);
    setIsNeedModalOpen(false);
    setNeedTitle("");
    setNeedBuyer("");
    setNeedQuantity("");
    setNeedBudget("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <Package className="w-3.5 h-3.5 text-blue-600" />
            Marketplace B2B • Section 9 & 10 AfriGain
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Produits, Fournisseurs & Approvisionnement
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Développez des relations d'affaires : approvisionnez votre activité en matières premières, trouvez des distributeurs et sous-traitants fiables.
          </p>
        </div>

        <button
          onClick={() => setIsNeedModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Publier un besoin d'approvisionnement
        </button>
      </div>

      {/* Onglets navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "suppliers"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Fiches Fournisseurs Certifiés ({filteredSuppliers.length})
        </button>

        <button
          onClick={() => setActiveTab("supply_needs")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "supply_needs"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Boxes className="w-4 h-4" />
          Besoins d'approvisionnement publiés ({supplyNeeds.length})
        </button>
      </div>

      {activeTab === "suppliers" ? (
        <div className="space-y-6">
          {/* Recherche & Filtres */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Rechercher par produit, matière, fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="all">Toutes les catégories de fournitures</option>
                <option value="agri">Agriculture & Agroalimentaire</option>
                <option value="textile">Textile, Couture & Tissus</option>
                <option value="materiaux">BTP, Électricité & Outillage</option>
                <option value="emballages">Packaging & Emballages</option>
                <option value="technologie">Technologie & Équipements</option>
              </select>
            </div>

            <div>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs bg-white text-slate-700"
              >
                <option value="all">Toutes les zones desservies</option>
                <option value="Bénin">Bénin</option>
                <option value="Togo">Togo</option>
                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                <option value="Niger">Niger</option>
                <option value="Burkina Faso">Burkina Faso</option>
                <option value="France">International (Europe)</option>
              </select>
            </div>
          </div>

          {/* Grille des fiches fournisseurs (Section 9.1) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSuppliers.map((sup) => (
              <div
                key={sup.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-brand-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        {sup.name}
                        {sup.verified && (
                          <span title="Vérifications légales validées"><ShieldCheck className="w-4 h-4 text-brand-600" /></span>
                        )}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {sup.city}, {sup.country}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {sup.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {sup.description}
                  </p>

                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <span>Produits & Galeries (5+ photos distinctes) :</span>
                      <span className="text-[10px] text-brand-600 font-normal">Cliquer pour voir la galerie</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {sup.detailedProducts && sup.detailedProducts.length > 0 ? (
                        sup.detailedProducts.map((dp) => (
                          <button
                            key={dp.id}
                            type="button"
                            onClick={() => setSelectedProductForGallery(dp)}
                            className="bg-white hover:bg-brand-50 border border-brand-200 text-brand-800 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shadow-sm flex items-center gap-1.5 group"
                          >
                            <Camera className="w-3.5 h-3.5 text-brand-600 group-hover:scale-110 transition-transform" />
                            <span>{dp.name}</span>
                            <span className="text-[9px] bg-brand-100 text-brand-800 px-1.5 py-0.2 rounded font-mono font-bold">
                              {dp.galleryUrls.length} photos
                            </span>
                          </button>
                        ))
                      ) : (
                        sup.products.map((p, idx) => (
                          <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                            ✓ {p}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block font-medium">Quantité minimale :</span>
                      <span className="font-semibold text-slate-800">{sup.minOrderQuantity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Délai indicatif :</span>
                      <span className="font-semibold text-slate-800">{sup.leadTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Conditions de vente :</span>
                      <span className="font-semibold text-slate-800">{sup.paymentTerms}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Zones livrées :</span>
                      <span className="font-semibold text-slate-800 truncate block">{sup.servedZones.join(", ")}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 flex items-center gap-3">
                    <span className="flex items-center gap-1"><PhoneCall className="w-3 h-3 text-slate-400" /> {sup.contactPhone}</span>
                    <button
                      type="button"
                      onClick={() => setReportingSupplier(sup)}
                      className="text-slate-400 hover:text-rose-600 text-[10px] flex items-center gap-1"
                      title="Signaler ce fournisseur"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Signaler
                    </button>
                  </div>
                  <button
                    onClick={() => setRfqSupplier(sup)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    Demander un devis B2B <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Besoins d'approvisionnement */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Besoins d'approvisionnement & Appels à fournisseurs
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Entreprises et artisans à la recherche de partenaires commerciaux réguliers.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {supplyNeeds.map((need) => (
                <div key={need.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{need.title}</h3>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                      {need.budgetEstimated}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Acheteur : {need.buyer}</span>
                    <span>Localisation : {need.location}</span>
                    <span>Volume requis : {need.quantityNeeded}</span>
                    <span>Publié le {need.postedDate}</span>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => alert(`Pour répondre au besoin "${need.title}", connectez-vous ou contactez l'équipe commerciale AfriGain.`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Soumettre une offre fournisseur <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modale Demande de devis fournisseur (RFQ) */}
      {rfqSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase">Demande de cotation B2B</span>
                <h3 className="text-lg font-bold text-slate-900">{rfqSupplier.name}</h3>
                <span className="text-xs text-slate-500">Délai estimé : {rfqSupplier.leadTime} • MOQ : {rfqSupplier.minOrderQuantity}</span>
              </div>
              <button onClick={() => setRfqSupplier(null)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rfqSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-base font-bold text-slate-900">Demande de devis transmise !</h4>
                <p className="text-xs text-slate-600">
                  Le fournisseur a reçu vos spécifications techniques et reviendra vers vous sous 24 à 48 heures.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendRFQ} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Nom / Entreprise *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Savonnerie du Bénin"
                      value={rfqSenderName}
                      onChange={(e) => setRfqSenderName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro WhatsApp / Téléphone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+229 97 00 00 00"
                      value={rfqSenderContact}
                      onChange={(e) => setRfqSenderContact(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantité souhaitée & Référence produit *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 500 poches kraft 250g ou 2 tonnes de soja"
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Précisions & lieu de livraison souhaité</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Précisez votre adresse de réception, votre délai d'urgence et vos éventuelles exigences de conditionnement..."
                    value={rfqMessage}
                    onChange={(e) => setRfqMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setRfqSupplier(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                  >
                    Envoyer ma demande de devis
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Publier un besoin */}
      {isNeedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Publier un besoin d'approvisionnement</h3>
                <span className="text-xs text-slate-500">Trouvez des fournisseurs capables de répondre à vos critères</span>
              </div>
              <button onClick={() => setIsNeedModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNeed} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Objet du besoin *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Recherche 300 mètres de tissu wax véritable pour confection"
                  value={needTitle}
                  onChange={(e) => setNeedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Votre Organisation / Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Styliste Cotonou"
                    value={needBuyer}
                    onChange={(e) => setNeedBuyer(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville de livraison</label>
                  <input
                    type="text"
                    value={needLocation}
                    onChange={(e) => setNeedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Volume / Quantité requise *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 300 mètres ou 5 tonnes"
                    value={needQuantity}
                    onChange={(e) => setNeedQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Budget indicatif</label>
                  <input
                    type="text"
                    placeholder="Ex: 500 000 FCFA"
                    value={needBudget}
                    onChange={(e) => setNeedBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNeedModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Publier l'annonce
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Galerie Produit Fournisseur (Section 8 : Inspection 5+ photos distinctes, zoom HD, miniatures) */}
      <SupplierProductGalleryModal
        product={selectedProductForGallery}
        onClose={() => setSelectedProductForGallery(null)}
        onRequestQuote={(prod) => {
          setSelectedProductForGallery(null);
          const foundSupplier = suppliers.find((s) => s.name === prod.supplierName) || suppliers[0];
          setRfqSupplier(foundSupplier);
          setRfqQuantity(`1 lot de "${prod.name}"`);
        }}
      />

      {/* Modale Signalement Anti-Fraude (Section 14) */}
      {reportingSupplier && (
        <FraudReportModal
          isOpen={true}
          onClose={() => setReportingSupplier(null)}
          targetId={reportingSupplier.id}
          targetType="profile"
          targetTitle={reportingSupplier.name}
        />
      )}
    </div>
  );
}

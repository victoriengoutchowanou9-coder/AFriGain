"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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

export default function FournisseursPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedZone, setSelectedZone] = useState("all");

  const [activeTab, setActiveTab] = useState<"suppliers" | "supply_needs">("suppliers");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplyNeeds, setSupplyNeeds] = useState<SupplyNeed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSuppliersAndNeeds() {
      setLoading(true);
      const supabase = createClient();

      const { data: sups } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['partner', 'client'])
        .eq('is_active', true);

      if (sups && sups.length > 0) {
        const cleanSups = sups.filter((s: any) => {
          const n = (s.company_name || s.full_name || "").toLowerCase();
          const em = (s.email || "").toLowerCase();
          const isTest = n.includes("test") || n.includes("testeur") || n.includes("demo") || em.includes("example.com");
          const hasBusiness = Boolean(s.company_name || s.business_sector || (s.headline && s.headline.trim().length > 3));
          return !isTest && hasBusiness;
        });

        const mappedSups = cleanSups.map((s: any) => ({
          id: s.id,
          name: s.company_name || s.full_name || "Fournisseur Partenaire",
          category: (s.business_sector?.toLowerCase().includes("textile") ? "textile" : s.business_sector?.toLowerCase().includes("tech") ? "technologie" : "agri") as any,
          city: s.city || "",
          country: s.country || "Afrique & International",
          servedZones: [s.city || s.country || "International"],
          products: Array.isArray(s.skills) ? s.skills : [],
          minOrderQuantity: 'À convenir',
          leadTime: 'Selon commande',
          paymentTerms: 'Paiement direct sécurisé ou virement',
          verified: s.verification_status === 'verified',
          contactEmail: s.email,
          contactPhone: s.phone || 'Non renseigné',
          description: s.headline || s.bio || 'Fournisseur B2B enregistré sur AfriGain.',
          detailedProducts: [],
        }));
        setSuppliers(mappedSups);
      } else {
        setSuppliers([]);
      }

      const { data: reqs } = await supabase
        .from('search_requests')
        .select('*, profiles:author_id(full_name, company_name)')
        .eq('status', 'open');

      if (reqs && reqs.length > 0) {
        const mappedNeeds = reqs.map((r: any) => ({
          id: r.id,
          title: r.title,
          buyer: r.profiles?.company_name || r.profiles?.full_name || 'Acheteur',
          location: r.location_city || 'Cotonou',
          quantityNeeded: r.quantity || 'Selon offre',
          frequency: 'Ponctuelle',
          budgetEstimated: r.budget_indicative ? `${r.budget_indicative} ${r.currency}` : 'Non spécifié',
          postedDate: new Date(r.created_at).toLocaleDateString('fr-FR'),
        }));
        setSupplyNeeds(mappedNeeds);
      } else {
        setSupplyNeeds([]);
      }
      setLoading(false);
    }

    loadSuppliersAndNeeds();
  }, []);

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

  const handleSendRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqSupplier) return;
    try {
      await fetch("/api/quotes/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          talentId: rfqSupplier.id,
          talentName: rfqSupplier.name,
          clientName: rfqSenderName.trim() || "Acheteur Professionnel",
          clientPhone: rfqSenderContact.trim() || "+229 00 00 00 00",
          needDescription: `[Demande de cotation B2B Fournisseur]\nQuantité & Référence : ${rfqQuantity}\nMessage : ${rfqMessage}`,
          currency: "XOF",
        }),
      });
      setRfqSuccess(true);
      setTimeout(() => {
        setRfqSuccess(false);
        setRfqSupplier(null);
        setRfqQuantity("");
        setRfqMessage("");
        setRfqSenderName("");
        setRfqSenderContact("");
      }, 1800);
    } catch (err) {
      console.error("Erreur RFQ:", err);
    }
  };

  const handleCreateNeed = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) {
        window.location.href = "/auth/login?redirect=/fournisseurs";
        return;
      }
      const { data: inserted, error } = await supabase.from("search_requests").insert({
        author_id: u.user.id,
        title: needTitle.trim(),
        category: "Fournitures & B2B",
        quantity: needQuantity.trim() || null,
        location_city: needLocation.trim() || "Cotonou",
        budget_indicative: Number(needBudget) || null,
        currency: "XOF",
        status: "open",
        description: `Besoin d'approvisionnement B2B publié par ${needBuyer.trim() || u.user.user_metadata?.full_name || 'Entreprise'}`
      }).select().single();

      if (!error && inserted) {
        const created: SupplyNeed = {
          id: inserted.id,
          title: inserted.title,
          buyer: needBuyer.trim() || "Entreprise",
          location: needLocation.trim(),
          quantityNeeded: needQuantity.trim(),
          frequency: "Commande B2B",
          budgetEstimated: needBudget ? `${needBudget} XOF` : "À convenir selon offre",
          postedDate: new Date().toLocaleDateString("fr-FR"),
        };
        setSupplyNeeds([created, ...supplyNeeds]);
      }
    } catch (err) {
      console.error("Erreur enregistrement besoin:", err);
    }
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
            {filteredSuppliers.length === 0 ? (
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Package className="w-10 h-10 text-brand-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Aucun fournisseur enregistré pour le moment</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Toutes les données de démonstration ont été purgées. Les fournisseurs B2B enregistrés apparaîtront ici.
                </p>
              </div>
            ) : filteredSuppliers.map((sup) => (
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
              {supplyNeeds.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-xs text-slate-500">Aucun besoin d'approvisionnement en attente actuellement.</p>
                </div>
              ) : supplyNeeds.map((need) => (
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

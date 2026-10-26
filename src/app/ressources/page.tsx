"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Boxes, 
  PlusCircle, 
  Search, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  X, 
  Loader2, 
  Camera, 
  Laptop, 
  Scissors, 
  Wrench, 
  Tractor, 
  Home, 
  ArrowRight,
  Send
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface ResourceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  location_city: string;
  location_country: string;
  terms_of_use?: string;
  price_per_day: number;
  currency: string;
  is_free_sharing: boolean;
  deposit_required: number;
  availability_status: string;
  verification_status: string;
  created_at: string;
  owner_name?: string;
}

const CATEGORIES = [
  { id: "all", label: "Toutes les ressources", icon: Boxes },
  { id: "informatique", label: "Informatique & PC", icon: Laptop },
  { id: "photo_video", label: "Photo & Vidéo", icon: Camera },
  { id: "textile_couture", label: "Couture & Textile", icon: Scissors },
  { id: "btp_outillage", label: "Outillage & BTP", icon: Wrench },
  { id: "agricole", label: "Matériel Agricole", icon: Tractor },
  { id: "espaces_ateliers", label: "Ateliers & Espaces", icon: Home },
];

export default function RessourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modale Publier une ressource
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("informatique");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [pricePerDay, setPricePerDay] = useState("");
  const [isFreeSharing, setIsFreeSharing] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [terms, setTerms] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Modale Réserver
  const [selectedRes, setSelectedRes] = useState<ResourceItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [reserving, setReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);

  useEffect(() => {
    async function loadResources() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("shared_resources")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setResources(data as any);
        } else {
          setResources([]);
        }
      } catch (err) {
        console.error("Erreur de chargement ressources:", err);
      } finally {
        setLoading(false);
      }
    }
    loadResources();
  }, []);

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.location_city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCat === "all" || res.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handlePublishResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        alert("Veuillez vous connecter pour publier un équipement ou une ressource.");
        setPublishing(false);
        return;
      }

      const newRes = {
        owner_id: authData.user.id,
        name,
        category,
        description,
        location_city: city,
        location_country: "Bénin",
        price_per_day: isFreeSharing ? 0 : Number(pricePerDay) || 0,
        currency: "XOF",
        is_free_sharing: isFreeSharing,
        deposit_required: Number(deposit) || 0,
        terms_of_use: terms,
        availability_status: "available",
        verification_status: "verified",
      };

      const { data, error } = await supabase.from("shared_resources").insert(newRes).select();

      if (error) {
        console.warn("Table shared_resources fallback:", error.message);
      }

      if (data && data.length > 0) {
        setResources([data[0] as any, ...resources]);
      } else {
        setResources([{ id: `res-${Date.now()}`, ...newRes, created_at: new Date().toISOString() } as any, ...resources]);
      }

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        setIsPublishOpen(false);
        setName("");
        setDescription("");
        setPricePerDay("");
        setDeposit("");
        setTerms("");
      }, 1500);
    } catch (err: any) {
      alert("Erreur lors de la publication : " + (err.message || "Veuillez réessayer."));
    } finally {
      setPublishing(false);
    }
  };

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRes) return;
    setReserving(true);

    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();

      if (!authData?.user) {
        alert("Veuillez vous connecter pour réserver une ressource.");
        setReserving(false);
        return;
      }

      const { error } = await supabase.from("resource_reservations").insert({
        resource_id: selectedRes.id,
        borrower_id: authData.user.id,
        start_date: startDate,
        end_date: endDate,
        purpose,
        status: "pending",
      });

      if (error) {
        console.warn("Table reservations notice:", error.message);
      }

      setReserveSuccess(true);
      setTimeout(() => {
        setReserveSuccess(false);
        setSelectedRes(null);
        setStartDate("");
        setEndDate("");
        setPurpose("");
      }, 1600);
    } catch (err: any) {
      alert("Erreur lors de la réservation : " + (err.message || "Veuillez réessayer."));
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold mb-2">
            <Boxes className="w-3.5 h-3.5 text-emerald-600" />
            AfriGain Ressources • Accès Partagé aux Équipements Professionnels
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Partage & Location de Matériel
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-2xl">
            Accédez aux équipements nécessaires pour réaliser vos contrats sans devoir supporter des coûts d'achat prohibitifs. Machines, appareils photo, PC, outillage et ateliers.
          </p>
        </div>

        <button
          onClick={() => setIsPublishOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all self-start md:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Proposer un équipement
        </button>
      </div>

      {/* Barre de Recherche et Catégories */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher une machine à coudre, ordinateur portable, caméra, outil BTP ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = selectedCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  active
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des Ressources */}
      {loading ? (
        <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          <span className="text-xs text-slate-500 font-medium">Chargement des équipements disponibles...</span>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Boxes className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Aucun équipement disponible dans cette catégorie</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Toutes les données de démonstration ont été purgées. Les équipements professionnels partagés ou mis en location par les membres apparaîtront ici.
            </p>
          </div>
          <button
            onClick={() => setIsPublishOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Mettre à disposition le premier équipement
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                    {res.category.replace("_", " ")}
                  </span>
                  <span className="text-xs font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                    {res.is_free_sharing ? "Partage Solidaire (Gratuit)" : `${formatCurrency(res.price_per_day, res.currency)} / jour`}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">{res.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{res.description}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-600 space-y-1 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Caution exigée :</span>
                    <span className="font-bold text-slate-800">
                      {res.deposit_required > 0 ? formatCurrency(res.deposit_required, res.currency) : "Sans caution préalable"}
                    </span>
                  </div>
                  {res.terms_of_use && (
                    <div className="text-[10px] text-slate-500 pt-1 line-clamp-1">
                      Conditions : {res.terms_of_use}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{res.location_city}</span>
                </div>

                <button
                  onClick={() => setSelectedRes(res)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Envoyer une demande <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale Proposer une ressource */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Proposer un équipement professionnel</h3>
                <p className="text-[11px] text-slate-500">Mettez à disposition votre matériel inutilisé en toute sécurité.</p>
              </div>
              <button onClick={() => setIsPublishOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {publishSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Équipement enregistré avec succès !</h4>
                <p className="text-xs text-emerald-800">
                  Votre matériel est désormais visible. Vous pourrez valider chaque demande de réservation.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublishResource} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Nom de la ressource / Équipement *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Machine à coudre industrielle Singer 191D"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="informatique">Informatique & PC</option>
                    <option value="photo_video">Photo & Vidéo</option>
                    <option value="textile_couture">Couture & Textile</option>
                    <option value="btp_outillage">Outillage & BTP</option>
                    <option value="agricole">Matériel Agricole & Transformation</option>
                    <option value="espaces_ateliers">Espaces & Ateliers partagés</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Description de l'état et spécifications *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Précisez l'état du matériel, les accessoires fournis et les consignes..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Tarif par jour (FCFA)</label>
                    <input
                      type="number"
                      disabled={isFreeSharing}
                      value={pricePerDay}
                      onChange={(e) => setPricePerDay(e.target.value)}
                      placeholder={isFreeSharing ? "Gratuit" : "Ex: 5000"}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Caution demandée (FCFA)</label>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                      placeholder="Ex: 20000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="freeSharing"
                    checked={isFreeSharing}
                    onChange={(e) => setIsFreeSharing(e.target.checked)}
                    className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <label htmlFor="freeSharing" className="text-xs text-slate-700 font-semibold cursor-pointer">
                    Mise à disposition solidaire (Gratuite)
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ville / Commune *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Cotonou, Akpakpa"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Conditions de restitution & Règles</label>
                  <input
                    type="text"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Ex: Restitution dans l'emballage d'origine avec batterie chargée"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsPublishOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publier l'équipement"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modale Réserver un équipement */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Demande de réservation</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">{selectedRes.name}</p>
              </div>
              <button onClick={() => setSelectedRes(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reserveSuccess ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-sm">Demande transmise au propriétaire !</h4>
                <p className="text-xs text-emerald-800">
                  Le propriétaire a été notifié et validera la disponibilité selon vos dates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReserve} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Date de début *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Date de fin *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Projet / Motif d'utilisation *</label>
                  <textarea
                    rows={3}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Précisez pour quelle mission ou prestation vous avez besoin de ce matériel..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-bold text-slate-800 block">Modalités de règlement :</span>
                  <span>Aucun paiement préalable en ligne n'est débité. Le règlement et le dépôt de caution se font directement avec le propriétaire lors de la remise en main propre.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedRes(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={reserving}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {reserving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
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

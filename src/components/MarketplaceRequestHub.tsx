"use client";

import { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  MapPin, 
  DollarSign, 
  Send, 
  CheckCircle, 
  Plus, 
  X, 
  ChevronRight, 
  Building2, 
  MessageSquareQuote
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface SearchRequest {
  id: string;
  author_id: string;
  title: string;
  category: string;
  description: string | null;
  quantity: string | null;
  specifications: string | null;
  location_city: string;
  budget_indicative: number | null;
  currency: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    company_name: string | null;
  };
}

export function MarketplaceRequestHub() {
  const [requests, setRequests] = useState<SearchRequest[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal publier une demande "Je recherche"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Alimentation & Boissons");
  const [quantity, setQuantity] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [locationCity, setLocationCity] = useState("Cotonou");
  const [budget, setBudget] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal répondre à une demande
  const [activeRequest, setActiveRequest] = useState<SearchRequest | null>(null);
  const [proposalText, setProposalText] = useState("");
  const [priceOffer, setPriceOffer] = useState<number | "">("");
  const [isSendingProposal, setIsSendingProposal] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("search_requests")
      .select(`
        id, author_id, title, category, description, quantity, specifications,
        location_city, budget_indicative, currency, status, created_at,
        profiles:author_id (full_name, company_name)
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(20);

    if (data) {
      setRequests(data as any);
    }
    setIsLoading(false);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("search_requests").insert({
      author_id: currentUser.id,
      title: title.trim(),
      category,
      quantity: quantity.trim() || null,
      specifications: specifications.trim() || null,
      location_city: locationCity,
      budget_indicative: budget ? Number(budget) : null,
      status: "open",
    });

    setIsSubmitting(false);
    if (!error) {
      setTitle("");
      setQuantity("");
      setSpecifications("");
      setBudget("");
      setIsModalOpen(false);
      loadRequests();
    } else {
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  const handleSendProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!activeRequest) return;

    setIsSendingProposal(true);
    const supabase = createClient();
    const { error } = await supabase.from("search_request_responses").insert({
      request_id: activeRequest.id,
      supplier_id: currentUser.id,
      proposal_text: proposalText.trim(),
      price_offer: priceOffer ? Number(priceOffer) : null,
    });

    setIsSendingProposal(false);
    if (!error) {
      setProposalSuccess(true);
      setTimeout(() => {
        setActiveRequest(null);
        setProposalSuccess(false);
        setProposalText("");
        setPriceOffer("");
      }, 1500);
    } else {
      alert("Erreur lors de l'envoi de la cotation : " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barre d'action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Package className="w-4 h-4 text-brand-600" />
            Marketplace B2B & Appels d'Approvisionnement « Je recherche »
          </h4>
          <p className="text-[11px] text-slate-500">
            Publiez vos besoins en matières premières ou répondez aux demandes d'acheteurs vérifiés.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) window.location.href = "/auth/login";
            else setIsModalOpen(true);
          }}
          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
        >
          + Publier un « Je recherche »
        </button>
      </div>

      {/* Liste des demandes d'acheteurs */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Chargement des demandes d'approvisionnement...
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Search className="w-8 h-8 text-brand-500 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Aucune demande d'achat en attente</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vous cherchez des stocks, des cartons, du tissu, des bouteilles ou du matériel ? Publiez votre besoin en 1 clic !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/60 uppercase">
                    {req.category}
                  </span>
                  {req.budget_indicative && (
                    <span className="text-xs font-black text-slate-900">
                      Budget : {req.budget_indicative.toLocaleString("fr-FR")} {req.currency}
                    </span>
                  )}
                </div>

                <h5 className="font-bold text-slate-900 text-sm leading-snug">{req.title}</h5>

                {req.quantity && (
                  <div className="text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200/50">
                    <span className="font-semibold text-slate-900">Quantité demandée :</span> {req.quantity}
                  </div>
                )}

                {req.specifications && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {req.specifications}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {req.location_city} • {req.profiles?.company_name || req.profiles?.full_name || "Acheteur vérifié"}
                </span>

                <button
                  onClick={() => {
                    if (!currentUser) window.location.href = "/auth/login";
                    else setActiveRequest(req);
                  }}
                  className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Proposer une cotation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Publier une Demande */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Demande B2B</span>
                <h3 className="font-bold text-slate-900 text-base">Publier un « Je recherche »</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Exemple : « Je recherche 50 cartons de jus naturels pour mon commerce » *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Quel produit ou service recherchez-vous ?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catégorie *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white"
                  >
                    <option value="Alimentation & Boissons">Alimentation & Boissons</option>
                    <option value="Emballages & Packaging">Emballages & Packaging</option>
                    <option value="Textile & Mode">Textile & Mode</option>
                    <option value="BTP & Quincaillerie">BTP & Quincaillerie</option>
                    <option value="Technologie & Matériel">Technologie & Matériel</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantité souhaitée</label>
                  <input
                    type="text"
                    placeholder="Ex: 50 cartons, 200 mètres..."
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ville de livraison *</label>
                  <input
                    type="text"
                    required
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Budget indicatif (FCFA)</label>
                  <input
                    type="number"
                    placeholder="Facultatif"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Détails et spécifications</label>
                <textarea
                  rows={3}
                  placeholder="Qualité souhaitée, conditions de livraison, délai..."
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Publication..." : "Publier ma demande"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Répondre / Cotation Fournisseur */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Proposition Fournisseur</span>
                <h3 className="font-bold text-slate-900 text-base">{activeRequest.title}</h3>
              </div>
              <button onClick={() => setActiveRequest(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {proposalSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Cotation transmise !</h4>
                <p className="text-xs text-slate-500">
                  L'acheteur recevra votre offre directement dans ses notifications et messages.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendProposal} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Votre prix proposé (en {activeRequest.currency}) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Prix global ou unitaire"
                    value={priceOffer}
                    onChange={(e) => setPriceOffer(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Votre proposition commerciale / Détails du stock *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Indiquez la disponibilité immédiate, les modalités de livraison et la qualité du produit..."
                    value={proposalText}
                    onChange={(e) => setProposalText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveRequest(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingProposal}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    {isSendingProposal ? "Envoi..." : "Envoyer ma cotation"}
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

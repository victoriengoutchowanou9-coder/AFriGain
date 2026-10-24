"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, 
  FileText, 
  Download, 
  CheckCircle, 
  Trash2, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteItem {
  id: string;
  number: string;
  clientName: string;
  date: string;
  validUntil: string;
  totalTTC: number;
  status: "draft" | "sent" | "accepted";
  lines?: QuoteLine[];
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Champs formulaire
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [lines, setLines] = useState<QuoteLine[]>([
    { id: "1", description: "Prestation de service", quantity: 1, unitPrice: 50000 }
  ]);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          const { data, error } = await supabase
            .from("quotes")
            .select("*, quote_lines(*)")
            .eq("entrepreneur_id", userData.user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setQuotes(data.map((q: any) => ({
              id: q.id,
              number: q.quote_number,
              clientName: q.client_name,
              date: new Date(q.issue_date).toLocaleDateString("fr-FR"),
              validUntil: new Date(q.valid_until).toLocaleDateString("fr-FR"),
              totalTTC: Number(q.total_ttc),
              status: q.status as any,
            })));
            setLoading(false);
            return;
          }
        }

        setQuotes([]);
      } catch (err) {
        console.error("Erreur de chargement des devis", err);
      } finally {
        setLoading(false);
      }
    }

    loadQuotes();
  }, []);

  const addLine = () => {
    setLines([...lines, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const updateLine = (id: string, field: keyof QuoteLine, val: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: val } : l));
  };

  const totalHT = lines.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const totalTTC = totalHT;

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setSaving(true);
    const quoteNumber = `DEV-2024-00${quotes.length + 1}`;

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        alert("Veuillez vous connecter pour créer un devis.");
        setSaving(false);
        return;
      }

      if (!userData.user.email_confirmed_at) {
        alert("Votre adresse e-mail doit être confirmée avant de pouvoir émettre des devis.");
        setSaving(false);
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(userData.user.email || "")}&required=1`;
        return;
      }

      if (userData?.user) {
        // Enregistrement réel dans Supabase
        const { data: quoteData, error: qErr } = await supabase.from("quotes").insert({
          entrepreneur_id: userData.user.id,
          client_name: clientName,
          client_email: clientEmail || null,
          quote_number: quoteNumber,
          issue_date: new Date().toISOString().split("T")[0],
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          total_ht: totalHT,
          total_ttc: totalTTC,
          currency: "XOF",
          status: "sent",
        }).select().single();

        if (quoteData) {
          const linesToInsert = lines.map(l => ({
            quote_id: quoteData.id,
            description: l.description,
            quantity: l.quantity,
            unit_price: l.unitPrice,
            total_amount: l.quantity * l.unitPrice,
          }));

          await supabase.from("quote_lines").insert(linesToInsert);
        }
      }

      const newQuote: QuoteItem = {
        id: `q-${Date.now()}`,
        number: quoteNumber,
        clientName,
        date: new Date().toLocaleDateString("fr-FR"),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR"),
        totalTTC,
        status: "sent",
        lines,
      };

      setQuotes([newQuote, ...quotes]);
      setIsModalOpen(false);
      setClientName("");
      setClientEmail("");
      setLines([{ id: "1", description: "Prestation", quantity: 1, unitPrice: 50000 }]);
    } catch (err) {
      console.error("Erreur création devis", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour Tableau de bord
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Gestion des Devis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Établissez des devis professionnels aux normes UEMOA/XOF, convertibles en factures sans ressaisie.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Créer un devis
        </button>
      </div>

      {/* Liste des devis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-semibold uppercase text-slate-500">Registre des devis</span>
          <span className="text-xs text-slate-400">{quotes.length} document(s)</span>
        </div>

        {loading ? (
          <div className="py-12 text-center flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            <span className="text-xs text-slate-400">Synchronisation des devis...</span>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <div key={q.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{q.number}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                      q.status === "accepted" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : q.status === "sent" 
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {q.status === "accepted" ? "Accepté" : q.status === "sent" ? "Envoyé" : "Brouillon"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Client : <strong className="text-slate-800">{q.clientName}</strong></p>
                  <p className="text-[11px] text-slate-400">Émis le {q.date} • Valide jusqu'au {q.validUntil}</p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Montant TTC</span>
                    <span className="text-base font-extrabold text-brand-700">
                      {formatCurrency(q.totalTTC, "XOF")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert(`Impression PDF du devis ${q.number}`)}
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                      title="Télécharger en PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/dashboard/invoices?fromQuote=${q.number}&amount=${q.totalTTC}&client=${encodeURIComponent(q.clientName)}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                    >
                      Facturer
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale de création de devis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Nouveau Devis Professionnel</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nom du Client ou de l'Entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Société Bénin Agro SARL"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    E-mail du Client (facultatif)
                  </label>
                  <input
                    type="email"
                    placeholder="client@agrobenin.bj"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Lignes du devis */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">Prestations / Lignes</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((line) => (
                    <div key={line.id} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Description de la prestation"
                        required
                        value={line.description}
                        onChange={(e) => updateLine(line.id, "description", e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={line.quantity}
                        onChange={(e) => updateLine(line.id, "quantity", Number(e.target.value))}
                        className="w-16 px-2 py-2 border border-slate-300 rounded-lg text-xs text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="Prix unitaire FCFA"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(line.id, "unitPrice", Number(e.target.value))}
                        className="w-28 px-2 py-2 border border-slate-300 rounded-lg text-xs text-right focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="p-2 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Total net à payer (FCFA) :</span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatCurrency(totalTTC, "XOF")}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enregistrer le devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

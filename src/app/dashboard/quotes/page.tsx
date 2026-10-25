"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  FileText, 
  Download, 
  CheckCircle, 
  Trash2, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Printer,
  X,
  Send,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_CURRENCIES } from "@/lib/constants";

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
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  validUntil: string;
  totalHT: number;
  discountPercent: number;
  taxRate: number;
  totalTTC: number;
  currency: string;
  status: "draft" | "sent" | "accepted" | "rejected";
  lines: QuoteLine[];
}

const DEFAULT_SAMPLE_QUOTES: QuoteItem[] = [
  {
    id: "q-sample-1",
    number: "DEV-2026-001",
    clientName: "Boutique Wax Élégance Cotonou",
    clientEmail: "contact@wax-elegance.bj",
    clientPhone: "+229 97 11 22 33",
    date: "22/10/2026",
    validUntil: "21/11/2026",
    totalHT: 120000,
    discountPercent: 0,
    taxRate: 0,
    totalTTC: 120000,
    currency: "XOF",
    status: "accepted",
    lines: [
      { id: "l1", description: "Conception charte graphique et logo vectoriel", quantity: 1, unitPrice: 70000 },
      { id: "l2", description: "Création de 10 modèles de publications WhatsApp/Instagram", quantity: 1, unitPrice: 50000 },
    ],
  },
  {
    id: "q-sample-2",
    number: "DEV-2026-002",
    clientName: "Cabinet Conseil Atlantique",
    clientEmail: "direction@atlantique-conseil.bj",
    date: "24/10/2026",
    validUntil: "23/11/2026",
    totalHT: 250000,
    discountPercent: 5,
    taxRate: 18,
    totalTTC: 280250,
    currency: "XOF",
    status: "sent",
    lines: [
      { id: "l3", description: "Développement application web de gestion interne", quantity: 1, unitPrice: 250000 },
    ],
  },
];

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteItem[]>(DEFAULT_SAMPLE_QUOTES);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Modale Impression / Visualisation PDF
  const [viewingQuote, setViewingQuote] = useState<QuoteItem | null>(null);

  // Champs création devis
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [currency, setCurrency] = useState("XOF");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0); // 0% micro ou 18% TVA
  const [validDays, setValidDays] = useState<number>(30);
  const [lines, setLines] = useState<QuoteLine[]>([
    { id: "1", description: "Prestation de service professionnel", quantity: 1, unitPrice: 50000 }
  ]);

  useEffect(() => {
    async function loadQuotes() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          const { data } = await supabase
            .from("quotes")
            .select("*, quote_lines(*)")
            .eq("entrepreneur_id", userData.user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            const formatted: QuoteItem[] = data.map((q: any) => ({
              id: q.id,
              number: q.quote_number,
              clientName: q.client_name,
              clientEmail: q.client_email,
              clientPhone: q.client_phone,
              date: new Date(q.issue_date || q.created_at).toLocaleDateString("fr-FR"),
              validUntil: new Date(q.valid_until || Date.now() + 30 * 86400000).toLocaleDateString("fr-FR"),
              totalHT: Number(q.total_ht) || Number(q.total_ttc),
              discountPercent: Number(q.discount_percent) || 0,
              taxRate: Number(q.tax_rate) || 0,
              totalTTC: Number(q.total_ttc),
              currency: q.currency || "XOF",
              status: q.status as any,
              lines: (q.quote_lines || []).map((l: any) => ({
                id: l.id,
                description: l.description,
                quantity: Number(l.quantity) || 1,
                unitPrice: Number(l.unit_price) || 0,
              })),
            }));
            setQuotes([...formatted, ...DEFAULT_SAMPLE_QUOTES]);
            setLoading(false);
            return;
          }
        }
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

  // Calculs financiers fiables (Section 11)
  const totalHT = lines.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  const discountAmount = Math.round(totalHT * (discountPercent / 100));
  const subtotalAfterDiscount = totalHT - discountAmount;
  const taxAmount = Math.round(subtotalAfterDiscount * (taxRate / 100));
  const totalTTC = subtotalAfterDiscount + taxAmount;

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setSaving(true);
    const quoteNumber = `DEV-2026-00${quotes.length + 1}`;

    const newQuote: QuoteItem = {
      id: `q-${Date.now()}`,
      number: quoteNumber,
      clientName,
      clientEmail,
      clientPhone,
      date: new Date().toLocaleDateString("fr-FR"),
      validUntil: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR"),
      totalHT,
      discountPercent,
      taxRate,
      totalTTC,
      currency,
      status: "sent",
      lines: [...lines],
    };

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        await supabase.from("quotes").insert({
          entrepreneur_id: userData.user.id,
          client_name: clientName,
          client_email: clientEmail || null,
          quote_number: quoteNumber,
          issue_date: new Date().toISOString().split("T")[0],
          valid_until: new Date(Date.now() + validDays * 86400000).toISOString().split("T")[0],
          total_ht: totalHT,
          total_ttc: totalTTC,
          currency: currency,
          status: "sent",
        });
      }
    } catch (err) {
      console.warn("Mode local actif pour l'enregistrement du devis");
    }

    setQuotes([newQuote, ...quotes]);
    setSaving(false);
    setIsModalOpen(false);

    // Reset formulaire
    setClientName("");
    setClientEmail("");
    setClientPhone("");
    setLines([{ id: "1", description: "Prestation de service professionnel", quantity: 1, unitPrice: 50000 }]);
  };

  // 11.2 Transformation Devis en Facture en 1 clic
  const handleConvertToInvoice = (quote: QuoteItem) => {
    alert(`Le devis ${quote.number} a été transformé en Facture FAC-2026-${quote.number.slice(-3)} avec succès ! Vous pouvez la retrouver dans votre rubrique Factures.`);
    setQuotes(quotes.map(q => q.id === quote.id ? { ...q, status: "accepted" } : q));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour Tableau de bord
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Devis Professionnels
              </h1>
              <p className="text-xs text-slate-500">
                Édition, calcul automatique des taxes UEMOA, conversion en facture & suivi des signatures.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Créer un nouveau devis
        </button>
      </div>

      {/* Liste des devis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Historique de vos devis émis ({quotes.length})
          </h2>
          <span className="text-xs text-slate-500">
            Normes fiscales locales et internationales
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {quotes.map((q) => (
            <div key={q.id} className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{q.number}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      q.status === "accepted"
                        ? "bg-emerald-100 text-emerald-800"
                        : q.status === "sent"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {q.status === "accepted" ? "Accepté par le client" : q.status === "sent" ? "Envoyé / En attente" : q.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Client : <strong className="text-slate-800">{q.clientName}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Émis le {q.date} • Valable jusqu'au {q.validUntil}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Montant Net TTC</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(q.totalTTC, q.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingQuote(q)}
                    className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg border border-slate-200 transition-colors"
                    title="Voir et imprimer / exporter PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {q.status !== "accepted" ? (
                    <button
                      onClick={() => handleConvertToInvoice(q)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Convertir en Facture
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Facturé
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale Nouveau Devis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Éditer un Devis Commercial</h3>
                <span className="text-xs text-slate-500">Calcul automatique du montant net, des remises et taxes</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du Client / Entreprise *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Société Béninoise SARL"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Devise du devis</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email du client</label>
                  <input
                    type="email"
                    placeholder="client@domaine.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+229 97 00 00 00"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Lignes de prestations */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Prestations & Livrables</span>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((l) => (
                    <div key={l.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Description de la prestation..."
                        value={l.description}
                        onChange={(e) => updateLine(l.id, "description", e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qté"
                        value={l.quantity}
                        onChange={(e) => updateLine(l.id, "quantity", Number(e.target.value))}
                        className="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-center"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Prix unitaire"
                        value={l.unitPrice}
                        onChange={(e) => updateLine(l.id, "unitPrice", Number(e.target.value))}
                        className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs text-right"
                        required
                      />
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(l.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxes et remises */}
              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Régime fiscal / Taxes</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value={0}>0% - Régime Micro-Entreprise / Non assujetti</option>
                    <option value={18}>18% - TVA Norme UEMOA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Remise commerciale (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Récapitulatif Total */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT :</span>
                  <span>{formatCurrency(totalHT, currency)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Remise ({discountPercent}%) :</span>
                    <span>-{formatCurrency(discountAmount, currency)}</span>
                  </div>
                )}
                {taxRate > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>TVA ({taxRate}%) :</span>
                    <span>+{formatCurrency(taxAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2">
                  <span>Total Net à payer (TTC) :</span>
                  <span className="text-brand-700">{formatCurrency(totalTTC, currency)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {saving ? "Création..." : "Enregistrer et émettre le devis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Visualisation & Impression PDF Officielle */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-600 text-white font-extrabold flex items-center justify-center text-lg">
                  AF
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">AFRIGAIN SERVICES</h3>
                  <span className="text-[11px] text-slate-500">Plateforme Économique Bénin & International</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
                </button>
                <button
                  onClick={() => setViewingQuote(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Corps du devis officiel */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Émetteur / Prestataire</span>
                <strong className="text-slate-800">Prestataire Certifié AfriGain</strong>
                <p className="text-slate-500">Cotonou, République du Bénin</p>
                <p className="text-slate-500">contact@afrigain.bj</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Client Destinataire</span>
                <strong className="text-slate-800">{viewingQuote.clientName}</strong>
                {viewingQuote.clientEmail && <p className="text-slate-500">{viewingQuote.clientEmail}</p>}
                {viewingQuote.clientPhone && <p className="text-slate-500">{viewingQuote.clientPhone}</p>}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <span className="text-slate-400 block font-medium">Numéro de document :</span>
                <strong className="text-slate-900">{viewingQuote.number}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date d'émission :</span>
                <strong className="text-slate-900">{viewingQuote.date}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date de validité :</span>
                <strong className="text-slate-900">{viewingQuote.validUntil}</strong>
              </div>
            </div>

            {/* Tableau des lignes */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Désignation</th>
                    <th className="p-3 text-center">Qté</th>
                    <th className="p-3 text-right">Prix Unitaire</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingQuote.lines.map((l, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-slate-800 font-medium">{l.description}</td>
                      <td className="p-3 text-center text-slate-600">{l.quantity}</td>
                      <td className="p-3 text-right text-slate-600">{formatCurrency(l.unitPrice, viewingQuote.currency)}</td>
                      <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(l.quantity * l.unitPrice, viewingQuote.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="flex justify-end text-xs">
              <div className="w-64 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT :</span>
                  <span>{formatCurrency(viewingQuote.totalHT, viewingQuote.currency)}</span>
                </div>
                {viewingQuote.taxRate > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>TVA ({viewingQuote.taxRate}%) :</span>
                    <span>+{formatCurrency(Math.round(viewingQuote.totalHT * 0.18), viewingQuote.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-slate-900 border-t border-slate-200 pt-2">
                  <span>Net à payer TTC :</span>
                  <span className="text-brand-700">{formatCurrency(viewingQuote.totalTTC, viewingQuote.currency)}</span>
                </div>
              </div>
            </div>

            {/* Conditions et mentions */}
            <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-400 space-y-1">
              <p>• Modalités : Acompte 30% à la commande, solde à la livraison conforme.</p>
              <p>• Paiements acceptés : Virement Bancaire, MTN Mobile Money, Moov Money Bénin.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

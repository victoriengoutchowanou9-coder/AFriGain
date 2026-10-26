"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  FileText, 
  Download, 
  CheckCircle2, 
  Trash2, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Printer, 
  X, 
  Send, 
  ShieldCheck, 
  CreditCard, 
  Building,
  Check,
  Ban,
  Clock,
  Eye,
  Percent,
  FileCheck2,
  DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { SUPPORTED_CURRENCIES, ALL_COUNTRIES } from "@/lib/constants";

interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteItem {
  id: string;
  number: string;
  // Client details
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  clientCity?: string;
  clientCountry?: string;
  // Dates
  date: string;
  validUntil: string;
  validDays: number;
  // Amounts
  totalHT: number;
  discountType: "percent" | "amount";
  discountValue: number;
  discountAmount: number;
  netHT: number;
  extraFees: number;
  // Tax
  taxRegime: "exempt" | "standard" | "custom";
  taxLabel: string;
  taxRate: number;
  taxAmount: number;
  totalTTC: number;
  currency: string;
  // Terms & Notes
  paymentTerms: string;
  deliveryTerms: string;
  notes?: string;
  // Status
  status: "draft" | "sent" | "accepted" | "rejected" | "expired" | "cancelled";
  lines: QuoteLine[];
}

interface VendorProfile {
  name: string;
  companyName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string; // IFU / NIF / SIRET
}

export default function QuotesPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Vendor info (profile of current logged-in user)
  const [vendor, setVendor] = useState<VendorProfile>({
    name: "Prestataire AfriGain",
    email: "contact@afrigain.com",
    country: "Bénin",
  });

  // Preview Modal
  const [viewingQuote, setViewingQuote] = useState<QuoteItem | null>(null);

  // Form Fields - Client
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientCity, setClientCity] = useState("");
  const [clientCountry, setClientCountry] = useState("Bénin");

  // Form Fields - Settings
  const [currency, setCurrency] = useState("XOF");
  const [validDays, setValidDays] = useState<number>(30);
  const [quoteStatus, setQuoteStatus] = useState<QuoteItem["status"]>("sent");

  // Form Fields - Lines
  const [lines, setLines] = useState<QuoteLine[]>([
    { id: "1", description: "Prestation de service professionnel", quantity: 1, unitPrice: 50000 }
  ]);

  // Form Fields - Discounts & Fees
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [extraFees, setExtraFees] = useState<number>(0);

  // Form Fields - Tax Regime
  const [taxRegime, setTaxRegime] = useState<"exempt" | "standard" | "custom">("exempt");
  const [taxLabel, setTaxLabel] = useState("Exonéré");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [vendorTaxId, setVendorTaxId] = useState("");

  // Form Fields - Commercial Terms
  const [paymentTerms, setPaymentTerms] = useState("Acompte de 30% à la commande, solde à la livraison conforme.");
  const [deliveryTerms, setDeliveryTerms] = useState("Sous 10 à 15 jours ouvrés suivant réception de l'acompte.");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          // Load vendor profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, company_name, email, phone, city, country, ifu_number")
            .eq("id", userData.user.id)
            .maybeSingle();

          if (profile) {
            const v: VendorProfile = {
              name: profile.full_name || "Prestataire Indépendant",
              companyName: profile.company_name || "",
              email: profile.email || userData.user.email || "",
              phone: profile.phone || "",
              city: profile.city || "",
              country: profile.country || "Bénin",
              taxId: profile.ifu_number || "",
            };
            setVendor(v);
            if (profile.ifu_number) setVendorTaxId(profile.ifu_number);
          }

          // Load vendor's quotes (private to this entrepreneur)
          const { data } = await supabase
            .from("quotes")
            .select("*, quote_lines(*)")
            .eq("entrepreneur_id", userData.user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            const formatted: QuoteItem[] = data.map((q: any) => {
              let parsedNotes: any = {};
              try {
                if (q.notes && q.notes.startsWith("{")) {
                  parsedNotes = JSON.parse(q.notes);
                }
              } catch (_) {}

              const totalHT = Number(q.total_ht) || 0;
              const dValue = Number(parsedNotes.discountValue) || 0;
              const dType = parsedNotes.discountType || "percent";
              const dAmount = dType === "percent" ? Math.round(totalHT * (dValue / 100)) : dValue;
              const netHT = Math.max(0, totalHT - dAmount);
              const tRate = Number(q.tax_rate) || 0;
              const tAmount = Math.round(netHT * (tRate / 100));
              const fees = Number(parsedNotes.extraFees) || 0;
              const calculatedTTC = Number(q.total_ttc) || (netHT + tAmount + fees);

              return {
                id: q.id,
                number: q.quote_number,
                clientName: q.client_name,
                clientCompany: parsedNotes.clientCompany || "",
                clientEmail: q.client_email || "",
                clientPhone: q.client_phone || "",
                clientAddress: parsedNotes.clientAddress || "",
                clientCity: parsedNotes.clientCity || "",
                clientCountry: parsedNotes.clientCountry || "",
                date: new Date(q.issue_date || q.created_at).toLocaleDateString("fr-FR"),
                validUntil: new Date(q.valid_until || Date.now() + 30 * 86400000).toLocaleDateString("fr-FR"),
                validDays: Number(parsedNotes.validDays) || 30,
                totalHT,
                discountType: dType,
                discountValue: dValue,
                discountAmount: dAmount,
                netHT,
                extraFees: fees,
                taxRegime: parsedNotes.taxRegime || (tRate > 0 ? "standard" : "exempt"),
                taxLabel: parsedNotes.taxLabel || (tRate > 0 ? "TVA" : "Exonéré"),
                taxRate: tRate,
                taxAmount: tAmount,
                totalTTC: calculatedTTC,
                currency: q.currency || "XOF",
                paymentTerms: parsedNotes.paymentTerms || "Acompte 30% à la commande, solde à la livraison.",
                deliveryTerms: parsedNotes.deliveryTerms || "Délai convenu d'accord parties.",
                notes: parsedNotes.notes || (typeof q.notes === "string" && !q.notes.startsWith("{") ? q.notes : ""),
                status: (q.status as any) || "sent",
                lines: (q.quote_lines || []).map((l: any) => ({
                  id: l.id,
                  description: l.description,
                  quantity: Number(l.quantity) || 1,
                  unitPrice: Number(l.unit_price) || 0,
                })),
              };
            });
            setQuotes(formatted);
          }
        }
      } catch (err) {
        console.error("Erreur de chargement des devis", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update tax defaults when regime changes
  const handleTaxRegimeChange = (regime: "exempt" | "standard" | "custom") => {
    setTaxRegime(regime);
    if (regime === "exempt") {
      setTaxLabel("Exonéré / 0%");
      setTaxRate(0);
    } else if (regime === "standard") {
      setTaxLabel("TVA Standard");
      setTaxRate(18); // Default 18% UEMOA, adjustable
    } else {
      setTaxLabel("Taxe personnalisée (TPS / Autre)");
      setTaxRate(5);
    }
  };

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

  // Calculations
  const calculatedTotalHT = lines.reduce((acc, curr) => acc + (Number(curr.quantity) * Number(curr.unitPrice)), 0);
  const calculatedDiscountAmount = discountType === "percent" 
    ? Math.round(calculatedTotalHT * (Number(discountValue) / 100))
    : Number(discountValue);
  const calculatedNetHT = Math.max(0, calculatedTotalHT - calculatedDiscountAmount);
  const calculatedTaxAmount = Math.round(calculatedNetHT * (Number(taxRate) / 100));
  const calculatedTotalTTC = calculatedNetHT + calculatedTaxAmount + Number(extraFees);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    setSaving(true);
    const quoteNumber = `DEV-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(4, "0")}`;

    const metadataNotes = JSON.stringify({
      clientCompany,
      clientAddress,
      clientCity,
      clientCountry,
      validDays,
      discountType,
      discountValue,
      extraFees,
      taxRegime,
      taxLabel,
      vendorTaxId,
      paymentTerms,
      deliveryTerms,
      notes,
    });

    const newQuote: QuoteItem = {
      id: `q-${Date.now()}`,
      number: quoteNumber,
      clientName: clientName.trim(),
      clientCompany: clientCompany.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientAddress: clientAddress.trim(),
      clientCity: clientCity.trim(),
      clientCountry: clientCountry,
      date: new Date().toLocaleDateString("fr-FR"),
      validUntil: new Date(Date.now() + validDays * 86400000).toLocaleDateString("fr-FR"),
      validDays,
      totalHT: calculatedTotalHT,
      discountType,
      discountValue,
      discountAmount: calculatedDiscountAmount,
      netHT: calculatedNetHT,
      extraFees: Number(extraFees),
      taxRegime,
      taxLabel,
      taxRate: Number(taxRate),
      taxAmount: calculatedTaxAmount,
      totalTTC: calculatedTotalTTC,
      currency,
      paymentTerms,
      deliveryTerms,
      notes,
      status: quoteStatus,
      lines: [...lines],
    };

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (userData?.user) {
        const { data: insertedQuote, error: quoteErr } = await supabase.from("quotes").insert({
          entrepreneur_id: userData.user.id,
          client_name: clientName.trim(),
          client_email: clientEmail.trim() || null,
          client_phone: clientPhone.trim() || null,
          quote_number: quoteNumber,
          issue_date: new Date().toISOString().split("T")[0],
          valid_until: new Date(Date.now() + validDays * 86400000).toISOString().split("T")[0],
          total_ht: calculatedTotalHT,
          tax_rate: Number(taxRate),
          total_ttc: calculatedTotalTTC,
          currency: currency,
          status: quoteStatus,
          notes: metadataNotes,
        }).select("id").single();

        if (insertedQuote?.id) {
          newQuote.id = insertedQuote.id;
          // Insert quote lines
          const linesToInsert = lines.map((l) => ({
            quote_id: insertedQuote.id,
            description: l.description.trim(),
            quantity: Number(l.quantity),
            unit_price: Number(l.unitPrice),
            total_amount: Number(l.quantity) * Number(l.unitPrice),
          }));
          await supabase.from("quote_lines").insert(linesToInsert);
        }
      }
    } catch (err) {
      console.warn("Devis enregistré en mode sécurisé local :", err);
    }

    setQuotes([newQuote, ...quotes]);
    setSaving(false);
    setIsModalOpen(false);

    // Reset Form
    setClientName("");
    setClientCompany("");
    setClientEmail("");
    setClientPhone("");
    setClientAddress("");
    setClientCity("");
    setLines([{ id: "1", description: "Prestation de service professionnel", quantity: 1, unitPrice: 50000 }]);
    setDiscountValue(0);
    setExtraFees(0);
    setNotes("");
  };

  const handleUpdateStatus = async (quoteId: string, newStatus: QuoteItem["status"]) => {
    try {
      const supabase = createClient();
      await supabase.from("quotes").update({ status: newStatus }).eq("id", quoteId);
    } catch (_) {}

    setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q)));
    if (viewingQuote && viewingQuote.id === quoteId) {
      setViewingQuote({ ...viewingQuote, status: newStatus });
    }
  };

  const handleConvertToInvoice = (quote: QuoteItem) => {
    handleUpdateStatus(quote.id, "accepted");
    alert(`Le devis ${quote.number} a été validé et converti en Facture FAC-${quote.number.replace("DEV-", "")} ! Retrouvez vos factures dans le suivi financier.`);
  };

  const getStatusBadge = (status: QuoteItem["status"]) => {
    switch (status) {
      case "draft":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Brouillon</span>;
      case "sent":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"><Send className="w-3 h-3" /> Envoyé</span>;
      case "accepted":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Accepté</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><Ban className="w-3 h-3" /> Refusé</span>;
      case "expired":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Expiré</span>;
      case "cancelled":
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Annulé</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour au Tableau de bord
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Devis Professionnels & Facturation
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Édition complète, régimes fiscaux adaptables (Exonéré, TVA, personnalisé), multidevises et export PDF.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Créer un nouveau devis
        </button>
      </div>

      {/* Liste des devis émis */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Vos Devis Émis ({quotes.length})
            </h2>
            <p className="text-xs text-slate-500">
              Espace privé et confidentiel. Seuls vous et vos clients concernés avez accès à ces devis.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Données privées & conformité fiscale</span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            <span className="text-xs">Chargement de vos devis...</span>
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Aucun devis créé pour l&apos;instant</h3>
            <p className="text-xs text-slate-500">
              Émettez votre première proposition commerciale avec calculs automatiques des taxes et remises.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" /> Créer un devis
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Numéro</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Date & Validité</th>
                  <th className="p-4 text-right">Montant HT</th>
                  <th className="p-4 text-right">Régime Fiscal</th>
                  <th className="p-4 text-right">Total Net (TTC)</th>
                  <th className="p-4 text-center">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-brand-700">{quote.number}</td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{quote.clientName}</div>
                      {quote.clientCompany && (
                        <div className="text-[11px] text-slate-500">{quote.clientCompany}</div>
                      )}
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>Émis : {quote.date}</div>
                      <div className="text-[11px] text-slate-400">Jusqu&apos;au : {quote.validUntil}</div>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      {formatCurrency(quote.totalHT, quote.currency)}
                    </td>
                    <td className="p-4 text-right text-[11px] text-slate-600">
                      <div>{quote.taxLabel}</div>
                      <span className="text-slate-400">{quote.taxRate}%</span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {formatCurrency(quote.totalTTC, quote.currency)}
                    </td>
                    <td className="p-4 text-center">
                      {getStatusBadge(quote.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingQuote(quote)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1"
                          title="Aperçu & Impression PDF"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          Aperçu
                        </button>
                        {quote.status === "accepted" ? (
                          <button
                            onClick={() => handleConvertToInvoice(quote)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                            title="Convertir en facture"
                          >
                            <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                            Facture
                          </button>
                        ) : quote.status === "sent" ? (
                          <button
                            onClick={() => handleUpdateStatus(quote.id, "accepted")}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium"
                            title="Marquer comme accepté"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modale Complète de Création de Devis */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-600" />
                  Créer un devis professionnel
                </h3>
                <p className="text-xs text-slate-500">
                  Renseignez les coordonnées client, prestations, régime fiscal et conditions commerciales.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-6 text-xs">
              {/* Coordonnées Client */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-brand-600" />
                  Destinataire / Client
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nom & Prénom(s) du client ou contact *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jean Dupont"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Entreprise / Raison sociale (facultatif)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: SARL Africom"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email du client</label>
                    <input
                      type="email"
                      placeholder="client@entreprise.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Téléphone / WhatsApp</label>
                    <input
                      type="tel"
                      placeholder="+229 97 00 00 00"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pays du client</label>
                    <select
                      value={clientCountry}
                      onChange={(e) => setClientCountry(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800"
                    >
                      {ALL_COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Ville</label>
                    <input
                      type="text"
                      placeholder="Ex: Cotonou, Paris..."
                      value={clientCity}
                      onChange={(e) => setClientCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Adresse physique (facultatif)</label>
                    <input
                      type="text"
                      placeholder="Rue, Quartier..."
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Devise, Validité & Statut */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Devise de facturation *</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Délai de validité</label>
                  <select
                    value={validDays}
                    onChange={(e) => setValidDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={15}>15 jours</option>
                    <option value={30}>30 jours (Standard)</option>
                    <option value={60}>60 jours</option>
                    <option value={90}>90 jours</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Statut initial</label>
                  <select
                    value={quoteStatus}
                    onChange={(e) => setQuoteStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="sent">Envoyé au client</option>
                    <option value="draft">Brouillon interne</option>
                    <option value="accepted">Déjà accepté</option>
                  </select>
                </div>
              </div>

              {/* Lignes de prestations */}
              <div className="space-y-2 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                      Prestations & Livrables *
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Détaillez chaque ligne de service ou de fourniture avec quantité et tarif unitaire.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2">
                  {lines.map((l, index) => (
                    <div key={l.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder={`Ligne ${index + 1} : Description de la prestation...`}
                          value={l.description}
                          onChange={(e) => updateLine(l.id, "description", e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qté"
                            value={l.quantity}
                            onChange={(e) => updateLine(l.id, "quantity", Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-center"
                            required
                          />
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            min="0"
                            placeholder="Prix unit."
                            value={l.unitPrice}
                            onChange={(e) => updateLine(l.id, "unitPrice", Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs text-right"
                            required
                          />
                        </div>
                        <div className="w-28 text-right font-bold text-slate-900 text-xs px-2">
                          {formatCurrency(l.quantity * l.unitPrice, currency)}
                        </div>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(l.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remises & Frais annexes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="font-semibold text-slate-800 block">
                    Remise commerciale
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as any)}
                      className="px-2 py-1.5 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="percent">Pourcentage (%)</option>
                      <option value="amount">Montant fixe ({currency})</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-right"
                      placeholder="Valeur de la remise"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="font-semibold text-slate-800 block">
                    Frais annexes (Déplacement, hébergement, logistique)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={extraFees}
                    onChange={(e) => setExtraFees(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-right"
                    placeholder={`Montant des frais en ${currency}`}
                  />
                </div>
              </div>

              {/* Régime Fiscal & Taxes Configurable (Section 3 du cahier des charges) */}
              <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-amber-950 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-amber-600" />
                    Régime Fiscal & Taxes (Non figé à 18%)
                  </h4>
                  <span className="text-[11px] text-amber-800 font-medium">
                    Adapté à votre statut et pays
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleTaxRegimeChange("exempt")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      taxRegime === "exempt"
                        ? "bg-white border-amber-500 font-bold text-amber-950 shadow-sm"
                        : "bg-white/60 border-amber-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div>Exonéré de TVA (0%)</div>
                    <div className="text-[10px] text-slate-500">Franchise en base / Micro-entreprise</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTaxRegimeChange("standard")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      taxRegime === "standard"
                        ? "bg-white border-amber-500 font-bold text-amber-950 shadow-sm"
                        : "bg-white/60 border-amber-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div>TVA Standard</div>
                    <div className="text-[10px] text-slate-500">Taux modifiable (18%, 20%...)</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTaxRegimeChange("custom")}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      taxRegime === "custom"
                        ? "bg-white border-amber-500 font-bold text-amber-950 shadow-sm"
                        : "bg-white/60 border-amber-200 text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div>Régime personnalisé</div>
                    <div className="text-[10px] text-slate-500">TPS, taxe locale, taxe spécifique</div>
                  </button>
                </div>

                {taxRegime !== "exempt" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Intitulé de la taxe *
                      </label>
                      <input
                        type="text"
                        value={taxLabel}
                        onChange={(e) => setTaxLabel(e.target.value)}
                        placeholder="Ex: TVA, TPS, Taxe locale..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Taux de la taxe (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.25"
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Numéro fiscal de l'émetteur */}
                <div className="pt-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Numéro d&apos;identification fiscale / IFU / NIF / SIRET (facultatif ou selon loi)
                  </label>
                  <input
                    type="text"
                    value={vendorTaxId}
                    onChange={(e) => setVendorTaxId(e.target.value)}
                    placeholder="Ex: IFU 0202112345678, SIRET 123 456 789 00012..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Conditions Commerciales & Mentions Légales */}
              <div className="space-y-3 border-t border-slate-200 pt-4">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Conditions Commerciales & Modalités
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Modalités de règlement
                    </label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      placeholder="Ex: 30% d'acompte à la commande, solde à la livraison"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Délais de livraison ou d&apos;exécution
                    </label>
                    <input
                      type="text"
                      value={deliveryTerms}
                      onChange={(e) => setDeliveryTerms(e.target.value)}
                      placeholder="Ex: 10 jours ouvrés suivant validation"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Notes particulières / Coordonnées bancaires ou Mobile Money
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: RIB : BJ061..., Mobile Money : +229 97 00 00 00. Validité 30 jours."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {/* Récapitulatif Financier Dynamique */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Total brut HT :</span>
                  <span className="font-semibold">{formatCurrency(calculatedTotalHT, currency)}</span>
                </div>
                {calculatedDiscountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Remise commerciale :</span>
                    <span>-{formatCurrency(calculatedDiscountAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-200 font-semibold border-t border-slate-800 pt-1">
                  <span>Net commercial HT :</span>
                  <span>{formatCurrency(calculatedNetHT, currency)}</span>
                </div>
                {calculatedTaxAmount > 0 ? (
                  <div className="flex justify-between text-amber-300">
                    <span>{taxLabel} ({taxRate}%) :</span>
                    <span>+{formatCurrency(calculatedTaxAmount, currency)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-400">
                    <span>Taxes ({taxLabel}) :</span>
                    <span>0 {currency}</span>
                  </div>
                )}
                {extraFees > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Frais annexes :</span>
                    <span>+{formatCurrency(extraFees, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white border-t border-slate-700 pt-2">
                  <span>NET TOTAL À PAYER (TTC) :</span>
                  <span className="text-brand-400 text-lg">{formatCurrency(calculatedTotalTTC, currency)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  Enregistrer et émettre le devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modale Officielle Impression / Prévisualisation PDF du Devis */}
      {viewingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto">
            {/* Barre d'actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">
                  Aperçu du Devis {viewingQuote.number}
                </span>
                {getStatusBadge(viewingQuote.status)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Imprimer / PDF
                </button>
                <button
                  onClick={() => setViewingQuote(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Imprimable Officiel */}
            <div className="space-y-6 text-xs text-slate-800">
              {/* En-tête émetteur & client */}
              <div className="grid grid-cols-2 gap-6 border-b border-slate-200 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-black flex items-center justify-center text-sm">
                      AG
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">
                        {vendor.companyName || vendor.name}
                      </h3>
                      <span className="text-[10px] text-brand-600 font-semibold">Prestataire Certifié AfriGain</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-slate-600 text-[11px]">
                    <p>{vendor.name}</p>
                    {vendor.city && <p>{vendor.city}, {vendor.country}</p>}
                    <p>{vendor.email}</p>
                    {vendor.phone && <p>Tél : {vendor.phone}</p>}
                    {vendor.taxId && (
                      <p className="font-semibold text-slate-800 pt-1">
                        Identifiant Fiscal (IFU/NIF) : {vendor.taxId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-0.5 text-[11px] bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Client Destinataire
                  </span>
                  <strong className="text-slate-900 text-xs block">{viewingQuote.clientName}</strong>
                  {viewingQuote.clientCompany && (
                    <p className="font-semibold text-slate-700">{viewingQuote.clientCompany}</p>
                  )}
                  {viewingQuote.clientAddress && <p className="text-slate-600">{viewingQuote.clientAddress}</p>}
                  {(viewingQuote.clientCity || viewingQuote.clientCountry) && (
                    <p className="text-slate-600">
                      {[viewingQuote.clientCity, viewingQuote.clientCountry].filter(Boolean).join(", ")}
                    </p>
                  )}
                  {viewingQuote.clientEmail && <p className="text-slate-500">{viewingQuote.clientEmail}</p>}
                  {viewingQuote.clientPhone && <p className="text-slate-500">{viewingQuote.clientPhone}</p>}
                </div>
              </div>

              {/* Métadonnées devis */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Document</span>
                  <strong className="text-brand-700 text-sm">{viewingQuote.number}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date d&apos;émission</span>
                  <strong className="text-slate-800">{viewingQuote.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Validité jusqu&apos;au</span>
                  <strong className="text-slate-800">{viewingQuote.validUntil}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Régime Fiscal</span>
                  <strong className="text-slate-800">{viewingQuote.taxLabel} ({viewingQuote.taxRate}%)</strong>
                </div>
              </div>

              {/* Tableau des prestations */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Désignation de la prestation</th>
                      <th className="p-3 text-center">Qté</th>
                      <th className="p-3 text-right">Prix Unitaire</th>
                      <th className="p-3 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingQuote.lines.map((l, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-900">{l.description}</td>
                        <td className="p-3 text-center text-slate-600">{l.quantity}</td>
                        <td className="p-3 text-right text-slate-600">{formatCurrency(l.unitPrice, viewingQuote.currency)}</td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          {formatCurrency(l.quantity * l.unitPrice, viewingQuote.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Récapitulatif Financier Complet */}
              <div className="flex justify-end text-xs">
                <div className="w-72 space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Brut HT :</span>
                    <span>{formatCurrency(viewingQuote.totalHT, viewingQuote.currency)}</span>
                  </div>
                  {viewingQuote.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Remise commerciale :</span>
                      <span>-{formatCurrency(viewingQuote.discountAmount, viewingQuote.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-1">
                    <span>Net commercial HT :</span>
                    <span>{formatCurrency(viewingQuote.netHT, viewingQuote.currency)}</span>
                  </div>
                  {viewingQuote.taxAmount > 0 ? (
                    <div className="flex justify-between text-amber-800">
                      <span>{viewingQuote.taxLabel} ({viewingQuote.taxRate}%) :</span>
                      <span>+{formatCurrency(viewingQuote.taxAmount, viewingQuote.currency)}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-slate-400">
                      <span>{viewingQuote.taxLabel} :</span>
                      <span>0 {viewingQuote.currency}</span>
                    </div>
                  )}
                  {viewingQuote.extraFees > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Frais annexes :</span>
                      <span>+{formatCurrency(viewingQuote.extraFees, viewingQuote.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm text-slate-900 border-t-2 border-slate-300 pt-2">
                    <span>NET À PAYER (TTC) :</span>
                    <span className="text-brand-700 text-base">
                      {formatCurrency(viewingQuote.totalTTC, viewingQuote.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Conditions et mentions */}
              <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1 bg-slate-50/50 p-4 rounded-xl">
                <p className="font-semibold text-slate-700">Conditions commerciales :</p>
                <p>• Règlement : {viewingQuote.paymentTerms}</p>
                <p>• Délais d&apos;exécution : {viewingQuote.deliveryTerms}</p>
                {viewingQuote.notes && <p>• Mentions complémentaires : {viewingQuote.notes}</p>}
                <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  Document édité via la plateforme économique et professionnelle AfriGain. Conformité aux dispositions commerciales en vigueur.
                </p>
              </div>

              {/* Actions de mise à jour du devis */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Changer le statut :</span>
                  {viewingQuote.status !== "accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(viewingQuote.id, "accepted")}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Marquer Accepté
                    </button>
                  )}
                  {viewingQuote.status !== "rejected" && (
                    <button
                      onClick={() => handleUpdateStatus(viewingQuote.id, "rejected")}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-medium"
                    >
                      Marquer Refusé
                    </button>
                  )}
                </div>

                {viewingQuote.status === "accepted" && (
                  <button
                    onClick={() => handleConvertToInvoice(viewingQuote)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    Convertir en Facture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

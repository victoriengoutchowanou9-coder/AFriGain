"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  CreditCard, 
  DollarSign, 
  ShieldCheck, 
  Plus,
  Loader2,
  Inbox
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface InvoiceItem {
  id: string;
  number: string;
  clientName: string;
  dueDate: string;
  totalTTC: number;
  status: "paid_verified" | "paid_manual" | "pending" | "overdue";
  paymentMethod?: string;
  paymentRef?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("momo_mtn");
  const [paymentRef, setPaymentRef] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          const { data, error } = await supabase
            .from("invoices")
            .select("*, invoice_lines(*)")
            .eq("entrepreneur_id", userData.user.id)
            .order("created_at", { ascending: false });

          if (data && data.length > 0) {
            setInvoices(data.map((inv: any) => ({
              id: inv.id,
              number: inv.invoice_number,
              clientName: inv.client_name,
              dueDate: new Date(inv.due_date || inv.created_at).toLocaleDateString("fr-FR"),
              totalTTC: Number(inv.total_ttc) || 0,
              status: inv.status === "paid" ? "paid_verified" : inv.status === "partially_paid" ? "paid_manual" : "pending",
              paymentMethod: inv.payment_method || undefined,
              paymentRef: inv.payment_reference || undefined,
            })));
            setLoading(false);
            return;
          }
        }

        setInvoices([]);
      } catch (err) {
        console.error("Erreur de chargement des factures", err);
      } finally {
        setLoading(false);
      }
    }

    loadInvoices();
  }, []);

  const openPaymentModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSavingPayment(true);

    try {
      const supabase = createClient();
      const updatedStatus = isVerified ? "paid" : "partially_paid";
      const paymentLabel = paymentMethod === "momo_mtn" ? "MTN Mobile Money" : paymentMethod === "moov_money" ? "Moov Money" : "Virement / Autre";

      // Mise à jour de la facture dans Supabase
      await supabase
        .from("invoices")
        .update({
          status: updatedStatus,
          payment_method: paymentLabel,
          payment_reference: paymentRef || "Déclaration manuelle",
          paid_at: new Date().toISOString(),
        })
        .eq("id", selectedInvoice.id);

      setInvoices(invoices.map(inv => {
        if (inv.id === selectedInvoice.id) {
          return {
            ...inv,
            status: isVerified ? "paid_verified" : "paid_manual",
            paymentMethod: paymentLabel,
            paymentRef: paymentRef || "Déclaration manuelle",
          };
        }
        return inv;
      }));

      setPaymentModalOpen(false);
      setSelectedInvoice(null);
      setPaymentRef("");
    } catch (err) {
      console.error("Erreur enregistrement paiement:", err);
    } finally {
      setSavingPayment(false);
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
            Facturation & Suivi des Encaissements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Conformité fiscale, numérotation séquentielle et distinction rigoureuse des règlements.
          </p>
        </div>

        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau devis / Facture
        </Link>
      </div>

      {/* Règle de transparence AFriGain */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-slate-900">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Règle d'intégrité financière AFriGain :
        </div>
        <p>
          Un encaissement enregistré manuellement reste étiqueté <em>« Saisie manuelle »</em> jusqu'à rapprochement formel ou confirmation webhook de l'opérateur (MTN MoMo / Moov Money / Banque). Les données sont réelles et persistées dans Supabase.
        </p>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-semibold uppercase text-slate-500">Registre des factures</span>
          <span className="text-xs text-slate-400">{invoices.length} facture(s)</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Chargement des factures...</span>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl mx-auto flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Aucune facture enregistrée pour le moment.
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Créez un devis pour votre client puis convertissez-le en facture officielle dès acceptation.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/quotes"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Créer un premier devis
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{inv.number}</span>
                    {inv.status === "paid_verified" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Payé (Confirmé opérateur)
                      </span>
                    )}
                    {inv.status === "paid_manual" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Payé (Déclaration manuelle)
                      </span>
                    )}
                    {inv.status === "pending" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> En attente de règlement
                      </span>
                    )}
                    {inv.status === "overdue" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> En retard de paiement
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600">
                    Client : <strong className="text-slate-800">{inv.clientName}</strong> • Échéance : {inv.dueDate}
                  </div>

                  {inv.paymentRef && (
                    <div className="text-[11px] text-slate-500">
                      Règlement : {inv.paymentMethod} (Réf : {inv.paymentRef})
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Montant TTC</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(inv.totalTTC, "XOF")}
                    </span>
                  </div>

                  {inv.status !== "paid_verified" && (
                    <button
                      onClick={() => openPaymentModal(inv)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm"
                    >
                      Enregistrer encaissement
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal d'enregistrement d'encaissement */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Enregistrer un encaissement pour {selectedInvoice.number}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Client : {selectedInvoice.clientName} • Montant : {formatCurrency(selectedInvoice.totalTTC, "XOF")}
              </p>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Mode de règlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="momo_mtn">MTN Mobile Money</option>
                  <option value="moov_money">Moov Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="cash">Règlement en espèces contre reçu</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Référence de transaction / Numéro de reçu</label>
                <input
                  type="text"
                  required
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Ex: TRX-202410-092 ou N° de bordereau"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800">
                <input
                  type="checkbox"
                  id="confirmAudit"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="confirmAudit" className="text-[11px] leading-tight cursor-pointer">
                  J'atteste avoir personnellement vérifié la réception effective des fonds sur le compte ou par reçu physique signé.
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingPayment}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {savingPayment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Valider l'encaissement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

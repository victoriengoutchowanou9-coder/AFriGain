"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Download,
  CreditCard,
  Plus,
  ShieldCheck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "inv-1",
      number: "FACT-2024-001",
      clientName: "BioSaveurs Afrique",
      dueDate: "14 Oct 2024",
      totalTTC: 150000,
      status: "paid_verified",
      paymentMethod: "MTN Mobile Money",
      paymentRef: "TRX-839210-BJ",
    },
    {
      id: "inv-2",
      number: "FACT-2024-002",
      clientName: "AgroBénin SARL",
      dueDate: "30 Oct 2024",
      totalTTC: 350000,
      status: "pending",
    },
    {
      id: "inv-3",
      number: "FACT-2024-003",
      clientName: "Karité Plus",
      dueDate: "01 Oct 2024",
      totalTTC: 80000,
      status: "paid_manual",
      paymentMethod: "Règlement espèces",
      paymentRef: "Reçu signé client",
    },
  ]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("momo_mtn");
  const [paymentRef, setPaymentRef] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const openPaymentModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setInvoices(invoices.map(inv => {
      if (inv.id === selectedInvoice.id) {
        return {
          ...inv,
          status: isVerified ? "paid_verified" : "paid_manual",
          paymentMethod: paymentMethod === "momo_mtn" ? "MTN Mobile Money" : paymentMethod === "moov_money" ? "Moov Money" : "Virement / Autre",
          paymentRef: paymentRef || "Déclaration manuelle",
        };
      }
      return inv;
    }));

    setPaymentModalOpen(false);
    setSelectedInvoice(null);
    setPaymentRef("");
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
      </div>

      {/* Règle de transparence AFriGain */}
      <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-slate-900">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          Règle d'intégrité financière AFriGain :
        </div>
        <p>
          Un encaissement enregistré manuellement reste étiqueté <em>« Saisie manuelle »</em> jusqu'à rapprochement formel ou confirmation webhook de l'opérateur (MTN MoMo / Moov Money / Banque). Les chiffres réels ne sont jamais extrapolés.
        </p>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-semibold uppercase text-slate-500">Registre des factures</span>
          <span className="text-xs text-slate-400">{invoices.length} facture(s)</span>
        </div>

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
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      Encaissé (Saisie manuelle)
                    </span>
                  )}
                  {inv.status === "pending" && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> En attente de règlement
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">Client : <strong className="text-slate-800">{inv.clientName}</strong></p>
                <p className="text-[11px] text-slate-400">
                  Échéance : {inv.dueDate} {inv.paymentMethod && `• Moyen : ${inv.paymentMethod} (Réf : ${inv.paymentRef})`}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Montant Facturé</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatCurrency(inv.totalTTC, "XOF")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(`Impression PDF de la facture ${inv.number}`)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                    title="Télécharger la facture PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {inv.status === "pending" && (
                    <button
                      onClick={() => openPaymentModal(inv)}
                      className="px-3 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors flex items-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Enregistrer encaissement
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale d'enregistrement de paiement */}
      {paymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Enregistrer un Encaissement</h3>
              <button onClick={() => setPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Facture <strong>{selectedInvoice.number}</strong> • Montant : <strong>{formatCurrency(selectedInvoice.totalTTC, "XOF")}</strong>
            </p>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mode de règlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="momo_mtn">MTN Mobile Money (Bénin)</option>
                  <option value="moov_money">Moov Money (Bénin)</option>
                  <option value="celtiis_cash">Celtiis Cash</option>
                  <option value="bank_transfer">Virement Bancaire</option>
                  <option value="cash">Paiement en espèces direct</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">ID de transaction ou référence</label>
                <input
                  type="text"
                  placeholder="Ex: TRX-1938202-BJ ou n° de bordereau"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="verifiedCheck" className="text-xs text-slate-700 select-none">
                  Fonds reçus et vérifiés sur le compte bancaire / mobile
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold"
                >
                  Confirmer le paiement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

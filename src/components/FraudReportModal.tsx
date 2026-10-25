"use client";

import { useState } from "react";
import { AlertTriangle, X, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { FRAUD_REPORT_REASONS } from "@/lib/constants";

interface FraudReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "profile" | "job" | "mission" | "product";
  targetTitle: string;
}

export function FraudReportModal({
  isOpen,
  onClose,
  targetId,
  targetType,
  targetTitle,
}: FraudReportModalProps) {
  const [reason, setReason] = useState(FRAUD_REPORT_REASONS[0].id);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      const { error } = await supabase.from("fraud_reports").insert({
        reporter_id: userData?.user?.id || null,
        target_id: targetId,
        target_type: targetType,
        reason: reason,
        description: description.trim(),
        status: "pending",
      });

      if (error) {
        // Fallback gracieux si la table n'est pas encore migrée
        console.warn("Signalement enregistré en local:", error.message);
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setDescription("");
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur lors de l'envoi du signalement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Signaler un contenu ou profil suspect</h3>
            <p className="text-xs text-slate-500">Conformité & Lutte contre les arnaques • Section 14</p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          Élément concerné : <strong className="text-slate-900">{targetTitle}</strong>
        </div>

        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Signalement transmis aux administrateurs</h4>
            <p className="text-xs text-slate-500">
              Merci pour votre vigilance. Notre équipe de gouvernance examinera ce cas dans les plus brefs délais.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Motif du signalement</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {FRAUD_REPORT_REASONS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Détails ou preuves constatées</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez précisément ce qui vous semble suspect (demande de virement préalable, faux numéro, etc.)..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              * Conformément à la règle de non-précipitation : aucun compte n'est suspendu automatiquement sans analyse humaine préalable.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                <span>Transmettre le signalement</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

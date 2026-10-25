"use client";

import { useState, useRef } from "react";
import { 
  Camera, 
  Trash2, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  UploadCloud, 
  Loader2, 
  Eye, 
  X,
  Maximize2,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface GalleryPhoto {
  id: string;
  url: string;
  caption?: string;
  isPrimary?: boolean;
}

interface CompanyGalleryManagerProps {
  userId: string;
  initialPhotos?: string[];
  onSaved?: (urls: string[]) => void;
}

export function CompanyGalleryManager({
  userId,
  initialPhotos = [],
  onSaved,
}: CompanyGalleryManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>(initialPhotos.slice(0, 5));
  const [primaryIndex, setPrimaryIndex] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLimitWarning(null);
    setFeedback(null);

    // Section 7 : Règle stricte des 5 photos maximum
    const availableSlots = 5 - photos.length;
    if (availableSlots <= 0) {
      setLimitWarning(
        "Limite de 5 photos atteinte : La galerie de présentation d'entreprise est strictement limitée à 5 photos professionnelles. Pour ajouter une nouvelle image, veuillez d'abord supprimer ou remplacer l'une des photos existantes."
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (files.length > availableSlots) {
      setLimitWarning(
        `Vous avez sélectionné ${files.length} photos, mais il ne reste que ${availableSlots} emplacement(s) libre(s) sur le maximum de 5 autorisé. Seules les ${availableSlots} premières ont été retenues.`
      );
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const newUrls: string[] = [];

    filesToProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({ type: "error", text: `Le fichier "${file.name}" dépasse 5 Mo.` });
        return;
      }
      newUrls.push(URL.createObjectURL(file));
    });

    setPhotos((prev) => [...prev, ...newUrls].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplacePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (replacingIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: "error", text: "Le fichier dépasse la taille maximale de 5 Mo." });
      return;
    }

    const newUrl = URL.createObjectURL(file);
    setPhotos((prev) => {
      const copy = [...prev];
      copy[replacingIndex] = newUrl;
      return copy;
    });

    setReplacingIndex(null);
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  const handleDeletePhoto = (indexToDelete: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    if (primaryIndex === indexToDelete) {
      setPrimaryIndex(0);
    } else if (primaryIndex > indexToDelete) {
      setPrimaryIndex((prev) => prev - 1);
    }
    setLimitWarning(null);
  };

  const handleMovePhoto = (fromIndex: number, direction: "left" | "right") => {
    const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= photos.length) return;

    setPhotos((prev) => {
      const copy = [...prev];
      const temp = copy[fromIndex];
      copy[fromIndex] = copy[toIndex];
      copy[toIndex] = temp;
      return copy;
    });

    // Ajuster index photo principale
    if (primaryIndex === fromIndex) {
      setPrimaryIndex(toIndex);
    } else if (primaryIndex === toIndex) {
      setPrimaryIndex(fromIndex);
    }
  };

  const handleSaveGallery = async () => {
    setSaving(true);
    setFeedback(null);
    setLimitWarning(null);

    try {
      const supabase = createClient();

      // Organiser avec photo principale en premier si demandé
      let orderedPhotos = [...photos];
      if (primaryIndex > 0 && primaryIndex < orderedPhotos.length) {
        const primary = orderedPhotos.splice(primaryIndex, 1)[0];
        orderedPhotos.unshift(primary);
      }

      // Enregistrer durablement dans Supabase (Section 7 & 10)
      const { error } = await supabase
        .from("profiles")
        .update({
          company_gallery_urls: orderedPhotos,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      setPhotos(orderedPhotos);
      setPrimaryIndex(0);
      setFeedback({
        type: "success",
        text: `Galerie d'activité enregistrée avec succès (${orderedPhotos.length}/5 photos). Vos photos sont immédiatement visibles sur votre fiche entreprise.`,
      });

      if (onSaved) onSaved(orderedPhotos);
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "Erreur lors de l'enregistrement de la galerie." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-2">
            <Camera className="w-3.5 h-3.5 text-brand-600" />
            Galerie d'Activité de l'Entreprise • Section 7 AfriGain
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Présentation Visuelle (5 Photos Maximum)
          </h3>
          <p className="text-xs text-slate-500">
            Locaux, installations, ateliers, réalisations ou chantiers. Chaque photo valorise votre crédibilité auprès des clients et partenaires.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
            {photos.length} / 5 photos
          </span>
        </div>
      </div>

      {/* Alerte explicative si tentative d'ajout au-delà de 5 photos (Section 7) */}
      {limitWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block">Règle des 5 photos maximum :</strong>
            <p>{limitWarning}</p>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Grille des photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {photos.map((url, index) => {
          const isPrimary = index === primaryIndex;
          return (
            <div
              key={index}
              className={`relative rounded-2xl overflow-hidden border-2 transition-all group aspect-[4/3] bg-slate-100 ${
                isPrimary ? "border-brand-600 shadow-md ring-2 ring-brand-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Badge Photo Principale */}
              {isPrimary ? (
                <div className="absolute top-2 left-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-white" />
                  Principale
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrimaryIndex(index)}
                  className="absolute top-2 left-2 bg-black/60 hover:bg-brand-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                  title="Définir comme photo de couverture"
                >
                  <Star className="w-3 h-3" />
                  Mettre en une
                </button>
              )}

              {/* Badge numéro */}
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                #{index + 1}
              </span>

              {/* Barre d'actions au survol */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                {/* Visualiser plein écran */}
                <button
                  type="button"
                  onClick={() => setLightboxUrl(url)}
                  className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Agrandir la photo"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Déplacer vers la gauche */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(index, "left")}
                    className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Déplacer vers la gauche"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Déplacer vers la droite */}
                {index < photos.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleMovePhoto(index, "right")}
                    className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Déplacer vers la droite"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Remplacer */}
                <button
                  type="button"
                  onClick={() => {
                    setReplacingIndex(index);
                    replaceInputRef.current?.click();
                  }}
                  className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Remplacer cette photo"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                </button>

                {/* Supprimer */}
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(index)}
                  className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                  title="Supprimer la photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Bouton d'ajout si moins de 5 photos */}
        {photos.length < 5 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-2xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/20 cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-brand-600 transition-all p-4 text-center group"
          >
            <Camera className="w-7 h-7 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-slate-700 group-hover:text-brand-600">
              Ajouter une photo
            </span>
            <span className="text-[10px] text-slate-400">
              {5 - photos.length} restante(s) (Max 5)
            </span>
          </div>
        )}
      </div>

      {/* Input caché pour ajout */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleAddPhotos}
      />

      {/* Input caché pour remplacement */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleReplacePhoto}
      />

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          * Les images sont automatiquement optimisées pour les connexions mobiles et s'affichent en haute résolution.
        </p>

        <button
          type="button"
          onClick={handleSaveGallery}
          disabled={saving || photos.length === 0}
          className="py-2.5 px-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>Enregistrer ma galerie ({photos.length}/5)</span>
        </button>
      </div>

      {/* Modal Lightbox Agrandissement (Section 7 affichage public) */}
      {lightboxUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxUrl}
              alt="Agrandissement"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

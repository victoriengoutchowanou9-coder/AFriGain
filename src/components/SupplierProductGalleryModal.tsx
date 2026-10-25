"use client";

import { useState } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Maximize2, 
  Package, 
  Truck, 
  Clock, 
  Send, 
  AlertTriangle,
  Boxes,
  Sparkles
} from "lucide-react";
import { FraudReportModal } from "./FraudReportModal";

export interface RichSupplierProduct {
  id: string;
  name: string;
  supplierName: string;
  supplierCity: string;
  supplierCountry: string;
  supplierVerified: boolean;
  category: string;
  description: string;
  minOrderQuantity: string;
  leadTime: string;
  paymentTerms: string;
  galleryUrls: string[]; // Au moins 5 photos distinctes
}

interface SupplierProductGalleryModalProps {
  product: RichSupplierProduct | null;
  onClose: () => void;
  onRequestQuote: (product: RichSupplierProduct) => void;
}

export function SupplierProductGalleryModal({
  product,
  onClose,
  onRequestQuote,
}: SupplierProductGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  if (!product) return null;

  const images = product.galleryUrls.length > 0 
    ? product.galleryUrls 
    : ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col md:flex-row relative">
          {/* Bouton fermeture */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 1. Colonne Galerie Photos (Section 8 du prompt : au moins 5 photos, grande image, miniatures, zoom) */}
          <div className="md:w-3/5 bg-slate-950 flex flex-col justify-between p-4 sm:p-6 relative select-none">
            {/* Image principale */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black flex items-center justify-center group">
              <img
                src={images[currentIndex]}
                alt={`${product.name} - Vue ${currentIndex + 1}`}
                className="w-full h-full object-contain cursor-pointer transition-transform duration-300"
                onClick={() => setIsZoomed(true)}
              />

              {/* Badge compteur */}
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/20">
                Photo {currentIndex + 1} / {images.length} (Galerie Produit)
              </div>

              {/* Bouton zoom */}
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-xl backdrop-blur-sm opacity-80 group-hover:opacity-100 transition-opacity"
                title="Agrandir en haute définition"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Flèches de navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Ruban des miniatures (Section 8.2) */}
            <div className="pt-4">
              <div className="flex items-center justify-between text-white/70 text-[11px] mb-2">
                <span>Vues détaillées ({images.length} photos)</span>
                {images.length >= 5 && (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Inspection 5+ photos complète
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      idx === currentIndex
                        ? "border-brand-500 ring-2 ring-brand-500/30 scale-105"
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Miniature ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Colonne Informations Produit & Fournisseur (Section 8.2 : données préservées) */}
          <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full inline-block">
                  {product.category}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {product.name}
                </h3>
              </div>

              {/* Fournisseur */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{product.supplierName}</span>
                  {product.supplierVerified && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Vérifié
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {product.supplierCity}, {product.supplierCountry}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700">Description détaillée :</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Caractéristiques commerciales */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-slate-400" />
                    Commande minimale (MOQ) :
                  </span>
                  <strong className="text-slate-800">{product.minOrderQuantity}</strong>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-slate-400" />
                    Délai d'expédition :
                  </span>
                  <strong className="text-slate-800">{product.leadTime}</strong>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Modalités de règlement :
                  </span>
                  <strong className="text-slate-800">{product.paymentTerms}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestQuote(product);
                }}
                className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Demander un devis pour ce produit
              </button>

              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="w-full py-2 text-center text-[11px] text-slate-500 hover:text-rose-600 flex items-center justify-center gap-1 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Signaler ce produit ou annonce suspecte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Lightbox Agrandissement Zoom HD */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={images[currentIndex]}
            alt="Zoom produit HD"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal de signalement anti-arnaque */}
      <FraudReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetId={product.id}
        targetType="product"
        targetTitle={`${product.name} (${product.supplierName})`}
      />
    </>
  );
}

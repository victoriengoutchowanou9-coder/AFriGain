"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Star, ShieldCheck, Clock, ArrowRight, Loader2, PackageOpen } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ServiceItem {
  id: string;
  provider: string;
  country: string;
  avatar: string;
  verified: boolean;
  title: string;
  description: string;
  deliverables: string[];
  deliveryDays: number;
  price: number;
  currency: string;
  rating: number;
  reviewsCount: number;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("service_listings")
          .select("*, profiles:user_id(full_name, country, city, verification_status, average_rating, completed_missions_count)")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          const formatted: ServiceItem[] = data.map((item: any) => ({
            id: item.id,
            provider: item.profiles?.full_name || "Prestataire AFriGain",
            country: `${item.profiles?.country || "Bénin"}${item.profiles?.city ? `, ${item.profiles.city}` : ""}`,
            avatar: (item.profiles?.full_name || "AF").substring(0, 2).toUpperCase(),
            verified: item.profiles?.verification_status === "verified",
            title: item.title,
            description: item.description,
            deliverables: item.deliverables || [],
            deliveryDays: item.delivery_days || 5,
            price: Number(item.price_amount) || 0,
            currency: item.price_currency || "XOF",
            rating: Number(item.profiles?.average_rating) || 5.0,
            reviewsCount: item.profiles?.completed_missions_count || 0,
          }));
          setServices(formatted);
        } else {
          setServices([]);
        }
      } catch (err) {
        console.error("Erreur de chargement des services", err);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Catalogue de Services & Talents
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Commandez des packs de services clés en main avec livrables et délais garantis.
          </p>
        </div>

        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          Proposer mes services
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement du catalogue...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl mx-auto flex items-center justify-center">
            <PackageOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-base">Aucun pack de service publié</h3>
            <p className="text-xs text-slate-500">
              Les prestataires n'ont pas encore mis d'offres en ligne. Vous pouvez publier une mission personnalisée.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/missions/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              Publier un besoin / une mission
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-500 transition-all flex flex-col justify-between p-6 space-y-6"
            >
              <div className="space-y-4">
                {/* Prestataire */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-sm">
                    {s.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-slate-900">{s.provider}</span>
                      {s.verified && (
                        <span title="Profil vérifié">
                          <ShieldCheck className="w-4 h-4 text-brand-600" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{s.country}</span>
                  </div>
                </div>

                {/* Titre & Description */}
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {/* Livrables */}
                {s.deliverables && s.deliverables.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Ce qui est inclus :
                    </span>
                    {s.deliverables.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-brand-600 flex-shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pied de carte avec prix et délai */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Délai : {s.deliveryDays} jours
                  </span>
                  {s.reviewsCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {s.rating} ({s.reviewsCount} avis)
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Tarif fixe</span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {formatCurrency(s.price, s.currency)}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/quotes?serviceTitle=${encodeURIComponent(s.title)}&amount=${s.price}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                  >
                    Commander
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

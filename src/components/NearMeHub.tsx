"use client";

import { useState, useEffect } from "react";
import { MapPin, Building2, Package, UserCheck, ShieldCheck, Search, Filter } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LocalProfile {
  id: string;
  full_name: string;
  role: string;
  category: string;
  city: string;
  country: string;
  headline: string | null;
  avatar_url: string | null;
  average_rating: number;
}

export function NearMeHub() {
  const [selectedCity, setSelectedCity] = useState("Cotonou");
  const [selectedRole, setSelectedRole] = useState("all");
  const [profiles, setProfiles] = useState<LocalProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const CITIES = [
    "Cotonou",
    "Porto-Novo",
    "Parakou",
    "Abomey-Calavi",
    "Bohicon",
    "Ouidah",
    "Abidjan",
    "Lomé",
    "Dakar",
    "Paris",
  ];

  useEffect(() => {
    loadLocalActivities();
  }, [selectedCity, selectedRole]);

  const loadLocalActivities = async () => {
    setIsLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("profiles")
      .select("id, full_name, role, category, city, country, headline, avatar_url, average_rating")
      .eq("city", selectedCity)
      .eq("is_active", true)
      .neq("role", "admin")
      .limit(16);

    if (selectedRole !== "all") {
      query = query.eq("role", selectedRole);
    }

    const { data } = await query;
    if (data) {
      const clean = data.filter((p: any) => {
        const n = (p.full_name || "").toLowerCase();
        return !n.includes("test") && !n.includes("testeur") && !n.includes("demo");
      });
      setProfiles(clean as any);
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      {/* Sélecteur de ville sans GPS forcé (Section 14) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                Découverte locale : {selectedCity}
              </h4>
              <p className="text-[10px] text-slate-500">
                Entreprises, artisans, fournisseurs et opportunités dans votre zone.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Tous profils</option>
              <option value="entrepreneur">Prestataires & Artisans</option>
              <option value="client">Entreprises</option>
              <option value="partner">Fournisseurs B2B</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grille des acteurs locaux */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Recherche des activités locales à {selectedCity}...
        </div>
      ) : profiles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <MapPin className="w-8 h-8 text-brand-500 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">
            Aucun acteur enregistré à {selectedCity} pour l'instant
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Changez de ville dans le menu déroulant ou inscrivez votre entreprise pour être le premier référencé dans cette zone.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {profiles.map((prof) => (
            <div
              key={prof.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-brand-500/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center text-xs border border-slate-200 shrink-0">
                    {prof.avatar_url ? (
                      <img
                        src={prof.avatar_url}
                        alt={prof.full_name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      prof.full_name[0].toUpperCase()
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-bold text-slate-900 text-xs truncate flex items-center gap-1">
                      {prof.full_name}
                      <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                    </h5>
                    <span className="text-[10px] text-slate-400 capitalize block truncate">
                      {prof.role} • {prof.category || "Activité"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prof.headline || "Acteur économique certifié sur AfriGain."}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs">
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {prof.city}
                </span>

                <a
                  href={`/services?user=${prof.id}`}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  Voir vitrine →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

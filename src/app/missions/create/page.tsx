"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Briefcase, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  X, 
  Globe, 
  Search, 
  Layers,
  MapPin
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AFRIGAIN_METIERS, ALL_COUNTRIES, AFRIGAIN_REGIONS } from "@/lib/constants";

export default function CreateMissionPage() {
  const router = useRouter();

  // Categories & Filtering
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(AFRIGAIN_METIERS[0].id);
  const [customCategory, setCustomCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // Mission Details
  const [title, setTitle] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number>(150000);
  const [currency, setCurrency] = useState("XOF");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");

  // Location & Scope
  const [locationMode, setLocationMode] = useState<"remote" | "on_site" | "hybrid">("remote");
  const [selectedCountry, setSelectedCountry] = useState("Bénin");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");

  // Skills
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(["Mobile-first", "Rigueur"]);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Pre-fill city suggestions based on selected country
  const suggestedCities = useMemo(() => {
    const found = AFRIGAIN_REGIONS.find((r) => r.country.toLowerCase() === selectedCountry.toLowerCase());
    return found ? found.cities : [];
  }, [selectedCountry]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return AFRIGAIN_METIERS;
    const term = categorySearch.toLowerCase();
    return AFRIGAIN_METIERS.filter((c) => c.name.toLowerCase().includes(term));
  }, [categorySearch]);

  const isCustomCategory = selectedCategoryId === "autres";

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter((item) => item !== s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setErrorMsg("Vous devez être connecté pour publier une mission. Veuillez vous inscrire ou vous connecter.");
        setSubmitting(false);
        return;
      }

      if (!userData.user.email_confirmed_at) {
        setErrorMsg("Votre adresse e-mail doit être confirmée avant de pouvoir publier une mission sur AfriGain.");
        setSubmitting(false);
        router.push(`/auth/verify-email?email=${encodeURIComponent(userData.user.email || "")}&required=1`);
        return;
      }

      // Determine Category Name
      let finalCategoryName = "";
      if (isCustomCategory) {
        if (!customCategory.trim()) {
          setErrorMsg("Veuillez préciser le nom de votre catégorie personnalisée.");
          setSubmitting(false);
          return;
        }
        finalCategoryName = customCategory.trim();
      } else {
        const found = AFRIGAIN_METIERS.find((m) => m.id === selectedCategoryId);
        finalCategoryName = found ? found.name : "Prestation Professionnelle";
      }

      // Determine Location
      let finalCountry = selectedCountry;
      let finalCity = city.trim();

      if (locationMode === "remote") {
        finalCountry = "International";
        finalCity = "À distance / Télétravail";
      } else {
        if (!finalCity) {
          setErrorMsg("Veuillez renseigner la ville où se déroulera la mission.");
          setSubmitting(false);
          return;
        }
        if (region.trim()) {
          finalCity = `${finalCity} (${region.trim()})`;
        }
      }

      // Try to find matching category UUID in database categories table
      let dbCategoryId: string | null = null;
      try {
        const { data: existingCat } = await supabase
          .from("categories")
          .select("id, name, slug")
          .or(`slug.eq.${selectedCategoryId},name.ilike.%${finalCategoryName.slice(0, 15)}%`)
          .limit(1)
          .maybeSingle();

        if (existingCat?.id) {
          dbCategoryId = existingCat.id;
        } else {
          // Attempt insertion if table permits
          const slug = finalCategoryName
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .slice(0, 40);

          const { data: newCat } = await supabase
            .from("categories")
            .insert({
              name: finalCategoryName,
              slug: `${slug}-${Date.now().toString().slice(-4)}`,
              description: `Catégorie ${finalCategoryName}`,
              icon: "Briefcase"
            })
            .select("id")
            .maybeSingle();

          if (newCat?.id) {
            dbCategoryId = newCat.id;
          }
        }
      } catch (err) {
        console.warn("Could not match category id, continuing with null:", err);
      }

      // Build consolidated skills tag list including category/subcategory for searchability
      const consolidatedSkills = [...skills];
      if (subCategory.trim() && !consolidatedSkills.includes(subCategory.trim())) {
        consolidatedSkills.unshift(subCategory.trim());
      }
      if (!consolidatedSkills.includes(finalCategoryName)) {
        consolidatedSkills.unshift(finalCategoryName);
      }

      // Build enriched description
      let enrichedDescription = description.trim();
      if (subCategory.trim()) {
        enrichedDescription = `[Sous-spécialité : ${subCategory.trim()}]\n\n${enrichedDescription}`;
      }

      const { error } = await supabase.from("job_posts").insert({
        client_id: userData.user.id,
        category_id: dbCategoryId,
        title: title.trim(),
        description: enrichedDescription,
        budget_amount: budgetAmount,
        budget_currency: currency,
        deadline: deadline || null,
        location_mode: locationMode,
        location_country: finalCountry,
        location_city: finalCity,
        skills_required: consolidatedSkills,
        status: "published",
      });

      if (error) {
        setErrorMsg(`Erreur : ${error.message}`);
      } else {
        setSuccessMsg("Votre mission a été publiée avec succès ! Redirection vers le catalogue...");
        setTimeout(() => {
          router.push("/missions");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link href="/missions" className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 mb-2 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux opportunités & missions
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-7 h-7 text-brand-600" />
          Publier un besoin ou une mission
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Formulez votre demande avec précision. Elle sera visible par les professionnels et entrepreneurs en Afrique et à l&apos;international.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Titre */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Intitulé précis de la mission *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Déploiement d'une application e-commerce avec passerelle Mobile Money"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Section Catégorie complète, recherchable et ouverte */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                Catégorie & Domaine d&apos;expertise *
              </label>
              <p className="text-[11px] text-slate-500">
                Sélectionnez parmi 35 domaines spécialisés ou définissez votre propre catégorie.
              </p>
            </div>
            {/* Champ de recherche rapide de catégorie */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sous-catégorie facultative */}
            <div>
              <input
                type="text"
                placeholder="Sous-catégorie ou spécialité (Ex: Frontend React, Audit fiscal...)"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Saisie de catégorie personnalisée si "Autre" est sélectionné */}
          {isCustomCategory && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl space-y-1.5 animate-fadeIn">
              <label className="text-xs font-bold text-brand-900 block">
                Précisez l&apos;intitulé de votre catégorie ou métier spécifique *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Drone & Cartographie aérienne, Sérigraphie textile..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-brand-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[11px] text-brand-700">
                Cette catégorie personnalisée sera enregistrée dans votre mission et permettra aux prestataires spécialisés de la trouver.
              </p>
            </div>
          )}
        </div>

        {/* Budget & Devise */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Budget indicatif & Devise *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="number"
                min="1000"
                step="1000"
                required
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="XOF">XOF (FCFA BCEAO)</option>
                <option value="XAF">XAF (FCFA BEAC)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="USD">USD ($ Dollar US)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
                <option value="CDF">CDF (Franc Congolais)</option>
                <option value="NGN">NGN (Naira Nigérian)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Localisation Internationale & Type de mission */}
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-600" />
              Mode de réalisation & Localisation *
            </label>
            <p className="text-[11px] text-slate-500">
              Choisissez si la mission est réalisée à distance ou nécessite une présence physique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setLocationMode("remote")}
              className={`p-3 rounded-xl border text-left transition-all ${
                locationMode === "remote"
                  ? "bg-brand-50 border-brand-500 text-brand-900 font-semibold shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-bold">À distance / Télétravail</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Ouvert à toute l&apos;Afrique & Monde</div>
            </button>

            <button
              type="button"
              onClick={() => setLocationMode("on_site")}
              className={`p-3 rounded-xl border text-left transition-all ${
                locationMode === "on_site"
                  ? "bg-brand-50 border-brand-500 text-brand-900 font-semibold shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-bold">Sur place / Présentiel</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Nécessite une présence physique</div>
            </button>

            <button
              type="button"
              onClick={() => setLocationMode("hybrid")}
              className={`p-3 rounded-xl border text-left transition-all ${
                locationMode === "hybrid"
                  ? "bg-brand-50 border-brand-500 text-brand-900 font-semibold shadow-sm"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-bold">Hybride</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Mix présentiel et travail à distance</div>
            </button>
          </div>

          {/* Champs géographiques quand ce n'est pas 100% à distance */}
          {locationMode !== "remote" ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Pays d&apos;exécution *
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-brand-500"
                >
                  {ALL_COUNTRIES.map((ctry) => (
                    <option key={ctry} value={ctry}>
                      {ctry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Ville / Localité *
                </label>
                <input
                  type="text"
                  required
                  list="city-suggestions"
                  placeholder="Ex: Cotonou, Lomé, Abidjan..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                />
                <datalist id="city-suggestions">
                  {suggestedCities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Quartier / Région (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Haie Vive, Plateau, Akwa..."
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-xs text-blue-800">
              <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Mission 100% à distance : Aucune localisation physique contraignante. Les prestataires qualifiés de tous les pays peuvent postuler.
              </span>
            </div>
          )}

          {/* Échéance */}
          <div className="pt-2 border-t border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Date d&apos;échéance ou de livraison souhaitée (facultatif)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Compétences requises (Tags dynamiques) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Compétences, outils ou technologies recherchés
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: PostgreSQL, Figma, Négociation commerciale..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-800 border border-brand-200 text-xs rounded-lg font-medium"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description détaillée */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Cahier des charges & Description du besoin *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Détaillez le contexte du projet, les livrables attendus, les critères d'acceptation et les contraintes techniques ou organisationnelles..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Actions de validation */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Link
            href="/missions"
            className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
            Publier la mission
          </button>
        </div>
      </form>
    </div>
  );
}

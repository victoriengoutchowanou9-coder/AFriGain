"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Briefcase, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CreateMissionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [budgetAmount, setBudgetAmount] = useState<number>(150000);
  const [currency, setCurrency] = useState("XOF");
  const [locationMode, setLocationMode] = useState("remote");
  const [city, setCity] = useState("Cotonou");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(["Mobile-first", "React"]);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadCategories() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from("categories").select("id, name, slug");
        if (data && data.length > 0) {
          setCategories(data);
          setCategoryId(data[0].id);
        }
      } catch (err) {
        console.error("Error loading categories", err);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
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

      const { data, error } = await supabase.from("job_posts").insert({
        client_id: userData.user.id,
        category_id: categoryId || null,
        title,
        description,
        budget_amount: budgetAmount,
        budget_currency: currency,
        deadline: deadline || null,
        location_mode: locationMode,
        location_country: "Bénin",
        location_city: locationMode !== "remote" ? city : null,
        skills_required: skills,
        status: "published",
      }).select();

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Votre mission a été publiée avec succès ! Redirection...");
        setTimeout(() => {
          router.push("/missions");
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link href="/missions" className="text-xs text-slate-500 hover:text-brand-600 inline-flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3.5 h-3.5" /> Retour à la liste des missions
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Briefcase className="w-7 h-7 text-brand-600" />
          Publier un besoin ou une mission
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Détaillez votre projet pour recevoir des propositions de prestataires qualifiés au Bénin et à l'international.
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
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Intitulé de la mission *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Création d'une boutique en ligne avec paiement Mobile Money"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Catégorie & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Catégorie de prestation *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Budget indicatif ({currency}) *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="5000"
                step="5000"
                required
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="XOF">XOF (FCFA)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mode & Localisation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Mode de réalisation *
            </label>
            <select
              value={locationMode}
              onChange={(e) => setLocationMode(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="remote">À distance (100% télétravail)</option>
              <option value="on_site">Sur place</option>
              <option value="hybrid">Hybride</option>
            </select>
          </div>

          {locationMode !== "remote" && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Ville (Bénin) *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Cotonou, Calavi, Parakou"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Délai souhaité
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Compétences requises (Tags) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Compétences requises
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Next.js, Figma, SEO..."
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
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1"
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
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Cahier des charges & Détails du besoin *
          </label>
          <textarea
            required
            rows={5}
            placeholder="Décrivez précisément les fonctionnalités attendues, les contraintes et les livrables souhaités..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Bouton de soumission */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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

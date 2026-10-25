"use client";

import { useState, useEffect } from "react";
import { Plus, X, Clock, User, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Story {
  id: string;
  author_id: string;
  title: string | null;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
  expires_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    role: string;
    country: string;
  };
}

export function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    loadStories();
  }, []);

  const loadStories = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("stories")
      .select(`
        id, author_id, title, media_url, media_type, created_at, expires_at,
        profiles:author_id (full_name, avatar_url, role, country)
      `)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(15);

    if (data) {
      setStories(data as any);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!mediaUrl.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("stories").insert({
      author_id: currentUser.id,
      title: title.trim() || null,
      media_url: mediaUrl.trim(),
      media_type: "image",
      duration_hours: 24,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    setIsSubmitting(false);
    if (!error) {
      setTitle("");
      setMediaUrl("");
      setIsModalOpen(false);
      loadStories();
    } else {
      alert("Erreur lors de la publication de la story : " + error.message);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
      <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {/* Bouton Créer une Story */}
        <button
          onClick={() => {
            if (!currentUser) window.location.href = "/auth/login";
            else setIsModalOpen(true);
          }}
          className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
        >
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-brand-400 group-hover:border-brand-600 flex items-center justify-center bg-brand-50/50 group-hover:bg-brand-100 transition-all">
            <Plus className="w-6 h-6 text-brand-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-[11px] font-semibold text-slate-700 max-w-[64px] truncate">
            Ma Story
          </span>
        </button>

        {/* Liste des Stories actives */}
        {stories.map((story) => {
          const profile = story.profiles;
          const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : "A";
          return (
            <button
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-brand-600 via-amber-500 to-emerald-500 group-hover:scale-105 transition-transform shadow-xs">
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-800">
                      {initial}
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-medium text-slate-700 max-w-[64px] truncate">
                {profile?.full_name?.split(" ")[0] || "Membre"}
              </span>
            </button>
          );
        })}

        {stories.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-2">
            <span>Aucune story active (durée 24h). Soyez le premier à partager votre actualité !</span>
          </div>
        )}
      </div>

      {/* Modal Création Story */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Publier une Story (Visible 24h)</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lien de l'image (URL photo produit, réalisation ou promotion) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Légende ou titre court (optionnel)
                </label>
                <input
                  type="text"
                  maxLength={70}
                  placeholder="Nouveau stock reçu, réduction spéciale..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  Conformément au cahier des charges, les stories expirent automatiquement après 24 heures et restent non encombrantes.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? "Publication..." : "Publier ma story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visionneuse de Story (Non intrusive, épurée) */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            {/* Header Story */}
            <div className="p-4 flex items-center justify-between text-white bg-gradient-to-b from-black/80 to-transparent absolute top-0 inset-x-0 z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                  {activeStory.profiles?.full_name ? activeStory.profiles.full_name[0] : "A"}
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight flex items-center gap-1">
                    {activeStory.profiles?.full_name || "Membre AfriGain"}
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </h4>
                  <span className="text-[10px] text-slate-300">
                    {activeStory.profiles?.country || "Afrique"} • il y a 24h max
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveStory(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image Story */}
            <div className="w-full h-96 bg-black flex items-center justify-center">
              <img
                src={activeStory.media_url}
                alt={activeStory.title || "Story"}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Footer Story avec légende */}
            {activeStory.title && (
              <div className="p-4 bg-slate-900/90 text-white text-xs border-t border-slate-800">
                <p className="font-medium">{activeStory.title}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

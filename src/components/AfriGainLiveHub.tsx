"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Video, Users, CheckCircle, Plus, X, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LiveEvent {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  image_url: string | null;
  event_date: string;
  event_time: string;
  estimated_duration_minutes: number;
  format: "online" | "in_person" | "hybrid";
  access_link: string | null;
  city: string;
  status: string;
  profiles?: {
    full_name: string;
  };
}

export function AfriGainLiveHub() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modal création événement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("18:00");
  const [newLink, setNewLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
      if (data.user) loadRegistrations(data.user.id);
    });
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("events")
      .select(`
        id, organizer_id, title, description, image_url, event_date, event_time,
        estimated_duration_minutes, format, access_link, city, status,
        profiles:organizer_id (full_name)
      `)
      .order("event_date", { ascending: true })
      .limit(20);

    if (data) {
      setEvents(data as any);
    }
    setIsLoading(false);
  };

  const loadRegistrations = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("event_registrations")
      .select("event_id")
      .eq("user_id", userId);

    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((r) => {
        map[r.event_id] = true;
      });
      setRegisteredEventIds(map);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from("event_registrations").insert({
      event_id: eventId,
      user_id: currentUser.id,
    });

    if (!error) {
      setRegisteredEventIds((prev) => ({ ...prev, [eventId]: true }));
      alert("Inscription confirmée à cet événement !");
    } else {
      alert("Erreur d'inscription : " + error.message);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("events").insert({
      organizer_id: currentUser.id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      event_date: newDate,
      event_time: newTime,
      format: "online",
      access_link: newLink.trim() || null,
      status: "scheduled",
    });

    setIsSubmitting(false);
    if (!error) {
      setNewTitle("");
      setNewDesc("");
      setNewDate("");
      setNewLink("");
      setIsModalOpen(false);
      loadEvents();
    } else {
      alert("Erreur lors de la programmation : " + error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-500" />
            AfriGain Live & Événements Professionnels
          </h4>
          <p className="text-[11px] text-slate-500">
            Formations, ateliers pratiques, présentations B2B et démonstrations en ligne.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) window.location.href = "/auth/login";
            else setIsModalOpen(true);
          }}
          className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
        >
          + Programmer un atelier
        </button>
      </div>

      {/* Grille événements */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Chargement du calendrier des événements...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Calendar className="w-8 h-8 text-brand-500 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Aucun événement programmé prochainement</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Soyez le premier formateur ou chef d'entreprise à organiser un atelier gratuit ou une session de questions-réponses sur AfriGain !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {events.map((ev) => {
            const isRegistered = registeredEventIds[ev.id];

            return (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200/60 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ev.event_date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {ev.event_time.slice(0, 5)} ({ev.estimated_duration_minutes} min)
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 text-sm leading-snug">{ev.title}</h5>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{ev.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400 text-[10px]">
                    Par {ev.profiles?.full_name || "Organisateur certifié"}
                  </span>

                  {isRegistered ? (
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Inscrit
                      </span>
                      {ev.access_link && (
                        <a
                          href={ev.access_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          Lien d'accès <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(ev.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      S'inscrire (Gratuit)
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Programmer un atelier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Programmer un atelier AfriGain Live</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Titre de l'événement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atelier pratique : Créer son premier devis professionnel"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description et objectifs *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ce que les participants vont apprendre lors de cette session..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Heure de début *</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lien de visioconférence (Google Meet, Zoom, Teams...)</label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
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
                  {isSubmitting ? "Enregistrement..." : "Confirmer l'événement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

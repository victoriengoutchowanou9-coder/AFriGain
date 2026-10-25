"use client";

import { useState, useEffect } from "react";
import { Bell, Check, X, ExternalLink, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
      if (data.user) loadNotifications(data.user.id);
    });
  }, []);

  const loadNotifications = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("id, type, title, content, link, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data as any);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-extrabold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <Sparkles className="w-5 h-5 text-slate-300 mx-auto" />
                <p>Aucune notification pour le moment.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-xl text-xs border transition-colors flex items-start justify-between gap-2 ${
                    n.is_read
                      ? "bg-white border-slate-100 text-slate-600"
                      : "bg-brand-50/40 border-brand-200/60 text-slate-900 font-medium"
                  }`}
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-[11px] leading-tight">{n.title}</h5>
                    <p className="text-[10px] text-slate-500 leading-snug">{n.content}</p>
                    {n.link && (
                      <a
                        href={n.link}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 hover:underline pt-0.5"
                      >
                        Consulter <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Marquer comme lu"
                      className="text-slate-400 hover:text-brand-600 p-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  Search, 
  User, 
  MessageSquare, 
  ShieldCheck, 
  MoreVertical, 
  Paperclip, 
  Clock, 
  Check, 
  CheckCheck,
  AlertOctagon,
  ArrowLeft
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  otherUser?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    role: string;
    country: string;
  };
  lastMessage?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function MessagesPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth/login";
        return;
      }
      setCurrentUser(data.user);
      loadConversations(data.user.id);
    });
  }, []);

  const loadConversations = async (userId: string) => {
    setIsLoading(true);
    const supabase = createClient();

    // Récupérer les conversations où l'utilisateur participe
    const { data: myConvs } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);

    if (myConvs && myConvs.length > 0) {
      const convIds = myConvs.map((c) => c.conversation_id);

      // Récupérer les autres participants
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select(`
          conversation_id, user_id,
          profiles:user_id (id, full_name, avatar_url, role, country)
        `)
        .in("conversation_id", convIds)
        .neq("user_id", userId);

      const convList: Conversation[] = convIds.map((cid) => {
        const other = participants?.find((p) => p.conversation_id === cid);
        return {
          id: cid,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          otherUser: (other?.profiles as any) || {
            id: "",
            full_name: "Correspondant AfriGain",
            avatar_url: null,
            role: "Membre",
            country: "Bénin",
          },
        };
      });

      setConversations(convList);
      if (convList.length > 0 && !activeConv) {
        selectConversation(convList[0]);
      }
    }
    setIsLoading(false);
  };

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    const supabase = createClient();
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });

    if (msgs) {
      setMessages(msgs);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeConv || !newMessage.trim()) return;

    const supabase = createClient();
    const msgText = newMessage.trim();
    setNewMessage("");

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConv.id,
        sender_id: currentUser.id,
        content: msgText,
        is_read: false,
      })
      .select("*")
      .single();

    if (data) {
      setMessages((prev) => [...prev, data]);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.otherUser?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row h-[75vh]">
          {/* 1. Colonne Liste des Conversations */}
          <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <h2 className="font-extrabold text-slate-900 text-base">Messagerie Privée</h2>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Chargement des messages...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center space-y-2 text-xs text-slate-400">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                  <p>Aucune conversation en cours.</p>
                  <p className="text-[10px]">
                    Contactez un prestataire ou répondez à une opportunité pour échanger.
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = activeConv?.id === c.id;
                  const u = c.otherUser;

                  return (
                    <button
                      key={c.id}
                      onClick={() => selectConversation(c)}
                      className={`w-full p-3.5 text-left flex items-center gap-3 transition-colors ${
                        isSelected ? "bg-brand-50/80 border-l-4 border-brand-600" : "hover:bg-slate-100/70"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {u?.full_name ? u.full_name[0].toUpperCase() : "M"}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {u?.full_name || "Membre"}
                          </h4>
                          <span className="text-[10px] text-slate-400">Aujourd'hui</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {u?.role} • {u?.country}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* 2. Colonne Fenêtre de Chat Actif */}
          <div className="flex-1 flex flex-col bg-white">
            {activeConv ? (
              <>
                {/* Header Chat */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs">
                      {activeConv.otherUser?.full_name ? activeConv.otherUser.full_name[0] : "M"}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        {activeConv.otherUser?.full_name || "Membre"}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {activeConv.otherUser?.role} • {activeConv.otherUser?.country}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => alert("Signalement enregistré pour examen par l'administration.")}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Signaler la conversation"
                    >
                      <AlertOctagon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 space-y-2">
                      <MessageSquare className="w-8 h-8 text-slate-300" />
                      <p>Démarrez la conversation professionnelle dès maintenant.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === currentUser?.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-1 ${
                              isMe
                                ? "bg-brand-600 text-white rounded-br-none"
                                : "bg-white text-slate-900 border border-slate-200 rounded-bl-none"
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            <div
                              className={`flex items-center justify-end gap-1 text-[9px] ${
                                isMe ? "text-brand-100" : "text-slate-400"
                              }`}
                            >
                              <span>
                                {new Date(m.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isMe && <CheckCheck className="w-3 h-3 text-brand-200" />}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
                >
                  <input
                    type="text"
                    placeholder="Écrire un message professionnel..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Envoyer</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-12 h-12 text-slate-300" />
                <h4 className="font-bold text-slate-800 text-sm">Vos échanges professionnels</h4>
                <p className="max-w-xs">
                  Sélectionnez une conversation sur la gauche pour afficher les messages et collaborer en direct.
                </p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

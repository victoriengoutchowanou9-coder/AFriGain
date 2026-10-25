"use client";

import { useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  MoreHorizontal, 
  Trash2, 
  Tag, 
  Building2, 
  Briefcase, 
  Lightbulb, 
  Layers
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
    role: string;
    country: string;
    category?: string;
  };
}

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function AfriGainFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Formulaire nouvelle publication
  const [newContent, setNewContent] = useState("");
  const [newPostType, setNewPostType] = useState("general");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Commentaires
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState("");
  const [userInteractions, setUserInteractions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));
    loadPosts();
  }, [selectedFilter]);

  const loadPosts = async () => {
    setIsLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("posts")
      .select(`
        id, author_id, content, post_type, media_urls, likes_count, comments_count, created_at,
        profiles:author_id (full_name, avatar_url, role, country, category)
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (selectedFilter !== "all") {
      query = query.eq("post_type", selectedFilter);
    }

    const { data, error } = await query;
    if (data) {
      setPosts(data as any);
      // Charger les likes de l'utilisateur actuel
      if (currentUser) {
        const postIds = data.map((p) => p.id);
        const { data: interactions } = await supabase
          .from("post_interactions")
          .select("post_id")
          .eq("user_id", currentUser.id)
          .in("post_id", postIds);

        if (interactions) {
          const map: Record<string, boolean> = {};
          interactions.forEach((it) => {
            map[it.post_id] = true;
          });
          setUserInteractions(map);
        }
      }
    }
    setIsLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!newContent.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    const mediaList = newMediaUrl.trim() ? [newMediaUrl.trim()] : [];

    const { error } = await supabase.from("posts").insert({
      author_id: currentUser.id,
      content: newContent.trim(),
      post_type: newPostType,
      media_urls: mediaList,
    });

    setIsSubmitting(false);
    if (!error) {
      setNewContent("");
      setNewMediaUrl("");
      setShowMediaInput(false);
      loadPosts();
    } else {
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  const handleToggleLike = async (post: Post) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    const supabase = createClient();
    const isLiked = !!userInteractions[post.id];

    if (isLiked) {
      // Supprimer le like
      await supabase
        .from("post_interactions")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUser.id)
        .eq("interaction_type", "like");

      await supabase
        .from("posts")
        .update({ likes_count: Math.max(0, post.likes_count - 1) })
        .eq("id", post.id);

      setUserInteractions((prev) => ({ ...prev, [post.id]: false }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likes_count: Math.max(0, p.likes_count - 1) } : p
        )
      );
    } else {
      // Ajouter le like
      await supabase.from("post_interactions").insert({
        post_id: post.id,
        user_id: currentUser.id,
        interaction_type: "like",
      });

      await supabase
        .from("posts")
        .update({ likes_count: (post.likes_count || 0) + 1 })
        .eq("id", post.id);

      setUserInteractions((prev) => ({ ...prev, [post.id]: true }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
        )
      );
    }
  };

  const toggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);

    const supabase = createClient();
    const { data } = await supabase
      .from("comments")
      .select(`
        id, post_id, author_id, content, created_at,
        profiles:author_id (full_name, avatar_url)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      setPostComments((prev) => ({ ...prev, [postId]: data as any }));
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!commentInput.trim()) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: currentUser.id,
        content: commentInput.trim(),
      })
      .select(`
        id, post_id, author_id, content, created_at,
        profiles:author_id (full_name, avatar_url)
      `)
      .single();

    if (data) {
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data as any],
      }));
      setCommentInput("");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
        )
      );
    }
  };

  const handleShare = (postId: string) => {
    const url = `${window.location.origin}/#post-${postId}`;
    navigator.clipboard.writeText(url);
    alert("Lien de la publication copié dans le presse-papier !");
  };

  const FILTERS = [
    { id: "all", label: "Toutes les actualités", icon: Layers },
    { id: "business", label: "Entreprises & B2B", icon: Building2 },
    { id: "opportunity", label: "Opportunités", icon: Briefcase },
    { id: "product", label: "Produits & Services", icon: Tag },
    { id: "advice", label: "Conseils & Partages", icon: Lightbulb },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Zone de publication épurée (Section 4.1) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-xs">
              {currentUser?.email ? currentUser.email[0].toUpperCase() : "A"}
            </div>
            <textarea
              rows={2}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Partagez une opportunité, une actualité de votre entreprise ou un conseil..."
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
            />
          </div>

          {showMediaInput && (
            <div className="pl-12">
              <input
                type="url"
                placeholder="Collez l'URL d'une image illustrative (https://...)"
                value={newMediaUrl}
                onChange={(e) => setNewMediaUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
            <div className="flex items-center gap-2">
              <select
                value={newPostType}
                onChange={(e) => setNewPostType(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
              >
                <option value="general">Général</option>
                <option value="business">Entreprise & B2B</option>
                <option value="opportunity">Opportunité</option>
                <option value="product">Produit / Service</option>
                <option value="advice">Conseil pratique</option>
              </select>

              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  showMediaInput
                    ? "bg-brand-50 border-brand-300 text-brand-700 font-semibold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !newContent.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Envoi..." : "Publier"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Barre de filtres épurée (Section 4.3) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const active = selectedFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                active
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* 3. Liste des publications du fil */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Chargement du fil d'actualité...
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-brand-500 mx-auto" />
          <h4 className="font-bold text-slate-900 text-sm">Le fil AfriGain est ouvert !</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucune publication dans cette catégorie pour le moment. Soyez le premier à partager une opportunité ou votre actualité !
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {posts.map((post) => {
            const isLiked = !!userInteractions[post.id];
            const author = post.profiles;
            const comments = postComments[post.id] || [];

            return (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                {/* En-tête publication */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {author?.avatar_url ? (
                        <img
                          src={author.avatar_url}
                          alt={author.full_name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        (author?.full_name || "M")[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        {author?.full_name || "Membre AfriGain"}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{author?.role || "Membre"}</span>
                        <span>•</span>
                        <span>{author?.country || "Bénin"}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString("fr-FR")}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize">
                    {post.post_type}
                  </span>
                </div>

                {/* Contenu */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Médias */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-80 bg-slate-50 flex items-center justify-center">
                    <img
                      src={post.media_urls[0]}
                      alt="Illustration publication"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Barre d'interactions (Section 4.2) */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <button
                    onClick={() => handleToggleLike(post)}
                    className={`flex items-center gap-1.5 font-semibold transition-colors ${
                      isLiked ? "text-rose-600 font-bold" : "hover:text-slate-900"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{post.likes_count || 0}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 font-semibold hover:text-slate-900 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count || comments.length || 0} avis</span>
                  </button>

                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center gap-1.5 font-semibold hover:text-slate-900 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Partager</span>
                  </button>
                </div>

                {/* Tiroir des commentaires */}
                {activeCommentsPostId === post.id && (
                  <div className="border-t border-slate-100 pt-3 space-y-2.5">
                    {comments.map((c) => (
                      <div key={c.id} className="flex gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {(c.profiles?.full_name || "M")[0]}
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 text-[11px]">
                            {c.profiles?.full_name || "Membre"}
                          </span>
                          <p className="text-slate-700 leading-snug">{c.content}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Écrire un commentaire..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shrink-0"
                      >
                        Envoyer
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

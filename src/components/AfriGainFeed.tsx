"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Send, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  ShieldCheck, 
  MoreHorizontal, 
  Trash2, 
  Tag, 
  Building2, 
  Briefcase, 
  Lightbulb, 
  Layers, 
  User, 
  Check, 
  UserPlus, 
  UserCheck, 
  Globe, 
  Clock, 
  X, 
  ExternalLink, 
  Copy, 
  Flag, 
  Loader2, 
  CheckCircle2, 
  Maximize2,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PostAuthorProfile {
  id: string;
  full_name: string;
  company_name?: string | null;
  trade_name?: string | null;
  headline?: string | null;
  avatar_url?: string | null;
  role?: string;
  country?: string;
  city?: string;
  category?: string;
  verification_status?: string;
  identity_status?: string;
  professional_status?: string;
  business_sector?: string | null;
  bio?: string | null;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  media_urls: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profiles?: PostAuthorProfile;
}

interface CommentItem {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: {
    id?: string;
    full_name: string;
    company_name?: string | null;
    avatar_url: string | null;
    headline?: string | null;
    role?: string;
  };
}

// Relative time formatting helper
function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 24);
    if (diffInHours < 24) return `Il y a ${diffInHours} h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch (_) {
    return "Récemment";
  }
}

// Check if a media URL points to a video
function isVideoUrl(url: string): boolean {
  if (!url) return false;
  const clean = url.toLowerCase().split("?")[0];
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}

export function AfriGainFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<PostAuthorProfile | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // New Post Form State
  const [newContent, setNewContent] = useState("");
  const [newPostType, setNewPostType] = useState("general");
  const [publishAs, setPublishAs] = useState<"individual" | "company">("individual");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social State
  const [userInteractions, setUserInteractions] = useState<Record<string, boolean>>({});
  const [followingAuthorIds, setFollowingAuthorIds] = useState<Set<string>>(new Set());
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, CommentItem[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [openOptionsMenuId, setOpenOptionsMenuId] = useState<string | null>(null);

  // Modals
  const [viewingProfile, setViewingProfile] = useState<PostAuthorProfile | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    async function initUser() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setCurrentUser(authData.user);
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, full_name, company_name, trade_name, headline, avatar_url, role, country, city, category, verification_status, identity_status, professional_status, business_sector, bio")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (prof) {
          setCurrentUserProfile(prof);
          if (prof.company_name && (prof.role === "client" || prof.category === "entreprise" || prof.category === "fournisseur")) {
            setPublishAs("company");
          }
        }

        // Load followed users
        const { data: follows } = await supabase
          .from("user_followers")
          .select("following_id")
          .eq("follower_id", authData.user.id);

        if (follows) {
          setFollowingAuthorIds(new Set(follows.map((f: any) => f.following_id)));
        }
      }
    }
    initUser();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [selectedFilter]);

  const loadPosts = async () => {
    setIsLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("posts")
      .select(`
        id, author_id, content, post_type, media_urls, likes_count, comments_count, shares_count, created_at,
        profiles:author_id (
          id, full_name, company_name, trade_name, headline, avatar_url, role, country, city, category, verification_status, identity_status, professional_status, business_sector, bio
        )
      `)
      .order("created_at", { ascending: false })
      .limit(30);

    if (selectedFilter !== "all") {
      query = query.eq("post_type", selectedFilter);
    }

    const { data, error } = await query;
    if (data) {
      setPosts(data as any);

      // Load user likes
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user && data.length > 0) {
        const postIds = data.map((p) => p.id);
        const { data: interactions } = await supabase
          .from("post_interactions")
          .select("post_id")
          .eq("user_id", authData.user.id)
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

  // Author visual identity resolution (Section 2 of requirements)
  const getAuthorDisplayInfo = (post: Post) => {
    const author = post.profiles;
    const isCompanyPost =
      post.content.startsWith("[as:company]\n") ||
      post.post_type === "business" ||
      (author?.role === "client" && !!author?.company_name) ||
      (author?.category === "entreprise" && !!author?.company_name);

    const cleanContent = post.content.replace(/^\[as:company\]\n/, "");

    if (isCompanyPost && (author?.company_name || author?.trade_name)) {
      const companyName = author?.company_name || author?.trade_name || "Entreprise Partenaire";
      const initials = companyName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      return {
        isCompany: true,
        displayName: companyName,
        subtitle: author?.business_sector || "Entreprise & Organisation",
        photoUrl: author?.avatar_url || null,
        initials: initials || "AG",
        isVerified: author?.professional_status === "verified" || author?.verification_status === "verified",
        cleanContent,
      };
    }

    const fullName = author?.full_name || "Membre AfriGain";
    const initials = fullName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    return {
      isCompany: false,
      displayName: fullName,
      subtitle: author?.headline || (author?.role === "jeune" ? "Jeune / Indépendant" : "Professionnel AfriGain"),
      photoUrl: author?.avatar_url || null,
      initials: initials || "AF",
      isVerified: author?.identity_status === "verified" || author?.verification_status === "verified",
      cleanContent,
    };
  };

  // File upload handling for images/videos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith("video/");
    const localUrl = URL.createObjectURL(file);
    setMediaPreview({ url: localUrl, type: isVid ? "video" : "image" });
    setNewMediaUrl(localUrl);
    setShowMediaInput(false);
  };

  // Create Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (!newContent.trim() && !newMediaUrl.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    // Determine final content with company flag if applicable
    let finalContent = newContent.trim();
    if (publishAs === "company" && currentUserProfile?.company_name) {
      finalContent = `[as:company]\n${finalContent}`;
    }

    const mediaList = newMediaUrl.trim() ? [newMediaUrl.trim()] : [];

    const { data: insertedPost, error } = await supabase
      .from("posts")
      .insert({
        author_id: currentUser.id,
        content: finalContent,
        post_type: newPostType,
        media_urls: mediaList,
      })
      .select(`
        id, author_id, content, post_type, media_urls, likes_count, comments_count, shares_count, created_at,
        profiles:author_id (
          id, full_name, company_name, trade_name, headline, avatar_url, role, country, city, category, verification_status, identity_status, professional_status, business_sector, bio
        )
      `)
      .single();

    setIsSubmitting(false);

    if (!error && insertedPost) {
      setNewContent("");
      setNewMediaUrl("");
      setMediaPreview(null);
      setShowMediaInput(false);
      setPosts([insertedPost as any, ...posts]);
      showToast("Votre publication a été partagée sur le fil d'actualité !");
    } else if (error) {
      alert("Erreur lors de la publication : " + error.message);
    }
  };

  // Toggle Like (Real DB update)
  const handleToggleLike = async (post: Post) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    const supabase = createClient();
    const isLiked = !!userInteractions[post.id];

    // Optimistic UI Update
    setUserInteractions((prev) => ({ ...prev, [post.id]: !isLiked }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) + (isLiked ? -1 : 1)) }
          : p
      )
    );

    try {
      if (isLiked) {
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
      } else {
        await supabase.from("post_interactions").insert({
          post_id: post.id,
          user_id: currentUser.id,
          interaction_type: "like",
        });

        await supabase
          .from("posts")
          .update({ likes_count: (post.likes_count || 0) + 1 })
          .eq("id", post.id);
      }
    } catch (err) {
      console.warn("Erreur mise à jour like :", err);
    }
  };

  // Toggle Follow / Unfollow from feed
  const handleToggleFollow = async (authorId: string) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    if (authorId === currentUser.id) return;

    const supabase = createClient();
    const isCurrentlyFollowing = followingAuthorIds.has(authorId);

    // Optimistic
    setFollowingAuthorIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) next.delete(authorId);
      else next.add(authorId);
      return next;
    });

    try {
      if (isCurrentlyFollowing) {
        await supabase
          .from("user_followers")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", authorId);

        showToast("Vous ne suivez plus cet auteur.");
      } else {
        await supabase.from("user_followers").insert({
          follower_id: currentUser.id,
          following_id: authorId,
        });

        showToast("Vous êtes maintenant abonné à cet auteur !");
      }
    } catch (err) {
      console.error("Erreur follow :", err);
    }
  };

  // Comments Toggle & Fetch
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
        profiles:author_id (id, full_name, company_name, avatar_url, headline, role)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (data) {
      setPostComments((prev) => ({ ...prev, [postId]: data as any }));
    }
  };

  // Add Comment
  const handleAddComment = async (postId: string) => {
    if (!currentUser) {
      window.location.href = "/auth/login";
      return;
    }
    const text = (commentInput[postId] || "").trim();
    if (!text) return;

    const supabase = createClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: currentUser.id,
        content: text,
      })
      .select(`
        id, post_id, author_id, content, created_at,
        profiles:author_id (id, full_name, company_name, avatar_url, headline, role)
      `)
      .single();

    if (data) {
      setPostComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data as any],
      }));
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
        )
      );

      // Increment comments_count in DB
      try {
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await supabase
            .from("posts")
            .update({ comments_count: (post.comments_count || 0) + 1 })
            .eq("id", postId);
        }
      } catch (_) {}
    }
  };

  // Share action with native mobile support and clipboard fallback
  const handleShare = async (post: Post) => {
    const shareUrl = `${window.location.origin}/#post-${post.id}`;
    const authorInfo = getAuthorDisplayInfo(post);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Publication de ${authorInfo.displayName} sur AfriGain`,
          text: authorInfo.cleanContent.slice(0, 140),
          url: shareUrl,
        });
        showToast("Publication partagée avec succès !");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          navigator.clipboard.writeText(shareUrl);
          showToast("Lien de la publication copié dans le presse-papier !");
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("Lien de la publication copié dans le presse-papier !");
    }

    // Increment shares count
    try {
      const supabase = createClient();
      await supabase
        .from("posts")
        .update({ shares_count: (post.shares_count || 0) + 1 })
        .eq("id", post.id);

      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, shares_count: (p.shares_count || 0) + 1 } : p))
      );
    } catch (_) {}
  };

  // Delete post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette publication ?")) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (!error) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast("Publication supprimée avec succès.");
      } else {
        alert("Erreur lors de la suppression : " + error.message);
      }
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const FILTERS = [
    { id: "all", label: "Toutes les actualités", icon: Layers },
    { id: "business", label: "Entreprises & B2B", icon: Building2 },
    { id: "opportunity", label: "Opportunités & Emploi", icon: Briefcase },
    { id: "product", label: "Produits & Services", icon: Tag },
    { id: "advice", label: "Conseils & Savoir-faire", icon: Lightbulb },
  ];

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fadeIn border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Zone de publication moderne et fluide (Section 1 & 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-3.5">
        {/* Choix de l'identité de publication si l'auteur possède une entreprise */}
        {currentUserProfile?.company_name && (
          <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-[11px] text-slate-500 font-medium pl-1">Publier en tant que :</span>
            <button
              type="button"
              onClick={() => setPublishAs("individual")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                publishAs === "individual"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3 h-3 text-brand-600" />
              <span>{currentUserProfile.full_name} (Profil personnel)</span>
            </button>
            <button
              type="button"
              onClick={() => setPublishAs("company")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                publishAs === "company"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3 h-3 text-brand-600" />
              <span>{currentUserProfile.company_name} (Entreprise)</span>
            </button>
          </div>
        )}

        <form onSubmit={handleCreatePost} className="space-y-3">
          <div className="flex items-start gap-3">
            {/* Avatar / Logo dynamique de l'auteur publiant */}
            {publishAs === "company" && currentUserProfile?.company_name ? (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-brand-700 text-white font-black flex items-center justify-center shrink-0 shadow-xs border border-slate-700 text-xs">
                {currentUserProfile.avatar_url ? (
                  <img
                    src={currentUserProfile.avatar_url}
                    alt={currentUserProfile.company_name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-brand-300" />
                )}
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-black flex items-center justify-center shrink-0 shadow-xs text-xs">
                {currentUserProfile?.avatar_url ? (
                  <img
                    src={currentUserProfile.avatar_url}
                    alt={currentUserProfile.full_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  (currentUserProfile?.full_name || currentUser?.email || "U")[0].toUpperCase()
                )}
              </div>
            )}

            <div className="flex-1 space-y-2">
              <textarea
                rows={3}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={
                  publishAs === "company"
                    ? `Partagez une actualité, une offre ou un projet de ${currentUserProfile?.company_name}...`
                    : "Partagez votre expertise, une opportunité concrète ou votre actualité professionnelle..."
                }
                className="w-full text-xs sm:text-sm text-slate-900 placeholder-slate-400 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none leading-relaxed"
              />

              {/* Aperçu du média joint */}
              {mediaPreview && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 max-h-60 flex items-center justify-center group">
                  {mediaPreview.type === "video" ? (
                    <video src={mediaPreview.url} controls className="max-h-60 w-full object-contain" />
                  ) : (
                    <img src={mediaPreview.url} alt="Aperçu" className="max-h-60 w-full object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPreview(null);
                      setNewMediaUrl("");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors"
                    title="Supprimer le média"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input URL média alternatif */}
              {showMediaInput && (
                <div className="flex gap-2 animate-fadeIn">
                  <input
                    type="url"
                    placeholder="Collez le lien direct d'une image ou vidéo (https://...)"
                    value={newMediaUrl}
                    onChange={(e) => {
                      setNewMediaUrl(e.target.value);
                      if (e.target.value) {
                        setMediaPreview({
                          url: e.target.value,
                          type: isVideoUrl(e.target.value) ? "video" : "image",
                        });
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMediaInput(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Barre d'outils de publication */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <select
                value={newPostType}
                onChange={(e) => setNewPostType(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none"
              >
                <option value="general">Général</option>
                <option value="business">Entreprise & B2B</option>
                <option value="opportunity">Opportunité</option>
                <option value="product">Produit & Service</option>
                <option value="advice">Conseil professionnel</option>
              </select>

              {/* Input fichier caché pour photos/vidéos */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Joindre une photo ou une vidéo"
              >
                <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
                <span className="hidden sm:inline">Photo / Vidéo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMediaInput(!showMediaInput)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Ajouter un lien de média externe"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Lien web</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || (!newContent.trim() && !newMediaUrl.trim())}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? "Publication..." : "Publier"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Barre de filtres épurée */}
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
        <div className="py-16 text-center text-xs text-slate-400 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600" />
          <span>Chargement des publications récentes...</span>
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
        <div className="space-y-4">
          {posts.map((post) => {
            const isLiked = !!userInteractions[post.id];
            const author = post.profiles;
            const authorInfo = getAuthorDisplayInfo(post);
            const isFollowingAuthor = followingAuthorIds.has(post.author_id);
            const comments = postComments[post.id] || [];
            const isAuthorCurrent = currentUser?.id === post.author_id;

            return (
              <article
                key={post.id}
                id={`post-${post.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors"
              >
                {/* En-tête de la publication : Photo/Logo + Nom + Titre/Secteur + Menu (Section 2 & 3) */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Photo de profil ou Logo d'entreprise */}
                    <button
                      type="button"
                      onClick={() => author && setViewingProfile(author)}
                      className="shrink-0 transition-transform hover:scale-105 focus:outline-none"
                      title={authorInfo.isCompany ? "Voir la page de l'entreprise" : "Voir le profil de l'auteur"}
                    >
                      {authorInfo.isCompany ? (
                        authorInfo.photoUrl ? (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-white flex items-center justify-center">
                            <img
                              src={authorInfo.photoUrl}
                              alt={authorInfo.displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-slate-900 to-brand-700 text-white font-black flex items-center justify-center text-xs shadow-xs border border-slate-700">
                            <Building2 className="w-5 h-5 text-brand-300" />
                          </div>
                        )
                      ) : (
                        authorInfo.photoUrl ? (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex items-center justify-center">
                            <img
                              src={authorInfo.photoUrl}
                              alt={authorInfo.displayName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-black flex items-center justify-center text-xs shadow-xs">
                            {authorInfo.initials}
                          </div>
                        )
                      )}
                    </button>

                    {/* Nom, Titre & Horodatage */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => author && setViewingProfile(author)}
                          className="font-bold text-slate-900 hover:text-brand-600 text-xs sm:text-sm text-left truncate transition-colors flex items-center gap-1"
                        >
                          <span>{authorInfo.displayName}</span>
                        </button>

                        {/* Badge Entreprise / Certifié */}
                        {authorInfo.isCompany ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-50 text-brand-800 border border-brand-200">
                            <Building2 className="w-3 h-3 text-brand-600" />
                            Entreprise
                          </span>
                        ) : authorInfo.isVerified ? (
                          <span title="Identité Certifiée AfriGain">
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          </span>
                        ) : null}

                        {/* Bouton Suivre en 1 clic (si ce n'est pas soi-même) */}
                        {!isAuthorCurrent && currentUser && (
                          <button
                            type="button"
                            onClick={() => handleToggleFollow(post.author_id)}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-all ${
                              isFollowingAuthor
                                ? "text-slate-500 hover:text-slate-700 bg-slate-100"
                                : "text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100"
                            }`}
                          >
                            {isFollowingAuthor ? "Abonné" : "+ Suivre"}
                          </button>
                        )}
                      </div>

                      {/* Sous-titre professionnel / secteur d'activité */}
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {authorInfo.subtitle}
                        {author?.city && ` • ${author.city}`}
                      </div>

                      {/* Date et temps relatif */}
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatRelativeTime(post.created_at)}</span>
                        <span>•</span>
                        <span className="capitalize">{post.post_type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Options (3 points) */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenOptionsMenuId(openOptionsMenuId === post.id ? null : post.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {openOptionsMenuId === post.id && (
                      <div className="absolute right-0 top-8 z-30 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-1 text-xs space-y-0.5 animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            handleShare(post);
                            setOpenOptionsMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copier le lien</span>
                        </button>

                        {!isAuthorCurrent && currentUser && (
                          <button
                            type="button"
                            onClick={() => {
                              handleToggleFollow(post.author_id);
                              setOpenOptionsMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                          >
                            {isFollowingAuthor ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                <span>Se désabonner</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5 text-brand-600" />
                                <span>S&apos;abonner à l&apos;auteur</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            showToast("Signalement transmis à l'équipe de modération AfriGain.");
                            setOpenOptionsMenuId(null);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 text-amber-700 flex items-center gap-2"
                        >
                          <Flag className="w-3.5 h-3.5 text-amber-500" />
                          <span>Signaler la publication</span>
                        </button>

                        {isAuthorCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              handleDeletePost(post.id);
                              setOpenOptionsMenuId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-slate-100"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                            <span>Supprimer ma publication</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu textuel */}
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-normal">
                  {authorInfo.cleanContent}
                </p>

                {/* Médias joints (Images avec préservation des proportions & Vidéos jouables) */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 flex items-center justify-center">
                    {isVideoUrl(post.media_urls[0]) ? (
                      <video
                        src={post.media_urls[0]}
                        controls
                        playsInline
                        className="w-full max-h-[500px] object-contain rounded-2xl bg-black"
                      />
                    ) : (
                      <div
                        className="w-full relative group cursor-pointer"
                        onClick={() => setLightboxUrl(post.media_urls[0])}
                      >
                        <img
                          src={post.media_urls[0]}
                          alt="Illustration de publication"
                          className="w-full max-h-[520px] object-contain rounded-2xl transition-transform group-hover:scale-[1.005]"
                        />
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Barre d'interactions sociales (Section 4) */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post)}
                    className={`flex items-center gap-1.5 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 ${
                      isLiked ? "text-rose-600 font-bold" : "hover:text-slate-900"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>{post.likes_count || 0}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 font-semibold hover:text-slate-900 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-500" />
                    <span>{post.comments_count || comments.length || 0} commentaires</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 font-semibold hover:text-slate-900 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline">Partager</span>
                    {post.shares_count > 0 && <span className="text-[11px] font-bold">({post.shares_count})</span>}
                  </button>
                </div>

                {/* Tiroir des commentaires dynamiques */}
                {activeCommentsPostId === post.id && (
                  <div className="border-t border-slate-100 pt-3 space-y-3 animate-fadeIn">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2">
                        Soyez le premier à commenter cette publication.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {c.profiles?.avatar_url ? (
                                <img
                                  src={c.profiles.avatar_url}
                                  alt={c.profiles.full_name}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                (c.profiles?.full_name || "M")[0].toUpperCase()
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <strong className="font-bold text-slate-900 text-[11px] truncate">
                                  {c.profiles?.full_name || "Membre AfriGain"}
                                </strong>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {formatRelativeTime(c.created_at)}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed mt-0.5 whitespace-pre-wrap">{c.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Saisie nouveau commentaire */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {currentUser?.email ? currentUser.email[0].toUpperCase() : "U"}
                      </div>
                      <input
                        type="text"
                        placeholder="Rédigez un commentaire pertinent..."
                        value={commentInput[post.id] || ""}
                        onChange={(e) =>
                          setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-xs"
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

      {/* 4. MODALE CONSULTATION DU PROFIL PUBLIC / ENTREPRISE (Section 2 & 4) */}
      {viewingProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setViewingProfile(null)}
        >
          <div
            className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {viewingProfile.company_name ? (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-brand-700 text-white font-black flex items-center justify-center text-lg shadow-sm border border-slate-700">
                    {viewingProfile.avatar_url ? (
                      <img src={viewingProfile.avatar_url} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <Building2 className="w-7 h-7 text-brand-300" />
                    )}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-emerald-500 text-white font-black flex items-center justify-center text-lg shadow-sm">
                    {viewingProfile.avatar_url ? (
                      <img src={viewingProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      (viewingProfile.full_name || "M")[0].toUpperCase()
                    )}
                  </div>
                )}

                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    {viewingProfile.company_name || viewingProfile.full_name}
                    {viewingProfile.company_name && (
                      <span className="text-[10px] font-bold bg-brand-100 text-brand-800 px-1.5 py-0.5 rounded">Entreprise</span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewingProfile.business_sector || viewingProfile.headline || "Acteur économique certifié"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Localisation et détails */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              {(viewingProfile.city || viewingProfile.country) && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-brand-600" />
                  <span>{[viewingProfile.city, viewingProfile.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {viewingProfile.role && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-brand-600" />
                  <span className="capitalize">{viewingProfile.role}</span>
                </div>
              )}
            </div>

            {/* Bio / Description */}
            {viewingProfile.bio && (
              <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto">
                {viewingProfile.bio}
              </p>
            )}

            {/* Actions du profil */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {currentUser && viewingProfile.id !== currentUser.id && (
                <button
                  type="button"
                  onClick={() => handleToggleFollow(viewingProfile.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    followingAuthorIds.has(viewingProfile.id)
                      ? "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      : "bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                  }`}
                >
                  {followingAuthorIds.has(viewingProfile.id) ? "Abonné" : "+ Suivre"}
                </button>
              )}
              <Link
                href="/messages"
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Envoyer un message
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. LIGHTBOX PLEIN ÉCRAN POUR IMAGES (Section 3) */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute top-5 right-5 text-white hover:text-slate-300 p-2"
          >
            <X className="w-7 h-7" />
          </button>
          <img
            src={lightboxUrl}
            alt="Média grand format"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getBusinessCoachReply, ChatHistoryItem } from "@/lib/coach-ai/engine";

// Rate limiting simple en mémoire (IP-based)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxRequests = 30, windowMs = 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";

    // 1. Contrôle des abus (Rate limit : 30 requêtes / minute)
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        {
          error: "Trop de requêtes rapprochées. Veuillez patienter quelques instants avant de relancer le Coach.",
        },
        { status: 429 }
      );
    }

    // 2. Extraction et validation de la charge utile
    const body = await request.json().catch(() => null);
    if (!body || typeof body.message !== "string") {
      return NextResponse.json(
        { error: "Format de requête invalide : le champ 'message' est requis." },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    if (!message) {
      return NextResponse.json(
        { error: "Le message ne peut pas être vide." },
        { status: 400 }
      );
    }

    if (message.length > 3000) {
      return NextResponse.json(
        { error: "Le message est trop long (maximum 3 000 caractères)." },
        { status: 400 }
      );
    }

    // Validation et assainissement de l'historique
    let sanitizedHistory: ChatHistoryItem[] = [];
    if (Array.isArray(body.history)) {
      sanitizedHistory = body.history
        .filter((item: any) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
        .slice(-12)
        .map((item: any) => ({
          role: item.role as "user" | "assistant",
          content: String(item.content).slice(0, 2000),
        }));
    }

    // 3. Traitement intelligent par le Business Coach IA
    const replyResult = await getBusinessCoachReply(message, sanitizedHistory);

    // 4. Audit et suivi optionnels via Supabase si l'utilisateur est authentifié
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {},
          },
        }
      );

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.id) {
        // Enregistrer l'utilisation dans ai_usage
        const promptTokens = Math.ceil((message.length + sanitizedHistory.map(h => h.content).join("").length) / 4);
        const completionTokens = Math.ceil(replyResult.text.length / 4);

        await supabase.from("ai_usage").insert({
          user_id: authData.user.id,
          feature: "coach_chat",
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
        });
      }
    } catch (dbErr) {
      // Le suivi ne bloque pas la réponse utilisateur en cas d'indisponibilité de la table
      console.warn("Info suivi ai_usage Supabase:", dbErr);
    }

    // 5. Réponse sécurisée au client
    return NextResponse.json({
      success: true,
      text: replyResult.text,
      source: replyResult.source,
      model: replyResult.model,
      timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    });
  } catch (err: any) {
    console.error("Erreur serveur API Coach IA:", err);
    return NextResponse.json(
      {
        error: "Une erreur technique temporaire est survenue lors du traitement de votre message. Veuillez réessayer.",
      },
      { status: 500 }
    );
  }
}

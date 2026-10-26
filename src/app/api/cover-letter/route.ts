import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateCoverLetterAI, CandidateProfile, JobTargetInfo } from "@/lib/coach-ai/cover-letter-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || !body.candidate || !body.job) {
      return NextResponse.json(
        { error: "Données incomplètes : les objets 'candidate' et 'job' sont requis." },
        { status: 400 }
      );
    }

    const { candidate, job } = body as { candidate: CandidateProfile; job: JobTargetInfo };

    if (!job.targetJobTitle?.trim()) {
      return NextResponse.json(
        { error: "Veuillez renseigner l'intitulé du poste ciblé." },
        { status: 400 }
      );
    }

    if (!job.targetCompany?.trim()) {
      return NextResponse.json(
        { error: "Veuillez renseigner le nom de l'entreprise ciblée." },
        { status: 400 }
      );
    }

    if (!job.jobMissions?.trim()) {
      return NextResponse.json(
        { error: "La description des missions et responsabilités du poste est obligatoire pour permettre à l'IA d'adapter la lettre." },
        { status: 400 }
      );
    }

    // Génération intelligente de la lettre
    const result = await generateCoverLetterAI(candidate, job);

    // Audit optionnel via Supabase si connecté
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
        await supabase.from("ai_usage").insert({
          user_id: authData.user.id,
          feature: "cover_letter",
          prompt_tokens: 300,
          completion_tokens: Math.ceil(result.letter.length / 4),
        });
      }
    } catch (auditErr) {
      console.warn("Info suivi ai_usage lettre:", auditErr);
    }

    return NextResponse.json({
      success: true,
      letter: result.letter,
      source: result.source,
      model: result.model,
    });
  } catch (err: any) {
    console.error("Erreur API génération lettre de motivation:", err);
    return NextResponse.json(
      { error: err?.message || "Une erreur est survenue lors de la rédaction de la lettre." },
      { status: 500 }
    );
  }
}

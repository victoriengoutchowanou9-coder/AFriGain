import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Identifiant utilisateur manquant." }, { status: 400 });
    }

    // 1. Vérification de la session du demandeur
    const supabaseUser = createServerClient(
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

    const { data: authData, error: authErr } = await supabaseUser.auth.getUser();
    if (authErr || !authData?.user) {
      return NextResponse.json({ error: "Session non autorisée. Veuillez vous connecter." }, { status: 401 });
    }

    // 2. Client administrateur avec Service Role Key sécurisé côté serveur
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Vérifier que l'appelant est bien Super Admin dans profiles
    const { data: callerProfile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    if (profileErr || callerProfile?.role !== "admin") {
      return NextResponse.json({ error: "Action interdite. Seul le Super Admin peut supprimer un compte." }, { status: 403 });
    }

    // 4. Empêcher l'administrateur de supprimer son propre compte
    if (authData.user.id === userId) {
      return NextResponse.json({ error: "Impossible de supprimer votre propre compte Super Admin actif." }, { status: 400 });
    }

    // 5. Vérifier que l'utilisateur cible n'est pas un autre admin protégé
    const { data: targetProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, email, full_name")
      .eq("id", userId)
      .single();

    if (targetProfile?.role === "admin") {
      return NextResponse.json({ error: "La suppression d'un compte Administrateur est protégée." }, { status: 403 });
    }

    // 6. Nettoyer les enregistrements associés de l'utilisateur
    try {
      await supabaseAdmin.from("job_applications").delete().eq("applicant_id", userId);
      await supabaseAdmin.from("job_posts").delete().eq("author_id", userId);
      await supabaseAdmin.from("comments").delete().eq("author_id", userId);
      await supabaseAdmin.from("likes").delete().eq("user_id", userId);
      await supabaseAdmin.from("posts").delete().eq("author_id", userId);
      await supabaseAdmin.from("stories").delete().eq("author_id", userId);
      await supabaseAdmin.from("search_requests").delete().eq("author_id", userId);
      await supabaseAdmin.from("pricing_requests").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_subscriptions").delete().eq("user_id", userId);
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
    } catch (cleanupErr) {
      console.warn("Avertissement nettoyage tables:", cleanupErr);
    }

    // 7. Suppression définitive du compte dans auth.users
    const { error: deleteAuthErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteAuthErr) {
      return NextResponse.json({ error: `Erreur lors de la suppression auth: ${deleteAuthErr.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Le compte utilisateur ${targetProfile?.full_name || userId} a été supprimé avec succès.`,
    });
  } catch (err: any) {
    console.error("Erreur API suppression utilisateur:", err);
    return NextResponse.json({ error: err?.message || "Une erreur inattendue est survenue." }, { status: 500 });
  }
}

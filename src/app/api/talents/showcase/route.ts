import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const supabaseUserClient = createClient();
    const { data: { user }, error: authErr } = await supabaseUserClient.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour publier votre vitrine de talent." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      fullName,
      metier,
      headline,
      bio,
      city,
      country,
      skills,
      priceAmount,
      priceCurrency = "XOF",
      pricingUnit = "Par prestation",
      phone,
      realisationTitle,
      realisationDesc,
    } = body;

    if (!headline || !bio) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre titre d'accroche et une description de vos services." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Update Profile
    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    const { error: profileErr } = await admin
      .from("profiles")
      .update({
        full_name: fullName || undefined,
        category: metier || undefined,
        headline: headline.trim(),
        bio: bio.trim(),
        city: city || undefined,
        country: country || undefined,
        phone: phone || undefined,
        currency: priceCurrency,
        skills: skillsArray,
        role: "entrepreneur",
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileErr) {
      console.error("Profile update error:", profileErr);
    }

    // 2. Insert or update service listing
    const deliverables = [
      `Unité: ${pricingUnit}`,
      ...(realisationTitle ? [`Réalisation: ${realisationTitle} - ${realisationDesc || ""}`] : []),
    ];

    const { data: listing, error: listingErr } = await admin
      .from("service_listings")
      .insert({
        user_id: user.id,
        title: headline.trim(),
        description: bio.trim(),
        deliverables: deliverables,
        delivery_days: 3,
        price_amount: Number(priceAmount) || 0,
        price_currency: priceCurrency || "XOF",
        is_published: true,
      })
      .select()
      .single();

    if (listingErr) {
      console.error("Service listing error:", listingErr);
      return NextResponse.json(
        { error: "Erreur lors de la publication de la vitrine." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      listingId: listing?.id,
    });
  } catch (error: any) {
    console.error("Showcase creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Une erreur est survenue." },
      { status: 500 }
    );
  }
}

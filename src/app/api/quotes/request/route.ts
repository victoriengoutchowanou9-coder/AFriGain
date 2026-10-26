import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      talentId,
      talentName,
      clientName,
      clientEmail,
      clientPhone,
      needDescription,
      budget,
      currency = "XOF",
      deadline,
    } = body;

    if (!talentId || !clientName || !clientPhone || !needDescription) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom, votre contact et la description de votre besoin." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Generate unique quote reference
    const timestamp = Date.now().toString().slice(-6);
    const quoteNumber = `DEV-${new Date().getFullYear()}-${timestamp}`;
    const budgetNum = Number(budget) || 0;

    // 2. Insert into public.quotes
    const issueDate = new Date().toISOString().split("T")[0];
    const validUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const notes = [
      `Demande de devis direct envoyée via la vitrine AfriGain.`,
      `Client: ${clientName.trim()}`,
      `Contact: ${clientPhone.trim()}${clientEmail ? ` / ${clientEmail.trim()}` : ""}`,
      `Délai souhaité: ${deadline?.trim() || "À convenir"}`,
      `Description du besoin:`,
      needDescription.trim(),
    ].join("\n");

    const { data: insertedQuote, error: quoteErr } = await supabase
      .from("quotes")
      .insert({
        entrepreneur_id: talentId,
        client_name: clientName.trim(),
        client_email: clientEmail ? clientEmail.trim() : null,
        client_phone: clientPhone.trim(),
        quote_number: quoteNumber,
        issue_date: issueDate,
        valid_until: validUntilDate,
        total_ht: budgetNum,
        tax_rate: 0,
        total_ttc: budgetNum,
        currency: currency || "XOF",
        status: "sent",
        notes: notes,
      })
      .select("id, quote_number")
      .single();

    if (quoteErr) {
      console.error("Error inserting quote request:", quoteErr);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement de la demande de devis." },
        { status: 500 }
      );
    }

    // 3. Insert line item in quote_lines
    if (insertedQuote?.id) {
      await supabase.from("quote_lines").insert({
        quote_id: insertedQuote.id,
        description: needDescription.trim().slice(0, 250),
        quantity: 1,
        unit_price: budgetNum,
        total_amount: budgetNum,
      });

      // 4. Send notification to the talent
      await supabase.from("notifications").insert({
        user_id: talentId,
        type: "quote_request",
        title: `Nouvelle demande de devis reçue de ${clientName.trim()}`,
        message: `Besoin: ${needDescription.trim().slice(0, 120)}... Téléphone: ${clientPhone.trim()}`,
        data: {
          quote_id: insertedQuote.id,
          quote_number: quoteNumber,
          client_name: clientName.trim(),
          client_phone: clientPhone.trim(),
          client_email: clientEmail?.trim() || null,
        },
        is_read: false,
      });
    }

    return NextResponse.json({
      success: true,
      quoteId: insertedQuote?.id,
      quoteNumber: quoteNumber,
    });
  } catch (error: any) {
    console.error("Quote request error:", error);
    return NextResponse.json(
      { error: error?.message || "Une erreur est survenue." },
      { status: 500 }
    );
  }
}

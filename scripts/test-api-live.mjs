// Test de l'endpoint HTTP réel /api/coach-ia
const BASE_URL = "http://localhost:3005/api/coach-ia";

async function sendRequest(message, history = []) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history })
  });
  const data = await res.json();
  return { status: res.status, ok: res.ok, data };
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log("   VÉRIFICATION TECHNIQUE COMPLÈTE EN DIRECT DU COACH IA       ");
  console.log("===============================================================\n");

  const results = [];

  // Test A — Salutation simple
  console.log("▶ TEST A : Salutation simple ('Bonjour')");
  {
    const { status, ok, data } = await sendRequest("Bonjour");
    const reply = data?.text || "";
    const isBadCannedReply = reply.includes("Pour mener à bien cette action, décomposez votre démarche");
    const isNaturalGreeting = (reply.toLowerCase().includes("bonjour") || reply.toLowerCase().includes("bienvenue")) && !isBadCannedReply;

    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Réponse : ${reply}`);
    console.log(`  Mauvaise réponse prédéfinie détectée ? : ${isBadCannedReply ? "OUI (ERREUR)" : "NON (CORRIGÉ)"}`);
    console.log(`  Salutation naturelle validée ? : ${isNaturalGreeting ? "OUI" : "NON"}`);

    results.push({ name: "Test A - Salutation", success: ok && isNaturalGreeting && !isBadCannedReply });
  }

  // Test B — Remerciement
  console.log("\n▶ TEST B : Remerciement ('Merci beaucoup')");
  {
    const { status, ok, data } = await sendRequest("Merci beaucoup", [
      { role: "user", content: "Bonjour" },
      { role: "assistant", content: "Bonjour ! Comment puis-je vous aider ?" }
    ]);
    const reply = data?.text || "";
    const success = ok && (reply.toLowerCase().includes("plaisir") || reply.toLowerCase().includes("disposition")) && !reply.includes("décomposez votre démarche");
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Réponse : ${reply}`);
    results.push({ name: "Test B - Remerciement", success });
  }

  // Test C — Recherche de revenus étudiant Bénin sans capital
  console.log("\n▶ TEST C : Recherche de revenus étudiant Bénin sans capital");
  {
    const msg = "Je suis étudiant au Bénin. Je veux gagner 5 000 FCFA par jour, mais je n'ai pas de capital.";
    const { status, ok, data } = await sendRequest(msg);
    const reply = data?.text || "";
    const success = ok &&
      (reply.includes("5 000") || reply.includes("5000")) &&
      (reply.toLowerCase().includes("bénin") || reply.toLowerCase().includes("cotonou")) &&
      (reply.toLowerCase().includes("services") || reply.toLowerCase().includes("whatsapp") || reply.toLowerCase().includes("clients"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test C - Recherche revenus", success });
  }

  // Test D — Création d'entreprise vente vêtements Cotonou budget 20 000 FCFA
  console.log("\n▶ TEST D : Vente vêtements Cotonou budget 20 000 FCFA");
  {
    const msg = "Je veux lancer une activité de vente de vêtements à Cotonou avec un budget de 20 000 FCFA.";
    const { status, ok, data } = await sendRequest(msg);
    const reply = data?.text || "";
    const success = ok &&
      (reply.includes("20 000") || reply.includes("20000")) &&
      reply.toLowerCase().includes("cotonou") &&
      (reply.toLowerCase().includes("whatsapp") || reply.toLowerCase().includes("stock") || reply.toLowerCase().includes("demande"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test D - Vente vêtements 20 000 FCFA", success });
  }

  // Test E — Question générale CA vs Bénéfice
  console.log("\n▶ TEST E : Question générale CA vs Bénéfice");
  {
    const msg = "Quelle est la différence entre le chiffre d'affaires et le bénéfice ?";
    const { status, ok, data } = await sendRequest(msg);
    const reply = data?.text || "";
    const success = ok &&
      (reply.toLowerCase().includes("chiffre d'affaires") || reply.toLowerCase().includes("ca")) &&
      (reply.toLowerCase().includes("bénéfice") || reply.toLowerCase().includes("benefice")) &&
      (reply.toLowerCase().includes("dépenses") || reply.toLowerCase().includes("coût") || reply.toLowerCase().includes("exemple"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test E - CA vs Bénéfice", success });
  }

  // Test F — Continuité du contexte (Chaussures -> 20 000 FCFA)
  console.log("\n▶ TEST F : Continuité du contexte (Chaussures puis budget 20 000 FCFA)");
  {
    const history = [
      { role: "user", content: "Je veux vendre des chaussures." },
      { role: "assistant", content: "Superbe idée ! Quel est votre budget initial pour débuter ?" }
    ];
    const { status, ok, data } = await sendRequest("Je dispose de 20 000 FCFA.", history);
    const reply = data?.text || "";
    const success = ok &&
      (reply.toLowerCase().includes("chaussure") || reply.toLowerCase().includes("paire")) &&
      (reply.includes("20 000") || reply.includes("20000"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test F - Continuité contexte", success });
  }

  // Test G — Changement de sujet : CV professionnel
  console.log("\n▶ TEST G : Changement de sujet (CV professionnel)");
  {
    const history = [
      { role: "user", content: "Je veux vendre des chaussures." },
      { role: "assistant", content: "Voici les conseils pour vos chaussures." }
    ];
    const { status, ok, data } = await sendRequest("Aide-moi à rédiger un CV professionnel.", history);
    const reply = data?.text || "";
    const success = ok &&
      (reply.toLowerCase().includes("cv") || reply.toLowerCase().includes("curriculum")) &&
      (reply.toLowerCase().includes("compétence") || reply.toLowerCase().includes("générateur"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test G - Changement sujet CV", success });
  }

  // Test H — Message incomplet
  console.log("\n▶ TEST H : Message incomplet ('Je veux créer une entreprise, mais…')");
  {
    const { status, ok, data } = await sendRequest("Je veux créer une entreprise, mais…");
    const reply = data?.text || "";
    const success = ok &&
      (reply.toLowerCase().includes("freine") || reply.toLowerCase().includes("bloqu") || reply.toLowerCase().includes("capital") || reply.toLowerCase().includes("précis"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test H - Message incomplet", success });
  }

  // Test I — Langue anglaise
  console.log("\n▶ TEST I : International English Query");
  {
    const { status, ok, data } = await sendRequest("Hello, how can I find clients for my services in Africa?");
    const reply = data?.text || "";
    const success = ok &&
      (reply.toLowerCase().includes("client") || reply.toLowerCase().includes("service") || reply.toLowerCase().includes("business"));
    console.log(`  Statut HTTP : ${status}`);
    console.log(`  Extrait réponse : ${reply.slice(0, 250)}...`);
    results.push({ name: "Test I - English Query", success });
  }

  // Test J — Validation entrées vides
  console.log("\n▶ TEST J : Sécurité et validation entrées vides");
  {
    const { status, ok, data } = await sendRequest("   ");
    const success = status === 400 && data?.error;
    console.log(`  Statut HTTP : ${status} (attendu: 400)`);
    console.log(`  Message d'erreur : ${data?.error}`);
    results.push({ name: "Test J - Validation vide", success });
  }

  console.log("\n===============================================================");
  console.log("   RÉCAPITULATIF DES TESTS                                     ");
  console.log("===============================================================");
  let allOk = true;
  for (const r of results) {
    console.log(`- ${r.name.padEnd(35)} : ${r.success ? "✓ REUSSI" : "✗ ECHEC"}`);
    if (!r.success) allOk = false;
  }

  if (allOk) {
    console.log("\n🎉 TOUS LES TESTS SONT VALIDÉS AVEC SUCCÈS À 100% !");
    process.exit(0);
  } else {
    console.error("\n❌ CERTAINS TESTS ONT ÉCHOUÉ !");
    process.exit(1);
  }
}

runTestSuite();

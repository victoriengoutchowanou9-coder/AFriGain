const BASE_URL = "http://localhost:3006";

async function runAllTests() {
  console.log("======================================================================");
  console.log("    TESTS TECHNIQUES OBLIGATOIRES — CV & LETTRE DE MOTIVATION AFRIGAIN");
  console.log("======================================================================\n");

  const results = [];

  // 1 & 14 : Étudiant sans expérience (valorisation formation & projets, sans invention)
  console.log("▶ TEST 1 & 14 : Profil étudiant / débutant sans expérience formelle");
  {
    const studentCandidate = {
      fullName: "Amina Diallo",
      title: "Étudiante en Marketing Digital",
      email: "amina.diallo@email.com",
      phone: "+229 96 11 22 33",
      cityCountry: "Cotonou, Bénin",
      summary: "Étudiante rigoureuse et passionnée par la création de contenu et la gestion de réseaux sociaux.",
      experiences: [], // Zéro expérience
      educations: [
        { degree: "Licence 2 en Communication & Multimédia", institution: "Université de Parakou", endYear: "En cours" }
      ],
      skills: ["Canva", "Gestion réseaux sociaux", "Rédaction web"],
      tools: [{ name: "Canva", level: "Avancé" }, { name: "CapCut", level: "Intermédiaire" }],
      languages: [{ name: "Français", level: "Courant" }, { name: "Bariba", level: "Langue maternelle" }],
      projects: [
        { title: "Animation page Facebook d'une coopérative agricole", description: "Création de 12 affiches produits et gestion des messages.", results: "Hausse de 40% des contacts." }
      ]
    };

    const job = {
      targetJobTitle: "Chargée de Communication Junior",
      targetCompany: "AfriAgro Tech",
      targetLocation: "Cotonou",
      jobMissions: "Créer les visuels pour nos campagnes digitales hebdomadaires et animer nos comptes LinkedIn et WhatsApp.",
      candidateMotivation: "Particulièrement motivée par le secteur agroalimentaire local."
    };

    const res = await fetch(`${BASE_URL}/api/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate: studentCandidate, job })
    });
    const data = await res.json();
    const letter = data?.letter || "";

    const hasNoFakeExp = !letter.includes("Directrice") && !letter.includes("5 ans d'expérience");
    const hasProjectValued = letter.includes("Animation page Facebook") || letter.includes("Licence 2") || letter.includes("visuels");
    const success = res.ok && hasNoFakeExp && hasProjectValued;

    console.log(`  Statut HTTP : ${res.status}`);
    console.log(`  Projet concret valorisé ? : ${hasProjectValued ? "OUI" : "NON"}`);
    console.log(`  Aucune fausse expérience inventée ? : ${hasNoFakeExp ? "OUI" : "NON"}`);
    results.push({ id: 1, name: "Étudiant sans expérience (valorisation projets)", success });
  }

  // 2, 11, 12, 13 : Professionnel avec plusieurs expériences + missions de l'offre
  console.log("\n▶ TEST 2, 11, 12, 13 : Professionnel expérimenté & adéquation réelle aux missions");
  {
    const proCandidate = {
      fullName: "Jean-Baptiste Dossou",
      title: "Comptable & Gestionnaire de Stock",
      email: "jb.dossou@email.com",
      phone: "+229 95 44 55 66",
      cityCountry: "Cotonou, Bénin",
      summary: "Comptable expérimenté, spécialiste du contrôle de gestion et du suivi rigoureux des stocks en zone UEMOA.",
      experiences: [
        {
          jobTitle: "Comptable Fournisseurs",
          company: "Bénin Distribution SARL",
          startDate: "2021",
          endDate: "2024",
          missions: "Enregistrement comptable SYSCOHADA, rapprochements bancaires mensuels et gestion des règlements fournisseurs.",
          achievements: "Zéro pénalité fiscale en 3 exercices consécutifs."
        },
        {
          jobTitle: "Gestionnaire de Stocks",
          company: "Quincaillerie Moderne",
          startDate: "2019",
          endDate: "2021",
          missions: "Inventaires tournants et tenue des fiches de stock sur Excel."
        }
      ],
      educations: [
        { degree: "Master en Comptabilité & Audit", institution: "FASPEG - UAC", endYear: "2019" }
      ],
      skills: ["SYSCOHADA révisé", "Rapprochements bancaires", "Gestion des inventaires", "Fiscalité d'entreprise"],
      tools: [{ name: "Excel", level: "Expert" }, { name: "Sage 100", level: "Avancé" }],
      languages: [{ name: "Français", level: "Courant" }, { name: "Anglais", level: "Professionnel" }]
    };

    const accountingJob = {
      targetJobTitle: "Chef Comptable Adjoint",
      targetCompany: "Grandes Brasseries de l'Atlantique",
      targetLocation: "Cotonou",
      recipientName: "Madame la Directrice Administrative et Financière",
      jobReference: "GBA-FIN-2024",
      jobMissions: `1. Superviser la saisie et le classement des pièces comptables selon les normes SYSCOHADA.
2. Établir les états de rapprochement bancaire de 5 comptes distincts.
3. Participer aux inventaires physiques semestriels et valider les écarts de stock.`,
      jobRequirements: "Minimum 3 ans d'expérience. Maîtrise de Sage et d'Excel avancé.",
      candidateMotivation: "Désireux de rejoindre une industrie agroalimentaire de référence à Cotonou."
    };

    const res = await fetch(`${BASE_URL}/api/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidate: proCandidate, job: accountingJob })
    });
    const data = await res.json();
    const letter = data?.letter || "";

    const matchesMissions = letter.includes("SYSCOHADA") || letter.includes("rapprochement") || letter.includes("stock") || letter.includes("pièces comptables");
    const usesRealCandidateInfo = letter.includes("Jean-Baptiste Dossou") && (letter.includes("Bénin Distribution") || letter.includes("Quincaillerie"));
    const success = res.ok && matchesMissions && usesRealCandidateInfo;

    console.log(`  Statut HTTP : ${res.status}`);
    console.log(`  Adéquation directe aux missions de l'offre ? : ${matchesMissions ? "OUI" : "NON"}`);
    console.log(`  Utilisation stricte du parcours réel du candidat ? : ${usesRealCandidateInfo ? "OUI" : "NON"}`);
    results.push({ id: 2, name: "Professionnel expérimenté (adéquation missions)", success });
  }

  // 11 : Rejet si missions obligatoires manquantes
  console.log("\n▶ TEST 11 : Validation de l'obligation des missions du poste");
  {
    const res = await fetch(`${BASE_URL}/api/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate: { fullName: "Test", email: "test@test.com" },
        job: { targetJobTitle: "Vendeur", targetCompany: "Boutique", jobMissions: "   " }
      })
    });
    const data = await res.json();
    const success = res.status === 400 && data?.error?.includes("missions");
    console.log(`  Statut HTTP : ${res.status} (attendu: 400)`);
    console.log(`  Message de rejet : ${data?.error}`);
    results.push({ id: 11, name: "Rejet si missions non renseignées", success });
  }

  // 17 : Vérification du bon fonctionnement du module Coach IA (/api/coach-ia)
  console.log("\n▶ TEST 17 : Préservation du module Coach IA conversationnel");
  {
    const res = await fetch(`${BASE_URL}/api/coach-ia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Bonjour, comment fixer mes prix en freelance ?" })
    });
    const data = await res.json();
    const success = res.ok && data?.text && !data.text.includes("Pour mener à bien cette action, décomposez votre démarche : 1° Clarifiez le besoin spécifique du client ; 2° Proposez un devis avec acompte de 30 %");
    console.log(`  Statut HTTP Coach IA : ${res.status}`);
    console.log(`  Réponse reçue (extrait) : ${data?.text?.slice(0, 100)}...`);
    results.push({ id: 17, name: "Préservation du Coach IA", success });
  }

  console.log("\n======================================================================");
  console.log("    RÉSUMÉ DES TESTS EFFECTUÉS                                       ");
  console.log("======================================================================");
  let allOk = true;
  for (const r of results) {
    console.log(`- [Test ${r.id}] ${r.name.padEnd(50)} : ${r.success ? "✓ REUSSI" : "✗ ECHEC"}`);
    if (!r.success) allOk = false;
  }

  if (allOk) {
    console.log("\n🎉 TOUS LES TESTS TECHNIQUES SONT VALIDÉS AVEC SUCCÈS À 100% !");
    process.exit(0);
  } else {
    console.error("\n❌ CERTAINS TESTS ONT ÉCHOUÉ !");
    process.exit(1);
  }
}

runAllTests();

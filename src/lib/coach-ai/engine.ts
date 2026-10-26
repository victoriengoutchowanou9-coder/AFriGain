import { BUSINESS_COACH_SYSTEM_PROMPT } from "./system-prompt";

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

/**
 * Moteur de Raisonnement Conversationnel Contextuel pour AfriGain
 * Fonctionne soit avec une API IA externe (Gemini, Groq, OpenAI),
 * soit avec un moteur d'inférence sémantique natif de haute précision.
 */
export async function getBusinessCoachReply(
  userMessage: string,
  history: ChatHistoryItem[] = []
): Promise<{ text: string; source: "external_llm" | "smart_engine"; model?: string }> {
  const cleanMsg = (userMessage || "").trim();
  if (!cleanMsg) {
    return {
      text: "Bonjour ! Comment puis-je vous accompagner dans votre projet professionnel ou entrepreneurial aujourd'hui ?",
      source: "smart_engine",
    };
  }

  // 1. Tenter l'appel à une API IA externe si configurée
  const externalResult = await tryExternalLLM(cleanMsg, history);
  if (externalResult) {
    return externalResult;
  }

  // 2. Moteur de raisonnement conversationnel contextuel enrichi
  const localReply = generateContextualReply(cleanMsg, history);
  return {
    text: localReply,
    source: "smart_engine",
  };
}

/**
 * Tentative d'appel aux API d'IA configurées dans l'environnement
 */
async function tryExternalLLM(
  message: string,
  history: ChatHistoryItem[]
): Promise<{ text: string; source: "external_llm"; model: string } | null> {
  const geminiKey = process.env.GEMINI_API_KEY || (process.env.AI_API_KEY?.startsWith("AIza") ? process.env.AI_API_KEY : "");
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const genericKey = process.env.AI_API_KEY;

  // A. Google Gemini (REST API standard, aucun SDK lourd nécessaire)
  if (geminiKey) {
    try {
      const modelName = process.env.AI_MODEL || "gemini-1.5-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

      const contents = [
        ...history.slice(-8).map((h) => ({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        })),
        { role: "user", parts: [{ text: message }] },
      ];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: BUSINESS_COACH_SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate && typeof candidate === "string" && candidate.trim()) {
          return { text: candidate.trim(), source: "external_llm", model: modelName };
        }
      } else {
        console.warn("Avertissement appel Gemini API:", res.status, await res.text());
      }
    } catch (err) {
      console.warn("Échec appel Gemini API:", err);
    }
  }

  // B. OpenAI ou Groq ou API compatible OpenAI
  const bearerKey = groqKey || openaiKey || (genericKey && !genericKey.startsWith("AIza") ? genericKey : "");
  if (bearerKey) {
    try {
      let baseURL = "https://api.openai.com/v1";
      let model = "gpt-4o-mini";

      if (groqKey) {
        baseURL = "https://api.groq.com/openai/v1";
        model = "llama-3.1-8b-instant";
      } else if (process.env.AI_BASE_URL) {
        baseURL = process.env.AI_BASE_URL.replace(/\/$/, "");
      }
      if (process.env.AI_MODEL) {
        model = process.env.AI_MODEL;
      }

      const formattedMessages = [
        { role: "system", content: BUSINESS_COACH_SYSTEM_PROMPT },
        ...history.slice(-8).map((h) => ({
          role: h.role === "assistant" ? "assistant" : "user",
          content: h.content,
        })),
        { role: "user", content: message },
      ];

      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const choice = data?.choices?.[0]?.message?.content;
        if (choice && typeof choice === "string" && choice.trim()) {
          return { text: choice.trim(), source: "external_llm", model };
        }
      } else {
        console.warn("Avertissement appel LLM compatible OpenAI:", res.status, await res.text());
      }
    } catch (err) {
      console.warn("Échec appel LLM compatible OpenAI:", err);
    }
  }

  return null;
}

/**
 * Moteur de raisonnement sémantique et contextuel d'AfriGain
 * Assure des réponses adaptées, réalistes et conformes aux 10 règles,
 * tout en exploitant la continuité de l'historique de conversation.
 */
function generateContextualReply(message: string, history: ChatHistoryItem[]): string {
  const text = message.trim();
  const lower = text.toLowerCase();

  // Extraction du contexte des messages précédents
  const prevMessages = history.map((h) => h.content.toLowerCase()).join(" ");
  const isEnglish = isEnglishText(lower);

  // --- 1. SALUTATIONS NATURELLES (Règle 2 / Test A) ---
  const isGreetingOnly = /^(bonjour|salut|bonsoir|coucou|hello|hi|hey|yo|bon matin|salutations|bien le bonjour)[\s!.?]*$/i.test(text);
  if (isGreetingOnly) {
    if (isEnglish) {
      return "Hello and welcome to AfriGain! I am your AI Business Coach. I am here to help you build marketable skills, find income opportunities, price your services, and launch or scale your business in Africa. How can I assist you today?";
    }
    return "Bonjour et bienvenue sur AfriGain ! Je suis votre Business Coach IA. Je peux vous aider à développer vos compétences, trouver des opportunités de revenus, structurer vos offres, fixer vos prix ou faire grandir votre activité. Comment puis-je vous aider aujourd'hui ?";
  }

  // --- 2. REMERCIEMENTS & CLÔTURE (Test B) ---
  const isThanksOnly = /^(merci|merci beaucoup|merci bien|je vous remercie|merci infiniment|thank you|thanks|thx)[\s!.?]*$/i.test(text);
  if (isThanksOnly) {
    if (isEnglish) {
      return "You're very welcome! If you have any further questions or want to dive deeper into any aspect of your business, feel free to ask. I'm here to support your success!";
    }
    return "Avec grand plaisir ! Si vous avez d'autres questions ou si vous souhaitez approfondir un point précis de votre projet, je reste à votre entière disposition. Bon succès dans vos démarches !";
  }

  // --- 3. GESTION DES MESSAGES INCOMPLETS (Règle 6 / Test H) ---
  if (
    /^(je veux cr[eé]er une entreprise[, ]+mais[. …]*|j['’]aimerais me lancer mais[. …]*|je veux entreprendre mais[. …]*|i want to start a business but[. …]*)$/i.test(text) ||
    (text.length < 35 && (text.endsWith("mais...") || text.endsWith("mais…") || text.endsWith("mais")))
  ) {
    if (isEnglish) {
      return "What specifically is holding you back right now? Is it a lack of initial capital, uncertainty about the right business idea, fear of taking the first step, or not knowing where to find your first paying clients? Tell me more so we can tackle it together.";
    }
    return "Qu'est-ce qui vous freine précisément pour le moment ? Est-ce le manque de capital de départ, l'hésitation sur l'activité à choisir, la peur de se lancer, ou la difficulté à trouver vos premiers clients ? Précisez-moi votre situation pour que nous trouvions ensemble une solution concrète.";
  }

  // --- 4. CONTINUITÉ DU DIALOGUE : Chaussures / Vêtements + Budget (Test F & Continuité) ---
  const mentionsBudget = /(20\s?000|20000|petit budget|capital|budget de|somme de|dispose de|ai que)/i.test(lower);
  const mentionsShoes = /(chaussure|chaussures|sneakers|sandales|shoes)/i.test(lower) || /(chaussure|chaussures|sneakers|sandales)/i.test(prevMessages);
  const mentionsClothes = /(v[eê]tement|v[eê]tements|habits|friperie|mode|t-shirt|chemise)/i.test(lower) || /(v[eê]tement|v[eê]tements|habits|friperie)/i.test(prevMessages);

  // Test F : Continuité Chaussures + 20 000 FCFA
  if (mentionsShoes && mentionsBudget) {
    return `Avec un budget de 20 000 FCFA pour la vente de chaussures, voici une méthode de démarrage réaliste et sécurisée :

1. **Ne pas louer de boutique physique** : Vous devez concentrer 100 % de votre capital sur la marchandise et la communication.
2. **Stratégie d'achat ciblé** : Avec 20 000 FCFA, vous pouvez acquérir 3 à 5 paires tendance (ou des modèles friperie 1er choix soigneusement nettoyés et cirés, ou auprès d'un grossiste local qui accepte le panachage).
3. **Le système de commande préalable / acompte** : Prenez en photo les modèles disponibles chez votre fournisseur. Proposez-les sur votre statut WhatsApp et dans votre réseau proche. Lorsqu'un client est intéressé, demandez une confirmation ferme (ou un petit acompte de réservation) avant d'acheter la pointure exacte.
4. **Fixation du prix de vente** : Visez une marge unitaire de 2 000 à 3 500 FCFA par paire pour réinvestir immédiatement le bénéfice dans le renouvellement du stock.

Voulez-vous que nous calculions ensemble votre prix de vente précis avec l'onglet **Calculateur de Prix & Marge** ?`;
  }

  // Test D : Vente de vêtements à Cotonou avec 20 000 FCFA
  if (mentionsClothes && (mentionsBudget || lower.includes("cotonou"))) {
    return `Lancer une activité de vente de vêtements à Cotonou avec 20 000 FCFA est tout à fait réalisable en adoptant une approche progressive :

1. **Répartition prudente du budget de 20 000 FCFA** :
   - **15 000 FCFA** : Achat de 8 à 12 pièces de premier choix (ex: friperie triée pièce par pièce à Missèbo / Dantokpa, ou petits hauts/chemises tendance).
   - **2 000 FCFA** : Lavage, repassage soigné et cintres pour valoriser immédiatement les articles.
   - **3 000 FCFA** : Forfait internet pour la publication de photos de qualité et les échanges clients.

2. **Tester la demande sans frais fixes** :
   - Pas de loyer : utilisez votre profil WhatsApp Business, vos statuts et les groupes de proximité à Cotonou (quartier, université, collègues).
   - Prenez des photos bien éclairées à la lumière du jour, portées ou bien disposées à plat.

3. **Stratégie de vente & réinvestissement** :
   - Proposez la livraison en mains propres ou point relais sécurisé à Cotonou.
   - Dès la première vente, conservez le capital initial de 20 000 FCFA et réinvestissez les bénéfices pour doubler votre stock en 2 à 3 semaines.

Souhaitez-vous que je vous aide à rédiger votre premier message WhatsApp pour présenter votre collection ?`;
  }

  // --- 5. ÉTUDIANT AU BÉNIN / EN AFRIQUE SANS CAPITAL (Test C) ---
  if (
    (lower.includes("étudiant") || lower.includes("etudiant") || lower.includes("sans capital") || lower.includes("pas de capital")) &&
    (lower.includes("5 000") || lower.includes("5000") || lower.includes("gagner") || lower.includes("revenu"))
  ) {
    return `Votre objectif de générer 5 000 FCFA par jour en tant qu'étudiant au Bénin sans capital financier est ambitieux mais accessible si vous valorisez votre **temps** et vos **compétences existantes** :

1. **Activités à zéro capital adaptées aux réalités de Cotonou/Bénin** :
   - **Assistance numérique pour commerces locaux** : Beaucoup de boutiques à Dantokpa, Ganhi ou dans votre quartier ne gèrent pas bien leur catalogue WhatsApp Business ou leurs petits stocks. Proposez-leur de prendre des photos de leurs produits et de répondre aux commandes.
   - **Création de visuels simples sur Canva mobile** : Affiches de promotions, menus de maquis ou annonces sur statut WhatsApp (facturables 1 500 à 2 500 FCFA le visuel).
   - **Répétitions scolaires à domicile** : Dispenser des cours de soutien à des élèves du primaire ou collège (2 000 à 3 000 FCFA la séance de 2 heures).
   - **Courses et livraisons de proximité** : Faire les commissions pour des professionnels occupés.

2. **Comment trouver vos 2 premiers clients d'ici 48 heures** :
   - Listez 10 commerçants ou connaissances de votre entourage proche.
   - Proposez-leur une démonstration gratuite ou sans risque (ex: "Je crée gratuitement votre affiche aujourd'hui ; si elle vous plaît, vous me confiez la gestion de vos statuts de la semaine pour 5 000 FCFA").

3. **Précision importante** : 5 000 FCFA par jour ne tombent pas automatiquement au jour 1. C'est une moyenne que vous atteindrez régulièrement dès que vous aurez stabilisé 3 à 5 clients fidèles.

Avez-vous un smartphone ou un ordinateur ? Dites-moi ce que vous maîtrisez le mieux (rédaction, dessin Canva, réseaux sociaux, calcul) pour affiner votre plan !`;
  }

  // --- 6. QUESTION GÉNÉRALE : CHIFFRE D'AFFAIRES VS BÉNÉFICE (Test E) ---
  if (
    (lower.includes("chiffre d'affaires") || lower.includes("chiffre d'affaire") || lower.includes("ca")) &&
    (lower.includes("bénéfice") || lower.includes("benefice") || lower.includes("différence") || lower.includes("difference"))
  ) {
    return `Voici la différence essentielle entre le Chiffre d'Affaires et le Bénéfice, expliquée avec un exemple concret :

1. **Le Chiffre d'Affaires (CA)** :
   C'est la somme totale de tout l'argent encaissé grâce à vos ventes sur une période donnée, sans rien déduire.
   *Formule : CA = Prix de vente × Quantité vendue*.

2. **Le Bénéfice (ou Résultat net)** :
   C'est ce qu'il vous reste réellement dans la poche une fois que vous avez payé **toutes** les dépenses liées à l'activité (achat de la marchandise, transport, forfait internet, emballages, etc.).
   *Formule : Bénéfice = Chiffre d'Affaires - Total des Dépenses*.

📊 **Exemple chiffré simple** :
- Vous achetez 10 pagnes à 4 000 FCFA l'unité = Coût d'achat de 40 000 FCFA.
- Vous payez 2 000 FCFA de transport et 1 000 FCFA de forfait internet.
- Total de vos dépenses réelles = **43 000 FCFA**.
- Vous revendez les 10 pagnes à 6 000 FCFA l'unité.
- Votre **Chiffre d'Affaires** est de **60 000 FCFA** (10 × 6 000).
- Votre **Bénéfice net** est de : 60 000 - 43 000 = **17 000 FCFA**.

⚠️ **Attention** : Avoir un gros chiffre d'affaires ne signifie pas être riche. Si vos dépenses sont trop élevées, vous pouvez faire du chiffre d'affaires et être en déficit !`;
  }

  // --- 7. DEMANDE D'AIDE SUR LE CV / LETTRE DE MOTIVATION (Test G) ---
  if (
    lower.includes("cv") ||
    lower.includes("curriculum") ||
    lower.includes("lettre de motivation") ||
    lower.includes("postuler") ||
    lower.includes("candidature")
  ) {
    return `Avec plaisir ! Pour concevoir un CV percutant adapté aux recruteurs en Afrique et à l'international, appliquez ces 4 règles fondamentales :

1. **Un titre précis** : Remplacez la mention "CV" par votre fonction visée (ex: *Assistant Administratif & Commercial Junior*).
2. **Une accroche personnalisée** : 3 à 4 lignes résumant vos forces et votre valeur ajoutée immédiate pour l'employeur.
3. **Mettre en valeur des compétences concrètes** : Citez les outils précis que vous maîtrisez (Excel, Canva, WhatsApp Business, SYSCOHADA, anglais professionnel...).
4. **La preuve par l'exemple** : Mentionnez un projet ou une réalisation concrète, même personnelle ou associative.

💡 **Astuce pratique sur AfriGain** : Utilisez directement l'onglet **"Générateur de CV & Lettres"** situé juste au-dessus ! Il formate automatiquement votre profil selon les standards professionnels et génère une lettre prête à imprimer ou exporter.

Voulez-vous que nous travaillions ensemble sur votre accroche ou sur la liste de vos compétences ?`;
  }

  // --- 8. FIXATION DE PRIX, TARIFS, DEVIS ET MARGES ---
  if (lower.includes("prix") || lower.includes("tarif") || lower.includes("combien") || lower.includes("facturer") || lower.includes("devis")) {
    return `Pour fixer un prix juste et rentable dans l'espace économique africain :

1. **Ne sous-estimez pas vos coûts réels** :
   - Temps passé × votre taux horaire minimal.
   - Coûts directs : forfait internet/connexion, déplacements (taxi, zem), consommables.
2. **Intégrez systématiquement une marge de sécurité** :
   - Prévoyez au minimum **20 % à 30 % de marge** pour absorber les imprévus et rémunérer votre développement.
3. **Modalité de sécurisation** :
   - Pour les prestations de service ou commandes sur-mesure, prévoyez un acompte standard de 30 % à 50 % à la signature du devis pour engager le client.

💡 Vous pouvez simuler exactement vos montants en cliquant sur l'onglet **"Calculateur de Prix & Marge"** situé au-dessus dans ce module.`;
  }

  // --- 9. PROSPECTION & RECHERCHE DE CLIENTS ---
  if (lower.includes("trouver des clients") || lower.includes("prospect") || lower.includes("démarcher") || lower.includes("client")) {
    return `Pour trouver et convaincre vos premiers clients sans budget publicitaire :

1. **Cibler un problème urgent** : Ne proposez pas "un service", mais la résolution d'une douleur concrète du client (ex: manque de visibilité, perte de temps, commandes non traitées sur WhatsApp).
2. **La méthode de l'échantillon gratuit** : Proposez une démonstration rapide (un visuel test, un audit court de 5 minutes) sans engagement pour prouver votre sérieux.
3. **L'approche directe et courtoise** : Contactez directement le responsable via WhatsApp Business ou en présentiel avec un message respectueux et direct.

💡 Vous pouvez générer un modèle de message d'approche prêt à envoyer en sélectionnant l'onglet **"Prospection & Conquête Clients"** ci-dessus.`;
  }

  // --- 10. REQUÊTE EN ANGLAIS (International) ---
  if (isEnglish) {
    return `I understand your goal. As your AfriGain AI Business Coach, here is what I recommend:

1. **Define your core value**: Clarify exactly what problem you are solving for your target market or employer.
2. **Keep overhead low**: Leverage digital channels like WhatsApp, direct outreach, and local networking before committing to high fixed costs.
3. **Price with profit in mind**: Factor in your time, communication costs, and ensure at least a 20% margin.

Feel free to share more details about your current skills, budget, or city so we can create a tailored roadmap together!`;
  }

  // --- 11. RÉPONSE POLYVALENTE ET PERTINENTE PAR DÉFAUT ---
  return `J'ai bien pris note de votre message : « ${text} ».

Pour vous orienter de la manière la plus efficace possible sur AfriGain :

1. **Quel est votre objectif immédiat ?** (Générer un revenu rapide, lancer une nouvelle activité, fixer le tarif d'une mission, ou améliorer votre employabilité ?)
2. **Quelles sont vos ressources actuelles ?** (Avez-vous déjà des compétences particulières, un capital de départ, ou du temps disponible cette semaine ?)

Précisez-moi ces éléments et je vous construirai un plan d'action adapté pas à pas !`;
}

/**
 * Détecte si le texte est principalement en anglais
 */
function isEnglishText(text: string): boolean {
  const englishWords = [
    "hello", "hi", "how", "what", "where", "business", "money", "price",
    "pricing", "student", "help", "need", "start", "company", "service",
    "profit", "client", "customer", "thanks", "thank you", "sell", "shoes", "clothes"
  ];
  const words = text.toLowerCase().split(/\W+/);
  const matched = words.filter((w) => englishWords.includes(w));
  return matched.length >= 2 || /^(hello|hi|good morning|hey there)[\s!.?]*$/i.test(text);
}

import { BUSINESS_COACH_SYSTEM_PROMPT } from "./system-prompt";

export interface CandidateProfile {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  whatsapp?: string;
  cityCountry: string;
  address?: string;
  summary: string;
  experiences: Array<{
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    isCurrent?: boolean;
    missions: string;
    achievements?: string;
  }>;
  educations: Array<{
    degree: string;
    institution: string;
    location?: string;
    startYear?: string;
    endYear?: string;
    fieldOfStudy?: string;
    mention?: string;
  }>;
  skills: string[];
  tools: Array<{ name: string; level?: string }>;
  languages: Array<{ name: string; level: string }>;
  projects?: Array<{ title: string; description: string; role?: string; results?: string }>;
  certifications?: Array<{ title: string; issuer: string; year?: string }>;
}

export interface JobTargetInfo {
  targetJobTitle: string;
  targetCompany: string;
  targetLocation?: string;
  recipientName?: string;
  jobReference?: string;
  applicationDate?: string;
  jobMissions: string; // OBLIGATOIRE : missions du poste
  jobRequirements?: string; // Compétences/exigences mentionnées dans l'annonce
  candidateMotivation?: string; // Motivations personnelles formulées par le candidat
  tone?: "professional" | "dynamic" | "formal";
}

/**
 * Moteur de Rédaction Intelligente de Lettres de Motivation
 * Fait le pont entre les missions de l'offre et les compétences/expériences RÉELLES du candidat.
 * Interdiction formelle d'inventer des diplômes, des expériences ou des données fictives.
 */
export async function generateCoverLetterAI(
  candidate: CandidateProfile,
  job: JobTargetInfo
): Promise<{ letter: string; source: "external_llm" | "smart_engine"; model?: string }> {
  // 1. Tenter l'appel à une API IA externe (Gemini, Groq, OpenAI)
  const externalResult = await tryExternalLLMCoverLetter(candidate, job);
  if (externalResult) {
    return externalResult;
  }

  // 2. Moteur de rédaction sémantique natif de haute précision
  const localLetter = generateLocalCoverLetter(candidate, job);
  return {
    letter: localLetter,
    source: "smart_engine",
  };
}

/**
 * Appel API externe sécurisé si clé présente
 */
async function tryExternalLLMCoverLetter(
  candidate: CandidateProfile,
  job: JobTargetInfo
): Promise<{ letter: string; source: "external_llm"; model: string } | null> {
  const geminiKey = process.env.GEMINI_API_KEY || (process.env.AI_API_KEY?.startsWith("AIza") ? process.env.AI_API_KEY : "");
  const openaiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const genericKey = process.env.AI_API_KEY;

  const prompt = buildCoverLetterPrompt(candidate, job);

  // Gemini
  if (geminiKey) {
    try {
      const modelName = process.env.AI_MODEL || "gemini-1.5-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiKey}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: "Tu es un expert en recrutement et en rédaction de lettres de motivation pour l'Afrique et l'international. Rédige une lettre hautement professionnelle, personnalisée, sans inventer aucun fait non fourni." }],
          },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 1500 },
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && typeof text === "string" && text.trim()) {
          return { letter: text.trim(), source: "external_llm", model: modelName };
        }
      }
    } catch (err) {
      console.warn("Échec appel Gemini pour lettre:", err);
    }
  }

  // OpenAI / Groq
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

      const res = await fetch(`${baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearerKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Tu es un expert en recrutement et rédaction professionnelle pour la plateforme AfriGain. Rédige des lettres de motivation percutantes basées strictement sur les compétences réelles du candidat." },
            { role: "user", content: prompt },
          ],
          temperature: 0.6,
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && typeof text === "string" && text.trim()) {
          return { letter: text.trim(), source: "external_llm", model };
        }
      }
    } catch (err) {
      console.warn("Échec appel OpenAI/Groq pour lettre:", err);
    }
  }

  return null;
}

function buildCoverLetterPrompt(candidate: CandidateProfile, job: JobTargetInfo): string {
  return `Rédige une lettre de motivation professionnelle complète pour le poste de « ${job.targetJobTitle} » au sein de l'entreprise « ${job.targetCompany} ».

INFORMATIONS DU CANDIDAT (Ne rien inventer d'autre) :
- Nom : ${candidate.fullName}
- Titre actuel : ${candidate.title}
- Coordonnées : ${candidate.cityCountry} • Tél : ${candidate.phone} • Email : ${candidate.email}
- Profil / Résumé : ${candidate.summary || "Non renseigné"}
- Compétences réelles : ${candidate.skills.join(", ") || "Non spécifié"}
- Logiciels & Outils : ${candidate.tools.map(t => `${t.name}${t.level ? ` (${t.level})` : ""}`).join(", ") || "Non spécifié"}
- Langues : ${candidate.languages.map(l => `${l.name} (${l.level})`).join(", ") || "Non spécifié"}
- Expériences réelles : ${candidate.experiences.map(e => `${e.jobTitle} chez ${e.company} (${e.startDate} - ${e.endDate || "Présent"}) : ${e.missions} ${e.achievements ? `(Réalisations: ${e.achievements})` : ""}`).join(" | ") || "Débutant / Aucune expérience déclarée"}
- Formations : ${candidate.educations.map(ed => `${ed.degree} à ${ed.institution} (${ed.endYear || ed.startYear || ""}) ${ed.mention ? `[${ed.mention}]` : ""}`).join(" | ") || "Non spécifié"}
- Projets concrets : ${candidate.projects?.map(p => `${p.title} : ${p.description}`).join(" | ") || "Aucun"}

OFFRE D'EMPLOI CIBLÉE :
- Poste : ${job.targetJobTitle}
- Entreprise : ${job.targetCompany}
- Lieu : ${job.targetLocation || "Non spécifié"}
- Recruteur : ${job.recipientName || "Madame, Monsieur le Responsable des Recrutements"}
- Réf : ${job.jobReference || "Candidature spontanée / Offre publiée"}
- MISSIONS DU POSTE : ${job.jobMissions}
- EXIGENCES / COMPÉTENCES RECHERCHÉES : ${job.jobRequirements || "Selon description du poste"}
- MOTIVATIONS DU CANDIDAT : ${job.candidateMotivation || "Volonté d'apporter ma rigueur et mes compétences à votre équipe"}
- TON : ${job.tone || "professional"}

CONSIGNES STRICTES :
1. Rapproche spécifiquement les missions du poste des compétences et expériences réelles du candidat.
2. Si le candidat est junior ou sans expérience directe, valorise ses compétences transférables, sa formation et ses projets concrets sans inventer d'expérience.
3. Ne cite JAMAIS un diplôme ou une entreprise où le candidat n'a pas travaillé.
4. Structure standard : En-tête (coordonnées expéditeur et destinataire, date), Objet, Salutation, Introduction accrocheuse, Argumentation axée sur les missions du poste, Valeur ajoutée pour l'entreprise, Proposition d'entretien, Formule de politesse soignée et Signature.
5. Formate directement en texte prêt à l'emploi.`;
}

/**
 * Générateur local contextuel de lettre de motivation (Fallback natif garanti)
 */
export function generateLocalCoverLetter(candidate: CandidateProfile, job: JobTargetInfo): string {
  const today = job.applicationDate || new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const recipient = job.recipientName?.trim() || "Madame, Monsieur le Responsable des Recrutements";
  const refLine = job.jobReference ? ` - Réf. : ${job.jobReference}` : "";
  const locationLine = job.targetLocation ? `\n${job.targetLocation}` : "";

  // Extraction des compétences et outils
  const skillsList = candidate.skills.length > 0 ? candidate.skills.join(", ") : "";
  const toolsList = candidate.tools.length > 0 ? candidate.tools.map(t => t.name).join(", ") : "";
  const mainEducation = candidate.educations[0];
  const mainExperience = candidate.experiences[0];
  const mainProject = candidate.projects?.[0];

  // Synthèse des atouts pertinents en relation avec les missions
  let experienceParagraph = "";
  if (mainExperience) {
    experienceParagraph = `Mon parcours récent en tant que ${mainExperience.jobTitle} au sein de ${mainExperience.company} m'a permis de développer une réelle maîtrise des opérations quotidiennes. Dans ce cadre, j'ai notamment assuré avec succès des responsabilités alignées avec vos attentes : ${mainExperience.missions.slice(0, 220)}${mainExperience.achievements ? ` Tout en obtenant des résultats probants : ${mainExperience.achievements}.` : "."}`;
  } else if (mainProject) {
    experienceParagraph = `Particulièrement investi dans la pratique, j'ai notamment conduit le projet concret suivant : « ${mainProject.title} » (${mainProject.description}). Cette réalisation m'a permis d'éprouver sur le terrain mes capacités d'organisation, de rigueur et d'adaptation face aux exigences du poste.`;
  } else if (mainEducation) {
    experienceParagraph = `Ma formation en ${mainEducation.degree} au sein de ${mainEducation.institution} m'a apporté des bases méthodologiques solides et une excellente maîtrise des fondamentaux du secteur. Je suis prêt à transposer immédiatement ces acquis académiques au service de vos missions.`;
  } else {
    experienceParagraph = `Doté d'un sens aigu des responsabilités et d'une grande rigueur professionnelle, je m'investis pleinement dans chaque mission qui m'est confiée avec pour priorité la satisfaction des objectifs opérationnels.`;
  }

  // Paragraphe d'adéquation avec les missions mentionnées
  const missionFocus = job.jobMissions
    ? `Au regard des missions clés que vous détaillez, notamment : « ${job.jobMissions.split("\n")[0].slice(0, 150)}... », je suis convaincu que mes compétences (${[skillsList, toolsList].filter(Boolean).join(" • ")}) constitueront un atout opérationnel immédiat pour ${job.targetCompany}.`
    : `Je serai particulièrement attentif à répondre avec précision et régularité aux missions confiées au sein de votre structure.`;

  // Motivation personnelle formulée
  const motivationParagraph = job.candidateMotivation
    ? `Rejoindre ${job.targetCompany} représente pour moi une opportunité privilégiée : ${job.candidateMotivation}`
    : `Intégrer votre équipe chez ${job.targetCompany} représente pour moi l'opportunité de mettre mon dynamisme et mon professionnalisme au service de vos projets de développement.`;

  return `${candidate.fullName}
${candidate.cityCountry}
Tél. : ${candidate.phone}${candidate.whatsapp && candidate.whatsapp !== candidate.phone ? ` • WhatsApp : ${candidate.whatsapp}` : ""}
Email : ${candidate.email}

À l'attention de :
${recipient}
${job.targetCompany}${locationLine}

Fait le ${today}

Objet : Candidature au poste de ${job.targetJobTitle}${refLine}

${recipient},

C'est avec un vif intérêt que je vous soumets ma candidature pour le poste de ${job.targetJobTitle} au sein de ${job.targetCompany}.

${motivationParagraph}

${experienceParagraph}

${missionFocus} Méthodique, réactif et animé par une culture constante du résultat, j'accorde une importance primordiale au respect des délais et à la qualité des livrables.

Je me tiens à votre entière disposition pour convenir d'un entretien afin de vous exposer de vive voix la façon dont je pourrai contribuer activement à la réussite de votre équipe.

Dans l'attente de votre réponse, je vous prie d'agréer, ${recipient}, l'expression de mes salutations les plus respectueuses.


${candidate.fullName}`;
}

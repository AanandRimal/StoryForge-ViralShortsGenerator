export type NicheSeed = {
  slug: string;
  nameEn: string;
  nameNe: string;
  emoji: string;
  language: string;
  languageBadge: "NE" | "HI" | "MIX";
  psychologicalTrigger: string;
  targetEmotion: string;
  contentAngle: string;
  pexelsKeywords: string[];
  captionColor: string;
  voiceTone: string;
  defaultVoiceId: string;
  pacing: string;
  exampleHooks: string[];
};

const SCRIPT_JSON_SCHEMA = `{
  "title": "social-ready title, max 60 chars, in Nepali or Hindi",
  "hook": "the opening sentence only",
  "language": "nepali or hindi",
  "scenes": [
    {
      "scene_number": 1,
      "text": "narration for this scene in Nepali or Hindi",
      "visual_keyword": "pexels search term — always in English",
      "duration_seconds": 8
    }
  ],
  "full_script": "all scene text concatenated — this is what gets sent to TTS",
  "cta": "closing call to action in Nepali or Hindi",
  "hashtags": ["#nepal", "#viral"],
  "thumbnail_text": "3-5 word bold text for thumbnail in Nepali or Hindi"
}`;

export function buildSystemPrompt(niche: NicheSeed): string {
  const primaryLang =
    niche.language === "hindi"
      ? "Hindi"
      : niche.language === "mixed"
        ? "Nepali and Hindi mix"
        : "Nepali";

  return `You are a viral short-form video scriptwriter for Nepali and Hindi audiences specializing in the "${niche.nameEn}" niche (${niche.nameNe}).

NICHE CONTEXT:
- Psychological trigger: ${niche.psychologicalTrigger}
- Target emotion: ${niche.targetEmotion}
- Content angle: ${niche.contentAngle}
- Voice tone: ${niche.voiceTone}
- Pacing: ${niche.pacing}
- Primary language: ${primaryLang}
- Visual theme keywords: ${niche.pexelsKeywords.join(", ")}

SCRIPT STRUCTURE (follow exactly):
[0–20s] HOOK — A detailed, lengthy opening. One shocking claim, open question, or incomplete truth with full context. Never answer the hook in the hook. Structure: "X kura — jo koi bhandaina / jo timi sochcha hoina"
[20–40s] TENSION ESCALATION — Deepen why this matters personally. Use "timi" (Nepali) or "aap/tumhara" (Hindi). Introduce the stakes. Do not leave the viewer halfway.
[40–100s] THE REVELATION — Detailed, full explanation with all context. 3–5 specific, concrete facts. Real names, real places, real numbers. Nepal/India specific examples always outperform generic ones. Provide rich, lengthy detail.
[100–130s] THE MEANING SHIFT — Why does this change how they see the world? Full conclusion. Emotional payoff — smarter, safer, prouder, or seen.
[130–140s] CTA CLOSER — Follow / save / share. Examples: "Follow garnus", "Yo video save garnus", "Yo kura आफ्नो साथीलाई share garnus"

WRITING RULES:
- Provide rich, lengthy detail in every section, avoid empty middle or halfway explanations.
- Max 15 words per sentence. Always active voice.
- Mix short punchy sentences with one longer one for rhythm.
- Use conversational contractions natural to spoken Nepali/Hindi.
- 12–15 scenes, each 10–15 seconds, totalling 130–180 seconds.
- visual_keyword in every scene MUST be in English (Pexels search is English-only).
- Append niche visual mood to keywords when helpful (e.g. "dark", "warm", "ancient").

OUTPUT: Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
${SCRIPT_JSON_SCHEMA}`;
}

export const NICHES: NicheSeed[] = [
  {
    slug: "power-control",
    nameEn: "Power & Control",
    nameNe: "शक्ति र नियन्त्रण",
    emoji: "👑",
    language: "mixed",
    languageBadge: "MIX",
    psychologicalTrigger:
      "Humans instantly detect status and dominance. Viewers feel like insiders who see what others don't.",
    targetEmotion: "Intellectual superiority, insider knowledge",
    contentAngle:
      "How political leaders and business tycoons (Adani, Ambani, Nepali politicians) silently control systems. Real names, real institutions.",
    pexelsKeywords: [
      "corporate power dark",
      "parliament building",
      "businessman shadow",
      "political meeting",
      "power control",
    ],
    captionColor: "#FFD700",
    voiceTone: "Authoritative, conspiratorial, low and confident",
    defaultVoiceId: "ne-NP-Standard-B",
    pacing: "Slow dramatic reveals, 6–8 second scenes",
    exampleHooks: [
      "Tata Group le Nepal ma k k control garcha — yo koi bhandaina",
      "Adani ko sabse bada secret jo media kabhi nahi batata",
      "Nepal ko sabai bada neta harule yo ek trick use garcha",
    ],
  },
  {
    slug: "love-attraction",
    nameEn: "Love & Attraction",
    nameNe: "प्रेम र आकर्षण",
    emoji: "💕",
    language: "nepali",
    languageBadge: "NE",
    psychologicalTrigger:
      "Reproduction drive — the strongest evolutionary hook. Relationship content drives recognition and validation.",
    targetEmotion: "Recognition, validation, curiosity about partner behavior",
    contentAngle:
      "Arranged vs love marriages, Nepali relationship culture, family pressure, modern dating in Kathmandu and Delhi.",
    pexelsKeywords: [
      "couple romantic",
      "relationship moment",
      "city evening love",
      "emotional connection",
      "couple walking",
    ],
    captionColor: "#FF6B9D",
    voiceTone: "Warm, intimate, slightly whispering",
    defaultVoiceId: "ne-NP-Standard-A",
    pacing: "Slow, emotional, 7–9 second scenes",
    exampleHooks: [
      "Agar koi ye 3 kaam karta hai to wo tumse pyaar karta hai — guaranteed",
      "Nepali केटाहरूले प्रेम गर्दा यो कहिल्यै नभन्ने कुरा",
      "Ladki ke ye 5 signs matlab wo tumhe ignore kar rahi hai",
    ],
  },
  {
    slug: "money-wealth",
    nameEn: "Money & Wealth",
    nameNe: "पैसा र सम्पत्ति",
    emoji: "💰",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger: "Financial survival anxiety — am I going to be okay?",
    targetEmotion: "Fear of staying poor, desire for financial escape",
    contentAngle:
      "Nepal's brain drain, India's middle class wealth gap, remittance economy, crypto in Nepal.",
    pexelsKeywords: [
      "money wealth contrast",
      "financial freedom",
      "gold coins",
      "poverty luxury contrast",
      "stock market",
    ],
    captionColor: "#00FF88",
    voiceTone: "Urgent, slightly alarming, then empowering",
    defaultVoiceId: "hi-IN-Neural2-C",
    pacing: "Fast cuts, 5–7 second scenes",
    exampleHooks: [
      "Nepali youth Qatar kinako janchan — yo jawab sunera dukha lagcha",
      "India mein sirf 1% log ye financial trick jaante hain",
      "Yo kaam garyo bhane Nepal ma basi pani ramro kamauna sakcha",
    ],
  },
  {
    slug: "untold-history",
    nameEn: "Untold History",
    nameNe: "अज्ञात इतिहास",
    emoji: "📜",
    language: "nepali",
    languageBadge: "NE",
    psychologicalTrigger:
      "Pride in heritage combined with shock at what was hidden — feels like discovering a betrayal.",
    targetEmotion: "National pride, intellectual curiosity, betrayal by official history",
    contentAngle:
      "Prithvi Narayan Shah's real strategies, hidden Rana rule stories, 2015 earthquake secrets, ancient Kathmandu Valley.",
    pexelsKeywords: [
      "ancient ruins nepal",
      "himalaya fog mystery",
      "old temple stone",
      "historical ruins",
      "mountain ancient",
    ],
    captionColor: "#D97706",
    voiceTone: "Mysterious documentary narrator, reverent",
    defaultVoiceId: "ne-NP-Standard-B",
    pacing: "Slow builds, 8–10 second scenes",
    exampleHooks: [
      "Prithvi Narayan Shah ko yo ek kaam — history books le kina lukaune?",
      "Kathmandu Valley ko yo temple ma ke hidden cha — koi bhandaina",
      "2015 earthquake ma yo top secret kura — government le hide garyo",
    ],
  },
  {
    slug: "dark-psychology",
    nameEn: "Dark Psychology",
    nameNe: "मनोविज्ञान र व्यवहार",
    emoji: "🧠",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      "Fear of being manipulated + desire to feel smarter than others.",
    targetEmotion: "Feeling enlightened and protected",
    contentAngle:
      "Workplace manipulation in Nepal's corporate culture, family manipulation tactics in South Asian families, social hierarchy psychology.",
    pexelsKeywords: [
      "dark psychology shadow",
      "manipulation concept",
      "mind control visual",
      "person silhouette dark",
      "psychological depth",
    ],
    captionColor: "#A855F7",
    voiceTone: "Low, conspiratorial, slightly dramatic",
    defaultVoiceId: "hi-IN-Neural2-C",
    pacing: "Medium cuts, 6–8 second scenes",
    exampleHooks: [
      "Agar koi ye 3 kaam kare to wo tumhe manipulate kar raha hai",
      "Office ma आफ्नो मान्छेलाई कसरी चिन्ने — यो psychology ले बताउँछ",
      "Jo log hamesha 'main theek hoon' kehte hain unke baare mein sach",
    ],
  },
  {
    slug: "culture-identity",
    nameEn: "Culture & Identity",
    nameNe: "संस्कृति र पहिचान",
    emoji: "🏔️",
    language: "nepali",
    languageBadge: "NE",
    psychologicalTrigger: '"Who am I? Where do I come from?" — identity and cultural pride.',
    targetEmotion: "Deep pride in being Nepali, nostalgia, belonging",
    contentAngle:
      "Everest mysteries, Pashupatinath secrets, Kumari tradition, Newari culture, Tharu community, temple architecture.",
    pexelsKeywords: [
      "nepal temple culture",
      "kathmandu streets",
      "himalaya everest",
      "nepali festival",
      "ancient temple ritual",
    ],
    captionColor: "#F97316",
    voiceTone: "Warm, proud, documentary reverence",
    defaultVoiceId: "ne-NP-Standard-B",
    pacing: "Slow beautiful reveals, 8–10 second scenes",
    exampleHooks: [
      "Pashupatinath ko yo secret room — 99% Nepali lai thaha chaina",
      "Kumari ko jeevan kaisa hota hai — ye sach sunke rone lagoge",
      "Everest ko summit ma ke cha — jo photos ma kabhi nahi dikhate",
    ],
  },
  {
    slug: "fear-danger",
    nameEn: "Fear & Danger",
    nameNe: "डर र जोखिम",
    emoji: "⚠️",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      "Brain prioritizes threat detection — safety content always gets watched.",
    targetEmotion: 'Protective urgency — "I need to know this to stay safe"',
    contentAngle:
      "Mobile radiation, food adulteration in Nepal, Kathmandu/Delhi air quality, loan shark traps.",
    pexelsKeywords: [
      "danger warning dark",
      "urban risk",
      "pollution city",
      "shadowy threat",
      "warning signs",
    ],
    captionColor: "#EF4444",
    voiceTone: "Urgent warning, slightly alarming",
    defaultVoiceId: "hi-IN-Neural2-C",
    pacing: "Fast urgent cuts, 5–6 second scenes",
    exampleHooks: [
      "Kathmandu ko haawa — doctors ke anusar kitna khatarnak hai",
      "Nepal ma yo food khayera 1000 manxe biraami pareka chan",
      "Ye 3 loan apps India mein — ek galti aur zindagi barbaad",
    ],
  },
  {
    slug: "mystery-conspiracy",
    nameEn: "Mystery & Conspiracy",
    nameNe: "रहस्य र षड्यन्त्र",
    emoji: "🔮",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      '"What don\'t I know? Who is hiding this from me?" — information gap anxiety.',
    targetEmotion: "Intellectual excitement, feeling of discovering hidden truth",
    contentAngle:
      "Why Rana regime ended, sealed Pashupatinath chamber, India unsolved mysteries, why Nepal is landlocked by design.",
    pexelsKeywords: [
      "mystery ancient door",
      "foggy ruins",
      "conspiracy dark",
      "ancient secrets",
      "mysterious corridor",
    ],
    captionColor: "#6366F1",
    voiceTone: "Slowly building, mysterious, dramatic pauses implied",
    defaultVoiceId: "hi-IN-Neural2-C",
    pacing: "Slow tension build, 8–10 second scenes",
    exampleHooks: [
      "Pashupatinath mandir ka wo darwaza jo kabhi nahi khulta — andar kya hai",
      "Nepal landlocked kina — yo accident thiyena, yo plan thio",
      "India ka sabse bada unsolved mystery jo government hide karti hai",
    ],
  },
  {
    slug: "conflict-competition",
    nameEn: "Corporate Wars",
    nameNe: "द्वन्द्व र प्रतिस्पर्धा",
    emoji: "⚔️",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      "Who is winning vs losing — competition narrative drives engagement.",
    targetEmotion: "Vicarious thrill, insider knowledge of power battles",
    contentAngle:
      "Tata vs Ambani wars, Byju's collapse, Flipkart vs Amazon, Nepal Airlines vs private airlines, why Nepali startups fail.",
    pexelsKeywords: [
      "corporate battle chess",
      "business competition",
      "corporate war strategy",
      "business success failure",
      "competition race",
    ],
    captionColor: "#F43F5E",
    voiceTone: "Energetic, competitive, slightly breathless",
    defaultVoiceId: "hi-IN-Neural2-C",
    pacing: "Fast cuts, 5–7 second scenes",
    exampleHooks: [
      "Byju's kaise duba — insider story jo media ne nahi batai",
      "Tata aur Ambani ke beech ki asli war — ye sab nahi jaante",
      "Nepal ko sabai thulo company kina dubi — yo sach sunnu hos",
    ],
  },
  {
    slug: "happiness-meaning",
    nameEn: "Happiness & Meaning",
    nameNe: "खुशी र अर्थ",
    emoji: "🌅",
    language: "nepali",
    languageBadge: "NE",
    psychologicalTrigger: '"Am I living correctly?" — emotional self-reflection and validation.',
    targetEmotion: "Recognition, gentle epiphany, feeling seen",
    contentAngle:
      "Nepal's youth mental health crisis, societal pressure, India's burnout culture, happiness in Nepali philosophy.",
    pexelsKeywords: [
      "peaceful nature sunrise",
      "meditation calm",
      "happiness nature",
      "emotional moment",
      "peaceful reflection",
    ],
    captionColor: "#FCD34D",
    voiceTone: "Gentle, empathetic, slow",
    defaultVoiceId: "ne-NP-Standard-A",
    pacing: "Slow peaceful, 8–10 second scenes",
    exampleHooks: [
      "Nepal ma 70% young people depressed chan — tara koi bhandaina",
      "Khushi khojda khojda dukhi kina hunchau — ye science le bataxa",
      "Jo hamesha 'sab theek hai' kehte hain — unke andar kya chal raha hota hai",
    ],
  },
  {
    slug: "economic-anxiety",
    nameEn: "Economic Anxiety",
    nameNe: "आर्थिक चिन्ता",
    emoji: "📉",
    language: "nepali",
    languageBadge: "NE",
    psychologicalTrigger:
      'Financial survival anxiety — "will I make it?" — universally powerful in Nepal/India.',
    targetEmotion: "Validation of economic fear, then empowerment through knowledge",
    contentAngle:
      "Nepal's youth unemployment, Kathmandu cost of living, remittance dependency, India's gig economy trap.",
    pexelsKeywords: [
      "economic struggle urban",
      "city poverty contrast",
      "job search stress",
      "financial anxiety",
      "urban survival",
    ],
    captionColor: "#10B981",
    voiceTone: "Urgent but solution-oriented",
    defaultVoiceId: "ne-NP-Standard-B",
    pacing: "Medium pace, 6–8 second scenes",
    exampleHooks: [
      "Kathmandu ma flat lina 40 saal laagcha — yo sach ho",
      "Nepal ma job nai chaina bhane ke garne — 5 real options",
      "Gig economy ka sach — Swiggy delivery karne wale kya kamaate hain sach mein",
    ],
  },
  {
    slug: "biography-power",
    nameEn: "Biography of Power",
    nameNe: "जीवनी र शक्तिको उदय",
    emoji: "🎬",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      "Admiration combined with vicarious ambition — the rise story.",
    targetEmotion:
      "Inspiration mixed with shocking revelations about how they really made it",
    contentAngle:
      "Binod Chaudhary, Ambani's origin story, Tata near-bankruptcy, dark side of Bollywood empires.",
    pexelsKeywords: [
      "powerful leader portrait",
      "luxury success",
      "dramatic business",
      "rise to power",
      "dark luxury",
    ],
    captionColor: "#C9B99A",
    voiceTone: "Dramatic narrator, building suspense",
    defaultVoiceId: "hi-IN-Neural2-C",
    pacing: "Cinematic slow builds, 7–9 second scenes",
    exampleHooks: [
      "Binod Chaudhary Nepal ko pehlo Arab pati kasari bane — yo koi bhandaina",
      "Ambani ne apni pehli company kaise start ki — ye sach shocking hai",
      "Bollywood ka sabse bada secret — jo stars kabhi nahi batate",
    ],
  },
  {
    slug: "hidden-knowledge",
    nameEn: "Hidden Knowledge",
    nameNe: "लुकेको ज्ञान",
    emoji: "📚",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      "Fear of missing critical information that others already have.",
    targetEmotion: "Urgency to learn, intellectual excitement",
    contentAngle:
      "Ancient Vedic knowledge, Nepali healing traditions science is proving, what IIT toppers study.",
    pexelsKeywords: [
      "ancient manuscript library",
      "hidden knowledge book",
      "academic dark",
      "wisdom ancient",
      "knowledge secret",
    ],
    captionColor: "#818CF8",
    voiceTone: "Intellectual, excited discovery",
    defaultVoiceId: "hi-IN-Neural2-D",
    pacing: "Medium, curiosity-building, 6–8 second scenes",
    exampleHooks: [
      "IIT topper jo padhte hain wo normal students ko nahi batate",
      "Ancient Ayurveda ka ye ek niyam — jo doctors nahi batate",
      "Nepal ko puraano chikitsa vidhi — jo ab science le prove garyo",
    ],
  },
  {
    slug: "social-psychology",
    nameEn: "Social Psychology",
    nameNe: "सामाजिक मनोविज्ञान",
    emoji: "👥",
    language: "hindi",
    languageBadge: "HI",
    psychologicalTrigger:
      'Social comparison — "where do I rank?" — constant background anxiety in South Asian culture.',
    targetEmotion: "Self-awareness, social advantage",
    contentAngle:
      "South Asian status obsession, Nepali 'ke garchau' culture psychology, social media fakeness in India.",
    pexelsKeywords: [
      "social gathering status",
      "crowd psychology",
      "status symbol",
      "social comparison",
      "luxury display",
    ],
    captionColor: "#EC4899",
    voiceTone: "Conversational, slightly wry, relatable",
    defaultVoiceId: "hi-IN-Neural2-D",
    pacing: "Medium, relatable, 6–8 second scenes",
    exampleHooks: [
      "India mein log zyada dikhawa kyon karte hain — psychology ka jawab",
      "Nepal ma 'ke garchau' sodhda sodhda manchhe depressed hunchan",
      "Jo log hamesha expensive cheezein dikhate hain unke baare mein sach",
    ],
  },
  {
    slug: "stoicism-wisdom",
    nameEn: "Stoicism & Wisdom",
    nameNe: "प्रेरणा र दर्शन",
    emoji: "🧘",
    language: "nepali",
    languageBadge: "NE",
    psychologicalTrigger:
      'Desire for meaning and mental strength — "how do I deal with this world?"',
    targetEmotion:
      "Calm empowerment, ancient wisdom feeling urgently modern",
    contentAngle:
      "Nepali Buddhist philosophy meeting Stoicism, Chanakya Niti for modern Nepal, Himalayan monk teachings.",
    pexelsKeywords: [
      "himalayan monastery meditation",
      "buddhist philosophy",
      "ancient wisdom mountain",
      "peaceful monk",
      "mountain sunrise wisdom",
    ],
    captionColor: "#34D399",
    voiceTone: "Calm, wise, meditative pace",
    defaultVoiceId: "ne-NP-Standard-B",
    pacing: "Very slow, peaceful, 9–12 second scenes",
    exampleHooks: [
      "Boudha darshan ko yo ek siddhanta — jo western science le prove garyo",
      "Chanakya le 2000 saal agaadi nai yo kura bhaneeka thiyo",
      "Himalayan monk haruko yo ek bani — jo tumro jeevan badal dinxa",
    ],
  },
];

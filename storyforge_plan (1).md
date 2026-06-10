# StoryForge — Implementation Plan

## What We're Building

A small team web app (2–5 users) that generates viral 60–90 second short-form videos in Nepali and Hindi, then auto-publishes to TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels. One click: pick a niche + topic → script → voice → visuals → video → published.

**Hard constraints:**
- Total API cost under $10/month at 2 videos/day (60/month)
- Videos must use real motion footage — never static image slideshows (Facebook and YouTube ban these)
- Captions must correctly render Nepali/Hindi Unicode (Devanagari script)

---

## The Core Pipeline

```
User picks niche + topic
  → Claude Haiku generates script (structured JSON with scenes)
  → Google Cloud TTS generates Nepali/Hindi voiceover audio
  → Pexels API fetches vertical stock video clips per scene
  → FFmpeg compiles: clips + audio + word-by-word Devanagari kinetic captions → 1080×1920 .mp4
  → Auto-published to TikTok, Instagram Reels, YouTube Shorts, Facebook Reels
```

This pipeline runs as a background job queue. The web UI triggers it and polls for status. The web server never waits on the render.

---

## The 15 Content Niches

These niches are specifically chosen for the psychological triggers they activate in Nepali and Indian audiences. Each niche has its own visual style, color grade, voice tone, and Claude system prompt stored in the database.

---

### Niche 1 — शक्ति र नियन्त्रण (Power & Control)
- **Slug:** `power-control`
- **Language:** Nepali + Hindi mix
- **Psychological trigger:** Humans instantly detect status and dominance. This niche makes viewers feel like insiders who see what others don't.
- **Target emotion:** Intellectual superiority, insider knowledge
- **Content angle:** How political leaders and business tycoons (Adani, Ambani, Nepali politicians) silently control systems. Real names, real institutions.
- **Example hooks:**
  - "Tata Group le Nepal ma k k control garcha — yo koi bhandaina"
  - "Adani ko sabse bada secret jo media kabhi nahi batata"
  - "Nepal ko sabai bada neta harule yo ek trick use garcha"
- **Visual theme:** Dark corporate offices, shadowed faces, parliament buildings, Singha Durbar, boardrooms
- **Pexels search keywords:** `corporate power dark`, `parliament building`, `businessman shadow`, `political meeting`, `power control`
- **Caption color:** `#FFD700` (gold)
- **Voice tone:** Authoritative, conspiratorial, low and confident
- **Pacing:** Slow dramatic reveals, 6–8 second scenes

---

### Niche 2 — प्रेम र आकर्षण (Love, Attraction & Relationships)
- **Slug:** `love-attraction`
- **Language:** Nepali primary, Hindi secondary
- **Psychological trigger:** Reproduction drive — the strongest evolutionary hook. Relationship content drives recognition and validation.
- **Target emotion:** Recognition, validation, curiosity about partner behavior
- **Content angle:** Arranged vs love marriages, Nepali relationship culture, family pressure, modern dating in Kathmandu and Delhi
- **Example hooks:**
  - "Agar koi ye 3 kaam karta hai to wo tumse pyaar karta hai — guaranteed"
  - "Nepali केटाहरूले प्रेम गर्दा यो कहिल्यै नभन्ने कुरा"
  - "Ladki ke ye 5 signs matlab wo tumhe ignore kar rahi hai"
- **Visual theme:** Warm golden tones, couples in Kathmandu streets, Pashupatinath ghats, evening city lights
- **Pexels search keywords:** `couple romantic`, `relationship moment`, `city evening love`, `emotional connection`, `couple walking`
- **Caption color:** `#FF6B9D` (pink)
- **Voice tone:** Warm, intimate, slightly whispering
- **Pacing:** Slow, emotional, 7–9 second scenes

---

### Niche 3 — पैसा र सम्पत्ति (Money, Wealth & Financial Secrets)
- **Slug:** `money-wealth`
- **Language:** Hindi primary (larger finance audience), Nepali secondary
- **Psychological trigger:** Financial survival anxiety — am I going to be okay?
- **Target emotion:** Fear of staying poor, desire for financial escape
- **Content angle:** Nepal's brain drain (youth leaving for Qatar and Malaysia), India's middle class wealth gap, remittance economy, crypto in Nepal
- **Example hooks:**
  - "Nepali youth Qatar kinako janchan — yo jawab sunera dukha lagcha"
  - "India mein sirf 1% log ye financial trick jaante hain"
  - "Yo kaam garyo bhane Nepal ma basi pani ramro kamauna sakcha"
- **Visual theme:** Gold/black contrast, money stacks, luxury vs poverty juxtaposition, Nepali remittance workers
- **Pexels search keywords:** `money wealth contrast`, `financial freedom`, `gold coins`, `poverty luxury contrast`, `stock market`
- **Caption color:** `#00FF88` (green)
- **Voice tone:** Urgent, slightly alarming, then empowering
- **Pacing:** Fast cuts, 5–7 second scenes

---

### Niche 4 — अज्ञात इतिहास (Untold History & Hidden Past)
- **Slug:** `untold-history`
- **Language:** Nepali primary
- **Psychological trigger:** Pride in heritage combined with shock at what was hidden — feels like discovering a betrayal
- **Target emotion:** National pride, intellectual curiosity, betrayal by "official" history
- **Content angle:** Prithvi Narayan Shah's real strategies, hidden stories of Rana rule, what really happened during the 2015 earthquake, ancient Kathmandu Valley secrets, Indus Valley mysteries
- **Example hooks:**
  - "Prithvi Narayan Shah ko yo ek kaam — history books le kina lukaune?"
  - "Kathmandu Valley ko yo temple ma ke hidden cha — koi bhandaina"
  - "2015 earthquake ma yo top secret kura — government le hide garyo"
- **Visual theme:** Sepia tones, foggy mountain paths, Kathmandu Durbar Square at dawn, old maps, ancient Nepal
- **Pexels search keywords:** `ancient ruins nepal`, `himalaya fog mystery`, `old temple stone`, `historical ruins`, `mountain ancient`
- **Caption color:** `#D97706` (amber)
- **Voice tone:** Mysterious documentary narrator, reverent
- **Pacing:** Slow builds, 8–10 second scenes

---

### Niche 5 — मनोविज्ञान र व्यवहार (Dark Psychology & Human Behavior)
- **Slug:** `dark-psychology`
- **Language:** Hindi primary (larger audience), Nepali secondary
- **Psychological trigger:** Fear of being manipulated + desire to feel smarter than others
- **Target emotion:** Feeling enlightened and protected
- **Content angle:** Workplace manipulation in Nepal's corporate culture, family manipulation tactics common in South Asian families, social hierarchy psychology
- **Example hooks:**
  - "Agar koi ye 3 kaam kare to wo tumhe manipulate kar raha hai"
  - "Office ma आफ्नो मान्छेलाई कसरी चिन्ने — यो psychology ले बताउँछ"
  - "Jo log hamesha 'main theek hoon' kehte hain unke baare mein sach"
- **Visual theme:** Noir shadows, close-up eyes, silhouettes, neon reflections on rain
- **Pexels search keywords:** `dark psychology shadow`, `manipulation concept`, `mind control visual`, `person silhouette dark`, `psychological depth`
- **Caption color:** `#A855F7` (purple)
- **Voice tone:** Low, conspiratorial, slightly dramatic
- **Pacing:** Medium cuts, 6–8 second scenes

---

### Niche 6 — संस्कृति र पहिचान (Culture, Identity & Sacred Nepal)
- **Slug:** `culture-identity`
- **Language:** Nepali primary
- **Psychological trigger:** "Who am I? Where do I come from?" — identity and cultural pride
- **Target emotion:** Deep pride in being Nepali, nostalgia, belonging
- **Content angle:** Everest mysteries, ancient Pashupatinath secrets, Kumari tradition, Newari culture, Tharu community stories, temple architecture meanings
- **Example hooks:**
  - "Pashupatinath ko yo secret room — 99% Nepali lai thaha chaina"
  - "Kumari ko jeevan kaisa hota hai — ye sach sunke rone lagoge"
  - "Everest ko summit ma ke cha — jo photos ma kabhi nahi dikhate"
- **Visual theme:** Warm ochre/orange, Pashupatinath ghats, Boudhanath stupa, Everest sunrise, Newari architecture details
- **Pexels search keywords:** `nepal temple culture`, `kathmandu streets`, `himalaya everest`, `nepali festival`, `ancient temple ritual`
- **Caption color:** `#F97316` (orange)
- **Voice tone:** Warm, proud, documentary reverence
- **Pacing:** Slow beautiful reveals, 8–10 second scenes

---

### Niche 7 — डर र जोखिम (Fear, Risk & Hidden Dangers)
- **Slug:** `fear-danger`
- **Language:** Hindi primary, Nepali secondary
- **Psychological trigger:** Brain prioritizes threat detection above everything — safety content always gets watched
- **Target emotion:** Protective urgency — "I need to know this to stay safe"
- **Content angle:** Everyday dangers Nepalis and Indians overlook: mobile radiation, food adulteration in Nepal, Kathmandu/Delhi air quality, loan shark traps
- **Example hooks:**
  - "Kathmandu ko haawa — doctors ke anusar kitna khatarnak hai"
  - "Nepal ma yo food khayera 1000 manxe biraami pareka chan"
  - "Ye 3 loan apps India mein — ek galti aur zindagi barbaad"
- **Visual theme:** High contrast, deep shadows, warning reds, urban danger aesthetic
- **Pexels search keywords:** `danger warning dark`, `urban risk`, `pollution city`, `shadowy threat`, `warning signs`
- **Caption color:** `#EF4444` (red)
- **Voice tone:** Urgent warning, slightly alarming
- **Pacing:** Fast urgent cuts, 5–6 second scenes

---

### Niche 8 — रहस्य र षड्यन्त्र (Mysteries & Conspiracies)
- **Slug:** `mystery-conspiracy`
- **Language:** Hindi primary, Nepali secondary
- **Psychological trigger:** "What don't I know? Who is hiding this from me?" — information gap anxiety
- **Target emotion:** Intellectual excitement, feeling of discovering hidden truth
- **Content angle:** Why did the Rana regime really end, what is inside the sealed Pashupatinath chamber, Area 51 equivalent stories from India, why Nepal is landlocked by design
- **Example hooks:**
  - "Pashupatinath mandir ka wo darwaza jo kabhi nahi khulta — andar kya hai"
  - "Nepal landlocked kina — yo accident thiyena, yo plan thio"
  - "India ka sabse bada unsolved mystery jo government hide karti hai"
- **Visual theme:** Dark corridors, ancient sealed doors, foggy ruins, classified document aesthetic
- **Pexels search keywords:** `mystery ancient door`, `foggy ruins`, `conspiracy dark`, `ancient secrets`, `mysterious corridor`
- **Caption color:** `#6366F1` (indigo)
- **Voice tone:** Slowly building, mysterious, dramatic pauses implied
- **Pacing:** Slow tension build, 8–10 second scenes

---

### Niche 9 — द्वन्द्व र प्रतिस्पर्धा (Corporate Wars & Competition)
- **Slug:** `conflict-competition`
- **Language:** Hindi primary
- **Psychological trigger:** Who is winning vs losing — competition narrative drives engagement
- **Target emotion:** Vicarious thrill, insider knowledge of power battles
- **Content angle:** Tata vs Ambani business wars, Byju's collapse, how Flipkart lost to Amazon, Nepal Airlines vs private airlines, why Nepali startups fail
- **Example hooks:**
  - "Byju's kaise duba — insider story jo media ne nahi batai"
  - "Tata aur Ambani ke beech ki asli war — ye sab nahi jaante"
  - "Nepal ko sabai thulo company kina dubi — yo sach sunnu hos"
- **Visual theme:** Chess pieces, corporate clash, fast aggressive cuts, dark office battles
- **Pexels search keywords:** `corporate battle chess`, `business competition`, `corporate war strategy`, `business success failure`, `competition race`
- **Caption color:** `#F43F5E` (rose red)
- **Voice tone:** Energetic, competitive, slightly breathless
- **Pacing:** Fast cuts, 5–7 second scenes

---

### Niche 10 — खुशी र अर्थ (Happiness, Meaning & Mental Health)
- **Slug:** `happiness-meaning`
- **Language:** Nepali primary (mental health deeply underserved in Nepal)
- **Psychological trigger:** "Am I living correctly?" — emotional self-reflection and validation
- **Target emotion:** Recognition, gentle epiphany, feeling seen
- **Content angle:** Nepal's youth mental health crisis, Nepali societal pressure (foreign job, marriage pressure), India's burnout culture, what happiness means in Nepali philosophy
- **Example hooks:**
  - "Nepal ma 70% young people depressed chan — tara koi bhandaina"
  - "Khushi khojda khojda dukhi kina hunchau — ye science le bataxa"
  - "Jo hamesha 'sab theek hai' kehte hain — unke andar kya chal raha hota hai"
- **Visual theme:** Soft warm light, peaceful Nepal nature, Phewa lake reflections, Pokhara sunsets
- **Pexels search keywords:** `peaceful nature sunrise`, `meditation calm`, `happiness nature`, `emotional moment`, `peaceful reflection`
- **Caption color:** `#FCD34D` (warm yellow)
- **Voice tone:** Gentle, empathetic, slow
- **Pacing:** Slow peaceful, 8–10 second scenes

---

### Niche 11 — आर्थिक चिन्ता (Economic Anxiety & Survival)
- **Slug:** `economic-anxiety`
- **Language:** Nepali primary, Hindi secondary
- **Psychological trigger:** Financial survival anxiety — "will I make it?" — universally powerful in Nepal/India
- **Target emotion:** Validation of economic fear, then empowerment through knowledge
- **Content angle:** Nepal's youth unemployment crisis, cost of living in Kathmandu doubling, remittance dependency, India's gig economy trap
- **Example hooks:**
  - "Kathmandu ma flat lina 40 saal laagcha — yo sach ho"
  - "Nepal ma job nai chaina bhane ke garne — 5 real options"
  - "Gig economy ka sach — Swiggy delivery karne wale kya kamaate hain sach mein"
- **Visual theme:** Urban economic contrast, Kathmandu congestion, price tags, middle class struggle
- **Pexels search keywords:** `economic struggle urban`, `city poverty contrast`, `job search stress`, `financial anxiety`, `urban survival`
- **Caption color:** `#10B981` (emerald)
- **Voice tone:** Urgent but solution-oriented
- **Pacing:** Medium pace, 6–8 second scenes

---

### Niche 12 — जीवनी र शक्तिको उदय (Biography of Power)
- **Slug:** `biography-power`
- **Language:** Hindi primary, Nepali secondary
- **Psychological trigger:** Admiration combined with vicarious ambition — the rise story
- **Target emotion:** Inspiration mixed with shocking revelations about how they really made it
- **Content angle:** Rise of Nepali billionaires (Binod Chaudhary), Ambani's real origin story, how Tata survived near-bankruptcy, dark side of Bollywood empires
- **Example hooks:**
  - "Binod Chaudhary Nepal ko pehlo Arab pati kasari bane — yo koi bhandaina"
  - "Ambani ne apni pehli company kaise start ki — ye sach shocking hai"
  - "Bollywood ka sabse bada secret — jo stars kabhi nahi batate"
- **Visual theme:** Sleek dark luxury, powerful portraits, dramatic light/shadow, rise-and-fall aesthetic
- **Pexels search keywords:** `powerful leader portrait`, `luxury success`, `dramatic business`, `rise to power`, `dark luxury`
- **Caption color:** `#C9B99A` (gold cream)
- **Voice tone:** Dramatic narrator, building suspense
- **Pacing:** Cinematic slow builds, 7–9 second scenes

---

### Niche 13 — लुकेको ज्ञान (Hidden Knowledge & Intellectual FOMO)
- **Slug:** `hidden-knowledge`
- **Language:** Hindi primary, Nepali secondary
- **Psychological trigger:** Fear of missing critical information that others already have
- **Target emotion:** Urgency to learn, intellectual excitement
- **Content angle:** Ancient Vedic knowledge hidden in plain sight, Nepali healing traditions that science is now proving, what IIT toppers study that others don't
- **Example hooks:**
  - "IIT topper jo padhte hain wo normal students ko nahi batate"
  - "Ancient Ayurveda ka ye ek niyam — jo doctors nahi batate"
  - "Nepal ko puraano chikitsa vidhi — jo ab science le prove garyo"
- **Visual theme:** Ancient manuscripts, library aesthetic, dark academic, knowledge symbols
- **Pexels search keywords:** `ancient manuscript library`, `hidden knowledge book`, `academic dark`, `wisdom ancient`, `knowledge secret`
- **Caption color:** `#818CF8` (lavender)
- **Voice tone:** Intellectual, excited discovery
- **Pacing:** Medium, curiosity-building, 6–8 second scenes

---

### Niche 14 — सामाजिक मनोविज्ञान (Social Psychology & Status)
- **Slug:** `social-psychology`
- **Language:** Hindi primary
- **Psychological trigger:** Social comparison — "where do I rank?" — constant background anxiety in South Asian culture
- **Target emotion:** Self-awareness, social advantage
- **Content angle:** Why South Asian societies are obsessed with status symbols, the psychology behind Nepali "ke garchau" culture, social media fakeness in India
- **Example hooks:**
  - "India mein log zyada dikhawa kyon karte hain — psychology ka jawab"
  - "Nepal ma 'ke garchau' sodhda sodhda manchhe depressed hunchan"
  - "Jo log hamesha expensive cheezein dikhate hain unke baare mein sach"
- **Visual theme:** Social gatherings, status symbols, candid crowd psychology moments
- **Pexels search keywords:** `social gathering status`, `crowd psychology`, `status symbol`, `social comparison`, `luxury display`
- **Caption color:** `#EC4899` (pink-red)
- **Voice tone:** Conversational, slightly wry, relatable
- **Pacing:** Medium, relatable, 6–8 second scenes

---

### Niche 15 — प्रेरणा र दर्शन (Stoicism & Ancient Wisdom)
- **Slug:** `stoicism-wisdom`
- **Language:** Nepali primary (deeply underserved niche in Nepal)
- **Psychological trigger:** Desire for meaning and mental strength — "how do I deal with this world?"
- **Target emotion:** Calm empowerment, ancient wisdom feeling urgently modern
- **Content angle:** Nepali Boudha philosophy meeting Stoicism, Chanakya Niti applied to modern Nepal, what Himalayan monks teach that Western psychology is just discovering
- **Example hooks:**
  - "Boudha darshan ko yo ek siddhanta — jo western science le prove garyo"
  - "Chanakya le 2000 saal agaadi nai yo kura bhaneeka thiyo"
  - "Himalayan monk haruko yo ek bani — jo tumro jeevan badal dinxa"
- **Visual theme:** Himalayan monastery, meditation, ancient wisdom, soft morning light on mountains
- **Pexels search keywords:** `himalayan monastery meditation`, `buddhist philosophy`, `ancient wisdom mountain`, `peaceful monk`, `mountain sunrise wisdom`
- **Caption color:** `#34D399` (sage green)
- **Voice tone:** Calm, wise, meditative pace
- **Pacing:** Very slow, peaceful, 9–12 second scenes

---

## The Universal Script Structure

Every video follows this 5-part psychological structure regardless of niche or language:

**[0–5s] Hook** — One sentence. Shocking claim, open question, or incomplete truth. The viewer must feel they'll miss something critical if they scroll. Never answer the hook in the hook. Structure: "X kura — jo koi bhandaina / jo timi sochcha hoina"

**[5–15s] Tension Escalation** — Deepen why this matters to them personally. Use "timi" (Nepali) or "aap/tumhara" (Hindi). Introduce the stakes. What happens if they don't know this?

**[15–45s] The Revelation** — 2–3 specific, concrete facts or insights. Use real names, real places, real numbers. Each point must re-hook before moving to the next. Nepal/India specific examples always outperform generic ones.

**[45–70s] The Meaning Shift** — Why does this change how they see the world or themselves? The "aha" moment. Emotional payoff. Should make the viewer feel: smarter, safer, prouder, or seen.

**[70–80s] CTA Closer** — Follow for content like this / save this video / share with someone who needs this. Examples:
- "Follow garnus — yo channel le tyo kura bataxa jo media le lukaaucha"
- "Yo video save garnus — 6 mahina pachi yaad auxa"
- "Yo kura आफ्नो साथीलाई share garnus jalle thaha chaina"

**Script writing rules:** Max 10 words per sentence. Always active voice. Every sentence must earn its place. Mix short punchy sentences with one longer one for rhythm. Use conversational contractions natural to spoken Nepali/Hindi.

---

## Script JSON Format

Claude returns this structure for every video. The pipeline depends on this exact shape:

```json
{
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
  "hashtags": ["#nepal", "#viral", "..."],
  "thumbnail_text": "3-5 word bold text for thumbnail in Nepali or Hindi"
}
```

7–10 scenes, each 6–10 seconds, totalling 70–85 seconds. Visual keywords must always be in English even when the script is in Nepali — Pexels search is English-only.

**Claude model to use:** claude-haiku-3-20240307 — cheapest, fast, and excellent at creative script tasks. Not Sonnet or Opus — those are 25x more expensive and unnecessary here.

---

## Voice Generation

**Primary: Google Cloud TTS** or Elevan labs  — the only provider with proper Nepali (ne-NP) voice support.

Available voices:
- `ne-NP-Standard-A` — Nepali Female — warm, cultural
- `ne-NP-Standard-B` — Nepali Male — authoritative
- `hi-IN-Neural2-C` — Hindi Male Neural — confident news anchor (best quality)
- `hi-IN-Neural2-D` — Hindi Female Neural — warm narrator
- `hi-IN-Wavenet-B` — Hindi Male Wavenet — documentary feel

Voice selection logic:
- Nepali niche → `ne-NP-Standard-B` (male default) or `ne-NP-Standard-A` (female)
- Hindi niche → `hi-IN-Neural2-C` (male default) or `hi-IN-Neural2-D` (female)
- User can override per video in the UI
- Speaking rate: 0.90 (slightly slower for Devanagari clarity)

**Fallback: edge-tts** (free, no API key, runs as Python library)
- Nepali fallback: `ne-NP-HemkalaNeural`
- Hindi fallback: `hi-IN-SwaraNeural`

Cost: Google TTS is ~$4/million characters. At 2 videos/day (~800 chars each), that's ~$0.19/month.

---

## Visual Pipeline

For each scene in the script:

1. Take the `visual_keyword` field (always English)
2. Append niche visual theme modifier to keyword (e.g. "dark", "warm", "ancient")
3. Search Pexels Videos API — `orientation=portrait` for vertical 9:16 video
4. Pick the first result with duration ≥ scene's `duration_seconds`
5. Download SD quality (720×1280) to save bandwidth
6. If nothing useful comes back → fall back to Stable Diffusion image via Replicate, then apply FFmpeg zoom-pan to create motion
7. Apply the niche-specific FFmpeg color grade to the clip

**Pexels is free** — just needs an API key from pexels.com/api. For Nepal/India cultural niches, include location-specific terms in search: "nepal temple ancient", "kathmandu streets", "himalaya mountain snow", "india street market", "monsoon rain asia".

---

## Video Rendering (FFmpeg)

**Output spec:** 1080×1920 (9:16 vertical), libx264, CRF 23, yuv420p, AAC 192k audio, 30fps. Final file ~40–60MB.

**Render steps:**

Step 1 — Per scene: scale and crop the clip to 1080×1920. Apply subtle zoompan (zoom increases 0.0008 per frame up to 1.2x maximum — this is what prevents platform bans for "static content"). Apply niche color grade.

Step 2 — Concat all processed scene clips into one silent video.

Step 3 — Final pass: mix in voiceover audio, burn ASS subtitle captions, export with `-movflags +faststart` for streaming.

**Caption specification (ASS subtitle format):**
- Font: Noto Sans Devanagari Bold — the only font that renders Nepali/Hindi Unicode correctly in FFmpeg
- Install on render server: `apt-get install fonts-noto-core fonts-noto-extra`
- Size: 80px
- Position: bottom center, 10% safe zone from bottom
- Max 3 words per caption group (TikTok-style)
- Pop-on animation: each word appears at 120% scale, settles to 100% in 0.08 seconds
- Color: niche-specific hex color
- Outline: 4px black stroke (readability on any background)
- Shadow: 2px drop shadow at 50% opacity

---

## Color Grades Per Niche

Each niche gets an FFmpeg video filter applied to every clip to set the visual mood:

- **power-control:** High contrast, desaturated, heavy dark vignette — cold and shadowy
- **love-attraction:** Warm red/blue curve boost, saturation lift — golden and romantic
- **money-wealth:** High contrast, gold tint, desaturated — sharp and wealth-coded
- **untold-history:** Sepia color matrix, slight underexposure — aged and documentary
- **dark-psychology:** Very high contrast, heavily desaturated, strong vignette — noir
- **culture-identity:** Warm curves, saturation boost, slight brightness lift — rich and proud
- **fear-danger:** Highest contrast, desaturated, heavy vignette — harsh and alarming
- **mystery-conspiracy:** Very low saturation, very dark, heavy vignette — eerie and classified
- **conflict-competition:** High contrast, punchy saturation — aggressive and competitive
- **happiness-meaning:** Warm highlights lifted, saturation and brightness up slightly — soft and hopeful
- **economic-anxiety:** Moderate contrast, slightly desaturated — real and unglamorous
- **biography-power:** Cinematic contrast, dark vignette — prestige and gravitas
- **hidden-knowledge:** Moderate contrast, half-desaturated, vignette — academic and serious
- **social-psychology:** Mild contrast, slight saturation lift — relatable and observational
- **stoicism-wisdom:** Lifted shadows, slightly desaturated, warm — calm and ancient

---

## Publishing to Each Platform

**Facebook Reels (Meta Graph API):**
1. Initialize reel upload on the Page — get video_id and upload_url
2. Upload video binary to upload_url with file size header
3. Finish publish — set `video_state: PUBLISHED` with description and access token

**Instagram Reels (Instagram Graph API):**
1. Upload video to object storage first — Instagram needs a public URL
2. Create media container on the IG user account — `media_type: REELS` with the public video URL and caption
3. Poll the container status every 10 seconds until it says FINISHED (Instagram processing takes 1–3 minutes)
4. Publish the container via `/media_publish`

**TikTok (Content Posting API):**
1. Query creator info — confirms allowed video durations for this account
2. Initialize upload — get publish_id and upload_url, declare file size and chunk count
3. Upload video in 10MB chunks with Content-Range headers
4. Poll publish status until confirmed

**YouTube Shorts (YouTube Data API v3):**
1. Resumable upload to the videos endpoint
2. Set snippet: title (max 100 chars), description with `#Shorts #Nepal #Viral`, tags array, `categoryId: "22"`, `defaultLanguage: "ne"`
3. Set status: `privacyStatus: public`, `selfDeclaredMadeForKids: false`
4. Upload in 10MB chunks

After each publish, save the platform post ID and public URL to the PublishedVideo record.

---

## Data Model

**User** — Team members. Fields: email, hashed password, name, role (admin or editor).

**ConnectedAccount** — Social platform OAuth tokens. One row per platform (TikTok, Instagram, YouTube, Facebook). Stores: access token, refresh token, expiry datetime, account handle, active/inactive flag.

**Niche** — The 15 content niches. Seeded at setup, editable in settings. Stores: slug, English name, Nepali name, emoji icon, language, psychological trigger description, Pexels keywords array, caption hex color, voice tone description, default voice ID, Claude system prompt (full text, stored as DB field so it's tunable without redeployment), 3 example hooks, active flag, sort order.

**Video** — Every video generated. Tracks the full lifecycle via status field. Stores: which niche, who created it, the full script JSON, audio file path, video file path, thumbnail path, duration, current status, error message if failed, render start and end timestamps.

Video statuses: `PENDING → SCRIPTING → VOICING → FETCHING_VISUALS → RENDERING → READY → PUBLISHING → PUBLISHED` (or `FAILED` at any step with error message).

**PublishedVideo** — One row per platform a video is posted to. Stores: platform, post ID, public URL, publish datetime, views count, likes count, comments count, last metrics refresh time.

**ScheduledVideo** — Future-dated publish jobs. Stores: target datetime, which platforms (array), status (waiting / published / cancelled / failed).

**TopicIdea** — AI-suggested topics per niche. Stores: niche, title, hook preview, language, trending score, whether it's been used.

---

## Environment Variables Needed

```
NEXTAUTH_SECRET
NEXTAUTH_URL
DATABASE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
REDIS_URL                         (for Python workers)
ANTHROPIC_API_KEY
GOOGLE_APPLICATION_CREDENTIALS    (path to service account JSON)
GOOGLE_CLOUD_PROJECT_ID
PEXELS_API_KEY                    (free at pexels.com/api)
REPLICATE_API_TOKEN               (for AI image fallback)
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_ENDPOINT
CLOUDFLARE_R2_PUBLIC_URL          (public bucket URL — needed for Instagram/TikTok)
META_APP_ID
META_APP_SECRET
FB_PAGE_ACCESS_TOKEN
FB_PAGE_ID
INSTAGRAM_ACCOUNT_ID
TIKTOK_CLIENT_KEY
TIKTOK_CLIENT_SECRET
TIKTOK_ACCESS_TOKEN
TIKTOK_REFRESH_TOKEN
YOUTUBE_CLIENT_ID
YOUTUBE_CLIENT_SECRET
YOUTUBE_REFRESH_TOKEN
VIDEO_TEMP_DIR                    (/tmp/storyforge — where FFmpeg works)
VIDEO_OUTPUT_DIR                  (/app/outputs)
DEFAULT_VISUAL_STYLE              (PEXELS)
DEFAULT_LANGUAGE                  (nepali)
AUTO_PUBLISH_SCHEDULE             (cron for auto-publish — 8am, 1pm, 7pm NPT)
METRICS_REFRESH_SCHEDULE          (cron for daily metrics sync)
MAX_CONCURRENT_RENDERS            (2)
```

---

## UI — What the Team Sees

### Home Page — Niche Grid
Top stats row: Videos Today / Total Published / Total Views / Queue Depth.

Main content: "Choose Your Niche" — 3-column responsive grid of 15 niche cards. Each card shows: large emoji icon, niche name in English + Nepali script, one example hook (italic, truncated to 2 lines), language badge (🇳🇵 NE / 🇮🇳 HI), and a "Create Video" button that opens the generation wizard.

Below the grid: Recent Videos — last 6 videos as a horizontal scroll row with thumbnail and status badge.

### Generation Wizard — 5 Steps

**Step 1 — Niche:** Grid of 15 cards, selected one highlighted. Skipped if coming from a niche card.

**Step 2 — Topic:** Two sections. Top: 5 AI-suggested topic chips (click to select, with a Reshuffle button to get 5 new ones). Bottom: free text input "Type your topic here..." with language toggle (Nepali / Hindi / Mixed).

**Step 3 — Voice:** Cards for each voice option with a Play Sample button. Options: Nepali Male (authoritative), Nepali Female (warm), Hindi Male (news anchor), Hindi Female (storyteller).

**Step 4 — Visuals:** Three options: Pexels Stock Video (recommended — free, no ban risk), AI Generated + Motion (slower, costs credits), Mixed (Pexels first, AI fallback). Brief explanation under each.

**Step 5 — Confirm & Generate:** Summary card showing all selections. Estimated cost shown in NPR/INR. Generate button. After clicking, a live progress tracker appears showing each pipeline step checking off in real time. Polls `/api/videos/{id}/status` every 3 seconds.

### Video Queue Page
Filters by status (All / Ready / Published / Failed), niche, and language. Sort by newest first.

Table: Thumbnail, Title, Niche, Language, Duration, Status badge, Created date, Actions. Status badges: Scripting (blue) / Rendering (yellow) / Ready (green) / Published (checkmark) / Failed (red).

Bulk actions: Publish Selected, Delete Selected.

### Video Detail Page
Left panel (60%): Video player in 9:16 ratio, scrollable script viewer in Devanagari font, buttons to regenerate script / audio / video individually.

Right panel (40%): Platform toggles for each of the 4 platforms. Editable title, caption, and hashtag chips per platform (pre-filled by Claude, user can edit). Publish Now button and Schedule button (with datetime picker). Below that: published status per platform with post URL and live metrics if already published.

### Connections Page
2×2 grid of platform cards. Each card: platform logo, connection status (Connected with @handle / Not Connected / Token Expiring in 3 days), Connect/Reconnect/Disconnect button, Test Connection button.

### Analytics Page
Date range selector (7 days / 30 days / All time).
- Row 1: Four stat cards — Total Published, Total Views, Best Performing Niche, Average Views per Video
- Row 2: Line chart — Views per day per platform (4 colored lines)
- Row 3: Two bar charts — Videos published per niche, and average views per niche (shows which niches outperform)
- Row 4: Publishing streak calendar heatmap

---



## APIs and Cost Breakdown

| Service | Purpose | Cost at 2 videos/day |
|---------|---------|----------------------|
| Claude Haiku | Script generation | ~$0.25/month |
| Google Cloud TTS | Nepali/Hindi voice | ~$0.20/month |
| Pexels Videos API | Stock footage | Free |
| Replicate (Stable Diffusion) | Image fallback only | ~$0.50/month worst case |
| FFmpeg | Video rendering | Free, self-hosted |
| PostgreSQL (Supabase free tier) | Database | Free |
| Redis (Upstash free tier) | Job queue | Free |
| Cloudflare R2 | Video/audio storage | ~$1–2/month |
| Meta Graph API | Facebook + Instagram | Free |
| TikTok Content Posting API | TikTok publish | Free |
| YouTube Data API v3 | YouTube publish | Free |
| **Total** | | **~$2–4/month** |

---

## Build Phases

**Phase 1 — Auth + Niche UI:** Users can log in. Home shows all 15 niche cards fetched from DB. Database seeded with all niche data and system prompts.

**Phase 2 — Script Generation:** Pick niche + topic → Claude generates script JSON → displayed in UI. Topics API also returns AI-suggested topic ideas per niche.

**Phase 3 — Voice Engine:** Script's `full_script` field → Google Cloud TTS → .mp3 saved to storage. edge-tts fallback wired up. Status updates as voice job runs.

**Phase 4 — Visual Pipeline:** For each scene, fetch Pexels vertical video clip by `visual_keyword`. Download and trim to scene duration. Replicate fallback for scenes where Pexels returns nothing useful.

**Phase 5 — FFmpeg Render:** Per-scene clips + audio + ASS captions → final 1080×1920 .mp4. Devanagari font confirmed working. User can preview the video.

**Phase 6 — Publishing:** Social OAuth connected in settings. Publish API calls for all 4 platforms. User picks platforms and clicks Publish. PublishedVideo records created with post URLs.

**Phase 7 — Scheduling + Automation:** Schedule future publishes via datetime picker. Background scheduler auto-generates at configured times (8am, 1pm, 7pm NPT). Daily metrics refresh pulls views/likes from each platform API and updates the analytics page.

---

## Critical Gotchas

**Devanagari font must be installed on the render server.** Run `apt-get install fonts-noto-core fonts-noto-extra` before FFmpeg ever runs. Without it, FFmpeg burns empty boxes where Nepali/Hindi text should be. This is the most common and most invisible failure.

**Zoompan on every clip prevents platform bans.** Even real video clips (not just images) get a subtle slow zoom — z increases 0.0008 per frame up to 1.2x max. This is what satisfies Facebook and YouTube's motion detection. Remove it and videos start getting flagged.

**Pexels keywords must always be in English.** Even when the script narration is entirely in Nepali, the `visual_keyword` in the scene JSON must be English. Pexels search is English-only.

**Instagram requires a public URL.** Unlike the other platforms, Instagram can't accept a direct file upload — the video must already be hosted at a public URL (Cloudflare R2 public bucket). Upload to storage first, then pass the URL to Instagram.

**Claude system prompts live in the database, not in code.** Each niche has its own system prompt stored as a DB field. This lets the team tune prompts and test new angles without touching code or redeploying.

**Video status updates at every pipeline step.** If a render fails at FETCHING_VISUALS, the team needs to know exactly where it failed and be able to retry from that step — not restart from scratch. Status + error message gets written to the Video record after every step.

**Social tokens expire.** Facebook and TikTok tokens especially. The Connections page must show expiry dates and surface a warning when a token is within 3 days of expiring. Stale tokens cause silent publish failures.

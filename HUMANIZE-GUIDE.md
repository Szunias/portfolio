# Humanization Guide: Briefing Document for Text Rewrite Agents

This guide is the single source of truth for rewriting all text on Igor Szuniewicz's game audio portfolio. Every agent must internalize these rules before touching any copy.

---

## Part 1: The Top 30 AI Red-Flag Words and Phrases (Search-and-Destroy List)

These words and phrases are statistically overrepresented in AI-generated text. Some appear 10x-200x more often in AI output than in human writing (per GPTZero frequency analysis). When you encounter them, replace or restructure.

### Tier 1: Kill on Sight (extreme AI signal)

| # | Word/Phrase | Why it flags | Replace with |
|---|------------|-------------|-------------|
| 1 | **delve / delve into** | ~15% of ChatGPT responses use it. Near-zero frequency in casual human writing. | dig into, look at, break down, explore (sparingly) |
| 2 | **tapestry** (metaphorical) | 8% of AI creative writing. Humans almost never use "tapestry of" outside textile discussions. | Drop entirely. Describe the actual thing. |
| 3 | **landscape** (metaphorical) | "In the ever-evolving landscape of..." is a meme-tier AI tell. | Drop. Just name the field or domain. |
| 4 | **multifaceted** | Vague catch-all that says nothing. | complex, layered -- or just describe the actual facets |
| 5 | **leverage** (verb) | Corporate jargon AI defaults to. | use, rely on, build on |
| 6 | **utilize** | Latinate inflation of "use". AI picks it 3x more than humans. | use |
| 7 | **foster** | AI-favorite for "encourage" or "grow". | build, grow, encourage, support |
| 8 | **craft / crafting** | "Crafting immersive experiences" is the #1 game audio AI cliche. | build, make, design, put together |
| 9 | **elevate** | Possibly the worst AI offender -- appears multiple times in single responses. | improve, push, strengthen, sharpen |
| 10 | **showcase** | 20x more common in AI than human text. | show, demonstrate, present -- or just show the thing |

### Tier 2: High Alert (strong AI signal when combined)

| # | Word/Phrase | Replace with |
|---|------------|-------------|
| 11 | **moreover / furthermore / additionally** | Cut. Start a new sentence with the actual point. |
| 12 | **it's worth noting that** | Cut entirely. If it's worth noting, just note it. |
| 13 | **plays a crucial/pivotal role** | matters, is central to, drives -- or rewrite to show WHY it matters |
| 14 | **in today's [X]** / **in today's fast-paced world** | Cut. The reader lives in today. |
| 15 | **at its core** | Cut or replace with "basically" / "really" |
| 16 | **embark on a journey** | start, begin, kick off -- or just describe what happens |
| 17 | **not just X, but Y** / **not only X, but also Y** | Wikipedia flags negation constructions as "the most prominent AI writing tell." Restructure: state Y directly. |
| 18 | **stands as a testament to** | shows, proves, is proof that |
| 19 | **beacon of** | Drop. |
| 20 | **realm of** | field, area, world -- or just name the thing |

### Tier 3: Caution (AI signal when overused or clustered)

| # | Word/Phrase | Replace with |
|---|------------|-------------|
| 21 | **comprehensive** | full, complete, thorough -- or drop if the content already shows comprehensiveness |
| 22 | **robust** | strong, solid, reliable |
| 23 | **seamless / seamlessly** | smooth, clean -- or describe what actually happens without friction |
| 24 | **innovative / innovation** | new, original, unusual -- or describe what's actually new about it |
| 25 | **cutting-edge / groundbreaking** | new, recent, first-of-its-kind -- or just describe the tech |
| 26 | **resonate / resonates with** | connects, hits, lands -- or describe the actual emotional effect |
| 27 | **underscore** | highlight, stress, show |
| 28 | **navigate / navigating** | handle, deal with, work through, figure out |
| 29 | **pivotal** | key, important, turning-point |
| 30 | **encompasses** | covers, includes, spans |

### Quick-Reference: Phrases to Search-and-Destroy Across All Files

These exact phrases should never appear in the final copy:

```
"it's worth noting"
"it's important to note"
"plays a crucial role"
"plays a pivotal role"
"in today's digital age"
"in today's fast-paced"
"in the ever-evolving"
"at the forefront of"
"stands as a testament"
"no discussion would be complete without"
"whether it's X, Y, or Z"
"from X to Y"  (when used to show range/comprehensiveness)
"not just X, but Y"
"not only X, but also Y"
"at its core"
"a sense of"
"exploring the intersection of"
"crafting immersive experiences"
"pushing the boundaries"
"I'm passionate about"
```

---

## Part 2: AI Structural Patterns to Eliminate

These are not about individual words but about how the text is organized. They are harder to spot but equally important.

### 2.1 Uniform Sentence Length

**The problem:** AI produces sentences averaging 15-25 words with almost no variation. Human writing "bursts" between 4-word punches and 35-word sprawls.

**Detection:** Read the paragraph aloud. If every sentence feels the same length, it's AI.

**Fix:** After writing a paragraph, deliberately break one sentence into a 3-6 word fragment. Then let one sentence run longer than feels comfortable.

**Before (AI):**
> The audio system was designed to respond to player actions in real time. It monitors multiple parameters to determine the appropriate sound response. The system uses RTPC values to blend between different audio states. This creates a dynamic experience that adapts to gameplay.

**After (human):**
> The audio system watches what the player does and reacts. Simple as that. It tracks RTPC values -- health, distance, aggression -- and blends between audio states on the fly, so the mix never sounds the same twice. When you're low on health and an enemy is close, the mix knows before you do.

### 2.2 The Rule of Three (Every Time)

**The problem:** AI defaults to three-item lists in almost every sentence ("X, Y, and Z"). After a few paragraphs, the pattern becomes rhythmically obvious.

**Fix:** Use two items. Use four. Use one. Break the pattern.

**Before (AI):**
> The project required creativity, technical skill, and attention to detail. I focused on recording, editing, and implementing sounds. The result was immersive, dynamic, and responsive.

**After (human):**
> The project needed both technical chops and an ear for what feels right. I recorded everything myself, edited in Reaper, then fought with Wwise until the implementation worked. The result? Players told us the audio made them flinch.

### 2.3 Parallel Structure Overuse

**The problem:** AI writes sentences with identical grammatical structure back-to-back. It loves correlative conjunctions ("not only...but also", "whether...or") and symmetrical constructions.

**Fix:** Deliberately break symmetry. Let one clause be longer than its pair. Start consecutive sentences differently.

**Before (AI):**
> Not only does the system handle dynamic mixing, but it also manages spatial audio. Whether players are in a large cavern or a tight corridor, the audio adapts. From ambient textures to combat stingers, every sound responds to context.

**After (human):**
> The system handles dynamic mixing and spatial audio in the same pipeline. In a cavern, reverb opens up. Tight corridor? It clamps down. Ambiences, stingers, footsteps -- they all read the room.

### 2.4 Formulaic Paragraph Structure

**The problem:** AI follows topic-sentence -> supporting-evidence -> summary in every paragraph. The summary often restates the topic sentence.

**Fix:** Don't summarize what you just said. End on the most interesting detail, not a restatement.

**Before (AI):**
> I designed the audio system to operate within strict memory constraints. The game was targeting mobile platforms, which meant a budget of only 50MB for all audio assets. By using procedural generation and intelligent streaming, I reduced the total footprint from 200MB to 48MB. This approach ensured the audio system operated efficiently within the platform's memory limitations.

**After (human):**
> Mobile meant 50MB for all audio. The first build was 200MB. I switched to procedural generation for ambiences and set up aggressive streaming for everything else. Final size: 48MB. That left 2MB of headroom, which we used for a reverb bus I fought to keep.

### 2.5 Em Dash Overuse

**The problem:** GPT-4 and later models use em dashes at 10x the rate of GPT-3.5 and roughly 2-3x human frequency. AI uses them every 50-80 words; humans use them once per 500 words on average. They have become the single most recognizable AI punctuation fingerprint.

**Fix:** Maximum one em dash per 500 words. Replace most with commas, periods, parentheses, or nothing. When you do use one, it should feel deliberate.

**Before (AI):**
> The mix needed to support four players simultaneously -- each with their own audio context -- while maintaining clarity across all channels. The solution -- a priority-based ducking system -- reduced voice count from 64 to 32 -- cutting CPU usage in half.

**After (human):**
> Four players, each with their own audio context, and the mix still had to stay clear. I built a priority-based ducking system that cut voice count from 64 to 32. CPU usage dropped by half.

### 2.6 Colon-Before-List Construction

**The problem:** AI consistently introduces lists with a colon and a formatted structure. Humans do this sometimes; AI does it compulsively.

**Fix:** Work list items into flowing sentences. Use colons only when the list is genuinely better as a list (e.g., a stats grid or tools section).

### 2.7 Transition Word Padding

**The problem:** "Furthermore," "Moreover," "Additionally," "However," "Consequently" appear at 3-5x human rates in AI text. They pad word count without adding meaning.

**Fix:** Cut the transition word. Start with the actual point. If the logical connection is unclear without the transition, rewrite for clarity.

**Before:** "Furthermore, the system also supports 3D spatialization."
**After:** "It also does 3D spatialization."

Even better: "3D spatialization runs on top of the same bus."

### 2.8 The Treadmill Effect

**The problem:** AI circles the same idea without adding new information. A 500-word section might contain 100 words of actual content and 400 words of restatement.

**Fix:** After writing a section, count the distinct facts or ideas. If you have fewer than one new idea per sentence, cut until you do.

### 2.9 Motivational Poster Tone

**The problem:** AI maintains relentless positivity. Every challenge becomes an opportunity. Every constraint becomes "an exciting limitation." Nothing goes wrong, nothing is frustrating, nothing is genuinely hard.

**Fix:** Be honest about what was hard and what sucked. "The first prototype sounded terrible" is more credible and interesting than "this presented an exciting opportunity to iterate."

### 2.10 Over-Explanation of Obvious Things

**The problem:** AI explains what Wwise is, defines "sound design," and tells the reader that "audio is an important part of games." This happens because AI cannot gauge what the audience already knows.

**Fix:** Assume the reader is an audio director or game developer. They know what Wwise is. They know audio matters. Skip the definitions and get to the interesting part.

---

## Part 3: 20 Human Writing Patterns to Inject

These are specific techniques that make text read as unmistakably human. Inject at least 3-5 per project description.

### Category A: Voice and Rhythm

| # | Pattern | How to apply | Example |
|---|---------|-------------|---------|
| 1 | **Short punchy sentences** | Drop a 2-6 word sentence after a long one. Breaks the AI rhythm. | "That took three weeks." / "It worked." / "Nobody noticed." |
| 2 | **Sentence fragments** | Intentional incomplete sentences. AI almost never does this. | "Not perfect, but shipped." / "Tight deadline. Tighter budget." |
| 3 | **Contractions everywhere** | Use "I'm", "it's", "can't", "didn't", "wouldn't", "we're" instead of full forms. AI avoids contractions. | "I didn't have time to..." not "I did not have time to..." |
| 4 | **Questions to the reader** | Break the monologue. AI rarely asks questions mid-paragraph. | "How do you mix four players without it turning to mud?" |
| 5 | **Varied paragraph length** | One paragraph can be a single sentence. The next can be five sentences. Asymmetry is human. | See the before/after examples throughout this guide. |

### Category B: Specificity and Sensory Detail

| # | Pattern | How to apply | Example |
|---|---------|-------------|---------|
| 6 | **Exact numbers over vague claims** | "45ms latency" not "low latency". "200+ foley samples" not "extensive foley work". | "The detection runs at 45ms with 92% accuracy on a 2019 MacBook." |
| 7 | **Named tools, versions, settings** | "Wwise 2023.1" not "audio middleware". "Reaper 7 with ReaEQ" not "DAW software". | Specifics prove you actually used the tool. |
| 8 | **Sensory descriptions of sound** | Don't say "the audio was immersive." Describe what it sounds like. | "The footsteps crunch differently on gravel vs. wood. You can hear the weight shift." |
| 9 | **Before/after states** | Describe what something was like before you fixed it and after. | "Before: 160MB of uncompressed WAVs. After: 2MB of procedural MetaSounds." |
| 10 | **Physical-world references** | Ground abstract concepts in physical reality. | "I recorded myself dragging a chair across concrete for the golem footsteps." |

### Category C: Honesty and Personal Stakes

| # | Pattern | How to apply | Example |
|---|---------|-------------|---------|
| 11 | **Admitting what was hard** | AI never says "I struggled with this." Humans do. | "The first three mixes were terrible. Too much reverb, not enough presence." |
| 12 | **Constraints as context** | State the constraint first, then the solution. | "Solo audio designer. Eight-week deadline. No budget for libraries." |
| 13 | **Things that went wrong** | Mention a problem, a failed approach, a bug. This is proof of real experience. | "The Wwise event system was leaking voices. Took two days to track down." |
| 14 | **Credit to collaborators** | Mention specific people or roles you worked with. AI writes as a lone genius. | "The programmer set up the Blueprint hooks; I built the audio logic on top." |
| 15 | **Personal opinion** | State a preference, a belief, a judgment. AI hedges; humans pick sides. | "FMOD was the right call for this project. Wwise would have been overkill." |

### Category D: Structural Humanity

| # | Pattern | How to apply | Example |
|---|---------|-------------|---------|
| 16 | **Starting sentences differently** | Vary the first word. Don't start three sentences in a row with "The" or "I". | Start with a verb, a number, a question, an object. |
| 17 | **Parenthetical asides** | Add (brief tangents) in parentheses. AI uses em dashes; humans use parentheses for asides. | "The mix had to support 32 voices (though we rarely hit that limit in practice)." |
| 18 | **Interrupting yourself** | Change direction mid-paragraph. | "I was going to use convolution reverb, but the CPU budget said no. Algorithmic reverb it was." |
| 19 | **Casual connectors** | Use "anyway", "so", "turns out", "thing is" instead of "furthermore" and "moreover". | "Turns out, the attenuation curve was wrong the whole time." |
| 20 | **Ending on a concrete detail, not a summary** | The last sentence of a section should be the most interesting specific, not a restatement of the first sentence. | End with "Final build: 48MB, 32 voices, zero audio bugs at ship" not "This approach demonstrated the effectiveness of the optimization strategy." |

---

## Part 4: 10 Portfolio-Specific Rules

These rules apply specifically to game audio portfolio project descriptions.

### Rule 1: Lead with the Problem, Not the Project

**Wrong:** "Shadow Frames is a psychological horror game where I did the audio."
**Right:** "Horror game where the player has no weapons. Audio is the only way to detect threats."

The hook is the constraint or the unique angle, not the title.

### Rule 2: Your Role Must Be Exact

**Wrong:** "Audio Designer"
**Right:** "Solo audio designer -- sound design, implementation, mix. 10-person team, 3-month timeline."

Audio Director, Technical Sound Designer, Composer, Sound Designer, Audio Programmer -- these are different jobs. Say which one you did.

### Rule 3: Every Claim Needs a Number

**Wrong:** "I optimized the audio pipeline."
**Right:** "I cut the audio footprint from 160MB to 2MB using procedural MetaSounds."

Numbers that matter in game audio: voice count, memory budget (MB), latency (ms), event count, sample count, mix bus count, file size reduction percentage, deadline length, team size.

### Rule 4: Name Your Tools With Authority

**Wrong:** "I used middleware for audio implementation."
**Right:** "Wwise 2023.1, integrated with UE5 via the Audiokinetic plugin. Events triggered through Blueprints and C++ delegates."

Recruiters and audio directors scan for specific tool names. They want to know you're fluent, not just "aware."

### Rule 5: Show the Signal Chain

Where does the sound start? Where does it end up? Describe the path.

"Recorded foley in my apartment using an SM57 -> processed in Reaper with ReaEQ and ReaComp -> batch exported to Wwise -> organized into random containers with pitch variation -> triggered by Blueprint overlap events -> mixed through a distance-attenuated bus with sidechain ducking from dialogue."

This proves you understand the full pipeline, not just one step.

### Rule 6: Challenge-Solution Pairs Are the Core Content

The most valuable content in any project description is: "X was hard because Y. I solved it by doing Z. The result was W."

**Example:**
> Four-player split screen meant four separate listener positions. Running 4x spatial audio would have killed the CPU budget. I built a priority system: only the two nearest players get full 3D audio. The other two get a simplified stereo downmix. Players never noticed the difference, and CPU usage dropped 40%.

### Rule 7: Don't Explain What the Reader Already Knows

Do not define Wwise, FMOD, MetaSounds, reverb, spatialization, or any standard game audio concept. Your reader is a hiring manager or audio director. They know.

**Wrong:** "Wwise is an audio middleware solution that enables interactive sound design for games."
**Right:** (just use "Wwise" without explanation)

### Rule 8: Make Audio Audible in Text

Audio is invisible. Your job is to make the reader "hear" the sound through your description.

**Wrong:** "I designed immersive ambient audio."
**Right:** "The forest ambience layers three beds: wind through pine needles (high shelf EQ for presence), distant bird calls (randomized from a pool of 12), and a low-frequency drone that fades in when enemies are within 30 meters."

### Rule 9: Connect Audio to Player Experience

Don't describe sounds in isolation. Explain what the player hears and how it changes their behavior.

**Wrong:** "I created sound effects for enemy footsteps."
**Right:** "Enemies get louder as they approach. Players learned to judge distance by ear alone -- the audio is the early warning system because there are no UI markers."

### Rule 10: Front-Load the Impressive Thing

The first sentence of any project description should be the most interesting fact. Don't warm up. Don't introduce. Hit hard.

**Wrong:** "This project was a 3D puzzle game that I worked on during a game jam in 2024."
**Right:** "Built the entire audio system in 48 hours during a game jam. 70 events, 3 adaptive music states, shipped on time."

---

## Part 5: 5 Polish-Specific Rules

These rules apply to the PL translations.

### Rule PL-1: Keep Technical Terms in English

Polish gamedev and audio communities use English technical terms daily. Translating them sounds forced and confusing.

**Keep in English:** Wwise, FMOD, MetaSounds, RTPC, SVM, FFT, reverb, delay, sidechain, ducking, bus, event, Blueprint, DataAsset, voice count, sound design, middleware, mix, mastering, foley, DAW, plugin, panning, attenuation, randomizer, trigger, spawn

**Do NOT translate:** "sound design" -> ~~"projektowanie dzwieku"~~ (nobody says this in Polish gamedev)

**Exception:** If a Polish term is genuinely more natural in context (like "implementacja" for "implementation"), use it. The test: would a Polish game audio person say this word out loud to a colleague? If yes, use it.

### Rule PL-2: Use Natural Conversational Polish, Not Textbook Polish

Polish web copy should read like how a young professional talks, not like a formal letter or academic paper. Use the informal register.

**Stiff/formal:** "Niniejszy projekt stanowi przyklad zastosowania zaawansowanych technik dzwiekowych."
**Natural:** "W tym projekcie postawilem na proceduralne dzwieki zamiast sampli -- i dzieki temu zmiescilismy sie w 50MB."

Characteristics of natural Polish web copy:
- Shorter sentences than formal Polish
- Conversational particles are OK (no wiec, w sumie, tak naprawde) in moderation
- First person, active voice ("zrobilem", "zbudowalem", not "zostalo wykonane")
- Contractions and colloquial forms where they feel natural

### Rule PL-3: Don't Over-Translate Idioms

English idioms should be adapted to Polish equivalents, not translated literally. But if there's no natural Polish equivalent, rephrase the idea instead of forcing an awkward calque.

**Wrong:** "To nie jest rocket science" (literal English idiom in Polish)
**Better:** "To nie jest takie trudne, jak moze sie wydawac"
**Best:** "To prostsze niz wyglada"

### Rule PL-4: Match the EN Tone, Not the EN Words

PL is a translation of the information and confidence level, not a word-for-word rendering. Polish naturally uses different sentence structures. Let it.

**EN:** "Built the entire audio system in 48 hours."
**Bad PL:** "Zbudowalem caly system audio w 48 godzin." (grammatically fine but feels like a direct calque)
**Better PL:** "Caly system dzwiekowy postawiony w 48 godzin." (more natural Polish phrasing, drops the pronoun because Polish allows it)

Polish drops pronouns more than English. Polish uses impersonal constructions naturally. Don't force "I did X" structure when "X was done" (with clear context that it was the author) sounds more natural in Polish.

### Rule PL-5: Avoid AI-Translated Polish Tells

AI-generated Polish has its own red flags:
- Overuse of "jest" (is) as a copula where Polish would normally omit it
- Overly long sentences that follow English clause structure
- Missing or wrong diacritics (a, e, s, c, z, o, l, n, z) -- double-check every single one
- Stiff word order that mirrors English SVO instead of Polish flexible word order
- Using "w dzisiejszym swiecie" or "w dzisiejszych czasach" (Polish version of "in today's world")
- Overuse of "rowniez" (also/additionally) and "ponadto" (furthermore) as transition words

---

## Part 6: Before/After Master Examples

### Example 1: Project Hook

**AI version:**
> Shadow Frames is a captivating psychological horror game that showcases innovative audio design. The project delves into the intersection of audio and gameplay, crafting an immersive experience where sound plays a crucial role in the player's journey.

**Human version:**
> Horror game. No weapons. The player's only defense is listening. If you hear the static shift to your left, something is there. That's the entire design premise, and the audio had to sell it completely.

### Example 2: Technical Description

**AI version:**
> The audio system leverages a comprehensive approach to sound design, utilizing multiple layers of ambient textures alongside dynamic musical elements. Furthermore, the implementation showcases seamless integration with the game engine, fostering an immersive and responsive audio landscape.

**Human version:**
> Three ambient layers running at all times: wind bed, environmental detail (drips, creaks, distant rumbles), and a tension drone tied to the threat system via RTPC. Music crossfades between four stems based on player state. The whole thing runs on 32 voices max because we were targeting Switch as well.

### Example 3: Challenge-Solution

**AI version:**
> One of the notable challenges involved navigating the complexities of multi-platform audio optimization. By leveraging cutting-edge techniques and innovative approaches, I was able to transform the audio pipeline, resulting in a robust and scalable solution that elevated the overall experience.

**Human version:**
> Switch has about a third of the CPU headroom that PC does. The first build ran at 60 voices and pegged the audio thread. I rewrote the priority system to cap at 24 voices on Switch, with aggressive distance culling. Anything beyond 30 meters gets killed. Players didn't notice.

### Example 4: Role Description

**AI version:**
> As the dedicated audio professional for this project, I was responsible for all aspects of the audio pipeline, encompassing sound design, implementation, and mixing. This multifaceted role allowed me to craft a comprehensive audio experience.

**Human version:**
> Solo audio designer on a 10-person team. I did everything: foley recording, sound design, Wwise implementation, and the final mix. Three months, no audio budget, personal mic closet.

### Example 5: PL Translation

**AI-translated PL:**
> Projekt Shadow Frames stanowi przyklad innowacyjnego podejscia do projektowania dzwieku w grach. System audio wykorzystuje zaawansowane techniki, tworzac imersyjne doswiadczenie, ktore angazuje gracza na wielu poziomach.

**Natural PL:**
> Shadow Frames to horror, w ktorym gracz nie ma broni. Jedyna obrona to sluch. Jesli statyczny szum przesuwa sie na lewo, cos tam jest. Caly audio design krecil sie wokol tego jednego zalozenia.

---

## Part 7: Process Checklist for Each Text Rewrite

Use this checklist for every piece of text you rewrite:

### Before Writing
- [ ] Read the original text and list every concrete fact (numbers, tool names, dates, results)
- [ ] Identify the single most interesting/impressive thing
- [ ] Identify the constraint or problem

### While Writing
- [ ] Start with the most interesting fact
- [ ] Use first person, active voice, contractions
- [ ] Include at least one specific number in every paragraph
- [ ] Vary sentence length (include at least one fragment under 6 words per section)
- [ ] No more than one em dash per 500 words
- [ ] No transition words (furthermore, moreover, additionally, consequently)
- [ ] No phrases from the Search-and-Destroy list (Part 1)
- [ ] At least one honest admission or constraint mention per project
- [ ] End sections on a specific detail, not a summary

### After Writing
- [ ] Read aloud. Does any sentence sound like a press release? Rewrite it.
- [ ] Count the three-item lists ("X, Y, and Z"). If more than one per 300 words, break some.
- [ ] Check that no two consecutive sentences start with the same word
- [ ] Check that no paragraph restates its own first sentence at the end
- [ ] Confirm every claim has a number or specific detail backing it
- [ ] For PL: verify all diacritics, check that technical terms stayed in English, read aloud for naturalness

### Final Gut Check
Read the text and ask: "Could a hiring manager at Naughty Dog or DICE tell this was rewritten by AI?" If the answer is anything other than a confident "no," revise again.

---

## Appendix A: Replacement Reference Table

Quick lookup for the most common AI-to-human word swaps:

| AI word | Human alternatives |
|---------|-------------------|
| utilize | use |
| leverage | use, build on, rely on |
| implement | build, set up, wire up |
| comprehensive | full, complete, thorough |
| robust | strong, solid, reliable |
| seamless | smooth, clean, invisible |
| innovative | new, unusual, first |
| facilitate | help, enable, let |
| demonstrate | show, prove |
| subsequent | next, later, then |
| commence | start, begin, kick off |
| endeavor | try, attempt, effort |
| paramount | critical, top priority |
| optimal | best, ideal |
| encompasses | covers, includes, spans |
| elucidate | explain, clarify |
| aforementioned | (just name the thing again) |
| methodology | method, approach, process |
| numerous | many, several, a lot of |
| sufficient | enough |
| in order to | to |
| due to the fact that | because |
| in the event that | if |
| at this point in time | now |
| a significant number of | many |
| has the ability to | can |
| it is important to note | (cut entirely) |
| serves as | is |

## Appendix B: Sentence Starter Variety Bank

When you catch yourself starting too many sentences the same way, pull from this list:

**Numbers:** "48 hours." / "32 voices." / "Three layers."
**Questions:** "How do you mix four players?" / "What happens when the CPU budget runs out?"
**Objects first:** "The reverb bus was the last thing I added."
**Verbs first:** "Built it in Wwise." / "Recorded everything in my apartment." / "Shipped on time."
**Constraints first:** "No budget." / "Solo designer." / "Switch port."
**Results first:** "45ms. That's what we hit." / "Zero audio bugs at launch."
**Contrast:** "The first mix was terrible." / "Plan A failed."
**Casual connectors:** "Turns out..." / "Thing is..." / "So..." / "Anyway..."

## Appendix C: AI Structural Tells Quick Reference

These patterns are red flags even when the individual words are fine:

1. Every sentence is 15-25 words (no variation)
2. Every paragraph has exactly 3-4 sentences
3. Three-item lists in every other sentence
4. Every paragraph ends by restating its opening
5. Transition words at the start of every other paragraph
6. Em dashes every 50-80 words
7. "Not only X, but also Y" appears more than once
8. Every positive claim is hedged ("arguably", "potentially")
9. No short sentences (under 6 words) anywhere
10. No questions, fragments, or interruptions
11. Perfect parallel structure in every list
12. Every section has a neat intro and conclusion
13. No humor, self-deprecation, or honest failure
14. Colons introducing every list
15. Present participle phrases tacked onto sentence ends ("...showcasing the importance of...")

If your rewritten text has 3 or more of these, it will read as AI. Revise.

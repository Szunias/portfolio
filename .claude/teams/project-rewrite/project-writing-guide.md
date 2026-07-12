# Game Audio Portfolio Writing Guide
**For: Igor Szuniewicz's Portfolio**
**Context: Third-year game audio student (22), DAE Belgium**
**Problem: Project descriptions sound too corporate, not human**

---

## 1. Core Principles

### Write Like a Human, Not a Consultant
- **Short sentences**: 8-12 words average, 20 words max
- **Fragments are fine**: "Wood, tiles, concrete — you hear the difference."
- **First person always**: "I built", "I recorded", "I fixed" — never third person
- **Student tone**: Honest about learning. Don't pretend to be senior.

### Show, Don't Tell
- **Bad**: "Implemented comprehensive audio solutions"
- **Good**: "Built a footstep system that switches sounds based on what you're walking on"

### Explain Like You're Talking to Another Student
- Not documenting for a corporate wiki
- Not writing academic papers
- Explaining how you solved a problem to someone who gets it

---

## 2. Verb Bank

### GOOD Verbs (Use These)
Real actions that show what you did:

- **Recording/Creation**: built, recorded, mixed, layered, wrote, made, created
- **Technical Work**: fixed, hooked up, wired, plugged in, set up, coded, scripted
- **Iteration**: tweaked, tuned, adjusted, changed, automated
- **Problem-Solving**: tested, debugged, tried, figured out
- **Audio Mixing**: crossfaded, triggered, ducked, routed, blended

### BAD Verbs (BLACKLISTED)
Corporate jargon that makes you sound like a PowerPoint:

- ❌ **architected** → use "built" or "designed"
- ❌ **leveraged** → use "used"
- ❌ **implemented** → use "built", "made", or "added" (only use "implemented" when truly neutral)
- ❌ **spearheaded** → use "led" or "started"
- ❌ **optimized** → use "sped up", "made faster", or "cut down"
- ❌ **crafted** → use "made" or "built"
- ❌ **curated** → use "picked" or "chose"
- ❌ **orchestrated** → ONLY use when talking about actual music orchestration
- ❌ **utilized** → use "used"
- ❌ **facilitated** → use "helped" or "made it easier to"

---

## 3. Noun Blacklist

### BANNED Corporate Buzzwords
Do NOT use these unless quoting a tool name:

- ❌ **infrastructure** → use "setup" or "how it's built"
- ❌ **pipeline** → use "setup", "workflow", or "how it works"
- ❌ **architecture** → use "setup" or "structure"
- ❌ **framework** → use "system" or "structure"
- ❌ **paradigm** → just... don't
- ❌ **methodology** → use "approach" or "how I did it"
- ❌ **solution** → use "fix" or "what I built"
- ❌ **deliverable** → use "what I made" or the actual thing (audio file, system, etc.)
- ❌ **stakeholder** → use "team member", "designer", "programmer"
- ❌ **scalable** → describe what you mean ("easy to add more")
- ❌ **modular** (as buzzword) → say what you mean ("each part works separately")
- ❌ **granular** (as buzzword) → say what you mean ("detailed control")
- ❌ **holistic** → use "whole", "complete", or "all parts"
- ❌ **comprehensive** → use "complete" or just describe what's there

---

## 4. Technical Terms That Are Fine

These are REAL audio/game dev concepts, not jargon. Use them freely:

### Wwise Terms
- RTPC, Switch Container, Random Container, Event, SoundBank, State Group
- Blend Container, Work Unit, Game Sync, Attenuation

### Unreal Engine Terms
- MetaSounds, Sound Cue, Attenuation
- Blueprint, DataAsset, Delegate, Line Trace
- C++, Component, Actor, Widget

### FMOD Terms
- Event, Parameter, Snapshot, Bank

### Audio Tool Terms
- VST, AU, AAX (plugin formats)
- DAW, convolution reverb, multiband compression

### General Game Audio Terms
- Foley, ambience, diegetic, non-diegetic, spatial audio, HRTF, binaural
- Ducking, sidechain, crossfade, layer

**Key difference**: Technical terms describe REAL tools and techniques. Buzzwords try to make simple things sound complicated.

---

## 5. Before/After Examples
**Using ACTUAL text from the portfolio JSON files**

### Example 1: Titles

**BEFORE** (shadowFrames.json:107):
```
"Footstep System: Surface Detection & Audio Routing"
```

**AFTER**:
```
"How Footsteps Work"
or
"Footsteps — Different Surfaces, Different Sounds"
```

**Why**: Corporate subtitle format → conversational explanation

---

### Example 2: System Descriptions

**BEFORE** (shadowFrames.json:66):
```
"RTPC value (0-5) controls ambient layers in Wwise. More photos on the board =
higher tension. Breathing gets heavier, ambient drones intensify. Smooth crossfades,
no hard cuts."
```

**AFTER**:
```
"The more photos you collect, the worse everything sounds. Your character's breathing
gets heavier. The ambient drones get louder. I used RTPCs in Wwise to track how many
photos are on the board and blend between calm and stressed layers. No hard cuts —
Wwise handles the crossfades automatically."
```

**Why**: Added "I" to show agency, explained WHAT happens before HOW it works

---

### Example 3: Technical Implementation

**BEFORE** (shadowFrames.json:68):
```
"Each room has its own ambient layers that crossfade as you move. Bathroom has
spatialized toilet and faucet sounds. Footsteps change based on surface.
Wood, tiles, concrete."
```

**AFTER**:
```
"Walk into the bathroom and you hear the toilet dripping, the faucet running.
Step on wood, you get wood footsteps. Move to tiles, the sound switches. I set up
different ambient layers for each room in Wwise and used trigger volumes in Unreal
to detect where the player is."
```

**Why**: Starts with player experience, THEN explains the implementation

---

### Example 4: Challenges

**BEFORE** (shadowFrames.json:213):
```
"Multi-institutional student project had workflow problems. Wwise integration broke
after Perforce pulls. Unreal compilation took too long, causing downtime."
```

**AFTER**:
```
"Every time someone pulled from Perforce, Wwise broke. Asset paths disappeared.
Actors went silent. We'd lose 20 minutes fixing it manually. So I built a tool that
fixes the integration in one click."
```

**Why**: Specific problem → time wasted → specific solution

---

### Example 5: Good Example (Keep This Tone)

**ALREADY GOOD** (notTodayDarling.json:25):
```
"I didn't want the engines to sound like looped MP3s. I built a graph in MetaSounds
where the kart's pitch and rattle intensity change based on speed. You can hear the
difference when you drive from carpet to tiles—the sound reacts instantly."
```

**Why it works**:
- First person ("I didn't want", "I built")
- Honest motivation (didn't want looped MP3s)
- Specific technical detail (MetaSounds graph, pitch/rattle)
- Player experience (hear the difference, reacts instantly)

---

### Example 6: Role Description

**BEFORE** (shadowFrames.json:169):
```
"Audio Designer for this multi-institutional student project. I built the audio
architecture: dynamic footstep systems, delegate-based player audio, RTPC-driven
tension progression, and Wwise integration. Additional systems in development for
final release."
```

**AFTER**:
```
"Audio designer on a student horror game made by three schools. I wrote the C++ code
for footsteps, enemy presence, and anomaly detection. Set up all the Wwise integration.
Still adding more systems before we ship in December."
```

**Why**:
- "wrote the C++ code" > "built the audio architecture"
- "still adding more" > "additional systems in development"
- Specific timeline (December) shows it's real

---

### Example 7: Technical Explanation

**BEFORE** (shadowFrames.json:110):
```
"Physical Material is detected using Unreal's surface system. That gets mapped to a
Switch name. Blueprint Audio Manager gets the delegate and plays the right sound in Wwise."
```

**AFTER**:
```
"Line trace shoots down from the player's feet. Hits the floor. Checks what material
it is — wood, tiles, concrete. That material type gets sent to Wwise as a Switch.
Wwise picks the right footstep sound. All automatic."
```

**Why**: Step-by-step action sequence, not abstract process description

---

### Example 8: What/How/Why Format

**BEFORE** (shadowFrames.json:109-111):
```
"what": "C++ component does a line trace down from the player, checks the Physical
Material, and maps it to a Wwise Switch (Tiles, Wood, CreakyWood, Concrete)."

"how": "Physical Material is detected using Unreal's surface system. That gets
mapped to a Switch name. Blueprint Audio Manager gets the delegate and plays the
right sound in Wwise."

"why": "C++ handles detection, Blueprint handles audio. I can add new surfaces
without touching C++ code. Audio designer can change Switch names in Wwise without
code changes."
```

**AFTER**:
```
WHAT: Line trace shoots down from the player. Detects the Physical Material.
Maps it to a Wwise Switch — Tiles, Wood, CreakyWood, Concrete.

HOW: Physical Material is detected using Unreal's surface system. That gets mapped
to a Switch name. Blueprint Audio Manager gets the delegate and plays the right
sound in Wwise.

WHY: Clean separation. C++ handles detection, Blueprint handles audio. Add new
surfaces without touching C++. Audio designer can change Switch names in Wwise
without code changes.

RESULT: Every footstep matches the surface. Automatic. No manual work. Add a new
material in Wwise, it works.
```

**Why**:
- WHAT: Action-oriented ("shoots", "detects", "maps")
- HOW: Keep technical but clear
- WHY: Benefits, not philosophy
- Added RESULT: What actually happens

---

### Example 9: Project Overview

**BEFORE** (shadowFrames.json:52):
```
"You're trapped in a black-and-white 1960s Irish pub where reality is breaking down.
Anomalies appear every 30 to 50 seconds, and sound is your only tool for finding them.
Put on headphones and listen carefully. A glass clinks in the corner. Footsteps echo
from an empty hallway. A chair scrapes across the floor by itself."
```

**AFTER**:
```
Keep this! It's already good.
```

**Why it works**:
- Second person ("you're trapped") pulls reader in
- Specific details (30-50 seconds, black-and-white, 1960s)
- Sensory description (glass clinks, footsteps echo, chair scrapes)
- Stakes (sound is your ONLY tool)

---

### Example 10: Mixing Challenge

**BEFORE** (notTodayDarling.json:37):
```
"With 4 players crashing and screaming, important sounds got lost in the noise.
I set priorities: if you pick up an item, that sound ducks the collisions for a
split second. The 'Wall of Death' boxing bell and the woman's '3, 2, 1' countdown
cut through everything. Information always wins over noise."
```

**AFTER**:
```
Keep this! It's already great.
```

**Why it works**:
- Problem stated clearly (4 players = chaos)
- Specific solution (ducking, priorities)
- Memorable details (boxing bell, countdown)
- Design principle as punchline ("Information always wins over noise")

---

### Example 11: Tools and Workflow

**BEFORE** (shadowFrames.json:76-77):
```
"fixer_title": "Wwise Unreal Fixer"
"fixer_desc": "Custom C++ plugin that restores Wwise integration after Perforce pulls.
Runs automatically, no manual fixing needed."
```

**AFTER**:
```
"Wwise Unreal Fixer"
"Every Perforce pull broke Wwise. Asset paths disappeared. Actors went silent.
I built a C++ tool that fixes it automatically. One click, integration restored.
Saved the team 20 minutes every sync."
```

**Why**: Shows time saved, explains WHAT broke before HOW you fixed it

---

### Example 12: Metrics That Matter

**BEFORE** (shadowFrames.json:256):
```
"12+ C++ classes for audio systems, 8+ Blueprint audio managers, 200+ Wwise
events/switches/RTPCs, 5 location zones, 10 anomaly types."
```

**AFTER**:
```
"12 C++ classes, 8 Blueprint managers, over 200 Wwise events. 5 location zones,
10 types of anomalies. This is the biggest Wwise project I've done."
```

**Why**: Removed "+" (looks like padding), added personal context (biggest project)

---

## 6. Project Description Template

Each project page should flow like this:

### 1. What is this? (1-2 sentences)
What's the game/project? What genre? What's the core idea?

**Example**:
> "4-player shared-screen racing game. It's chaotic, loud, and ridiculous."

### 2. What did I do? (2-3 sentences)
Your specific role and main contributions. Use "I" statements.

**Example**:
> "Solo audio designer on a 6-person student team. I recorded all the sounds, picked
> the music, and built the MetaSounds engine system. We even voiced the grandmas ourselves."

### 3. How does it work? (Technical detail, told as explanation)
Explain ONE OR TWO key systems in detail. Not documentation — explanation.

**Example**:
> "I didn't want the engines to sound like looped MP3s. I built a graph in MetaSounds
> where the kart's pitch and rattle intensity change based on speed. You can hear the
> difference when you drive from carpet to tiles — the sound reacts instantly."

### 4. What was hard? (1-2 sentences)
Honest about challenges. Shows problem-solving.

**Example**:
> "With 4 players crashing at once, important sounds got lost. I set priorities:
> item pickups duck collision sounds. The countdown and boxing bell cut through everything."

### 5. What I learned (optional, 1 sentence)
Only if genuine. Don't force it.

**Example**:
> "This taught me that managing RAM is as important as managing mix headroom when
> you're designing for 4-player chaos."

---

## 7. Translation Notes (PL/NL)

### Polish (PL)
- **Casual "ja" form, not formal**: "Zrobiłem" not "Zaimplementowałem"
- **Technical terms stay in English**: "RTPC", "Switch Container", "MetaSounds"
- **Keep it conversational**: Like you're explaining to a classmate
- **Example**: "Zbudowałem system footstepów w C++" not "Zaimplementowałem kompleksową architekturę footstepów"

### Dutch (NL)
- **Casual "ik" form**: "Ik heb gemaakt" not "Ik heb geïmplementeerd"
- **Technical terms stay in English**: Same as PL
- **Direct and clear**: Dutch prefers clarity over formality
- **Example**: "Ik heb een footstep systeem gebouwd" not "Ik heb een uitgebreide footstep infrastructuur geïmplementeerd"

**Key principle**: The translations should feel like Igor talking, not like a translated technical document.

---

## 8. Specific Fixes Needed

Based on the portfolio files, here are the most common corporate patterns to fix:

### Pattern 1: Job Title Format
**Bad**: "Audio Designer & Technical Implementer"
**Good**: "Audio designer" or "Solo audio designer on a 6-person team"

### Pattern 2: System Names
**Bad**: "RTPC-Based Dynamic System"
**Good**: "Dynamic tension system" or "How tension builds"

### Pattern 3: Abstract Processes
**Bad**: "Physical Material is detected using Unreal's surface system"
**Good**: "Line trace hits the floor, checks the material"

### Pattern 4: Feature Lists
**Bad**: "dynamic footstep systems, delegate-based player audio, RTPC-driven tension progression"
**Good**: "footsteps that change per surface, player audio tied to camera actions, tension that builds as you collect photos"

### Pattern 5: Passive Construction
**Bad**: "Audio systems communicate through delegates"
**Good**: "I used delegates so the audio systems can talk to each other"

---

## 9. Quality Checklist

Before publishing a rewritten description, check:

- [ ] **First person**: Did you use "I", "we", "my"?
- [ ] **No buzzwords**: Ctrl+F for blacklisted words
- [ ] **Short sentences**: Average under 15 words?
- [ ] **Player experience first**: Does it start with WHAT happens, not HOW it works?
- [ ] **Specific details**: Real numbers, real examples, real tool names?
- [ ] **Honest tone**: Does it sound like a student, not a consultant?
- [ ] **Technical terms justified**: Is each technical term describing a REAL tool?
- [ ] **Active voice**: "I built" not "was built", "I fixed" not "was fixed"

---

## 10. Resources Used

This guide was informed by research into game audio portfolio best practices:

- [How to Build a Strong Game Audio Portfolio – A Sound Effect](https://www.asoundeffect.com/game-audio-portfolio-guide/)
- [Build your games portfolio - ScreenSkills](https://www.screenskills.com/starting-your-career/building-your-portfolio/build-your-games-portfolio/)
- [Creating Sound Design Portfolio Made Easy - Orita Sinclair](https://www.orita-sinclair.edu.sg/sound-design-portfolio/)
- [How To Make A Better Audio Portfolio - Transverse Audio](https://transverseaudio.com/posts/how-to-make-a-better-audio-portfolio)

**Key takeaways from research**:
1. Label everything — make your contributions clear
2. Keep it short (4-5 min reels, concise descriptions)
3. Provide context for each piece
4. Show your learning process for student work
5. Be honest if it's a redesign, not original work
6. Get feedback from the game audio community

---

## 11. Tone Reference: Good vs. Bad

### GOOD Examples from Current Portfolio

**From notTodayDarling.json:25**:
> "I didn't want the engines to sound like looped MP3s. I built a graph in MetaSounds
> where the kart's pitch and rattle intensity change based on speed."

**From notTodayDarling.json:41**:
> "The original boost sound caused lag with 4 players. I replaced it with a synth
> patch in MetaSounds—same impact, near-zero memory."

**What makes these good**:
- Personal motivation ("I didn't want")
- Specific problem (lag with 4 players)
- Concrete solution (replaced with synth patch)
- Measurable result (near-zero memory)

### BAD Patterns to Avoid

**Corporate Abstract**:
> "Implemented a comprehensive RTPC-based dynamic audio architecture that modulates
> ambient tension parameters in response to player progression metrics"

**Should be**:
> "The ambient sound changes based on what's happening in the game. More photos
> collected = more tense. I set up RTPCs in Wwise that track the game state and
> blend between calm and stressed ambient layers."

---

## 12. Final Notes

### Remember
- **You're a student** — it's fine to say "this is my first time using Wwise" or "I learned X while doing this"
- **Honesty > hype** — "This taught me that..." is better than "Successfully delivered..."
- **Show the journey** — problems you hit, how you fixed them, what you'd do differently
- **Specific > vague** — "Saved 20 minutes per sync" > "improved workflow efficiency"

### When in Doubt
Ask yourself:
1. Would I say this out loud to another student?
2. Does this explain WHAT I did, or just use big words?
3. Can I make this sentence shorter?
4. Am I using "I" and "we", or hiding behind passive voice?

If the answer to #1 is no, rewrite it.

---

**End of Guide**

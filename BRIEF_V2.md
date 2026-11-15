# Eiwaa landing page v2 — "the guided tour" (master brief for a Claude Code session)

You are a senior product designer + front-end engineer + sound designer. Build v2 of the landing page for
**إيواء (Eiwaa)**, an offline-first Android app that replaces Excel registers in displaced-persons camps in Gaza.
The page lives in this repo (`site/`, plain static files). **Pushing to `main` auto-deploys** to Cloudflare
(Worker "eiwaa"): https://eiwaa.bdalhmydalfra879.workers.dev

The owner reads Arabic only. Explain every decision to him in **short Arabic**. He is on Claude Pro with
**tight usage limits**: plan before building, never regenerate large files without need, commit after each working
step, keep messages short.

---

## 1. Read first (in this order, do not skim)
1. `site/index.html` (v1, live now): structure, tokens, copy, JS. Keep what works.
2. Repo `abood2596/eiwaa-system`, branch `marketing-screens`: `marketing/HANDOFF.md`, `marketing/STRATEGY.md`,
   `docs/DESIGN.md` (app visual identity), `docs/GLOSSARY.md` (approved wording). Do NOT change that repo's `main`.
3. Assets already in `site/`: `film1.mp4` (managers, vertical 9:16, 78 s, voice «Mohammad»), `film2.mp4`
   (organisations, 16:9, 86 s, voice «Mazen Lawand»), `img/poster.jpg`, `img/poster2.jpg`, 12 app screens
   `img/01…12-*.webp`, icons, `img/qr.svg`, IBM Plex Sans Arabic + Plex Mono in `fonts/`, `manifest.webmanifest`, `sw.js`.

## 2. Hard rules (owner decisions — breaking one = failure)
- No personal name, no phone number as text, anywhere. Contact = WhatsApp Business «إيواء» via `wa.me` button
  (number assembled in JS, never printed) + email `eiwaa.system@proton.me`. Footer «© إيواء».
- **No real figures** (no family/people counts). Never invent testimonials, logos, partners, prices or statistics.
  If proof is needed, leave a clearly marked placeholder and ask the owner.
- No gradients/spectrum colours, no purple, no emoji, no glassy AI look, no bento grids, no stock illustrations.
  Palette and type from `docs/DESIGN.md` (navy #0F2747, tarp #1D4E8F, paper #F3F0E8, stamp red/amber/green for state only).
- Arabic, RTL, short institutional wording per GLOSSARY (المخيم، المعاون، التحقق، الكشف، الاعتماد). **No English codes
  or jargon visible to visitors** (v1 shows SADD, QA, MATCH, ID-CHECK, OFFLINE — replace with Arabic).
- **No sound before a user gesture.** Captions always visible when audio plays. Mute/pause/skip always reachable.
- Gaza bandwidth: first load (HTML+CSS+JS+fonts+hero images) ≤ 350 KB; audio and video load only on demand;
  respect `navigator.connection.saveData` and `prefers-reduced-motion`.
- CSP in `site/_headers` stays strict (self only). No CDNs, no analytics, no external fonts, no frameworks.
  Vanilla HTML/CSS/JS. Keep it one page (+ small JS/CSS files if cleaner).

## 3. Red-team findings on v1 (fix all)
1. Visitors see English codes (A · F-047, OFFLINE, SADD, QA, MATCH, ROLES, MULTI) → Arabic labels.
2. Org path reuses the ID-check hero card → org hero needs its own demo: an "export log" card (serial 2026/031,
   org, rows, date) that animates a clean export being stamped «معتمد».
3. Trust gap for organisations: no "who is behind this", no documents. Add a calm block: «فريق إيواء» + email +
   «اطلبوا ملف حماية البيانات» (WhatsApp/email request; do not publish docs without owner approval).
4. Download trust gap: link goes to GitHub and Android warns "unknown apps". Add a 3-frame illustrated install
   guide (what the warning looks like, why it is safe: signed updates, the app only installs updates signed with
   the same key) and the file's approximate size in words («ملف صغير») — no MB in big type.
5. Mobile story carousel has no position indicator → add dots/progress and "1 / 5".
6. Before/after slider content is `aria-hidden` → add a visually-hidden text summary for screen readers.
7. Small grey text contrast (`--ink3`) was below AA → keep ≥ 4.5:1 for all body/small text.
8. Path switch is easy to miss on phones (small in header) → make the path choice the first decision of the tour
   (see §4) while keeping the header switch.
9. WhatsApp share preview: keep absolute `og:image`/`og:url` (fixed in v1.1); create a proper 1200×630 `og.jpg`
   (Arabic headline + phone screen, paper/navy, no gradient) and check it.
10. Films start cold (poster + play). Make them part of the story (see §4) instead of isolated blocks.

## 4. The concept: «جولة إيواء» — a narrated, interactive showcase
The page works in two modes from the same DOM:
- **Browse mode** (default, silent): a polished, scrollable page like v1 but tighter.
- **Tour mode** («ابدأ الجولة · دقيقتان بالصوت»): the page drives itself chapter by chapter; a calm Arabic voice
  narrates; the visitor is asked to *do* one small thing per chapter, and the narration reacts to what they did.

Tour flow (camp manager path; write the org path the same way with its own chapters):
0. **Choice**: full-screen navy card: «أنا مدير مخيم» / «أنا من مؤسسة». Each choice sets the voice:
   managers → the film-1 voice (Mohammad), organisations → the film-2 voice (Mazen Lawand), so the films and the tour
   sound like one brand.
1. **The problem** (5–7 s): a 4-second silent loop cut from film 1 (chaos of Excel sheets) behind the headline;
   narration: one sentence about duplicated names and lost versions.
2. **Try it — ID check**: narration asks the visitor to type an ID or tap «جرّب رقمًا مسجّلًا»; on result, play the
   matching line (valid / wrong digit / duplicate) + stamp SFX.
3. **Before / after**: narration invites a drag; when the slider passes 70 %, play the "one register" line.
4. **Offline**: visitor switches the internet off, registers 2 families, switches it on → sync line + soft chime.
5. **The family's journey**: sticky phone, screens advance with short narrated captions (auto, 3–4 s each).
6. **The film**: «شاهد يومًا كاملًا» → film 1 opens in a focused player (org path: film 2, 16:9).
7. **Close**: download (camp) / request a 60-day pilot (org), with QR on desktop.
Controls bar (fixed bottom, opaque): chapter dots, pause/resume, mute, captions on/off, «تخطَّ», «إنهاء الجولة».
State survives scrolling; leaving the tour returns to browse mode at the same place.

Motion: purposeful only (stamp thud, row slide-in, phone screen cross-fade, slider nudge). 150–450 ms, one easing.
No parallax spectacle, no scroll-jacking in browse mode.

## 5. Audio with ElevenLabs (use the ElevenLabs connector tools if this session has them; if not, stop and tell
the owner so the audio can be generated in a chat session that has them)
- Voices: managers = the voice used for film 1 («Mohammad», search `creative_list_voices` for Arabic male
  «Mohammad»; confirm with the owner if more than one); organisations = «Mazen Lawand» (`rPNcQ53R703tTmtue1AT`).
- Model `eleven_multilingual_v2`, `generations_count: 1`. Write lines in **fully voweled Arabic** for hard words
  (e.g. مُؤَسَّسَة، مُسَجَّلَة، النَّتيجَة، تُرى) — this fixed real mispronunciations in film 2.
- Free plan, ~8,000 credits left (1 credit ≈ 1 character). Budget: ≤ 1,500 characters per path including
  reaction lines. **Show the owner the full Arabic script and character count and wait for approval before
  generating anything.**
- SFX (`creative_generate_in_flow` / sound-effect model if available, else skip): stamp thud, paper slide, soft
  sync chime. Keep each < 1 s, very quiet (−18 dB under the voice).
- Verify every line before using it: `pip install --break-system-packages faster-whisper`, model `small`,
  `language="ar"`, feed a numpy float array from a 16 kHz mono WAV (passing a file path fails with the installed
  `av`). Re-generate only lines whose words are wrong.
- Encode: mono, 48 kbps MP3 (or Opus in .webm with MP3 fallback), loudness-matched (≈ −16 LUFS), each chapter a
  separate file loaded on demand. Captions = the same text, in the DOM, timed by chapter (no extra timing files).
- Film loops: cut 3–5 s silent clips from `film1.mp4` / `film2.mp4` with ffmpeg (`-an`, H.264, ≤ 250 KB each,
  `-preset veryfast`), `preload="none"`, start only when in view.

## 6. Process (one phase per step, commit + short Arabic note to the owner after each)
0. Read §1, list what v1 already does well, and confirm the plan in 5–8 Arabic lines.
1. Script: Arabic narration for both paths + reaction lines + char counts → **owner approval**.
2. Generate + verify audio, cut film loops, make `og.jpg`.
3. Build browse mode v2 (fix §3), then tour mode on top.
4. QA with Playwright: 390×844, 820×1180, 1280×800; full tour run in each; keyboard-only run; reduced-motion run;
   no horizontal overflow; no console errors; first-load weight report. Send the owner 3–4 screenshots.
5. Push `main` (auto-deploy), check the live URL, update `marketing/HANDOFF.md` in eiwaa-system (branch
   `marketing-screens`) with what changed and what is next.

## 7. Done means
- A first-time visitor on a cheap Android phone understands what Eiwaa is in 10 seconds, can finish the tour in
  ≈ 2 minutes, and ends one tap away from downloading (managers) or requesting a pilot (organisations).
- Both films are part of the experience, not just embedded.
- All §2 rules hold; all §3 findings are closed; the owner approved the script before credits were spent.

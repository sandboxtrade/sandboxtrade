// mind.exe V4.7 — two fixes. (1) CRITICAL DATA LOSS BUG: the cloud-profile load effect set
// loaded=true in a finally block regardless of whether loadProfile actually succeeded. If the
// Firestore read threw (network hiccup, timing, permissions) the catch silently swallowed it, but
// loaded still flipped true with entries/settings sitting at the empty defaults from
// resetInMemoryState() \u2014 and the auto-persist effect (gated only on `loaded`) immediately wrote
// that empty state back to Firestore, wiping the real saved data. This is almost certainly what
// happened to the Google-account user who lost everything. Fixed with a new canPersistRef that
// only flips true after a load attempt actually completes without throwing (success OR a
// legitimately-empty new profile both count \u2014 only a thrown error withholds it); the two
// auto-persist effects, the daily-reward effect, and awardCoins now all check it, so nothing
// auto-saves until a load has genuinely succeeded. Failed loads now retry twice with backoff before
// giving up, and only then surface a toast telling the person to reload rather than silently saving
// zeros over their data. (2) Starting-capital field in Settings: the onChange coerced every
// keystroke through `parseFloat(...) || 0`, so clearing the field to type a fresh number
// immediately snapped back to "0" and new digits landed after it (typing "500" produced "0500").
// Replaced with a local string draft (capitalDraft) that accepts free typing, strips a redundant
// leading zero before a digit, and only commits to the real numeric startingCapital on blur \u2014
// matches the pattern already used for price fields elsewhere in the app.
// mind.exe V4.6 — the splash animation read as crude, not elegant. Root cause: the shimmer was a
// diagonal light-bar sliding across via background-position \u2014 a recognizable "cheap CSS shine"
// cliche, and the breathing halo animated both scale AND opacity together, producing a hard
// heartbeat-like snap rather than a smooth glow. Replaced both: the shimmer is now a still radial
// highlight (no travel) whose opacity alone breathes on a slow 4.5s ease-in-out cycle, still gated
// by the brightness mask so only the ring/candle pixels light up \u2014 reads as the ring itself glowing,
// not a bar sliding over it. The horizon halo now only pulses opacity too (0.4\u21920.85, no scale jump)
// on its own slower 6s cycle with a -1.5s offset from the shimmer's cycle, so the two overlapping
// slow breaths don't sync into one obvious blink \u2014 closer to organic "alive" light. Ken Burns eased
// back to a gentler 1.05 max scale over 12s with a smoother cubic-bezier curve instead of the
// sharper default ease-in-out.
// mind.exe V4.5 — splash animations weren't visible: Ken Burns was a 26s cycle and the shimmer a
// 7s cycle, but the splash only stays on screen for ~7.2s total (see the setTimeout in MindExe), so
// almost nothing had time to play. Sped Ken Burns up to 9s (scale 1.0->1.1, was 1.06) and the
// shimmer sweep to 3.2s with a wider, brighter band, so both are now clearly visible within the
// splash's actual lifetime. Also added a new .splash2-bh-glow layer: a warm radial highlight pinned
// to the measured event-horizon center (47%/41%) that pulses size+opacity on its own faster 2.6s
// cycle (screen blend mode), giving the hole a distinct "breathing" glow independent of the shimmer
// sweep; it shares the same Ken Burns transform as the photo so it stays in registration while
// zooming instead of drifting off the hole.
// mind.exe V4.4 — splash screen now uses the user's own black-hole-with-candlestick photo directly
// (base64 JPEG, quality 75, no re-generation, no CSS-drawn black hole) in place of the earlier
// landscape stock photo. A matching SPLASH_BLACKHOLE_MASK was computed from this exact image (PIL:
// grayscale -> gamma/threshold curve keeping only bright pixels) so the existing shimmer-sweep
// technique now gates on both the accretion disk ring AND the candlestick chart baked into the
// photo, making the whole scene \u2014 chart included \u2014 pulse with light together. Event horizon
// center (47%, 41%) was hand-measured against a 10% grid overlay on the source photo and applied to
// object-position/mask-position/vignette so the crop stays centered on the hole across screen
// sizes; scene height went from 62% to 100% since this photo's own vertical composition already
// carries the "chart flows into the hole" story the full height of a phone screen, and the bottom
// vignette gradient was strengthened accordingly to keep the logo/tagline legible over the busier
// lower half. No literal photo rotation/warping, consistent with the prior developer's note that it
// would break the ring's foreshortened perspective \u2014 motion still comes entirely from compositing
// layers on top of the untouched photo.
// mind.exe V4.3 — market insight diagnostics + fallback, since the polish button (plain Gemini
// call, no tools) worked but the market snapshot (grounded call, tools:[{googleSearch:{}}]) never
// visibly updated. Two changes: (1) aiFetchMarketSnapshot now tries the grounded call first and,
// if it throws for any reason (tool unsupported by this model/SDK combo, grounding refusing strict
// JSON output, etc.), logs the real error to console and retries once with a second plain model
// (no search tool) so the insight still updates from Gemini's own knowledge instead of silently
// doing nothing \u2014 this also isolates whether the bug is the search tool specifically or
// something else in the pipeline. (2) The manual refresh button on Home now surfaces the actual
// failure via a toast (notify, wired through from App) and console.error, instead of swallowing it
// \u2014 open devtools after pressing refresh to see exactly what's failing if it still doesn't
// update.
// mind.exe V4.2 — two changes. (1) Voice input removed entirely (useSpeechToText/MicButton and
// the unused Mic icon import deleted) and replaced with PolishButton: a small Gemini-backed
// "\u2728" button next to the same 4 reflection fields (pull in NewEntry/EditTrade, lesson in
// CloseTrade/EditTrade) that lightly copyedits whatever the trader already typed \u2014 grammar/
// flow only, meaning and facts untouched, no advice, not answered as a question \u2014 via a
// separate aiGetPolishModel() instance (same Firebase AI Logic client, different config/no system
// instruction, since the coaching model's instruction is the wrong fit for a copyedit task). (2)
// Home's Insight card gets a manual refresh control (RotateCcw icon, spins while busy) next to the
// pulsing dot, shown only when a trading asset is selected in Settings \u2014 calls
// aiFetchMarketSnapshot directly (bypassing the hourly cache check) and writes the result back
// into both the shared Firestore cache and local state, so a stale/failed automatic fetch can be
// retried on demand instead of waiting up to an hour.
// mind.exe V4.1 — Home's "Инсайт" card is now Gemini-backed instead of purely local. New
// aiFetchMarketSnapshot uses a separate getGenerativeModel() config with the Google Search
// grounding tool (tools:[{googleSearch:{}}]) — same Firebase AI Logic client, not a second
// integration — to read the real current market and return {moodLabel, summary, btcDominance,
// sentimentScore, sentimentLabel}. Cached in Firestore per asset class (shared:true) for one hour
// so every user trading the same asset class reads the same cached snapshot instead of each
// triggering their own Gemini+Search call on every Home visit. Added a "Что ты торгуешь"
// (crypto/forex/stocks) selector in Settings — persisted through the same profile save/load/
// backup/reset paths as measureMode/currency — that both narrows the Gemini prompt's focus and
// controls whether the BTC.D chip shows in Home's footer ticker (F&G/sentiment chip stays for all
// asset classes as a general risk-sentiment read). Any fetch failure (unsupported tool, quota,
// network, bad JSON) falls back to the last cached snapshot, then silently to the previous
// local-only insight/static BTC_DOMINANCE/FEAR_GREED constants — nothing breaks if a user hasn't
// picked an asset class yet or Gemini/grounding is unavailable.
// mind.exe V4.0 — two fixes. (1) PickerField (instrument/setup-type dropdowns in NewEntry/
// EditTrade) had no click-outside handling, so opening a second field left the first one open
// underneath it — both stayed open at once, and tapping anywhere else on the screen did nothing.
// Added a document mousedown/touchstart listener while a picker is open that closes it (and
// clears the search query) on any click outside its own container; picking a value already closed
// it as before. (2) Fonts across the whole app have referenced 'Space Grotesk' and 'JetBrains
// Mono' by name since the beginning, but neither was ever actually loaded — index.html had no
// font <link> at all, so every label/number silently fell back to the system sans-serif this
// whole time. Added the Google Fonts stylesheet for both (weights 400–700) plus a body-level
// font-family/weight default (500, up from the browser's 400) so untagged text reads a bit
// heavier too. No change needed in app.js itself for this part — see index.html.
// mind.exe V3.9 — fixed voice input losing text after pressing stop: some Safari builds call
// stop()/abort() without ever emitting a final (isFinal:true) result for the phrase in progress,
// so the old code — which only committed on isFinal — silently dropped whatever was said right
// before stopping. Now every onresult also keeps the still-interim tail in pendingRef; that gets
// flushed into the field on session end (including mid-restart chunks) and, as a safety net, 300ms
// after stop() even if onend never fires. Final chunks still commit immediately as before.
// mind.exe V3.8 — two fixes. (1) Voice input on iOS Safari: webkitSpeechRecognition there ends
// the session after every short pause even with continuous:true — a known platform quirk, not
// something continuous:true can override. useSpeechToText now tracks the user's actual intent
// (wantRef) separately from the browser session; when a session ends but the user hasn't pressed
// stop, it silently spins up a fresh recognition instance ~200ms later so it reads as one
// continuous recording instead of dying after ~1 second. Also switched interimResults to true,
// which several iOS builds need to keep the audio pipeline alive at all — only isFinal chunks are
// still appended to the field. (2) Bottom nav tiles were too big/blocky — shrunk icon badges
// (regular 44px -> 32px, primary 48px -> 36px), dropped the visible border on regular tiles (flat
// background tint only when active), softer/smaller glow on the primary "Запись" tile, corners
// rounded-2xl -> rounded-xl throughout for a lighter feel.
// mind.exe V3.7 — restyled the bottom nav to match the reference: dropped the floating-circle
// look from V3.6 (it wasn't docked to the row and used the wrong colors). Every one of the 7 tabs
// now gets its own static rounded-square icon badge (subtle border, accent tint when active) with
// the label below it, instead of a shared sliding highlight box — closer to the reference's flat
// tile grid. "Запись" (primary) keeps its own branch: a taller near-white badge with a black icon
// and a soft white glow, pulled up slightly (-mt-3) so it visibly sits a notch above its
// neighbors without floating free of the bar; label goes bold white instead of accent-colored.
// Removed the now-unused activeIndex slider calc. Desktop sidebar untouched (not part of the ask).
// mind.exe V3.6 — bottom nav restructure. "new" (formerly mislabeled "Дневник") is now the
// centered, elevated primary button — a bigger accent-filled circle popping above the bar (own
// branch in the nav.map, marked via nav[].primary, sliding highlight box skipped for that slot
// since the circle itself is the active indicator) — reordered to sit in the middle of the 7-tab
// row. Renamed labels: "new" -> "Запись" (short, still clear it's for logging a trade), "log"
// (the actual trade list, NotebookText icon) -> "Дневник" (was wrongly "Заметки"). Same nav array
// feeds the desktop sidebar too, so labels/order stay consistent there.
// mind.exe V3.5 — fixed voice input: (1) the "stop" control was a 10px pill that easily read as
// "nothing happened" when tapped — it's now a full red bar with explicit "Запись… нажми, чтобы
// остановить" text while recording. (2) guarded against double-start (a stray second tap while
// already recording could throw "already started" repeatedly); (3) wrapped the SpeechRecognition
// constructor itself in try/catch — some restricted/insecure contexts throw synchronously there
// instead of firing a normal error event, which was an uncaught exception before; (4) added an
// unmount cleanup that stops any recognition still running if the user switches tabs mid-recording
// — previously it kept firing in the background against a stale component and could throw
// repeatedly with no way to stop it from the UI, which is what looked like "breaks the app".
// mind.exe V3.4 — added a "Очистить" reset button to the Coach chat card header (next to
// chatTitle, shown only when chatMessages.length > 0). Clears local chatMessages state; the
// existing persistence useEffect (already keyed on chatMessages) then overwrites the stored
// aiState with an empty chat array via the existing saveAiState/storageSet — no new storage call,
// no change to the analysis insight box, Firestore schema, or Auth.
// mind.exe V3.3 — two additions to the Journal flow, both wired through existing systems only
// (no new Firebase project, no new AI client, no changes to Auth/Firestore/Analytics/Pattern
// Engine/Calibration). (1) AI trade recognition: NewEntry now has a "Распознать сделку по
// скриншоту" button; the uploaded image is compressed with the existing compressImageFile and
// added to the existing screenshots array (no duplicate storage), then sent to Gemini via a new
// aiCallGeminiVision (same aiGeminiModel singleton, just called with an inlineData image part
// instead of text-only). Prompt instructs Gemini to return null for anything not clearly visible
// — never invented prices. Recognized fields only pre-fill the existing form inputs; RR is still
// computed exclusively by the existing computePlannedRR, and nothing saves until the user presses
// the existing "Сохранить запись" button. Direction is mapped LONG/SHORT -> Long/Short to match
// the app's existing convention. (2) Voice input: a small mic button (new MicButton +
// useSpeechToText, browser Web Speech API only, no network/AI call) sits next to the four
// existing reflection labels (pull in NewEntry/EditTrade, lesson in CloseTrade/EditTrade) and
// appends recognized speech into the existing pull/lesson textareas — manual typing/editing still
// works exactly as before. Unsupported browsers or denied mic permission fall back to a toast via
// the existing notify(), the app never blocks.
// mind.exe V3.2 — two fixes on the sticky mobile header from V3.0. (1) The hard 1px bottom
// border was clearly visible as a sharp cut line under the logo bar — removed it, replaced with
// a soft ~20px gradient fade (header's own translucent color fading to transparent) that extends
// just past the header's bottom edge, so it blends into the scrolling content instead of a crisp
// edge. (2) The small accent gradient divider under the logo used to live outside the sticky
// header, in normal document flow — so it scrolled away on the very first pixel of scroll while
// the header itself stayed pinned, an obvious mismatch. Moved it inside the sticky header (right
// under the logo row) so it now scrolls/sticks as one unit with the rest of the bar.
// mind.exe V3.1 — fixed the "странный блюр" on long AI replies: DecodeText's per-word cascade
// computed its stagger step as maxTotalMs/wordCount, and for a long paragraph (a full AI answer
// can be 150+ words) that step collapsed toward its floor — meaning dozens of words ended up
// mid-fade simultaneously for well over a second, so a screenshot taken in that window showed a
// patchwork of sharp/blurred words in no visible order rather than a clean sweep. Long text
// (>24 words) now skips the per-word stagger entirely and fades in as one synchronized block
// (single 0.55s softReveal, no stagger) — reads as calm regardless of length or when it's
// captured. Short text (titles, buttons, chips) keeps the per-word cascade, which was never the
// part that looked wrong.
// mind.exe V3.0 — two changes. (1) DecodeText replaced entirely: the per-character random-glyph
// "decrypt" animation is gone (it was still reading as jittery/artificial even after V2.5's
// tuning). New version is a calm word-by-word blur+fade cascade — each word starts blurred,
// dimmed and offset by a few px, and settles into place left-to-right via a single CSS animation
// per word (browser-driven via animation-delay, no JS timer loop, no per-frame re-renders at
// all). Same external API (text/as/className/style/maxTotalMs) so every call site across Coach/
// Analysis needed zero changes. New `softReveal` keyframe added to the global stylesheet.
// (2) The mobile top bar (logo + wordmark + wallet badge) is now `sticky top-0` with its own
// translucent/blurred background (matching the existing bottom-nav glass treatment) and a hairline
// bottom border, so it stays pinned while the page scrolls instead of scrolling away with the
// content. Moved that bar's top padding off the outer content wrapper and onto the sticky bar
// itself so spacing looks identical whether it's stuck or not. Desktop is unaffected (that header
// row is md:hidden; desktop already has its own fixed sidebar).
// mind.exe V2.9 — fixed the black-screen crash on Calibration. Root cause: the same-day cache
// record saved to Firestore (calibHistoryKey) stored each question's id/text/factor/category/
// source but NOT its `options` array. On a same-day reopen the cached (option-less) questions
// were loaded straight into state, and the quiz screen's `q.options.map(...)` threw on an
// undefined array — with no error boundary that unmounts the whole tree, leaving just the plain
// black body background from index.html. Fixed at the source (the saved history record now
// includes `options`) and defensively: prepareAndStart now validates every cached question has a
// non-empty options array before trusting the cache (so an already-corrupted record saved by V2.6
// self-heals into a fresh generation instead of crashing again), and the quiz-stage render bails
// to a small error state + restart button if `q` or `q.options` is ever missing for any other
// reason, instead of letting the crash propagate.
// mind.exe V2.8 — EmotionGrid (the entry-mood pad in New Entry / Edit Trade) reworked. It used
// to classify the tapped point into just 4 quadrant states via a >=50/<50 split on each axis.
// Replaced with a 3x3 banding (fear/neutral/confidence × on-edge/balanced/calm) giving 9 distinct
// written states, so a point near the center now reads as "even, neutral" instead of being forced
// into whichever quadrant it's barely closer to. Visual pass: added two faint tertile grid lines
// per axis (in addition to the bold center cross) so the 9 zones are visible, not just implied;
// the placed dot and its state text now use a continuous LOSS→WARN→WIN color blend
// (emotionPositionColor/emotionLerpHex, new) based on actual position instead of 3 fixed colors;
// dot gets a two-layer glow (soft ring + blur) instead of a flat halo; card background/shadow
// deepened slightly (inset shadow, warmer center glow) for more depth. Also: all of EmotionGrid's
// text (axis labels, hint, all 9 states) was hardcoded Russian with no English path even though
// the rest of the app is bilingual — moved into t.newEntry.emotionGrid (RU/EN) and the component
// now takes `t` like its siblings.
// mind.exe V2.7 — renamed the "Coach" tab to "Analysis" everywhere it's user-visible: bottom nav
// label, screen title, chat section title ("Спросить ИИ" / "Ask AI"), and the online-status line.
// Internal identifiers (Coach component, t.coach.* keys, aiCoach-adjacent functions) intentionally
// left as-is — renaming those is a pure code-churn risk with zero user-facing benefit.
// mind.exe V2.6 — Adaptive pre-session Calibration. Calibration is no longer a fixed 6-question
// quiz: on "Start" it now reads the existing Analytics/Pattern Engine output for the trader's last
// closed session + a short recent window and turns it into a small set of typed, severity-scored
// factors (consecutive_losses, euphoria_risk, revenge_risk, increased_risk, overtrading_risk,
// early_exit_pattern, fomo_risk, repeated_lesson, decreased_discipline, poor_sleep,
// reflection_note — new caComputeAdaptiveFactors, nothing invented if the sample isn't there).
// Those factors + a compact context (new caBuildContext, same shape family as the Coach tab's
// aiBuildContext) go to the existing Gemini integration (one new call site,
// aiGenerateCalibrationQuestions) which returns ONLY question text + factor/category/priority —
// never scores, never awareness, per spec. Every returned (or fallback) question is scored through
// one new shared 4-point readiness scale (CALIBRATION_READINESS_SCALE) via scoreCalibrationDynamic,
// so Gemini can't influence the math. Final set = 2 baseline questions (sleep/emotion, unchanged
// from CALIBRATION_QUESTIONS) + up to 4 adaptive ones. Three-tier fallback if Gemini is unavailable
// or returns something unusable: caLocalFallbackQuestions (local per-factor question bank) ->
// full original static CALIBRATION_QUESTIONS set — Calibration can never break. Same-day caching
// and a rolling question history (avoids repeating the same factor every day) are stored per user
// via the same storageGet/Set Firestore pattern as loadAiState (new calibHistoryKey). Nothing in
// Analytics Engine, Pattern Engine, Calibration Score math, Firebase Auth, Firestore schema, or the
// existing Gemini/Coach integration was changed — this is purely an added layer.
// mind.exe V2.5 — two Coach-screen fixes. (1) Chat card layout: it had `minHeight` instead of a
// fixed `height`, so the card grew to fit the whole conversation instead of scrolling internally
// — pushed the input off-screen and blew past the bottom nav, exactly like the "стало резиновым"
// screenshot showed. Reverted to a fixed height (52vh, capped at 560px) plus `min-h-0` on the
// inner scroll div (a flexbox gotcha: a flex child needs min-h-0 for overflow-y-auto to actually
// clip instead of growing its parent). (2) DecodeText felt like lag, not an effect: it drove a
// requestAnimationFrame loop (60 ticks/sec) that rebuilt and re-rendered the *entire* string every
// frame for up to 1100ms, and — because revealMs (90-260ms) was large relative to the tiny
// per-char delay on long strings — most characters were mid-scramble simultaneously, i.e. the
// whole paragraph flickering at once rather than a left-to-right sweep, which is real jank on a
// phone with 10+ DecodeText instances live at once (title, labels, chips, messages...). Switched
// the tick loop from rAF to a slower ~55ms setTimeout cadence (fewer re-renders) and cut default
// maxTotalMs/revealMs roughly in half (900/260 -> 520/90), with the long-text call sites (analysis
// paragraph, AI chat replies, quick-question chips) tuned down to match. Net effect: a quick,
// calm settle instead of a sustained flicker.
// mind.exe V2.4 — pilot: text on the Coach screen no longer just fades in, it "decodes" — the
// full string renders immediately with every letter/digit scrambled to a random character from
// its own script (cyrillic stays cyrillic, digits stay digits, so width never jumps), then
// characters lock into their real value left-to-right over a capped ~0.5-1.1s regardless of
// string length. New shared DecodeText component (near LogoSpinner) drives this via
// requestAnimationFrame and respects prefers-reduced-motion. Applied to: the Coach title/
// subtitle, both card section labels, the Analyze button label, the analysis result paragraph
// (so a fresh AI insight visibly "decrypts" in), the scope-info line, the 6 quick-question
// chips, assistant chat replies (user messages stay plain — only AI output decodes), the
// disclaimer, and the status/model footer row. Card layout and colors unchanged. If this reads
// well, next step is rolling DecodeText out to the other screens.
// mind.exe V2.3 — bottom mobile nav bar geometry fixed: the active-tab highlight was positioned
// with percentages measured against the bar's padding box (p-1 on the same element as the grid),
// while the grid tracks themselves are sized against the content box (padding excluded) — a
// mismatch that grows with each column, so it was worst (visibly skewed/cut) on the rightmost
// tab (Settings). Fixed by moving the 4px inset from padding to margin on an inner wrapper: the
// highlight and the grid buttons now share that inner div as their coordinate system with zero
// padding on it, so percentage math for both matches exactly. Outer rounded shell also got
// overflow-hidden so nothing can visually poke past its rounded corners again.
// mind.exe V2.2 — Coach tab redesigned: header now has a subtitle line, the analysis card gained
// a small glowing accent orb + gradient "Analyze" button + a scope-info footer line, and the chat
// card shows a 2-column grid of tappable quick-question chips (Brain/Star/TrendingDown/Target/
// RotateCcw/LineChart icons) before the first message, which fire straight into sendMessage
// instead of requiring typing. Added a bottom status row (pulsing WIN-colored online dot +
// "Model: Gemini" badge) below the chat card. All colors stay on the existing cosmic BASE/accent
// palette — no new hues introduced. sendMessage now accepts an optional override string so the
// quick-question chips can bypass the input box.
// mind.exe V2.1 — splash-screen shimmer glow restored: the luminance mask baked for the new 16:9
// black hole photo had way too harsh a contrast curve (mean alpha ~4/255, only ~5% of pixels
// visible), so the animated light sweep across the ring was barely there. Rebuilt the mask with a
// gentler black point/gamma and a brightness boost (mean alpha now ~21/255) so the glow reads clearly
// on the loading screen again. (Also since V2.0, undocumented: App Check reCAPTCHA v3 site key wired
// in, black hole object-position retuned to 51%/48% to center the event horizon on mobile crops,
// CalendarView capped to max-w-md so it doesn't blow up on wide desktop, Settings' Section/
// SectionLabel hoisted out of the component body to fix a focus-loss-per-keystroke bug, and the Coach
// chat got a pulsing logo spinner + fade-in for replies instead of an abrupt pop-in.)
// mind.exe V2.0 — Gemini AI layer added via Firebase AI Logic (client SDK, Gemini Developer API
// backend — no Cloud Function, no Blaze billing plan needed). Bumped the Firebase JS SDK from
// 10.13.0 to 12.17.1 in index.html (required for the firebase/ai package to exist) and added
// firebase/ai + firebase/app-check imports. Replaced the old aiAnalyzeCallable Cloud Function
// (Anthropic-backed, deferred pending Blaze) with a direct Gemini call. New AI layer, organized as
// three logical modules within this file: aiContextBuilder (turns real analytics/journal data into
// a compact, privacy-safe JSON — no raw Firestore/user/auth data ever leaves the device), aiPrompts
// (fixed system instruction: no trading signals, no diagnoses, RR+WinRate read jointly, cites only
// given numbers), aiService (single Gemini call site + error handling). Coach tab now calls Gemini
// directly; requests only fire on explicit user action (Analyze button / Send), never on render, and
// the automatic insight is skipped entirely if the underlying stats hash hasn't changed since the
// last generated insight. AI_MODEL is the one place the model name lives (gemini-3.1-flash-lite —
// current free-tier fast/cheap model; 2.0/2.5 Flash & Flash-Lite are being retired through 2026).
// Two manual setup steps remain in the Firebase console (can't be done from code): 1) run through
// the "AI Logic" setup wizard once to enable the Gemini Developer API for this project (Spark plan
// is fine, no billing needed); 2) optionally create a reCAPTCHA v3 site key under App Check and
// paste it into AI_APP_CHECK_SITE_KEY before Nov 2, 2026, when Google starts enforcing App Check
// for Firebase AI Logic — until then the app works fine with it left blank.
// entry.jsx
import React2 from "react";
import { createRoot } from "react-dom/client";

// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
var firebaseConfig = {
  apiKey: "AIzaSyAPSGcQOPS09ytLKi8dk0WOh0U3WfLm4_E",
  authDomain: "mindexe-29adf.firebaseapp.com",
  projectId: "mindexe-29adf",
  storageBucket: "mindexe-29adf.firebasestorage.app",
  messagingSenderId: "448455109935",
  appId: "1:448455109935:web:46862c8d072ea6cb7505da",
  measurementId: "G-NJFS3KLKFN"
};
var firebaseApp = initializeApp(firebaseConfig);
var fbAuth = getAuth(firebaseApp);
var fbDb = getFirestore(firebaseApp);
// ai/config.js — single place that controls which Gemini model is used everywhere in the app.
// Gemini 2.0/2.5 Flash and Flash-Lite are being retired in 2026 (2.0 already shut down June 1,
// 2.5 shuts down Oct 16) — 3.1 Flash-Lite is the current cheap/fast free-tier model recommended
// as their replacement, so that's what's wired in by default. Swap the model by changing this one
// constant; nothing else in the file should hardcode a model name.
var AI_MODEL = "gemini-3.1-flash-lite";
// reCAPTCHA v3 site key for Firebase App Check (Web). Firebase AI Logic doesn't require App Check
// yet, but Google has announced enforcement starting Nov 2, 2026 — create a reCAPTCHA v3 key in the
// Firebase console (App Check section) and paste it here before that date. Left blank, App Check is
// simply skipped and the app (including AI features) keeps working exactly as it does today.
var AI_APP_CHECK_SITE_KEY = "6LebzJQtAAAAAAWWewd3EI6SbiY-xoTeAjRrmrNa";
if (AI_APP_CHECK_SITE_KEY) {
  try {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(AI_APP_CHECK_SITE_KEY),
      isTokenAutoRefreshEnabled: true
    });
  } catch (_) {
  }
}
var aiLogic = getAI(firebaseApp, { backend: new GoogleAIBackend() });
function fsSanitizeKey(key) {
  return String(key).replace(/[\/]/g, "_");
}
function fsDocRef(key, shared) {
  const safeKey = fsSanitizeKey(key);
  if (shared) return doc(fbDb, "shared", safeKey);
  const uid = fbAuth.currentUser?.uid;
  if (!uid) return null;
  return doc(fbDb, "users", uid, "data", safeKey);
}

// mind-exe.tsx
import { useState, useMemo, useRef, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Tooltip,
  AreaChart,
  Area
} from "recharts";
import {
  Sparkles,
  BookOpen,
  NotebookText,
  LineChart as LineChartIcon,
  Settings as SettingsIcon,
  Flame,
  Search,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X as XIcon,
  CalendarCheck,
  ShieldCheck,
  PenLine,
  TrendingUp,
  Volume2,
  VolumeX,
  Download,
  AlertTriangle,
  Plus,
  Wallet,
  ImagePlus,
  Gauge,
  Upload,
  Swords,
  Coins,
  Newspaper,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Bot,
  Send,
  Brain,
  Star,
  TrendingDown,
  Target,
  RotateCcw,
  Zap,
  Info,
  Camera
} from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var BASE = {
  bg: "#0A0A0B",
  surface: "#131315",
  surface2: "#18181B",
  line: "#25252A",
  ink: "#F3F3F1",
  inkDim: "#8B8B90",
  inkFaint: "#4E4E54"
};
var WIN = "#5FAF96";
var LOSS = "#C4645A";
var FLAT = "#8B8B90";
var WARN = "#D9A24A";
var ACCENTS = [
  { name: "\u0411\u0438\u0440\u044E\u0437\u043E\u0432\u044B\u0439", value: "#2FD9BC", dim: "#175C4F" },
  { name: "\u042F\u043D\u0442\u0430\u0440\u043D\u044B\u0439", value: "#D9A24A", dim: "#5C441F" },
  { name: "\u0424\u0438\u043E\u043B\u0435\u0442\u043E\u0432\u044B\u0439", value: "#8C7FE0", dim: "#3C3570" },
  { name: "\u0420\u043E\u0437\u043E\u0432\u044B\u0439", value: "#E0708F", dim: "#5C2E3D" },
  { name: "\u041A\u043E\u0441\u043C\u043E\u0441", value: "#F5F5F7", dim: "#3A3A3E", cosmic: true }
];
var INSTRUMENTS = [
  { category: "\u041A\u0440\u0438\u043F\u0442\u043E", items: ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XRP/USD", "DOGE/USD", "TON/USD"] },
  { category: "\u0410\u043A\u0446\u0438\u0438", items: ["AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "GOOGL", "META", "NFLX"] },
  { category: "\u0424\u043E\u0440\u0435\u043A\u0441", items: ["EUR/USD", "GBP/USD", "USD/JPY", "GBP/JPY", "USD/CHF", "AUD/USD", "USD/CAD"] },
  { category: "\u0418\u043D\u0434\u0435\u043A\u0441\u044B \u0438 \u0441\u044B\u0440\u044C\u0451", items: ["XAU/USD", "XAG/USD", "NAS100", "SPX500", "US30", "USOIL"] }
];
var SETUP_TAGS = ["\u041F\u0440\u043E\u0431\u043E\u0439", "\u0420\u0430\u0437\u0432\u043E\u0440\u043E\u0442", "\u0420\u0435\u0432\u0430\u043D\u0448", "\u0422\u0440\u0435\u043D\u0434", "\u0424\u043B\u044D\u0442", "\u041D\u043E\u0432\u043E\u0441\u0442\u0438", "\u0418\u043C\u043F\u0443\u043B\u044C\u0441", "\u041E\u0442\u0431\u043E\u0439 \u0443\u0440\u043E\u0432\u043D\u044F", "\u0421\u043A\u0430\u043B\u044C\u043F", "\u0423\u0441\u0440\u0435\u0434\u043D\u0435\u043D\u0438\u0435"];
var OUTCOME_LABEL = { Win: "\u041F\u0440\u0438\u0431\u044B\u043B\u044C", Loss: "\u0423\u0431\u044B\u0442\u043E\u043A", Breakeven: "\u0412 \u043D\u043E\u043B\u044C", All: "\u0412\u0441\u0435" };
var DIRECTION_LABEL = { Long: "\u041B\u043E\u043D\u0433", Short: "\u0428\u043E\u0440\u0442" };
var STRINGS = {
  ru: {
    nav: { home: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F", new: "\u0417\u0430\u043F\u0438\u0441\u044C", log: "\u0414\u043D\u0435\u0432\u043D\u0438\u043A", patterns: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430", simulator: "\u0418\u0433\u0440\u0430", challenge: "\u0427\u0435\u043B\u043B\u0435\u043D\u0434\u0436", coach: "\u0410\u043D\u0430\u043B\u0438\u0437", settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" },
    coach: {
      title: "\u0418\u0418-\u0430\u043D\u0430\u043B\u0438\u0437",
      subtitle: "\u0422\u0432\u043E\u0439 \u043B\u0438\u0447\u043D\u044B\u0439 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A. \u041F\u043E\u043D\u0438\u043C\u0430\u0435\u0442 \u0442\u0432\u043E\u0439 \u0441\u0442\u0438\u043B\u044C \u0442\u043E\u0440\u0433\u043E\u0432\u043B\u0438.",
      analyzeTitle: "\u0410\u043D\u0430\u043B\u0438\u0437 \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430",
      analyzeDesc: "\u0418\u0418 \u043F\u0440\u043E\u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u0442\u0432\u043E\u0439 \u0436\u0443\u0440\u043D\u0430\u043B \u0438 \u043D\u0430\u0439\u0434\u0451\u0442 \u0432\u0430\u0436\u043D\u044B\u0435 \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u044B, \u0441\u0438\u043B\u044C\u043D\u044B\u0435 \u0438 \u0441\u043B\u0430\u0431\u044B\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B.",
      analyzeScopeInfo: "\u0410\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u043C \u0432\u0435\u0441\u044C \u0434\u043D\u0435\u0432\u043D\u0438\u043A \u0438 \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0435 \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u044B",
      analyzeBtn: "\u0410\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C",
      analyzeBusy: "\u0410\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u044E\u2026",
      analyzeEmpty: "\u041D\u0430\u0436\u043C\u0438 \u00AB\u0410\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u00BB, \u0447\u0442\u043E\u0431\u044B \u0418\u0418 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u043B \u0442\u0432\u043E\u0439 \u0434\u043D\u0435\u0432\u043D\u0438\u043A.",
      analyzeNoEntries: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0434\u043E\u0431\u0430\u0432\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0432 \u0434\u043D\u0435\u0432\u043D\u0438\u043A.",
      chatTitle: "\u0421\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u0418\u0418",
      chatDesc: "\u0417\u0430\u0434\u0430\u0439 \u043B\u044E\u0431\u043E\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u043F\u0440\u043E \u0441\u0432\u043E\u0438 \u0441\u0434\u0435\u043B\u043A\u0438, \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u044E \u0438\u043B\u0438 \u0442\u043E\u0440\u0433\u043E\u0432\u043B\u044E \u0432 \u0446\u0435\u043B\u043E\u043C.",
      chatPlaceholder: "\u041D\u0430\u043F\u0438\u0448\u0438 \u0441\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435\u2026",
      chatEmpty: "\u0421\u043F\u0440\u043E\u0441\u0438 \u043F\u0440\u043E \u0441\u0432\u043E\u0438 \u0441\u0434\u0435\u043B\u043A\u0438, \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u044B \u0438\u043B\u0438 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u044E \u0442\u043E\u0440\u0433\u043E\u0432\u043B\u0438.",
      resetChat: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C",
      quick: {
        lateCloses: "\u041F\u043E\u0447\u0435\u043C\u0443 \u044F \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044E \u0441\u0434\u0435\u043B\u043A\u0438 \u0440\u0430\u043D\u044C\u0448\u0435?",
        strengths: "\u041C\u043E\u0438 \u0441\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B",
        losses: "\u041F\u043E\u0447\u0435\u043C\u0443 \u044F \u0432 \u0443\u0431\u044B\u0442\u043A\u0435?",
        discipline: "\u041A\u0430\u043A \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0443?",
        strategy: "\u0421\u0442\u043E\u0438\u0442 \u043B\u0438 \u043C\u0435\u043D\u044F\u0442\u044C \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044E?",
        style: "\u041A\u0430\u043A\u043E\u0439 \u0443 \u043C\u0435\u043D\u044F \u0441\u0442\u0438\u043B\u044C \u0442\u043E\u0440\u0433\u043E\u0432\u043B\u0438?"
      },
      disclaimer: "\u0418\u0418 \u043D\u0435 \u0434\u0430\u0451\u0442 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0445 \u0441\u043E\u0432\u0435\u0442\u043E\u0432. \u0422\u043E\u043B\u044C\u043A\u043E \u0430\u043D\u0430\u043B\u0438\u0437 \u0438 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F.",
      statusReady: "\u0413\u043E\u0442\u043E\u0432 \u043F\u043E\u043C\u043E\u0447\u044C",
      statusOnline: "\u0418\u0418-\u0430\u043D\u0430\u043B\u0438\u0437 \u043E\u043D\u043B\u0430\u0439\u043D",
      modelLabel: "\u041C\u043E\u0434\u0435\u043B\u044C: Gemini",
      send: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C",
      error: "\u0418\u0418 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437."
    },
    home: {
      welcomeBack: (name) => `\u0421 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435\u043C, ${name}`,
      defaultName: "\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440",
      subtitle: "\u0422\u0435\u0431\u044F \u0436\u0434\u0451\u0442 \u044F\u0441\u043D\u043E\u0441\u0442\u044C.",
      capital: "\u041A\u0430\u043F\u0438\u0442\u0430\u043B",
      totalResult: "\u041E\u0431\u0449\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442",
      sinceStart: "\u0441 \u043D\u0430\u0447\u0430\u043B\u0430",
      calibrationToday: (pct) => `\u041A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F: ${pct}%`,
      calibrationCta: "\u041F\u0440\u043E\u0439\u0442\u0438 \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0443 \u043F\u0435\u0440\u0435\u0434 \u0441\u0435\u0441\u0441\u0438\u0435\u0439",
      insight: "\u0418\u043D\u0441\u0430\u0439\u0442",
      marketRefresh: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
      moodPrefix: "\u041D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435 \u0440\u044B\u043D\u043A\u0430: ",
      insightConfident: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442, \u0447\u0442\u043E \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u043E\u043A\u0443\u043F\u0430\u0435\u0442\u0441\u044F \u2014 \u0434\u0435\u0440\u0436\u0438 \u043E\u0431\u044A\u0451\u043C \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u043C.",
      insightFocus: "\u0421\u0444\u043E\u043A\u0443\u0441\u0438\u0440\u0443\u0439\u0441\u044F \u043D\u0430 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438. \u0414\u043E\u0431\u0430\u0432\u044C \u0435\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u0441\u0434\u0435\u043B\u043E\u043A, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u044F\u0432\u0438\u043B\u0441\u044F \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0430\u0442\u0442\u0435\u0440\u043D.",
      moodCalm: "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0435",
      moodStable: "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0435",
      moodReactive: "\u0420\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0435",
      traderLevel: "\u0423\u0440\u043E\u0432\u0435\u043D\u044C \u0442\u0440\u0435\u0439\u0434\u0435\u0440\u0430",
      awareness: "\u041E\u0441\u043E\u0437\u043D\u0430\u043D\u043D\u043E\u0441\u0442\u044C",
      reflection: "\u0420\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u044F",
      discipline: "\u0414\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0430",
      riskStability: "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0440\u0438\u0441\u043A\u0430",
      calibrationTodayShort: "\u041A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F",
      newEntryTile: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C",
      logTile: "\u0417\u0430\u043C\u0435\u0442\u043A\u0438",
      patternsTile: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430",
      simulatorTile: "\u0418\u0433\u0440\u0430",
      market: "\u0420\u044B\u043D\u043E\u043A",
      streakDays: (n) => `${n} \u0434\u043D. \u043F\u043E\u0434\u0440\u044F\u0434`,
      startStreak: "\u041D\u0430\u0447\u043D\u0438 \u0441\u0435\u0440\u0438\u044E"
    },
    newEntry: {
      title: "\u041D\u043E\u0432\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C",
      instrument: "\u0418\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442",
      pickOrAdd: "\u0412\u044B\u0431\u0435\u0440\u0438 \u0438\u043B\u0438 \u0434\u043E\u0431\u0430\u0432\u044C",
      setupType: "\u0422\u0438\u043F \u0441\u0435\u0442\u0430\u043F\u0430",
      result: (unit) => `\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 (${unit})`,
      direction: "\u041D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435",
      entry: "\u0412\u0445\u043E\u0434",
      exit: "\u0412\u044B\u0445\u043E\u0434",
      outcome: "\u0418\u0441\u0445\u043E\u0434",
      screenshots: (max) => `\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u044B \u0433\u0440\u0430\u0444\u0438\u043A\u0430 (\u0434\u043E ${max})`,
      pullQuestion: "\u0427\u0442\u043E \u0437\u0430\u0442\u044F\u043D\u0443\u043B\u043E \u0442\u0435\u0431\u044F \u0432 \u044D\u0442\u0443 \u0441\u0434\u0435\u043B\u043A\u0443?",
      pullPlaceholder: "\u0427\u0435\u0441\u0442\u043D\u043E, \u0430 \u043D\u0435 \u043A\u0440\u0430\u0441\u0438\u0432\u043E.",
      lessonQuestion: "\u0427\u0442\u043E \u0431\u044B \u0442\u044B \u0441\u043A\u0430\u0437\u0430\u043B \u0441\u0435\u0431\u0435 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437?",
      lessonPlaceholder: "\u041E\u0434\u043D\u0430 \u0444\u0440\u0430\u0437\u0430, \u043A\u043E\u0442\u043E\u0440\u0443\u044E \u0442\u044B \u043F\u0440\u0430\u0432\u0434\u0430 \u0437\u0430\u043F\u043E\u043C\u043D\u0438\u0448\u044C.",
      emotionQuestion: "\u0427\u0442\u043E \u0442\u044B \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u043B \u0432 \u043C\u043E\u043C\u0435\u043D\u0442 \u0432\u0445\u043E\u0434\u0430 \u0432 \u0441\u0434\u0435\u043B\u043A\u0443?",
      save: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C",
      emotionGrid: {
        axisTop: "\u041D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445",
        axisBottom: "\u0421\u043F\u043E\u043A\u043E\u0435\u043D",
        axisLeft: "\u0421\u0442\u0440\u0430\u0445",
        axisRight: "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C",
        hint: "\u041E\u0442\u043C\u0435\u0442\u044C, \u0433\u0434\u0435 \u0431\u044B\u043B \u0442\u044B, \u0430 \u043D\u0435 \u0433\u0434\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u043B \u0431\u044B\u0442\u044C",
        states: [
          "\u0421\u0442\u0440\u0430\u0448\u043D\u043E \u0438 \u043D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445",
          "\u0422\u0440\u0435\u0432\u043E\u0436\u043D\u043E, \u0431\u0435\u0437 \u0447\u0451\u0442\u043A\u043E\u0439 \u043F\u043E\u0437\u0438\u0446\u0438\u0438",
          "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E, \u043D\u043E \u043D\u0430 \u0432\u0437\u0432\u043E\u0434\u0435",
          "\u0415\u0441\u0442\u044C \u0441\u043E\u043C\u043D\u0435\u043D\u0438\u044F, \u043D\u043E \u0434\u0435\u0440\u0436\u0438\u0448\u044C\u0441\u044F",
          "\u0420\u043E\u0432\u043D\u043E\u0435, \u043D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435",
          "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E \u0438 \u0441\u043E\u0431\u0440\u0430\u043D\u043D\u043E",
          "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E, \u043D\u043E \u043D\u0435\u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E",
          "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E \u0438 \u0440\u043E\u0432\u043D\u043E",
          "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E \u0438 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E"
        ]
      }
    },
    log: {
      title: "\u0416\u0443\u0440\u043D\u0430\u043B \u0441\u0434\u0435\u043B\u043E\u043A",
      totalTrades: "\u0412\u0441\u0435\u0433\u043E \u0441\u0434\u0435\u043B\u043E\u043A",
      profitable: "\u041F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445",
      searchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0441\u0434\u0435\u043B\u043A\u0430\u043C\u2026",
      filters: { All: "\u0412\u0441\u0435", Win: "\u041F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0435", Loss: "\u0423\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435", Long: "\u041B\u043E\u043D\u0433", Short: "\u0428\u043E\u0440\u0442" },
      empty: "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0434\u0440\u0443\u0433\u043E\u0439 \u0444\u0438\u043B\u044C\u0442\u0440.",
      colEntry: "\u0412\u0445\u043E\u0434",
      colExit: "\u0412\u044B\u0445\u043E\u0434",
      colRR: "R/R",
      colResult: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442"
    },
    settings: {
      title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
      language: "\u042F\u0437\u044B\u043A \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F",
      languageNote: "\u041C\u0435\u043D\u044F\u0435\u0442 \u044F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430. \u0417\u0430\u043F\u0438\u0441\u0438 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u043E\u0441\u0442\u0430\u043D\u0443\u0442\u0441\u044F \u0442\u0430\u043A\u0438\u043C\u0438, \u043A\u0430\u043A \u0442\u044B \u0438\u0445 \u043D\u0430\u043F\u0438\u0441\u0430\u043B.",
      russian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
      english: "English",
      tradingAssetLabel: "\u0427\u0442\u043E \u0442\u044B \u0442\u043E\u0440\u0433\u0443\u0435\u0448\u044C",
      tradingAssetCrypto: "\u041A\u0440\u0438\u043F\u0442\u0430",
      tradingAssetForex: "\u0412\u0430\u043B\u044E\u0442\u0430",
      tradingAssetStocks: "\u0410\u043A\u0446\u0438\u0438",
      tradingAssetNote: "\u0412\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u0442\u043E, \u043A\u0430\u043A\u043E\u0439 \u0440\u044B\u043D\u043E\u043A \u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u0418\u0418 \u0434\u043B\u044F \u0438\u043D\u0441\u0430\u0439\u0442\u0430 \u043D\u0430 \u0413\u043B\u0430\u0432\u043D\u043E\u0439.",
      account: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442",
      logout: "\u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430",
      localAccountNote: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043E\u0431\u043B\u0430\u043A\u043E \u0438 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0441 \u043B\u044E\u0431\u043E\u0433\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \u043F\u043E\u0441\u043B\u0435 \u0432\u0445\u043E\u0434\u0430.",
      operatorName: "\u0418\u043C\u044F \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430",
      operatorPlaceholder: "\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440",
      accentColor: "\u0410\u043A\u0446\u0435\u043D\u0442\u043D\u044B\u0439 \u0446\u0432\u0435\u0442",
      resultUnits: "\u0415\u0434\u0438\u043D\u0438\u0446\u044B \u0438\u0437\u043C\u0435\u0440\u0435\u043D\u0438\u044F \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430",
      rMultiplier: "R-\u043C\u0443\u043B\u044C\u0442\u0438\u043F\u043B\u0438\u043A\u0430\u0442\u043E\u0440",
      currencyLabel: "\u0412\u0430\u043B\u044E\u0442\u0430",
      startingCapital: "\u041D\u0430\u0447\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043F\u0438\u0442\u0430\u043B",
      weeklyGoalLabel: "\u041D\u0435\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u0446\u0435\u043B\u044C \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438",
      weeklyGoalNote: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u0434\u043D\u0435\u0439 \u0432 \u043D\u0435\u0434\u0435\u043B\u044E \u043D\u0443\u0436\u043D\u043E \u0432\u0435\u0441\u0442\u0438 \u0436\u0443\u0440\u043D\u0430\u043B \u0434\u043B\u044F \u0447\u0435\u043B\u043B\u0435\u043D\u0434\u0436\u0430 \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438.",
      daysSuffix: "\u0434\u043D\u0435\u0439",
      sound: "\u0417\u0432\u0443\u043A",
      soundToggleLabel: "\u0417\u0432\u0443\u043A \u043F\u0440\u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0438 \u0437\u0430\u043F\u0438\u0441\u0438",
      data: "\u0414\u0430\u043D\u043D\u044B\u0435",
      dataNote: "\u0412\u0441\u0451 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435 (\u0438\u043B\u0438 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435, \u0435\u0441\u043B\u0438 \u0442\u044B \u0432\u043E\u0448\u0451\u043B). \u041F\u043E\u043B\u043D\u044B\u0439 \u0431\u044D\u043A\u0430\u043F \u2014 \u043D\u0430 \u0441\u043B\u0443\u0447\u0430\u0439 \u0441\u043C\u0435\u043D\u044B \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430 \u0438\u043B\u0438 \u043D\u0430 \u0432\u0441\u044F\u043A\u0438\u0439 \u0441\u043B\u0443\u0447\u0430\u0439.",
      fullBackup: "\u041F\u043E\u043B\u043D\u044B\u0439 \u0431\u044D\u043A\u0430\u043F (.json)",
      restoreBackup: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0438\u0437 \u0431\u044D\u043A\u0430\u043F\u0430 (.json)",
      exportJournalOnly: "\u042D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0436\u0443\u0440\u043D\u0430\u043B (.json)",
      importJournalOnly: "\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0436\u0443\u0440\u043D\u0430\u043B (.json)",
      confirmClearJournal: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u0437\u0430\u043F\u0438\u0441\u0438 \u0431\u0435\u0437 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u043E\u0442\u043C\u0435\u043D\u044B?",
      yes: "\u0414\u0430",
      cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
      clearJournal: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0436\u0443\u0440\u043D\u0430\u043B",
      fullResetTitle: "\u041F\u043E\u043B\u043D\u044B\u0439 \u0441\u0431\u0440\u043E\u0441",
      fullResetNote: "\u0421\u0442\u0438\u0440\u0430\u0435\u0442 \u0436\u0443\u0440\u043D\u0430\u043B, \u0432\u0441\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438, \u0441\u0432\u043E\u0438 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B, \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0438 \u0438 \u043A\u043E\u0448\u0435\u043B\u0451\u043A MindCoin \u2014 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043A \u043F\u0435\u0440\u0432\u043E\u043C\u0443 \u0437\u0430\u043F\u0443\u0441\u043A\u0443.",
      confirmFullReset: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u043E\u043E\u0431\u0449\u0435 \u0432\u0441\u0451?",
      yesReset: "\u0414\u0430, \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C",
      fullResetButton: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0451 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
      footerNote: "\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u044B \u0441\u0434\u0435\u043B\u043E\u043A \u0445\u0440\u0430\u043D\u044F\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u044D\u0442\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438 \u0438 \u043D\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u043C\u0435\u0436\u0434\u0443 \u0432\u0438\u0437\u0438\u0442\u0430\u043C\u0438. \u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0438 \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0441 \u0431\u0440\u043E\u043A\u0435\u0440\u043E\u043C \u043F\u043E\u043A\u0430 \u043D\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043D\u044B."
    },
    challenge: {
      title: "\u0427\u0435\u043B\u043B\u0435\u043D\u0434\u0436",
      daysInARow: "\u0434\u043D\u0435\u0439 \u043F\u043E\u0434\u0440\u044F\u0434",
      weeklyConsistency: "\u041D\u0435\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u044C",
      weeklyConsistencyDesc: (goal) => `\u0412\u0435\u0434\u0438 \u0436\u0443\u0440\u043D\u0430\u043B ${goal} \u0438\u0437 7 \u0434\u043D\u0435\u0439 \u044D\u0442\u043E\u0439 \u043D\u0435\u0434\u0435\u043B\u0438.`,
      thisWeek: "\u042D\u0442\u0430 \u043D\u0435\u0434\u0435\u043B\u044F",
      footer: "\u0420\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u044C \u0432\u0430\u0436\u043D\u0435\u0435 \u043B\u044E\u0431\u043E\u0439 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438. \u0421\u0435\u0440\u0438\u044F \u2014 \u044D\u0442\u043E \u043D\u0435 \u043F\u0440\u043E \u043F\u043E\u0431\u0435\u0434\u044B, \u0430 \u043F\u0440\u043E \u0442\u043E, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0442\u044C\u0441\u044F \u043A \u0441\u0435\u0431\u0435 \u0434\u0430\u0436\u0435 \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430."
    },
    calibration: {
      heading: "\u041A\u0410\u041B\u0418\u0411\u0420\u041E\u0412\u041A\u0410",
      subtitle: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u044C \u043A \u0442\u043E\u0440\u0433\u043E\u0432\u043E\u0439 \u0441\u0435\u0441\u0441\u0438\u0438.",
      intro: "\u042D\u0442\u043E \u0437\u0430\u0439\u043C\u0451\u0442 \u043C\u0435\u043D\u0435\u0435 30 \u0441\u0435\u043A\u0443\u043D\u0434. \u041E\u0442\u0432\u0435\u0447\u0430\u0439\u0442\u0435 \u0447\u0435\u0441\u0442\u043D\u043E. \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0430\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u0442 \u043D\u0435 \u0440\u044B\u043D\u043E\u043A, \u0430 \u0432\u0430\u0448\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435.",
      start: "\u041D\u0430\u0447\u0430\u0442\u044C",
      loading: "\u0413\u043E\u0442\u043E\u0432\u0438\u043C \u0432\u043E\u043F\u0440\u043E\u0441\u044B \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0435 \u0442\u0432\u043E\u0438\u0445 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0441\u0435\u0441\u0441\u0438\u0439\u2026",
      adaptiveNote: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F\u0448\u043D\u044F\u044F \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0430 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u043D\u0430 \u0442\u0432\u043E\u0438\u0445 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430\u0445.",
      questionOf: (i, total) => `\u0412\u043E\u043F\u0440\u043E\u0441 ${i} \u0438\u0437 ${total}`,
      cancel: "\u041E\u0442\u043C\u0435\u043D\u0430",
      mainRiskFactor: "\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0444\u0430\u043A\u0442\u043E\u0440 \u0440\u0438\u0441\u043A\u0430",
      whatInfluenced: "\u0427\u0442\u043E \u043F\u043E\u0432\u043B\u0438\u044F\u043B\u043E \u043D\u0430 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442",
      restart: "\u041F\u0440\u043E\u0439\u0442\u0438 \u0437\u0430\u043D\u043E\u0432\u043E"
    },
    pattern: {
      yourPattern: "\u0422\u0432\u043E\u0439 \u043F\u0430\u0442\u0442\u0435\u0440\u043D",
      strongSignal: "\u0421\u0438\u043B\u044C\u043D\u044B\u0439 \u0441\u0438\u0433\u043D\u0430\u043B",
      observedPattern: "\u041D\u0430\u0431\u043B\u044E\u0434\u0430\u0435\u043C\u044B\u0439 \u043F\u0430\u0442\u0442\u0435\u0440\u043D",
      someSigns: "\u0415\u0441\u0442\u044C \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u0438",
      trades: (n) => `${n} ${pluralRu(n, "\u0441\u0434\u0435\u043B\u043A\u0430", "\u0441\u0434\u0435\u043B\u043A\u0438", "\u0441\u0434\u0435\u043B\u043E\u043A")}`,
      winShort: "win",
      avgShort: "\u0441\u0440.",
      breakdown: "\u0420\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u2192",
      strength: "\u0421\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430",
      noClearPattern: "\u042F\u0432\u043D\u043E\u0433\u043E \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u043E\u0433\u043E \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0432\u0438\u0434\u043D\u043E \u2014 \u044D\u0442\u043E \u0442\u043E\u0436\u0435 \u043D\u0435\u043F\u043B\u043E\u0445\u043E\u0439 \u0437\u043D\u0430\u043A. \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0439 \u0432\u0435\u0441\u0442\u0438 \u0436\u0443\u0440\u043D\u0430\u043B, \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441\u043B\u0435\u0434\u0438\u0442 \u0437\u0430 \u044D\u0442\u0438\u043C \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E.",
      buildingUp: (have, need) => `\u041F\u043E\u043A\u0430 \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u2014 ${have} / ${need}`,
      buildingUpDesc: "\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0438\u0449\u0435\u0442 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0435\u0441\u044F \u0441\u0432\u044F\u0437\u0438 \u043C\u0435\u0436\u0434\u0443 \u0442\u0432\u043E\u0438\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C \u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C \u2014 \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0437\u0430\u043F\u0438\u0441\u0438 \u0441 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u043D\u043E\u0439 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u043E\u0439.",
      detailTitle: "\u0422\u0432\u043E\u0439 \u043F\u0430\u0442\u0442\u0435\u0440\u043D",
      tradesLabel: "\u0421\u0434\u0435\u043B\u043E\u043A",
      winRateLabel: "Win rate",
      avgRLabel: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 R",
      comparison: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435",
      similarSituations: "\u041F\u043E\u0445\u043E\u0436\u0438\u0435 \u0441\u0438\u0442\u0443\u0430\u0446\u0438\u0438",
      otherTrades: "\u041E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438",
      whereOnMap: "\u0413\u0434\u0435 \u044D\u0442\u043E \u043D\u0430 \u043A\u0430\u0440\u0442\u0435 \u044D\u043C\u043E\u0446\u0438\u0439",
      fearToConfidence: "\u0421\u0442\u0440\u0430\u0445 \u2192 \u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C",
      nervousToCalm: "\u041D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445 \u2192 \u0421\u043F\u043E\u043A\u043E\u0435\u043D",
      tradeExamples: "\u041F\u0440\u0438\u043C\u0435\u0440\u044B \u0441\u0434\u0435\u043B\u043E\u043A",
      whyShown: "\u041F\u043E\u0447\u0435\u043C\u0443 mind.exe \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u044D\u0442\u043E",
      whyShownText: (n, avgGroup, avgRest) => `${n} ${pluralRu(n, "\u0441\u0434\u0435\u043B\u043A\u0430 \u043F\u043E\u043F\u0430\u043B\u0430", "\u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u043F\u0430\u043B\u0438", "\u0441\u0434\u0435\u043B\u043E\u043A \u043F\u043E\u043F\u0430\u043B\u043E")} \u0432 \u044D\u0442\u0443 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E. \u0412 \u044D\u0442\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u0435 \u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0441\u043E\u0441\u0442\u0430\u0432\u0438\u043B ${avgGroup}, \u043F\u0440\u043E\u0442\u0438\u0432 ${avgRest} \u0443 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A.`,
      needMoreEntries: "\u0414\u043E\u0431\u0430\u0432\u044C \u0435\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u0441\u0434\u0435\u043B\u043E\u043A \u0441 \u043E\u0431\u0435\u0438\u0445 \u0441\u0442\u043E\u0440\u043E\u043D \u2014 \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445 \u0438 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u2014 \u0438 \u0437\u0434\u0435\u0441\u044C \u043D\u0430\u0447\u043D\u0451\u0442 \u043F\u0440\u043E\u044F\u0432\u043B\u044F\u0442\u044C\u0441\u044F \u043F\u0430\u0442\u0442\u0435\u0440\u043D.",
      noPatternYetLong: "\u042F\u0432\u043D\u043E\u0433\u043E \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u043E\u0433\u043E \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u0430 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0432\u0438\u0434\u043D\u043E \u2014 \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0435 \u0438 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u0440\u0438\u0445\u043E\u0434\u044F\u0442 \u0438\u0437 \u043F\u043E\u0445\u043E\u0436\u0438\u0445 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439. \u042D\u0442\u043E \u0441\u0430\u043C\u043E \u043F\u043E \u0441\u0435\u0431\u0435 \u0432\u0430\u0436\u043D\u043E \u0437\u0430\u043C\u0435\u0442\u0438\u0442\u044C.",
      accumulating: (n) => `\u041F\u043E\u043A\u0430 \u043D\u0430\u043A\u0430\u043F\u043B\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0434\u043B\u044F \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u044B\u0445 \u0432\u044B\u0432\u043E\u0434\u043E\u0432 (\u043D\u0443\u0436\u043D\u043E \u0435\u0449\u0451 ${n} \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u0441 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0439 \u0442\u043E\u0447\u043A\u043E\u0439) \u2014 \u043D\u043E \u0443\u0436\u0435 \u0432\u0438\u0434\u043D\u043E, \u0447\u0442\u043E \u0436\u0443\u0440\u043D\u0430\u043B \u0432\u0435\u0434\u0451\u0442\u0441\u044F \u0440\u0435\u0433\u0443\u043B\u044F\u0440\u043D\u043E, \u0438 \u044D\u0442\u043E \u0433\u043B\u0430\u0432\u043D\u043E\u0435.`
    },
    review: {
      heading: "\u0420\u0410\u0417\u0411\u041E\u0420",
      notEnough: "\u041F\u043E\u043A\u0430 \u043C\u0430\u043B\u043E\u0432\u0430\u0442\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439, \u0447\u0442\u043E\u0431\u044B \u0432\u044B\u0434\u0435\u043B\u0438\u0442\u044C \u0432 \u043D\u0438\u0445 \u0437\u0430\u043A\u043E\u043D\u043E\u043C\u0435\u0440\u043D\u043E\u0441\u0442\u0438. \u0414\u043E\u0431\u0430\u0432\u044C \u0435\u0449\u0451 \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u0441\u0434\u0435\u043B\u043E\u043A \u2014 \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445 \u0438 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u2014 \u0438 \u0440\u0430\u0437\u0431\u043E\u0440 \u0441\u0442\u0430\u043D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D.",
      back: "\u041D\u0430\u0437\u0430\u0434",
      questionsCount: (n) => `${n} ${pluralRu(n, "\u0432\u043E\u043F\u0440\u043E\u0441", "\u0432\u043E\u043F\u0440\u043E\u0441\u0430", "\u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432")} \u043F\u043E \u0442\u043E\u043C\u0443, \u0447\u0442\u043E \u0443\u0436\u0435 \u0432\u0438\u0434\u043D\u043E \u0432 \u0442\u0432\u043E\u0451\u043C \u0436\u0443\u0440\u043D\u0430\u043B\u0435.`,
      intro: "\u042D\u0442\u043E \u043D\u0435 \u043F\u0440\u043E \u0440\u044B\u043D\u043E\u043A \u0438 \u043D\u0435 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0439 \u0441\u043E\u0432\u0435\u0442 \u2014 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u043C \u0442\u044B \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0435\u0448\u044C \u0440\u0435\u0448\u0435\u043D\u0438\u044F. \u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u0447\u0435\u0441\u0442\u043D\u043E, \u0437\u0434\u0435\u0441\u044C \u043D\u0435\u043A\u043E\u043C\u0443 \u043F\u043E\u043D\u0440\u0430\u0432\u0438\u0442\u044C\u0441\u044F.",
      questionsAnswered: (total, dataDriven) => `${total} ${pluralRu(total, "\u0432\u043E\u043F\u0440\u043E\u0441", "\u0432\u043E\u043F\u0440\u043E\u0441\u0430", "\u0432\u043E\u043F\u0440\u043E\u0441\u043E\u0432")}${dataDriven > 0 ? `, \u0438\u0437 \u043D\u0438\u0445 ${dataDriven} \u2014 \u043F\u043E \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u043C \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u0430\u043C \u0438\u0437 \u0436\u0443\u0440\u043D\u0430\u043B\u0430` : ""}`,
      startHere: "\u041D\u0430\u0447\u043D\u0438 \u0441 \u044D\u0442\u043E\u0433\u043E",
      alsoWorthNoting: "\u0415\u0449\u0451 \u0441\u0442\u043E\u0438\u0442 \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435",
      looksFine: "\u0422\u0443\u0442 \u0432\u0440\u043E\u0434\u0435 \u043F\u043E\u0440\u044F\u0434\u043E\u043A",
      disclaimer: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0430\u0446\u0438\u0438 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0435, \u043D\u0435 \u0444\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u044B\u0435 \u2014 \u043E\u043D\u0438 \u043D\u0435 \u043F\u0440\u043E \u0442\u043E, \u0447\u0442\u043E \u0442\u043E\u0440\u0433\u043E\u0432\u0430\u0442\u044C, \u0430 \u043F\u0440\u043E \u0442\u043E, \u043A\u0430\u043A \u0442\u044B \u044D\u0442\u043E \u0434\u0435\u043B\u0430\u0435\u0448\u044C.",
      done: "\u0413\u043E\u0442\u043E\u0432\u043E"
    },
    sim: {
      heading: "\u0421\u0418\u041C\u0423\u041B\u042F\u0422\u041E\u0420 \u0420\u042B\u041D\u041A\u0410",
      subtitle: "\u0418\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0440\u044B\u043D\u043E\u043A. \u0420\u0435\u0430\u043B\u044C\u043D\u044B\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u044F.",
      terminal: "\u0422\u0435\u0440\u043C\u0438\u043D\u0430\u043B",
      beta: "Beta",
      introText: "\u0420\u0430\u0434\u0430\u0440 \u043A\u0440\u0443\u043F\u043D\u044B\u0445 \u0437\u0430\u044F\u0432\u043E\u043A, \u0441\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0435 \u043D\u043E\u0432\u043E\u0441\u0442\u0438 \u0438 \u043F\u043B\u0435\u0447\u043E \u0434\u043E x50. \u0420\u044B\u043D\u043E\u043A \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0443\u0436\u0435 \xAB\u0432 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0435\xBB \u2014 \u0441 \u0438\u0441\u0442\u043E\u0440\u0438\u0435\u0439 \u043D\u0430 \u0433\u0440\u0430\u0444\u0438\u043A\u0435 \u2014 \u0438 \u0432\u0435\u0434\u0451\u0442 \u0441\u0435\u0431\u044F \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0432\u0430\u0448\u0438\u0445 \u0441\u0434\u0435\u043B\u043E\u043A.",
      startSession: "\u041D\u0430\u0447\u0430\u0442\u044C \u0441\u0435\u0441\u0441\u0438\u044E",
      capital: "\u041A\u0430\u043F\u0438\u0442\u0430\u043B",
      price: "\u0426\u0435\u043D\u0430",
      reacting: "\u0440\u0435\u0430\u043A\u0446\u0438\u044F\u2026",
      positionLiquidated: "\u041F\u043E\u0437\u0438\u0446\u0438\u044F \u043B\u0438\u043A\u0432\u0438\u0434\u0438\u0440\u043E\u0432\u0430\u043D\u0430",
      takeProfitHit: "Take-profit \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B",
      stopLossHit: "Stop-loss \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B",
      long: "\u041B\u043E\u043D\u0433",
      short: "\u0428\u043E\u0440\u0442",
      entry: "\u0432\u0445\u043E\u0434",
      margin: "\u041C\u0430\u0440\u0436\u0430",
      liq: "\u043B\u0438\u043A\u0432.",
      add: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C",
      closePosition: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u044E",
      volume: "\u043E\u0431\u044A\u0451\u043C",
      sessionOver: "\u0421\u0415\u0421\u0421\u0418\u042F \u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D\u0410",
      finalCapital: "\u041A\u0430\u043F\u0438\u0442\u0430\u043B",
      beatMarket: "\u041F\u043E\u0431\u0435\u0434\u0430 \u043D\u0430\u0434 \u0440\u044B\u043D\u043A\u043E\u043C.",
      lostToMarket: "\u0420\u044B\u043D\u043E\u043A \u043E\u043A\u0430\u0437\u0430\u043B\u0441\u044F \u0441\u0438\u043B\u044C\u043D\u0435\u0435.",
      marketReturn: "\u0414\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u0440\u044B\u043D\u043A\u0430",
      tradesCount: "\u0421\u0434\u0435\u043B\u043E\u043A",
      maxDrawdown: "\u041C\u0430\u043A\u0441. \u043F\u0440\u043E\u0441\u0430\u0434\u043A\u0430",
      liquidations: "\u041B\u0438\u043A\u0432\u0438\u0434\u0430\u0446\u0438\u0438",
      wasLiquidated: "\u0431\u044B\u043B\u0438",
      achievements: "\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F",
      playAgain: "\u0418\u0433\u0440\u0430\u0442\u044C \u0441\u043D\u043E\u0432\u0430",
      bigOrders: "\u041A\u0440\u0443\u043F\u043D\u044B\u0435 \u0437\u0430\u044F\u0432\u043A\u0438",
      bid: "\u0431\u0438\u0434",
      ask: "\u0430\u0441\u043A",
      noGuarantee: "\u041D\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u044F \u2014 \u043C\u043E\u0433\u0443\u0442 \u0441\u043D\u044F\u0442\u044C, \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0438\u043B\u0438 \u0441\u0434\u0432\u0438\u043D\u0443\u0442\u044C \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442"
    }
  },
  en: {
    nav: { home: "Home", new: "Entry", log: "Journal", patterns: "Analytics", simulator: "Game", challenge: "Challenge", coach: "Analysis", settings: "Settings" },
    coach: {
      title: "AI Analysis",
      subtitle: "Your personal analyst. Understands your trading style.",
      analyzeTitle: "Journal analysis",
      analyzeDesc: "AI will review your journal and surface key patterns, strengths and weaknesses.",
      analyzeScopeInfo: "Analyzing your full journal and detected patterns",
      analyzeBtn: "Analyze",
      analyzeBusy: "Analyzing\u2026",
      analyzeEmpty: "Tap \"Analyze\" to have AI review your journal.",
      analyzeNoEntries: "Add a few journal entries first.",
      chatTitle: "Ask AI",
      chatDesc: "Ask anything about your trades, psychology, or trading in general.",
      chatPlaceholder: "Type a message\u2026",
      chatEmpty: "Ask about your trades, patterns, or trading psychology.",
      resetChat: "Clear",
      quick: {
        lateCloses: "Why do I close trades too early?",
        strengths: "My strengths",
        losses: "Why am I losing?",
        discipline: "How can I improve discipline?",
        strategy: "Should I change my strategy?",
        style: "What's my trading style?"
      },
      disclaimer: "AI doesn't give financial advice. Analysis and observations only.",
      statusReady: "Ready to help",
      statusOnline: "AI Analysis online",
      modelLabel: "Model: Gemini",
      send: "Send",
      error: "AI is unavailable right now, try again."
    },
    home: {
      welcomeBack: (name) => `Welcome back, ${name}`,
      defaultName: "Operator",
      subtitle: "Clarity is waiting for you.",
      capital: "Capital",
      totalResult: "Total result",
      sinceStart: "since start",
      calibrationToday: (pct) => `Today's calibration: ${pct}%`,
      calibrationCta: "Calibrate before your session",
      insight: "Insight",
      marketRefresh: "Refresh",
      moodPrefix: "Market mood: ",
      insightConfident: "Recent trades show confidence is paying off \u2014 keep your size consistent.",
      insightFocus: "Focus on consistency. Add a few more trades for a real pattern to show up.",
      moodCalm: "Calm",
      moodStable: "Stable",
      moodReactive: "Reactive",
      traderLevel: "Trader level",
      awareness: "Awareness",
      reflection: "Reflection",
      discipline: "Discipline",
      riskStability: "Risk stability",
      calibrationTodayShort: "Today's calibration",
      newEntryTile: "New entry",
      logTile: "Notes",
      patternsTile: "Analytics",
      simulatorTile: "Game",
      market: "Market",
      streakDays: (n) => `${n} days in a row`,
      startStreak: "Start a streak"
    },
    newEntry: {
      title: "New entry",
      instrument: "Instrument",
      pickOrAdd: "Pick or add",
      setupType: "Setup type",
      result: (unit) => `Result (${unit})`,
      direction: "Direction",
      entry: "Entry",
      exit: "Exit",
      outcome: "Outcome",
      screenshots: (max) => `Chart screenshots (up to ${max})`,
      pullQuestion: "What pulled you into this trade?",
      pullPlaceholder: "Be honest, not flattering.",
      lessonQuestion: "What would you tell yourself next time?",
      lessonPlaceholder: "One line you'll actually remember.",
      emotionQuestion: "What did you feel the moment you entered?",
      save: "Save entry",
      emotionGrid: {
        axisTop: "On edge",
        axisBottom: "Calm",
        axisLeft: "Fear",
        axisRight: "Confidence",
        hint: "Mark where you actually were, not where you should've been",
        states: [
          "Scared and on edge",
          "Uneasy, no clear footing",
          "Confident, but wound up",
          "Some doubt, but holding steady",
          "Even, neutral state",
          "Confident and composed",
          "Calm, but unsure",
          "Calm and steady",
          "Confident and calm"
        ]
      }
    },
    log: {
      title: "Trade journal",
      totalTrades: "Total trades",
      profitable: "Profitable",
      searchPlaceholder: "Search trades\u2026",
      filters: { All: "All", Win: "Profitable", Loss: "Losing", Long: "Long", Short: "Short" },
      empty: "Nothing found. Try a different filter.",
      colEntry: "Entry",
      colExit: "Exit",
      colRR: "R/R",
      colResult: "Result"
    },
    settings: {
      title: "Settings",
      language: "App language",
      languageNote: "Changes the interface language. Your journal entries stay exactly as you wrote them.",
      russian: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
      english: "English",
      tradingAssetLabel: "What you trade",
      tradingAssetCrypto: "Crypto",
      tradingAssetForex: "Forex",
      tradingAssetStocks: "Stocks",
      tradingAssetNote: "Controls which market the AI insight on Home analyzes.",
      account: "Account",
      logout: "Log out",
      localAccountNote: "Account syncs to the cloud and is available from any device after logging in.",
      operatorName: "Operator name",
      operatorPlaceholder: "Operator",
      accentColor: "Accent color",
      resultUnits: "Result units",
      rMultiplier: "R-multiple",
      currencyLabel: "Currency",
      startingCapital: "Starting capital",
      weeklyGoalLabel: "Weekly consistency goal",
      weeklyGoalNote: "How many days a week to journal for the consistency challenge.",
      daysSuffix: "days",
      sound: "Sound",
      soundToggleLabel: "Play a sound when saving an entry",
      data: "Data",
      dataNote: "Everything saves automatically on this device (or your account, if signed in). A full backup is for switching devices or just for safety.",
      fullBackup: "Full backup (.json)",
      restoreBackup: "Restore from backup (.json)",
      exportJournalOnly: "Export journal only (.json)",
      importJournalOnly: "Import journal only (.json)",
      confirmClearJournal: "Delete all entries permanently?",
      yes: "Yes",
      cancel: "Cancel",
      clearJournal: "Clear journal",
      fullResetTitle: "Full reset",
      fullResetNote: "Erases the journal, all settings, custom instruments, calibration result, and MindCoin wallet \u2014 resets the app to its first launch.",
      confirmFullReset: "Reset absolutely everything?",
      yesReset: "Yes, reset",
      fullResetButton: "Reset the whole app",
      footerNote: "Trade screenshots are kept only for this session and aren't saved between visits. Notifications and broker sync aren't implemented yet."
    },
    challenge: {
      title: "Challenge",
      daysInARow: "days in a row",
      weeklyConsistency: "Weekly consistency",
      weeklyConsistencyDesc: (goal) => `Journal ${goal} out of 7 days this week.`,
      thisWeek: "This week",
      footer: "Consistency matters more than any single trade. A streak isn't about winning \u2014 it's about coming back to yourself even after a loss."
    },
    calibration: {
      heading: "CALIBRATION",
      subtitle: "Check your readiness for a trading session.",
      intro: "It takes less than 30 seconds. Answer honestly. The system analyzes your state, not the market.",
      start: "Start",
      loading: "Building today's questions from your recent sessions\u2026",
      adaptiveNote: "Today's calibration is built on your recent results.",
      questionOf: (i, total) => `Question ${i} of ${total}`,
      cancel: "Cancel",
      mainRiskFactor: "Main risk factor",
      whatInfluenced: "What influenced the result",
      restart: "Take it again"
    },
    pattern: {
      yourPattern: "Your pattern",
      strongSignal: "Strong signal",
      observedPattern: "Observed pattern",
      someSigns: "Some signs",
      trades: (n) => `${n} ${n === 1 ? "trade" : "trades"}`,
      winShort: "win",
      avgShort: "avg",
      breakdown: "Break it down \u2192",
      strength: "Strength",
      noClearPattern: "No clear stable pattern yet \u2014 that's a decent sign too. Keep journaling, the app keeps watching for this continuously.",
      buildingUp: (have, need) => `Still building up \u2014 ${have} / ${need}`,
      buildingUpDesc: "The app looks for repeating links between your state and your results \u2014 entries need a filled-in emotional point to count.",
      detailTitle: "Your pattern",
      tradesLabel: "Trades",
      winRateLabel: "Win rate",
      avgRLabel: "Average R",
      comparison: "Comparison",
      similarSituations: "Similar situations",
      otherTrades: "Other trades",
      whereOnMap: "Where this sits on the emotion map",
      fearToConfidence: "Fear \u2192 Confidence",
      nervousToCalm: "On edge \u2192 Calm",
      tradeExamples: "Trade examples",
      whyShown: "Why mind.exe is showing this",
      whyShownText: (n, avgGroup, avgRest) => `${n} ${n === 1 ? "trade falls" : "trades fall"} into this category. This group's average result was ${avgGroup}, versus ${avgRest} for the rest of your trades.`,
      needMoreEntries: "Add a few more trades from both sides \u2014 winning and losing \u2014 and a pattern will start to show up here.",
      noPatternYetLong: "No clear stable pattern yet \u2014 winning and losing trades come from similar emotional states. That's worth noticing in itself.",
      accumulating: (n) => `Still building material for stable conclusions (need ${n} more entries with an emotional point) \u2014 but it's already clear the journal is being kept regularly, and that's what matters.`
    },
    review: {
      heading: "REVIEW",
      notEnough: "There aren't quite enough entries yet to spot patterns in them. Add a few more trades \u2014 winning and losing \u2014 and the review will become available.",
      back: "Back",
      questionsCount: (n) => `${n} ${n === 1 ? "question" : "questions"} based on what's already visible in your journal.`,
      intro: "This isn't about the market or financial advice \u2014 only about the state you're making decisions in. Answer honestly, there's no one to impress here.",
      questionsAnswered: (total, dataDriven) => `${total} ${total === 1 ? "question" : "questions"}${dataDriven > 0 ? `, ${dataDriven} of them based on real patterns from your journal` : ""}`,
      startHere: "Start with this",
      alsoWorthNoting: "Also worth noting",
      looksFine: "This looks fine",
      disclaimer: "The recommendations are psychological, not financial \u2014 they're not about what to trade, but about how you do it.",
      done: "Done"
    },
    sim: {
      heading: "MARKET SIMULATOR",
      subtitle: "An artificial market. Real decisions.",
      terminal: "Terminal",
      beta: "Beta",
      introText: 'A radar of large orders, random news, and leverage up to x50. The market opens already "in progress" \u2014 with history on the chart \u2014 and moves independently of your trades.',
      startSession: "Start session",
      capital: "Capital",
      price: "Price",
      reacting: "reacting\u2026",
      positionLiquidated: "Position liquidated",
      takeProfitHit: "Take-profit hit",
      stopLossHit: "Stop-loss hit",
      long: "Long",
      short: "Short",
      entry: "entry",
      margin: "Margin",
      liq: "liq.",
      add: "Add",
      closePosition: "Close position",
      volume: "size",
      sessionOver: "SESSION OVER",
      finalCapital: "Capital",
      beatMarket: "You beat the market.",
      lostToMarket: "The market was stronger.",
      marketReturn: "Market return",
      tradesCount: "Trades",
      maxDrawdown: "Max drawdown",
      liquidations: "Liquidations",
      wasLiquidated: "yes",
      achievements: "Achievements",
      playAgain: "Play again",
      bigOrders: "Large orders",
      bid: "bid",
      ask: "ask",
      noGuarantee: "Not a guarantee \u2014 orders can be pulled, filled, or moved at any moment"
    }
  }
};
var CURRENCIES = [
  { code: "USD", symbol: "$", prefix: true },
  { code: "RUB", symbol: "\u20BD", prefix: false },
  { code: "EUR", symbol: "\u20AC", prefix: true },
  { code: "GBP", symbol: "\xA3", prefix: true },
  { code: "CNY", symbol: "\xA5", prefix: true },
  { code: "KZT", symbol: "\u20B8", prefix: false }
];
var BTC_DOMINANCE = 54.6;
var FEAR_GREED = { score: 44, label: "\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E" };
var ring = (accent) => `0 0 0 1px ${accent}35`;
var softLift = (accent) => `0 0 0 1px ${accent}35, 0 6px 20px ${accent}1F`;
var outcomeColor = (o) => o === "Win" ? WIN : o === "Loss" ? LOSS : FLAT;
function deriveEntryStatus(e) {
  if (e.status === "open" || e.status === "closed") return e.status;
  return e.outcome != null ? "closed" : "open";
}
function migrateEntry(e) {
  return {
    ...e,
    status: deriveEntryStatus(e),
    exitDate: e.exitDate ? e.exitDate : null,
    stopLoss: typeof e.stopLoss === "number" && !isNaN(e.stopLoss) ? e.stopLoss : null,
    takeProfit: typeof e.takeProfit === "number" && !isNaN(e.takeProfit) ? e.takeProfit : null,
    plannedRR: typeof e.plannedRR === "number" && !isNaN(e.plannedRR) ? e.plannedRR : null,
    closeType: ["tp", "sl", "manual"].includes(e.closeType) ? e.closeType : null,
    realizedRR: typeof e.realizedRR === "number" && !isNaN(e.realizedRR) ? e.realizedRR : null,
    exitScreenshots: Array.isArray(e.exitScreenshots) ? e.exitScreenshots : []
  };
}
var isEntryClosed = (e) => e.status === "closed";
function computePlannedRR(direction, entry, sl, tp) {
  if ([entry, sl, tp].some((v) => typeof v !== "number" || isNaN(v) || !isFinite(v))) return { ok: false, error: "\u0417\u0430\u043F\u043E\u043B\u043D\u0438 Entry, SL \u0438 TP \u0447\u0438\u0441\u043B\u0430\u043C\u0438" };
  const risk = direction === "Short" ? sl - entry : entry - sl;
  const reward = direction === "Short" ? entry - tp : tp - entry;
  if (risk <= 0) return { ok: false, error: direction === "Short" ? "SL \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u0432\u044B\u0448\u0435 Entry" : "SL \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043D\u0438\u0436\u0435 Entry" };
  if (reward <= 0) return { ok: false, error: direction === "Short" ? "TP \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043D\u0438\u0436\u0435 Entry" : "TP \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u0432\u044B\u0448\u0435 Entry" };
  const rr = reward / risk;
  if (!isFinite(rr) || isNaN(rr)) return { ok: false, error: "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F" };
  return { ok: true, rr };
}
function computeRealizedRR(direction, entry, sl, exit) {
  if ([entry, sl, exit].some((v) => typeof v !== "number" || isNaN(v) || !isFinite(v))) return null;
  const risk = direction === "Short" ? sl - entry : entry - sl;
  if (!risk || risk <= 0) return null;
  const reward = direction === "Short" ? entry - exit : exit - entry;
  const rr = reward / risk;
  return isFinite(rr) && !isNaN(rr) ? rr : null;
}
var findCurrency = (code) => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
var groupThousands = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
var isToday = (isoDate) => !!isoDate && new Date(isoDate).toDateString() === (/* @__PURE__ */ new Date()).toDateString();
function unitSymbol(measureMode, currencyCode) {
  return measureMode === "R" ? "R" : findCurrency(currencyCode).symbol;
}
function formatResult(value, measureMode, currencyCode) {
  if (value === null || value === void 0) return "\u2014";
  if (measureMode === "R") {
    const v2 = Math.round(value * 10) / 10;
    return `${v2 > 0 ? "+" : ""}${v2}R`;
  }
  const cur = findCurrency(currencyCode);
  const v = Math.round(value);
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  const abs = groupThousands(Math.abs(v));
  return cur.prefix ? `${sign}${cur.symbol}${abs}` : `${sign}${abs} ${cur.symbol}`;
}
function formatPriceValue(v) {
  if (v == null || isNaN(v)) return "\u2014";
  if (Math.abs(v) >= 1e3) return groupThousands(Math.round(v));
  if (Math.abs(v) >= 1) return (Math.round(v * 100) / 100).toString();
  return (Math.round(v * 1e4) / 1e4).toString();
}
function formatBalance(value, currencyCode) {
  const cur = findCurrency(currencyCode);
  const v = Math.round(value);
  const sign = v < 0 ? "-" : "";
  const abs = groupThousands(Math.abs(v));
  return cur.prefix ? `${sign}${cur.symbol}${abs}` : `${sign}${abs} ${cur.symbol}`;
}
function useAnimatedNumber(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    if (from === to) return;
    let start;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min(1, (ts - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
      else prevRef.current = to;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return display;
}
function useIsDesktop(breakpoint = 900) {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== "undefined" && window.innerWidth >= breakpoint);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${breakpoint}px)`);
    const handler = (e) => setIsDesktop(e.matches);
    handler(mq);
    if (mq.addEventListener) mq.addEventListener("change", handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handler);
      else mq.removeListener(handler);
    };
  }, [breakpoint]);
  return isDesktop;
}
function calculateTraderLevel(entriesCount) {
  return Math.min(9, 3 + Math.floor(entriesCount / 3));
}
function calculateCalendarStats(dayEntries, closedDayEntries) {
  if (!dayEntries.length) return null;
  const closed = closedDayEntries || dayEntries.filter(isEntryClosed);
  const wins = closed.filter((e) => e.outcome === "Win").length;
  const losses = closed.filter((e) => e.outcome === "Loss").length;
  const breakevens = closed.filter((e) => e.outcome === "Breakeven").length;
  const avgR = closed.length ? closed.reduce((s, e) => s + (e.r || 0), 0) / closed.length : 0;
  const countBy = (key) => {
    const counts = {};
    dayEntries.forEach((e) => {
      const v = e[key];
      if (v) counts[v] = (counts[v] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length ? { value: sorted[0][0], count: sorted[0][1] } : null;
  };
  const topInstrument = countBy("instrument");
  const topTag = countBy("tag");
  const emoPoints = dayEntries.filter((e) => e.x != null && e.y != null);
  let mood = null, moodColor = BASE.inkFaint;
  if (emoPoints.length) {
    const avgX = emoPoints.reduce((s, e) => s + e.x, 0) / emoPoints.length;
    const avgY = emoPoints.reduce((s, e) => s + e.y, 0) / emoPoints.length;
    mood = avgX >= 50 && avgY >= 50 ? "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E \u0438 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E" : avgX >= 50 && avgY < 50 ? "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E, \u043D\u043E \u043D\u0430 \u0432\u0437\u0432\u043E\u0434\u0435" : avgX < 50 && avgY >= 50 ? "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E, \u043D\u043E \u043D\u0435\u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E" : "\u0421\u0442\u0440\u0430\u0448\u043D\u043E \u0438 \u043D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445";
    moodColor = avgX >= 50 && avgY >= 50 ? WIN : avgX < 50 && avgY < 50 ? LOSS : BASE.inkDim;
  }
  return { wins, losses, breakevens, avgR, topInstrument, topTag, mood, moodColor };
}
var daysAgo = (n) => {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d;
};
var relTime = (date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 864e5);
  if (diff <= 0) return "\u0421\u0435\u0433\u043E\u0434\u043D\u044F";
  if (diff === 1) return "\u0412\u0447\u0435\u0440\u0430";
  if (diff < 7) return `${diff} \u0434\u043D. \u043D\u0430\u0437\u0430\u0434`;
  return `${Math.floor(diff / 7)} \u043D\u0435\u0434. \u043D\u0430\u0437\u0430\u0434`;
};
var pluralRu = (n, one, few, many) => {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
};
function compressImageFile(file, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image decode failed"));
    };
    img.src = url;
  });
}
var seedEntries = [
  {
    id: 1,
    instrument: "EUR/USD",
    direction: "Long",
    outcome: "Loss",
    x: 78,
    y: 82,
    r: -1.2,
    tag: "\u041F\u0440\u043E\u0431\u043E\u0439",
    screenshots: [],
    pull: "\u0423\u0432\u0438\u0434\u0435\u043B, \u043A\u0430\u043A \u043F\u0430\u0440\u0430 \u043F\u0440\u043E\u043B\u0435\u0442\u0435\u043B\u0430 40 \u043F\u0443\u043D\u043A\u0442\u043E\u0432 \u0437\u0430 10 \u043C\u0438\u043D\u0443\u0442, \u0438 \u043D\u0435 \u0445\u043E\u0442\u0435\u043B \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435.",
    lesson: "\u041F\u043E\u0433\u043E\u043D\u044F \u0437\u0430 \u0441\u0432\u0435\u0447\u043E\u0439 \u2014 \u044D\u0442\u043E \u043D\u0435 \u0441\u0435\u0442\u0430\u043F. \u0414\u043E\u0436\u0434\u0438\u0441\u044C, \u043F\u043E\u043A\u0430 \u0446\u0435\u043D\u0430 \u0432\u0435\u0440\u043D\u0451\u0442\u0441\u044F \u043A \u0442\u0435\u0431\u0435.",
    date: daysAgo(3)
  },
  {
    id: 2,
    instrument: "TSLA",
    direction: "Short",
    outcome: "Win",
    x: 62,
    y: 40,
    r: 2.1,
    tag: "\u0420\u0430\u0437\u0432\u043E\u0440\u043E\u0442",
    screenshots: [],
    pull: "\u0427\u0451\u0442\u043A\u0438\u0439 \u043E\u0442\u0431\u043E\u0439 \u043E\u0442 \u0441\u043E\u043F\u0440\u043E\u0442\u0438\u0432\u043B\u0435\u043D\u0438\u044F, \u0432\u0441\u0451 \u0441\u043E\u0432\u043F\u0430\u043B\u043E \u0441 \u043F\u043B\u0430\u043D\u043E\u043C, \u0441\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u043C \u0434\u043E \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F \u0440\u044B\u043D\u043A\u0430.",
    lesson: "\u0412\u043E\u0442 \u043A\u0430\u043A \u0432\u044B\u0433\u043B\u044F\u0434\u044F\u0442 \u0441\u043A\u0443\u0447\u043D\u044B\u0435 \u0438 \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438. \u0417\u0430\u043F\u043E\u043C\u043D\u0438 \u044D\u0442\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435.",
    date: daysAgo(5)
  },
  {
    id: 3,
    instrument: "NAS100",
    direction: "Long",
    outcome: "Loss",
    x: 22,
    y: 71,
    r: -2,
    tag: "\u0420\u0435\u0432\u0430\u043D\u0448",
    screenshots: [],
    pull: "\u0420\u0435\u0432\u0430\u043D\u0448-\u0442\u0440\u0435\u0439\u0434 \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0441\u0442\u043E\u043F\u0430 \u043F\u043E TSLA, \u0445\u043E\u0442\u0435\u043B \u043E\u0442\u044B\u0433\u0440\u0430\u0442\u044C\u0441\u044F.",
    lesson: "\u042F \u0442\u043E\u0440\u0433\u043E\u0432\u0430\u043B \u043D\u0435 \u0433\u0440\u0430\u0444\u0438\u043A, \u0430 \u0441\u0432\u043E\u0439 P&L.",
    date: daysAgo(5)
  },
  {
    id: 4,
    instrument: "GBP/JPY",
    direction: "Short",
    outcome: "Win",
    x: 70,
    y: 35,
    r: 1.6,
    tag: "\u0422\u0440\u0435\u043D\u0434",
    screenshots: [],
    pull: "\u0421\u043F\u0435\u0446\u0438\u0430\u043B\u044C\u043D\u043E \u0443\u043C\u0435\u043D\u044C\u0448\u0438\u043B \u043E\u0431\u044A\u0451\u043C, \u043D\u0435 \u0431\u044B\u043B\u043E \u0441\u043F\u0435\u0448\u043A\u0438 \u2014 \u043F\u0440\u043E\u0441\u0442\u043E \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u043B \u043F\u043B\u0430\u043D.",
    lesson: "\u041C\u0435\u043D\u044C\u0448\u0435 \u043E\u0431\u044A\u0451\u043C, \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u0435\u0435 \u0433\u043E\u043B\u043E\u0432\u0430, \u0442\u043E\u0447\u043D\u0435\u0435 \u0447\u0442\u0435\u043D\u0438\u0435 \u0440\u044B\u043D\u043A\u0430. \u0412\u0437\u044F\u043B \u043D\u0430 \u0437\u0430\u043C\u0435\u0442\u043A\u0443.",
    date: daysAgo(1)
  },
  {
    id: 5,
    instrument: "BTC/USD",
    direction: "Long",
    outcome: "Breakeven",
    x: 48,
    y: 55,
    r: 0,
    tag: "\u0424\u043B\u044D\u0442",
    screenshots: [],
    pull: "\u041D\u0435 \u0431\u044B\u043B \u0443\u0432\u0435\u0440\u0435\u043D, \u0432\u0437\u044F\u043B \u043F\u043E\u043B\u043E\u0432\u0438\u043D\u0443 \u043E\u0431\u044A\u0451\u043C\u0430 \u043A\u0430\u043A \u043A\u043E\u043C\u043F\u0440\u043E\u043C\u0438\u0441\u0441 \u0441 \u0441\u0430\u043C\u0438\u043C \u0441\u043E\u0431\u043E\u0439.",
    lesson: "\u0421\u0434\u0435\u043B\u043A\u0438 \u0441 \u043F\u043E\u043B\u043E\u0432\u0438\u043D\u0447\u0430\u0442\u043E\u0439 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C\u044E \u0441\u044A\u0435\u0434\u0430\u044E\u0442 \u0441\u043B\u043E\u0442\u044B. \u041B\u0438\u0431\u043E \u043D\u0430 \u043F\u043E\u043B\u043D\u0443\u044E, \u043B\u0438\u0431\u043E \u043C\u0438\u043C\u043E.",
    date: daysAgo(2)
  },
  {
    id: 6,
    instrument: "XAU/USD",
    direction: "Short",
    outcome: "Loss",
    x: 30,
    y: 88,
    r: -1.5,
    tag: "\u041D\u043E\u0432\u043E\u0441\u0442\u0438",
    screenshots: [],
    pull: "\u0422\u043E\u043B\u044C\u043A\u043E \u0432\u044B\u0448\u0435\u043B CPI, \u0445\u043E\u0442\u0435\u043B \u0432\u043E\u0439\u0442\u0438 \u043F\u0435\u0440\u0432\u044B\u043C, \u043F\u043E\u043A\u0430 \u043D\u0435 \u0443\u043B\u0435\u0442\u0435\u043B\u043E \u0435\u0449\u0451 \u0434\u0430\u043B\u044C\u0448\u0435.",
    lesson: "\u041D\u043E\u0432\u043E\u0441\u0442\u043D\u044B\u0435 \u0441\u043F\u0430\u0439\u043A\u0438 \u2014 \u044D\u0442\u043E \u043B\u043E\u0442\u0435\u0440\u0435\u044F, \u0430 \u043D\u0435 \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u043E.",
    date: daysAgo(0)
  }
];
var CALIBRATION_QUESTIONS = [
  {
    id: "sleep",
    text: "\u041A\u0430\u043A \u0432\u044B \u0441\u043F\u0430\u043B\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F?",
    positive: "\u0425\u043E\u0440\u043E\u0448\u0438\u0439 \u0441\u043E\u043D",
    negative: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0441\u043D\u0430",
    options: [
      { label: "\u041E\u0442\u043B\u0438\u0447\u043D\u043E", score: 2 },
      { label: "\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u043E", score: 1 },
      { label: "\u041F\u043B\u043E\u0445\u043E", score: -1 },
      { label: "\u041F\u043E\u0447\u0442\u0438 \u043D\u0435 \u0441\u043F\u0430\u043B", score: -2 }
    ]
  },
  {
    id: "emotion",
    text: "\u0412\u0430\u0448\u0435 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435?",
    positive: "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435",
    negative: "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u0430\u044F \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
    options: [
      { label: "\u0421\u043F\u043E\u043A\u043E\u0435\u043D", score: 2 },
      { label: "\u041D\u0435\u043C\u043D\u043E\u0433\u043E \u043D\u0430\u043F\u0440\u044F\u0436\u0451\u043D", score: 0 },
      { label: "\u0420\u0430\u0437\u0434\u0440\u0430\u0436\u0451\u043D", score: -1 },
      { label: "\u041E\u0447\u0435\u043D\u044C \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u0435\u043D", score: -2, flag: "emotion" }
    ]
  },
  {
    id: "motivation",
    text: "\u041F\u043E\u0447\u0435\u043C\u0443 \u0432\u044B \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0435 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B?",
    positive: "\u0427\u0451\u0442\u043A\u0438\u0439 \u043F\u043B\u0430\u043D \u043D\u0430 \u0441\u0435\u0441\u0441\u0438\u044E",
    negative: "\u0416\u0435\u043B\u0430\u043D\u0438\u0435 \u043E\u0442\u0431\u0438\u0442\u044C \u0443\u0431\u044B\u0442\u043A\u0438",
    options: [
      { label: "\u0421\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u043F\u043B\u0430\u043D\u0443", score: 2 },
      { label: "\u0415\u0441\u0442\u044C \u0445\u043E\u0440\u043E\u0448\u0438\u0435 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438", score: 1 },
      { label: "\u0425\u043E\u0447\u0443 \u043E\u0442\u0431\u0438\u0442\u044C \u0443\u0431\u044B\u0442\u043A\u0438", score: -2, flag: "revenge" },
      { label: "\u041F\u0440\u043E\u0441\u0442\u043E \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u043E\u0442\u043E\u0440\u0433\u043E\u0432\u0430\u0442\u044C", score: -1 }
    ]
  },
  {
    id: "walkaway",
    text: "\u0415\u0441\u043B\u0438 \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u0445\u043E\u0440\u043E\u0448\u0438\u0445 \u0432\u0445\u043E\u0434\u043E\u0432, \u0441\u043C\u043E\u0436\u0435\u0442\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u044C \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B \u0431\u0435\u0437 \u0441\u0434\u0435\u043B\u043A\u0438?",
    positive: "\u0413\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0441\u0435\u0441\u0441\u0438\u044E",
    negative: "\u0421\u043B\u043E\u0436\u043D\u043E \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C\u0441\u044F \u0431\u0435\u0437 \u0441\u0434\u0435\u043B\u043A\u0438",
    options: [
      { label: "\u0414\u0430", score: 2 },
      { label: "\u0421\u043A\u043E\u0440\u0435\u0435 \u0434\u0430", score: 1 },
      { label: "\u0421\u043A\u043E\u0440\u0435\u0435 \u043D\u0435\u0442", score: -1 },
      { label: "\u041D\u0435\u0442", score: -2 }
    ]
  },
  {
    id: "noTradeFeeling",
    text: "\u0427\u0442\u043E \u043F\u043E\u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0435\u0442\u0435, \u0435\u0441\u043B\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u043D\u0438 \u043E\u0434\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438?",
    positive: "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F \u043A \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0438\u044E \u0441\u0434\u0435\u043B\u043E\u043A",
    negative: "\u0421\u0442\u0440\u0430\u0445 \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435",
    options: [
      { label: "\u041D\u0438\u0447\u0435\u0433\u043E", score: 2 },
      { label: "\u041B\u0451\u0433\u043A\u043E\u0435 \u0440\u0430\u0437\u043E\u0447\u0430\u0440\u043E\u0432\u0430\u043D\u0438\u0435", score: 1 },
      { label: "\u0411\u0443\u0434\u0435\u0442 \u043D\u0435\u043F\u0440\u0438\u044F\u0442\u043D\u043E", score: -1 },
      { label: "\u0411\u0443\u0434\u0443 \u0447\u0443\u0432\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C, \u0447\u0442\u043E \u0443\u043F\u0443\u0441\u0442\u0438\u043B \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C", score: -2, flag: "fomo" }
    ]
  },
  {
    id: "objectivity",
    text: "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043E\u0431\u044A\u0435\u043A\u0442\u0438\u0432\u043D\u043E \u0432\u044B \u0441\u0435\u0439\u0447\u0430\u0441 \u043E\u0446\u0435\u043D\u0438\u0432\u0430\u0435\u0442\u0435 \u0440\u044B\u043D\u043E\u043A?",
    positive: "\u0422\u0440\u0435\u0437\u0432\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430 \u0440\u044B\u043D\u043A\u0430",
    negative: "\u042D\u043C\u043E\u0446\u0438\u0438 \u0432\u043B\u0438\u044F\u044E\u0442 \u043D\u0430 \u043E\u0446\u0435\u043D\u043A\u0443 \u0440\u044B\u043D\u043A\u0430",
    options: [
      { label: "\u041F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E", score: 2 },
      { label: "\u0421\u043A\u043E\u0440\u0435\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E", score: 1 },
      { label: "\u0415\u0441\u0442\u044C \u0441\u043E\u043C\u043D\u0435\u043D\u0438\u044F", score: -1 },
      { label: "\u0421\u0438\u043B\u044C\u043D\u044B\u0435 \u044D\u043C\u043E\u0446\u0438\u0438 \u0438\u043B\u0438 \u0447\u0440\u0435\u0437\u043C\u0435\u0440\u043D\u0430\u044F \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C", score: -2, flag: "emotion" }
    ]
  }
];
var CALIBRATION_QUESTIONS_EN = [
  {
    id: "sleep",
    text: "How did you sleep today?",
    positive: "Good sleep",
    negative: "Lack of sleep",
    options: [
      { label: "Great", score: 2 },
      { label: "Fine", score: 1 },
      { label: "Poorly", score: -1 },
      { label: "Barely slept", score: -2 }
    ]
  },
  {
    id: "emotion",
    text: "How's your emotional state?",
    positive: "Calm state",
    negative: "Elevated emotions",
    options: [
      { label: "Calm", score: 2 },
      { label: "A bit tense", score: 0 },
      { label: "Irritated", score: -1 },
      { label: "Very emotional", score: -2, flag: "emotion" }
    ]
  },
  {
    id: "motivation",
    text: "Why are you opening the terminal today?",
    positive: "Clear plan for the session",
    negative: "Wanting to win back losses",
    options: [
      { label: "To follow the plan", score: 2 },
      { label: "There are good opportunities", score: 1 },
      { label: "I want to win back losses", score: -2, flag: "revenge" },
      { label: "Just feel like trading", score: -1 }
    ]
  },
  {
    id: "walkaway",
    text: "If there are no good entries, can you close the terminal without trading?",
    positive: "Willing to skip the session",
    negative: "Hard to stop without a trade",
    options: [
      { label: "Yes", score: 2 },
      { label: "Probably yes", score: 1 },
      { label: "Probably not", score: -1 },
      { label: "No", score: -2 }
    ]
  },
  {
    id: "noTradeFeeling",
    text: "How would you feel if there were no trades at all today?",
    positive: "Calm about having no trades",
    negative: "Fear of missing out",
    options: [
      { label: "Nothing", score: 2 },
      { label: "Mild disappointment", score: 1 },
      { label: "Would feel unpleasant", score: -1 },
      { label: "Would feel like I missed an opportunity", score: -2, flag: "fomo" }
    ]
  },
  {
    id: "objectivity",
    text: "How objectively are you assessing the market right now?",
    positive: "Sober market assessment",
    negative: "Emotions are affecting your read on the market",
    options: [
      { label: "Completely calm", score: 2 },
      { label: "Mostly calm", score: 1 },
      { label: "Some doubts", score: -1 },
      { label: "Strong emotions or overconfidence", score: -2, flag: "emotion" }
    ]
  }
];
var CALIBRATION_TIERS = [
  { label: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u0430 \u2014 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043E\u0442\u043B\u0438\u0447\u043D\u043E\u0435.", color: WIN },
  { label: "\u0413\u043E\u0442\u043E\u0432 \u043A \u0442\u043E\u0440\u0433\u043E\u0432\u043B\u0435 \u2014 \u043C\u043E\u0436\u043D\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u043F\u043E \u043F\u043B\u0430\u043D\u0443.", color: WIN },
  { label: "\u041F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0440\u0438\u0441\u043A\u0430 \u2014 \u0441\u043E\u0431\u043B\u044E\u0434\u0430\u0442\u044C \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0443.", color: WARN },
  { label: "\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u043E\u0441\u0442\u043E\u0440\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u2014 \u0441\u043D\u0438\u0437\u0438\u0442\u044C \u0440\u0438\u0441\u043A \u043D\u0430 30\u201350%.", color: LOSS },
  { label: "\u0422\u043E\u0440\u0433\u043E\u0432\u043B\u044F \u043D\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \u2014 \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u0432\u0435\u0440\u043E\u044F\u0442\u043D\u043E\u0441\u0442\u044C \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0440\u0435\u0448\u0435\u043D\u0438\u0439.", color: LOSS }
];
var CALIBRATION_TIERS_EN = [
  { label: "System stable \u2014 great state.", color: WIN },
  { label: "Ready to trade \u2014 you can work the plan.", color: WIN },
  { label: "Elevated risk level \u2014 stick to discipline.", color: WARN },
  { label: "Caution recommended \u2014 cut risk by 30\u201350%.", color: LOSS },
  { label: "Trading not recommended \u2014 high chance of emotional decisions.", color: LOSS }
];
function scoreCalibration(answers, lang = "ru") {
  const questions = lang === "en" ? CALIBRATION_QUESTIONS_EN : CALIBRATION_QUESTIONS;
  const tiers = lang === "en" ? CALIBRATION_TIERS_EN : CALIBRATION_TIERS;
  const total = questions.reduce((s, q) => s + (answers[q.id]?.score ?? 0), 0);
  const pct = Math.max(0, Math.min(100, Math.round((total + 12) / 24 * 100)));
  let tierIndex = pct >= 85 ? 0 : pct >= 70 ? 1 : pct >= 50 ? 2 : pct >= 30 ? 3 : 4;
  const riskFactors = [];
  if (answers.motivation?.flag === "revenge") riskFactors.push(lang === "en" ? "Wanting to win back losses" : "\u0416\u0435\u043B\u0430\u043D\u0438\u0435 \u043E\u0442\u0431\u0438\u0442\u044C \u0443\u0431\u044B\u0442\u043A\u0438");
  if (answers.emotion?.flag === "emotion" || answers.objectivity?.flag === "emotion") riskFactors.push(lang === "en" ? "Strong emotional involvement" : "\u0421\u0438\u043B\u044C\u043D\u0430\u044F \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u043E\u0432\u043B\u0435\u0447\u0451\u043D\u043D\u043E\u0441\u0442\u044C");
  if (riskFactors.length) tierIndex = Math.max(tierIndex, 2);
  const factors = questions.map((q) => {
    const a = answers[q.id];
    if (!a) return null;
    if (a.score === 2) return { type: "positive", text: q.positive };
    if (a.score === -2) return { type: "warning", text: q.negative };
    return null;
  }).filter(Boolean);
  return { pct, tier: tiers[tierIndex], riskFactors, factors };
}
// ---- Adaptive Calibration: shared answer scale + scorer ---------------------
// Adaptive (Gemini-written) questions don't carry their own per-option scores — that would let
// the model influence scoring, which p.14 of the spec explicitly forbids. Instead every adaptive
// question uses this one fixed 4-point readiness scale, and score is derived purely from which
// option (position) the user picked. Baseline questions (sleep/emotion, pulled from
// CALIBRATION_QUESTIONS as-is) keep their existing custom-labeled options untouched.
var CALIBRATION_READINESS_SCALE = [
  { label: "\u041D\u0435\u0442", score: -2 },
  { label: "\u0421\u043A\u043E\u0440\u0435\u0435 \u043D\u0435\u0442", score: -1 },
  { label: "\u0421\u043A\u043E\u0440\u0435\u0435 \u0434\u0430", score: 1 },
  { label: "\u0414\u0430", score: 2 }
];
var CALIBRATION_READINESS_SCALE_EN = [
  { label: "No", score: -2 },
  { label: "Probably not", score: -1 },
  { label: "Probably yes", score: 1 },
  { label: "Yes", score: 2 }
];
var ADAPTIVE_FACTOR_LABELS = {
  consecutive_losses: { ru: "\u0421\u0435\u0440\u0438\u044F \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A", en: "A losing streak" },
  euphoria_risk: { ru: "\u042D\u0439\u0444\u043E\u0440\u0438\u044F \u043F\u043E\u0441\u043B\u0435 \u0441\u0435\u0440\u0438\u0438 \u043F\u043E\u0431\u0435\u0434", en: "Euphoria after a winning streak" },
  revenge_risk: { ru: "\u0416\u0435\u043B\u0430\u043D\u0438\u0435 \u0431\u044B\u0441\u0442\u0440\u043E \u043E\u0442\u044B\u0433\u0440\u0430\u0442\u044C\u0441\u044F", en: "Wanting to win back losses quickly" },
  increased_risk: { ru: "\u0420\u0438\u0441\u043A \u0432\u044B\u0448\u0435 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430", en: "Risk creeping up after a loss" },
  overtrading_risk: { ru: "\u0421\u043A\u043B\u043E\u043D\u043D\u043E\u0441\u0442\u044C \u043A \u043F\u0435\u0440\u0435\u0442\u043E\u0440\u0433\u043E\u0432\u043B\u0435", en: "Tendency to overtrade" },
  early_exit_pattern: { ru: "\u0420\u0430\u043D\u043D\u0438\u0435 \u0432\u044B\u0445\u043E\u0434\u044B \u0438\u0437 \u043F\u043E\u0437\u0438\u0446\u0438\u0439", en: "Exiting positions early" },
  fomo_risk: { ru: "FOMO \u2014 \u0441\u0442\u0440\u0430\u0445 \u043F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435", en: "FOMO \u2014 fear of missing the move" },
  repeated_lesson: { ru: "\u041F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0439\u0441\u044F \u0443\u0440\u043E\u043A", en: "A recurring lesson" },
  poor_sleep: { ru: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0441\u043D\u0430", en: "Lack of sleep" },
  decreased_discipline: { ru: "\u0421\u043D\u0438\u0436\u0435\u043D\u043D\u0430\u044F \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0430", en: "Discipline slipping" },
  reflection_note: { ru: "\u0412\u0447\u0435\u0440\u0430\u0448\u043D\u044F\u044F \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u044F", en: "Yesterday's reflection" }
};
function caFactorLabel(factor, lang) {
  const entry = ADAPTIVE_FACTOR_LABELS[factor];
  if (!entry) return null;
  return lang === "en" ? entry.en : entry.ru;
}
// Works for any question list: static CALIBRATION_QUESTIONS, or the mixed baseline+adaptive
// list assembled by assembleCalibrationQuestions(). Baseline questions keep their embedded
// positive/negative/flag; adaptive questions derive their factor label from q.factor when the
// user picks a low-readiness option (score <= -1) on the shared scale.
function scoreCalibrationDynamic(questions, answers, lang = "ru") {
  const tiers = lang === "en" ? CALIBRATION_TIERS_EN : CALIBRATION_TIERS;
  const total = questions.reduce((s, q) => s + (answers[q.id]?.score ?? 0), 0);
  const maxAbs = Math.max(1, questions.length) * 2;
  const pct = Math.max(0, Math.min(100, Math.round((total + maxAbs) / (2 * maxAbs) * 100)));
  let tierIndex = pct >= 85 ? 0 : pct >= 70 ? 1 : pct >= 50 ? 2 : pct >= 30 ? 3 : 4;
  const riskFactors = [];
  const factors = [];
  questions.forEach((q) => {
    const a = answers[q.id];
    if (!a) return;
    if (q.source === "adaptive" || q.source === "fallback") {
      const label = caFactorLabel(q.factor, lang);
      if (a.score <= -1 && label && !riskFactors.includes(label)) riskFactors.push(label);
      if (a.score === 2) factors.push({ type: "positive", text: q.text });
      else if (a.score === -2) factors.push({ type: "warning", text: label || q.text });
    } else {
      if (a.score === 2 && q.positive) factors.push({ type: "positive", text: q.positive });
      if (a.score === -2 && q.negative) factors.push({ type: "warning", text: q.negative });
      if (a.flag === "revenge") {
        const t2 = lang === "en" ? "Wanting to win back losses" : "\u0416\u0435\u043B\u0430\u043D\u0438\u0435 \u043E\u0442\u0431\u0438\u0442\u044C \u0443\u0431\u044B\u0442\u043A\u0438";
        if (!riskFactors.includes(t2)) riskFactors.push(t2);
      }
      if (a.flag === "emotion") {
        const t2 = lang === "en" ? "Strong emotional involvement" : "\u0421\u0438\u043B\u044C\u043D\u0430\u044F \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0432\u043E\u0432\u043B\u0435\u0447\u0451\u043D\u043D\u043E\u0441\u0442\u044C";
        if (!riskFactors.includes(t2)) riskFactors.push(t2);
      }
      if (a.flag === "fomo") {
        const t2 = lang === "en" ? "Fear of missing out" : "\u0421\u0442\u0440\u0430\u0445 \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C";
        if (!riskFactors.includes(t2)) riskFactors.push(t2);
      }
    }
  });
  if (riskFactors.length) tierIndex = Math.max(tierIndex, 2);
  return { pct, tier: tiers[tierIndex], riskFactors, factors };
}
var REVIEW_LIKERT = [
  { label: "\u041F\u043E\u0447\u0442\u0438 \u043D\u0438\u043A\u043E\u0433\u0434\u0430", score: 0 },
  { label: "\u0418\u043D\u043E\u0433\u0434\u0430", score: 1 },
  { label: "\u0427\u0430\u0441\u0442\u043E", score: 2 },
  { label: "\u041F\u043E\u0447\u0442\u0438 \u0432\u0441\u0435\u0433\u0434\u0430", score: 3 }
];
var REVIEW_LIKERT_EN = [
  { label: "Almost never", score: 0 },
  { label: "Sometimes", score: 1 },
  { label: "Often", score: 2 },
  { label: "Almost always", score: 3 }
];
var REVIEW_MIN_QUESTIONS = 5;
var REVIEW_MAX_QUESTIONS = 8;
var GENERIC_REVIEW_QUESTIONS = [
  {
    id: "g_plan",
    dataDriven: false,
    title: "\u0422\u043E\u0440\u0433\u043E\u0432\u043B\u044F \u0431\u0435\u0437 \u043F\u043B\u0430\u043D\u0430",
    evidence: "\u041E\u0431\u0449\u0438\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u2014 \u0436\u0443\u0440\u043D\u0430\u043B \u043F\u043E\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0433\u043E \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u043F\u043E \u0446\u0438\u0444\u0440\u0430\u043C.",
    question: "\u041A\u0430\u043A \u0447\u0430\u0441\u0442\u043E \u0442\u044B \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0448\u044C \u0441\u0434\u0435\u043B\u043A\u0443 \u0431\u0435\u0437 \u0437\u0430\u0440\u0430\u043D\u0435\u0435 \u043F\u0440\u043E\u043F\u0438\u0441\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u043B\u0430\u043D\u0430 \u2014 \u0442\u043E\u0447\u043A\u0438 \u0432\u0445\u043E\u0434\u0430, \u0441\u0442\u043E\u043F\u0430 \u0438 \u0446\u0435\u043B\u0438?",
    recommendation: "\u041F\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043C \u0432\u0445\u043E\u0434\u0438\u0442\u044C, \u0437\u0430\u043F\u0438\u0448\u0438 \u0442\u0440\u0438 \u0447\u0438\u0441\u043B\u0430: \u0432\u0445\u043E\u0434, \u0441\u0442\u043E\u043F, \u0446\u0435\u043B\u044C. \u0415\u0441\u043B\u0438 \u043D\u0435 \u043C\u043E\u0436\u0435\u0448\u044C \u2014 \u0441\u0434\u0435\u043B\u043A\u0430 \u0435\u0449\u0451 \u043D\u0435 \u0433\u043E\u0442\u043E\u0432\u0430, \u044D\u0442\u043E \u043D\u0435 \u043F\u0440\u043E \u0440\u044B\u043D\u043E\u043A."
  },
  {
    id: "g_overconf",
    dataDriven: false,
    title: "\u0420\u0438\u0441\u043A \u043F\u043E\u0441\u043B\u0435 \u0441\u0435\u0440\u0438\u0438 \u043F\u043E\u0431\u0435\u0434",
    evidence: "\u041E\u0431\u0449\u0438\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u2014 \u0436\u0443\u0440\u043D\u0430\u043B \u043F\u043E\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0433\u043E \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u043F\u043E \u0446\u0438\u0444\u0440\u0430\u043C.",
    question: "\u041F\u043E\u0441\u043B\u0435 \u043F\u0430\u0440\u044B \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u043F\u043E\u0434\u0440\u044F\u0434 \u0442\u0435\u0431\u0435 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C \u0440\u0430\u0437\u043C\u0435\u0440 \u043F\u043E\u0437\u0438\u0446\u0438\u0438?",
    recommendation: "\u0421\u0435\u0440\u0438\u044F \u043F\u043E\u0431\u0435\u0434 \u043D\u0435 \u043E\u0442\u043C\u0435\u043D\u044F\u0435\u0442 \u043F\u043B\u0430\u043D \u043F\u043E \u0440\u0438\u0441\u043A\u0443. \u0415\u0441\u043B\u0438 \u0438 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0442\u044C \u0447\u0442\u043E-\u0442\u043E \u2014 \u0442\u043E \u043E\u0441\u0442\u043E\u0440\u043E\u0436\u043D\u043E\u0441\u0442\u044C, \u0430 \u043D\u0435 \u043E\u0431\u044A\u0451\u043C."
  },
  {
    id: "g_honesty",
    dataDriven: false,
    title: "\u0427\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u044C \u0436\u0443\u0440\u043D\u0430\u043B\u0430",
    evidence: "\u041E\u0431\u0449\u0438\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u2014 \u0436\u0443\u0440\u043D\u0430\u043B \u043F\u043E\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0433\u043E \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u043F\u043E \u0446\u0438\u0444\u0440\u0430\u043C.",
    question: "\u0411\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0442\u044B \u043D\u0435 \u0437\u0430\u043F\u0438\u0441\u044B\u0432\u0430\u0435\u0448\u044C \u043D\u0435\u0443\u0434\u0430\u0447\u043D\u0443\u044E \u0441\u0434\u0435\u043B\u043A\u0443 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B, \u0447\u0442\u043E\u0431\u044B \u043D\u0435 \u043F\u0440\u0438\u0437\u043D\u0430\u0432\u0430\u0442\u044C \u0435\u0451?",
    recommendation: "\u0416\u0443\u0440\u043D\u0430\u043B \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442, \u0442\u043E\u043B\u044C\u043A\u043E \u0435\u0441\u043B\u0438 \u0432 \u043D\u0451\u043C \u0435\u0441\u0442\u044C \u0438 \u0442\u043E, \u0447\u0442\u043E \u0441\u0442\u044B\u0434\u043D\u043E \u043F\u0438\u0441\u0430\u0442\u044C. \u041F\u0440\u043E\u043F\u0443\u0449\u0435\u043D\u043D\u0430\u044F \u0437\u0430\u043F\u0438\u0441\u044C \u2014 \u0442\u043E\u0436\u0435 \u0443\u0440\u043E\u043A, \u043F\u0440\u043E\u0441\u0442\u043E \u043E\u0442\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439."
  },
  {
    id: "g_carryover",
    dataDriven: false,
    title: "\u041F\u0435\u0440\u0435\u043D\u043E\u0441 \u044D\u043C\u043E\u0446\u0438\u0439 \u043C\u0435\u0436\u0434\u0443 \u0441\u0434\u0435\u043B\u043A\u0430\u043C\u0438",
    evidence: "\u041E\u0431\u0449\u0438\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u2014 \u0436\u0443\u0440\u043D\u0430\u043B \u043F\u043E\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0433\u043E \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u043F\u043E \u0446\u0438\u0444\u0440\u0430\u043C.",
    question: "\u041F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0448\u044C \u043B\u0438 \u0440\u0430\u0437\u0434\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u044D\u0439\u0444\u043E\u0440\u0438\u044E \u043E\u0442 \u043E\u0434\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u043D\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043F\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439?",
    recommendation: "\u041C\u0435\u0436\u0434\u0443 \u0441\u0434\u0435\u043B\u043A\u0430\u043C\u0438 \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0440\u0438\u0442\u0443\u0430\u043B-\u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u0435\u043B\u044C \u2014 \u0434\u0430\u0436\u0435 60 \u0441\u0435\u043A\u0443\u043D\u0434 \u043F\u0430\u0443\u0437\u044B \u0438 \u043E\u0434\u0438\u043D \u0432\u0434\u043E\u0445, \u0447\u0442\u043E\u0431\u044B \u043D\u0435 \u0442\u0430\u0449\u0438\u0442\u044C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u0430\u043B\u044C\u0448\u0435."
  },
  {
    id: "g_size",
    dataDriven: false,
    title: "\u041E\u0431\u044A\u0451\u043C \u043F\u043E\u0434 \u043D\u0430\u0441\u0442\u0440\u043E\u0435\u043D\u0438\u0435",
    evidence: "\u041E\u0431\u0449\u0438\u0439 \u0432\u043E\u043F\u0440\u043E\u0441 \u2014 \u0436\u0443\u0440\u043D\u0430\u043B \u043F\u043E\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0435\u0433\u043E \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u043F\u043E \u0446\u0438\u0444\u0440\u0430\u043C.",
    question: "\u041C\u0435\u043D\u044F\u0435\u0448\u044C \u043B\u0438 \u0442\u044B \u0440\u0430\u0437\u043C\u0435\u0440 \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 \u043E\u0442 \u0442\u043E\u0433\u043E, \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0443\u0432\u0435\u0440\u0435\u043D \u0432 \u043C\u043E\u043C\u0435\u043D\u0442\u0435, \u0430 \u043D\u0435 \u043E\u0442 \u0437\u0430\u0440\u0430\u043D\u0435\u0435 \u0437\u0430\u0434\u0430\u043D\u043D\u043E\u0433\u043E \u0440\u0438\u0441\u043A\u0430?",
    recommendation: "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u2014 \u043F\u043B\u043E\u0445\u043E\u0439 \u043A\u0430\u043B\u044C\u043A\u0443\u043B\u044F\u0442\u043E\u0440 \u043E\u0431\u044A\u0451\u043C\u0430. \u041E\u043D\u0430 \u043E\u0431\u043C\u0430\u043D\u044B\u0432\u0430\u0435\u0442 \u0447\u0430\u0449\u0435 \u0432\u0441\u0435\u0433\u043E \u0438\u043C\u0435\u043D\u043D\u043E \u043F\u043E\u0441\u043B\u0435 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u043F\u043E\u0431\u0435\u0434 \u043F\u043E\u0434\u0440\u044F\u0434."
  }
];
var GENERIC_REVIEW_QUESTIONS_EN = [
  {
    id: "g_plan",
    dataDriven: false,
    title: "Trading without a plan",
    evidence: "General question \u2014 the journal can't check this directly against numbers yet.",
    question: "How often do you open a trade without a plan written down in advance \u2014 entry, stop, and target?",
    recommendation: "Before entering, write down three numbers: entry, stop, target. If you can't \u2014 the trade isn't ready yet, that's not about the market."
  },
  {
    id: "g_overconf",
    dataDriven: false,
    title: "Risk after a winning streak",
    evidence: "General question \u2014 the journal can't check this directly against numbers yet.",
    question: "After a couple of winning trades in a row, do you feel like increasing position size?",
    recommendation: "A winning streak doesn't cancel your risk plan. If anything should increase, it's caution \u2014 not size."
  },
  {
    id: "g_honesty",
    dataDriven: false,
    title: "Journal honesty",
    evidence: "General question \u2014 the journal can't check this directly against numbers yet.",
    question: "Do you ever skip logging a bad trade so you don't have to admit it?",
    recommendation: "A journal only works if it includes the things you're embarrassed to write. A skipped entry is still a lesson \u2014 just a postponed one."
  },
  {
    id: "g_carryover",
    dataDriven: false,
    title: "Carrying emotions between trades",
    evidence: "General question \u2014 the journal can't check this directly against numbers yet.",
    question: "Do you carry irritation or euphoria from one trade into decisions on the next?",
    recommendation: "A reset ritual between trades helps \u2014 even 60 seconds of pause and one breath, so the state doesn't carry forward."
  },
  {
    id: "g_size",
    dataDriven: false,
    title: "Sizing by mood",
    evidence: "General question \u2014 the journal can't check this directly against numbers yet.",
    question: "Do you change position size based on how confident you feel in the moment, rather than a pre-set risk?",
    recommendation: "Confidence is a bad size calculator. It fools you most often right after a few wins in a row."
  }
];
function analyzeJournalForQuiz(entries, lang = "ru") {
  if (entries.length < 3) return [];
  const questions = lang === "en" ? GENERIC_REVIEW_QUESTIONS_EN : GENERIC_REVIEW_QUESTIONS;
  const wins = entries.filter((e) => e.outcome === "Win");
  const losses = entries.filter((e) => e.outcome === "Loss");
  const avg = (arr, k) => arr.reduce((s, e) => s + (e[k] || 0), 0) / arr.length;
  const sorted = [...entries].sort((a, b) => a.date - b.date);
  const issues = [];
  const wEmo = wins.filter((e) => e.x != null), lEmo = losses.filter((e) => e.x != null);
  if (wEmo.length >= 2 && lEmo.length >= 2) {
    const wX = avg(wEmo, "x"), lX = avg(lEmo, "x");
    if (lX < wX - 8) {
      issues.push(lang === "en" ? {
        id: "fear",
        dataDriven: true,
        title: "Entering out of fear",
        evidence: 'Losing trades in the journal started, on average, from a more anxious state ("Fear") than winning ones.',
        question: "Do you notice yourself opening a trade out of fear of missing something, rather than because it matched your plan?",
        recommendation: `Before you hit "enter," say your reason for the trade out loud in one sentence. If the only reason is "what if it moves without me" \u2014 that's fear, not a plan.`
      } : {
        id: "fear",
        dataDriven: true,
        title: "\u0412\u0445\u043E\u0434 \u0438\u0437 \u0441\u0442\u0440\u0430\u0445\u0430",
        evidence: "\u0423\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C \u043D\u0430\u0447\u0438\u043D\u0430\u043B\u0438\u0441\u044C \u0438\u0437 \u0431\u043E\u043B\u0435\u0435 \u0442\u0440\u0435\u0432\u043E\u0436\u043D\u043E\u0433\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F (\xAB\u0421\u0442\u0440\u0430\u0445\xBB), \u0447\u0435\u043C \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0435.",
        question: "\u0417\u0430\u043C\u0435\u0447\u0430\u0435\u0448\u044C, \u0447\u0442\u043E \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0448\u044C \u0441\u0434\u0435\u043B\u043A\u0443 \u0438\u0437 \u0441\u0442\u0440\u0430\u0445\u0430 \u0447\u0442\u043E-\u0442\u043E \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C, \u0430 \u043D\u0435 \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u044D\u0442\u043E \u0441\u043E\u0432\u043F\u0430\u043B\u043E \u0441 \u043F\u043B\u0430\u043D\u043E\u043C?",
        recommendation: "\u041F\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043C \u043D\u0430\u0436\u0430\u0442\u044C \xAB\u0432 \u0441\u0434\u0435\u043B\u043A\u0443\xBB, \u0441\u0444\u043E\u0440\u043C\u0443\u043B\u0438\u0440\u0443\u0439 \u0432\u0441\u043B\u0443\u0445 \u043F\u0440\u0438\u0447\u0438\u043D\u0443 \u0432\u0445\u043E\u0434\u0430 \u043E\u0434\u043D\u0438\u043C \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u043C. \u0415\u0441\u043B\u0438 \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043F\u0440\u0438\u0447\u0438\u043D\u0430 \u2014 \xAB\u0430 \u0432\u0434\u0440\u0443\u0433 \u0443\u0435\u0434\u0443 \u0431\u0435\u0437 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F\xBB \u2014 \u044D\u0442\u043E \u0441\u0442\u0440\u0430\u0445, \u0430 \u043D\u0435 \u043F\u043B\u0430\u043D."
      });
    }
  }
  const wYEmo = wins.filter((e) => e.y != null), lYEmo = losses.filter((e) => e.y != null);
  if (wYEmo.length >= 2 && lYEmo.length >= 2) {
    const wY = avg(wYEmo, "y"), lY = avg(lYEmo, "y");
    if (lY < wY - 8) {
      issues.push(lang === "en" ? {
        id: "nerves",
        dataDriven: true,
        title: 'Being "on edge"',
        evidence: 'Losing trades noticeably more often happened while "on edge" than winning ones.',
        question: "Before your losing trades, did you feel a sense of rushing or being wound up?",
        recommendation: "Rushing almost never comes from the market \u2014 it comes from you. If you feel wound up, that's a signal to pause, not a signal to enter faster."
      } : {
        id: "nerves",
        dataDriven: true,
        title: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \xAB\u043D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445\xBB",
        evidence: "\u0423\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0447\u0430\u0449\u0435 \u0441\u043B\u0443\u0447\u0430\u043B\u0438\u0441\u044C \u0432 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \xAB\u043D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445\xBB, \u0447\u0435\u043C \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0435.",
        question: "\u041F\u0435\u0440\u0435\u0434 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u043C\u0438 \u0441\u0434\u0435\u043B\u043A\u0430\u043C\u0438 \u0443 \u0442\u0435\u0431\u044F \u0431\u044B\u043B\u043E \u043E\u0449\u0443\u0449\u0435\u043D\u0438\u0435 \u0441\u043F\u0435\u0448\u043A\u0438 \u0438\u043B\u0438 \u0432\u0437\u0432\u0438\u043D\u0447\u0435\u043D\u043D\u043E\u0441\u0442\u0438?",
        recommendation: "\u0421\u043F\u0435\u0448\u043A\u0430 \u043F\u043E\u0447\u0442\u0438 \u043D\u0438\u043A\u043E\u0433\u0434\u0430 \u043D\u0435 \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u043E\u0442 \u0440\u044B\u043D\u043A\u0430 \u2014 \u043E\u043D\u0430 \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442 \u043E\u0442 \u0442\u0435\u0431\u044F. \u0415\u0441\u043B\u0438 \u0447\u0443\u0432\u0441\u0442\u0432\u0443\u0435\u0448\u044C \u0432\u0437\u0432\u0438\u043D\u0447\u0435\u043D\u043D\u043E\u0441\u0442\u044C, \u044D\u0442\u043E \u0441\u0438\u0433\u043D\u0430\u043B \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0430\u0443\u0437\u0443, \u0430 \u043D\u0435 \u0441\u0438\u0433\u043D\u0430\u043B \u0432\u0445\u043E\u0434\u0438\u0442\u044C \u0431\u044B\u0441\u0442\u0440\u0435\u0435."
      });
    }
  }
  let revengeCount = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i - 1].outcome === "Loss") {
      const gapMin = (sorted[i].date - sorted[i - 1].date) / 6e4;
      if (gapMin >= 0 && gapMin < 30) revengeCount++;
    }
  }
  if (revengeCount >= 1) {
    issues.push(lang === "en" ? {
      id: "revenge",
      dataDriven: true,
      title: "Revenge trading",
      evidence: `The journal has ${revengeCount} ${revengeCount === 1 ? "case" : "cases"} of a new trade opening within half an hour of a loss.`,
      question: "After a losing trade, do you want to win it back with a new one as fast as possible?",
      recommendation: "Set a mandatory pause after a loss \u2014 at least 20-30 minutes away from the terminal. This isn't about the market, it's about getting control back over yourself, not the price."
    } : {
      id: "revenge",
      dataDriven: true,
      title: "\u0420\u0435\u0432\u0430\u043D\u0448-\u0442\u0440\u0435\u0439\u0434\u0438\u043D\u0433",
      evidence: `\u0412 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 ${revengeCount} ${pluralRu(revengeCount, "\u0441\u043B\u0443\u0447\u0430\u0439", "\u0441\u043B\u0443\u0447\u0430\u044F", "\u0441\u043B\u0443\u0447\u0430\u0435\u0432")}, \u043A\u043E\u0433\u0434\u0430 \u043D\u043E\u0432\u0430\u044F \u0441\u0434\u0435\u043B\u043A\u0430 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u043B\u0430\u0441\u044C \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0441\u0430 \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430.`,
      question: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u0442\u0435\u0431\u0435 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043C\u043E\u0436\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u043E\u0442\u044B\u0433\u0440\u0430\u0442\u044C\u0441\u044F \u043D\u043E\u0432\u043E\u0439?",
      recommendation: "\u0412\u0432\u0435\u0434\u0438 \u0434\u043B\u044F \u0441\u0435\u0431\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u043F\u0430\u0443\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u2014 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 20-30 \u043C\u0438\u043D\u0443\u0442 \u0431\u0435\u0437 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430. \u042D\u0442\u043E \u043D\u0435 \u043F\u0440\u043E \u0440\u044B\u043D\u043E\u043A, \u044D\u0442\u043E \u043F\u0440\u043E \u0442\u043E, \u0447\u0442\u043E\u0431\u044B \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u043D\u0430\u0434 \u0441\u043E\u0431\u043E\u0439, \u0430 \u043D\u0435 \u043D\u0430\u0434 \u0446\u0435\u043D\u043E\u0439."
    });
  }
  const lessonCounts = {};
  entries.forEach((e) => {
    if (e.lesson && e.lesson !== "\u2014") lessonCounts[e.lesson] = (lessonCounts[e.lesson] || 0) + 1;
  });
  const repeated = Object.entries(lessonCounts).find(([, c]) => c >= 2);
  if (repeated) {
    issues.push(lang === "en" ? {
      id: "repeat",
      dataDriven: true,
      title: "A repeating lesson",
      evidence: `The lesson "${repeated[0]}" appears in the journal ${repeated[1]} times \u2014 it seems the takeaway hasn't become a habit yet.`,
      question: "Do you ever write down a lesson but still repeat the same mistake next time?",
      recommendation: `Rewrite the lesson as a specific action, not an observation \u2014 not "don't rush," but "wait for the candle to close before entering." Abstract conclusions get forgotten, instructions don't.`
    } : {
      id: "repeat",
      dataDriven: true,
      title: "\u041F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0439\u0441\u044F \u0443\u0440\u043E\u043A",
      evidence: `\u0423\u0440\u043E\u043A \xAB${repeated[0]}\xBB \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u0442\u0441\u044F \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 ${repeated[1]} \u0440\u0430\u0437\u0430 \u2014 \u043F\u043E\u0445\u043E\u0436\u0435, \u0432\u044B\u0432\u043E\u0434 \u043F\u043E\u043A\u0430 \u043D\u0435 \u0441\u0442\u0430\u043B \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u043E\u0439.`,
      question: "\u0411\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0442\u044B \u0444\u043E\u0440\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0448\u044C \u0443\u0440\u043E\u043A, \u043D\u043E \u0432\u0441\u0451 \u0440\u0430\u0432\u043D\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0448\u044C \u0442\u0443 \u0436\u0435 \u043E\u0448\u0438\u0431\u043A\u0443 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437?",
      recommendation: "\u041F\u0435\u0440\u0435\u043F\u0438\u0448\u0438 \u0443\u0440\u043E\u043A \u0432 \u0444\u043E\u0440\u043C\u0430\u0442 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u0433\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F, \u0430 \u043D\u0435 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F \u2014 \u043D\u0435 \xAB\u043D\u0435 \u0442\u043E\u0440\u043E\u043F\u0438\u0442\u044C\u0441\u044F\xBB, \u0430 \xAB\u0436\u0434\u0430\u0442\u044C \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0441\u0432\u0435\u0447\u0438 \u043F\u0435\u0440\u0435\u0434 \u0432\u0445\u043E\u0434\u043E\u043C\xBB. \u0410\u0431\u0441\u0442\u0440\u0430\u043A\u0442\u043D\u044B\u0435 \u0432\u044B\u0432\u043E\u0434\u044B \u0437\u0430\u0431\u044B\u0432\u0430\u044E\u0442\u0441\u044F, \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u0438 \u2014 \u043D\u0435\u0442."
    });
  }
  const withR = entries.filter((e) => e.r != null && e.r !== void 0);
  if (withR.length >= 4) {
    const rs = withR.map((e) => e.r);
    const avgAbs = rs.reduce((s, r) => s + Math.abs(r), 0) / rs.length;
    const maxLoss = Math.min(...rs);
    if (maxLoss < -avgAbs * 2.5 && maxLoss <= -1) {
      issues.push(lang === "en" ? {
        id: "outlier",
        dataDriven: true,
        title: "Unstable risk size",
        evidence: `There's a trade with a result of ${maxLoss.toFixed(1)}, noticeably bigger than your usual risk per trade.`,
        question: "Do you set your risk size before entering a trade, rather than adjusting it as you go?",
        recommendation: "A spread in loss size usually says more about unstable in-the-moment decisions than about the market. Fix your risk in R or % before you enter \u2014 that should be decided before the terminal is even open."
      } : {
        id: "outlier",
        dataDriven: true,
        title: "\u041D\u0435\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430",
        evidence: `\u0415\u0441\u0442\u044C \u0441\u0434\u0435\u043B\u043A\u0430 \u0441 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C ${maxLoss.toFixed(1)}, \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u043A\u0440\u0443\u043F\u043D\u0435\u0435 \u0442\u0432\u043E\u0435\u0433\u043E \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u0440\u0438\u0441\u043A\u0430 \u043D\u0430 \u0441\u0434\u0435\u043B\u043A\u0443.`,
        question: "\u0422\u044B \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0448\u044C \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430 \u0434\u043E \u0432\u0445\u043E\u0434\u0430 \u0432 \u0441\u0434\u0435\u043B\u043A\u0443, \u0430 \u043D\u0435 \u043F\u043E \u0445\u043E\u0434\u0443 \u043D\u0435\u0451?",
        recommendation: "\u0420\u0430\u0437\u0431\u0440\u043E\u0441 \u0432 \u0440\u0430\u0437\u043C\u0435\u0440\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u043E\u0431\u044B\u0447\u043D\u043E \u0433\u043E\u0432\u043E\u0440\u0438\u0442 \u043D\u0435 \u043E \u0440\u044B\u043D\u043A\u0435, \u0430 \u043E \u043D\u0435\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u0440\u0435\u0448\u0435\u043D\u0438\u0439 \u0432 \u043C\u043E\u043C\u0435\u043D\u0442\u0435. \u0424\u0438\u043A\u0441\u0438\u0440\u0443\u0439 \u0440\u0438\u0441\u043A \u0432 R \u0438\u043B\u0438 % \u0435\u0449\u0451 \u0434\u043E \u0432\u0445\u043E\u0434\u0430 \u2014 \u044D\u0442\u043E \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0440\u0435\u0448\u0435\u043D\u043E \u0440\u0430\u043D\u044C\u0448\u0435, \u0447\u0435\u043C \u043E\u0442\u043A\u0440\u044B\u0442 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B."
      });
    }
  }
  const dayCounts = {};
  entries.forEach((e) => {
    const k = e.date.toDateString();
    dayCounts[k] = (dayCounts[k] || 0) + 1;
  });
  const dayCountValues = Object.values(dayCounts);
  const maxDay = Math.max(...dayCountValues);
  const avgDay = dayCountValues.reduce((s, c) => s + c, 0) / dayCountValues.length;
  if (maxDay >= 4 && maxDay > avgDay * 1.8) {
    issues.push(lang === "en" ? {
      id: "overtrade",
      dataDriven: true,
      title: "Overtrading",
      evidence: `On one day, the journal shows ${maxDay} trades \u2014 noticeably more than the average (${avgDay.toFixed(1)} per day).`,
      question: "Do you notice that on some days you open way more trades than you planned that morning?",
      recommendation: "Set a daily trade limit in advance and physically stop once you hit it \u2014 regardless of whether you're up or down."
    } : {
      id: "overtrade",
      dataDriven: true,
      title: "\u041F\u0435\u0440\u0435\u0442\u0440\u0435\u0439\u0434\u0438\u043D\u0433",
      evidence: `\u0412 \u043E\u0434\u0438\u043D \u0438\u0437 \u0434\u043D\u0435\u0439 \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 ${maxDay} ${pluralRu(maxDay, "\u0441\u0434\u0435\u043B\u043A\u0430", "\u0441\u0434\u0435\u043B\u043A\u0438", "\u0441\u0434\u0435\u043B\u043E\u043A")} \u2014 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0431\u043E\u043B\u044C\u0448\u0435, \u0447\u0435\u043C \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C (${avgDay.toFixed(1)} \u0432 \u0434\u0435\u043D\u044C).`,
      question: "\u0417\u0430\u043C\u0435\u0447\u0430\u0435\u0448\u044C, \u0447\u0442\u043E \u0432 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u0434\u043D\u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0448\u044C \u0441\u0438\u043B\u044C\u043D\u043E \u0431\u043E\u043B\u044C\u0448\u0435 \u0441\u0434\u0435\u043B\u043E\u043A, \u0447\u0435\u043C \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043B \u0441 \u0443\u0442\u0440\u0430?",
      recommendation: "\u0417\u0430\u0440\u0430\u043D\u0435\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438 \u043B\u0438\u043C\u0438\u0442 \u0441\u0434\u0435\u043B\u043E\u043A \u043D\u0430 \u0434\u0435\u043D\u044C \u0438 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0439\u0441\u044F, \u043A\u043E\u0433\u0434\u0430 \u043E\u043D \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u2014 \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0442\u043E\u0433\u043E, \u0432 \u043F\u043B\u044E\u0441\u0435 \u0442\u044B \u0438\u043B\u0438 \u0432 \u043C\u0438\u043D\u0443\u0441\u0435."
    });
  }
  let streak = 0, maxStreak = 0;
  sorted.forEach((e) => {
    if (e.outcome === "Loss") {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else streak = 0;
  });
  if (maxStreak >= 3) {
    issues.push(lang === "en" ? {
      id: "streak",
      dataDriven: true,
      title: "A streak of consecutive losses",
      evidence: `The journal has a streak of ${maxStreak} consecutive losing trades with no winning trade in between.`,
      question: "Do you keep trading the same way even after several losses in a row?",
      recommendation: "After the second loss in a row \u2014 that's already a signal to stop and figure out why, not a signal to add size on the next one."
    } : {
      id: "streak",
      dataDriven: true,
      title: "\u0421\u0435\u0440\u0438\u044F \u0443\u0431\u044B\u0442\u043A\u043E\u0432 \u043F\u043E\u0434\u0440\u044F\u0434",
      evidence: `\u0412 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u0435\u0441\u0442\u044C \u0441\u0435\u0440\u0438\u044F \u0438\u0437 ${maxStreak} \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u043F\u043E\u0434\u0440\u044F\u0434 \u0431\u0435\u0437 \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u043E\u0439 \u043C\u0435\u0436\u0434\u0443 \u043D\u0438\u043C\u0438.`,
      question: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u0448\u044C \u0442\u043E\u0440\u0433\u043E\u0432\u0430\u0442\u044C \u0432 \u0442\u043E\u043C \u0436\u0435 \u0440\u0435\u0436\u0438\u043C\u0435, \u0434\u0430\u0436\u0435 \u043F\u043E\u0441\u043B\u0435 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u0443\u0431\u044B\u0442\u043A\u043E\u0432 \u043F\u043E\u0434\u0440\u044F\u0434?",
      recommendation: "\u041F\u043E\u0441\u043B\u0435 \u0432\u0442\u043E\u0440\u043E\u0439 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u0434\u0440\u044F\u0434 \u2014 \u044D\u0442\u043E \u0443\u0436\u0435 \u0441\u0438\u0433\u043D\u0430\u043B \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C\u0441\u044F \u0438 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F, \u0430 \u043D\u0435 \u0441\u0438\u0433\u043D\u0430\u043B \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043E\u0431\u044A\u0451\u043C \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439."
    });
  }
  const lossesAfterWin = [], lossesAfterLoss = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].outcome === "Loss" && sorted[i].r != null) {
      if (sorted[i - 1].outcome === "Win") lossesAfterWin.push(sorted[i].r);
      else if (sorted[i - 1].outcome === "Loss") lossesAfterLoss.push(sorted[i].r);
    }
  }
  if (lossesAfterWin.length >= 2 && lossesAfterLoss.length >= 1) {
    const avgAfterWin = lossesAfterWin.reduce((s, r) => s + r, 0) / lossesAfterWin.length;
    const avgAfterLoss = lossesAfterLoss.reduce((s, r) => s + r, 0) / lossesAfterLoss.length;
    if (avgAfterWin < avgAfterLoss - 0.3) {
      issues.push(lang === "en" ? {
        id: "overconfidence",
        dataDriven: true,
        title: "Risk grows after wins",
        evidence: "Losses that happened right after a winning trade are, on average, bigger than losses after another loss.",
        question: "After a winning trade, do you feel more comfortable risking more on the next one?",
        recommendation: "A win doesn't make the next setup any more valid. Keep your risk size constant regardless of what happened on the last trade."
      } : {
        id: "overconfidence",
        dataDriven: true,
        title: "\u0420\u0438\u0441\u043A \u0440\u0430\u0441\u0442\u0451\u0442 \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0431\u0435\u0434",
        evidence: "\u0423\u0431\u044B\u0442\u043A\u0438, \u0441\u043B\u0443\u0447\u0438\u0432\u0448\u0438\u0435\u0441\u044F \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438, \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C \u043A\u0440\u0443\u043F\u043D\u0435\u0435 \u0443\u0431\u044B\u0442\u043A\u043E\u0432 \u043F\u043E\u0441\u043B\u0435 \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0443\u0431\u044B\u0442\u043A\u0430.",
        question: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0434\u0430\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u0442\u0435\u0431\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u0435\u0435 \u0440\u0438\u0441\u043A\u043E\u0432\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439?",
        recommendation: "\u041F\u043E\u0431\u0435\u0434\u0430 \u043D\u0435 \u0434\u0435\u043B\u0430\u0435\u0442 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u0435\u0442\u0430\u043F \u0431\u043E\u043B\u0435\u0435 \u0432\u0435\u0440\u043D\u044B\u043C. \u0414\u0435\u0440\u0436\u0438 \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u043C \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0442\u043E\u0433\u043E, \u0447\u0442\u043E \u043F\u0440\u043E\u0438\u0437\u043E\u0448\u043B\u043E \u043D\u0430 \u043F\u0440\u043E\u0448\u043B\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0435."
      });
    }
  }
  if (losses.length >= 3) {
    const lossesNoShot = losses.filter((e) => !e.screenshots || e.screenshots.length === 0).length;
    if (lossesNoShot / losses.length > 0.75) {
      issues.push(lang === "en" ? {
        id: "noshot",
        dataDriven: true,
        title: "Avoiding loss review",
        evidence: `${lossesNoShot} of ${losses.length} losing trades in the journal have no chart screenshot.`,
        question: "Do you feel uncomfortable revisiting the chart after a losing trade?",
        recommendation: "A screenshot of a losing trade is the most useful material in the journal, not the most pleasant. Make a habit of saving exactly what you don't want to revisit."
      } : {
        id: "noshot",
        dataDriven: true,
        title: "\u0418\u0437\u0431\u0435\u0433\u0430\u043D\u0438\u0435 \u0440\u0430\u0437\u0431\u043E\u0440\u0430 \u0443\u0431\u044B\u0442\u043A\u043E\u0432",
        evidence: `${lossesNoShot} \u0438\u0437 ${losses.length} \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 ${pluralRu(losses.length, "\u0441\u0434\u0435\u043B\u043A\u0438", "\u0441\u0434\u0435\u043B\u043E\u043A", "\u0441\u0434\u0435\u043B\u043E\u043A")} \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u2014 \u0431\u0435\u0437 \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430 \u0433\u0440\u0430\u0444\u0438\u043A\u0430.`,
        question: "\u0422\u0435\u0431\u0435 \u043D\u0435\u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u043F\u0435\u0440\u0435\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C \u0433\u0440\u0430\u0444\u0438\u043A \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438?",
        recommendation: "\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u2014 \u0441\u0430\u043C\u044B\u0439 \u043F\u043E\u043B\u0435\u0437\u043D\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435, \u043D\u0435 \u0441\u0430\u043C\u044B\u0439 \u043F\u0440\u0438\u044F\u0442\u043D\u044B\u0439. \u0412\u043E\u0437\u044C\u043C\u0438 \u0437\u0430 \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0443 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C \u0438\u043C\u0435\u043D\u043D\u043E \u0442\u043E, \u0447\u0442\u043E \u043D\u0435 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0435\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C."
      });
    }
  }
  if (losses.length >= 3) {
    const shallow = losses.filter((e) => !e.lesson || e.lesson === "\u2014" || e.lesson.trim().length < 15).length;
    if (shallow / losses.length > 0.6) {
      issues.push(lang === "en" ? {
        id: "shallow",
        dataDriven: true,
        title: "Shallow reflection",
        evidence: "Most losing trades in the journal are described without a real takeaway.",
        question: "After a loss, do you want to close the subject quickly rather than dig into the reason?",
        recommendation: `One line of "bad luck" doesn't count as a lesson. Try finishing the sentence "Next time I'll do it differently if..." \u2014 and write it honestly.`
      } : {
        id: "shallow",
        dataDriven: true,
        title: "\u041F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u0430\u044F \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u044F",
        evidence: "\u0411\u043E\u043B\u044C\u0448\u0430\u044F \u0447\u0430\u0441\u0442\u044C \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0430 \u0431\u0435\u0437 \u0440\u0430\u0437\u0432\u0451\u0440\u043D\u0443\u0442\u043E\u0433\u043E \u0432\u044B\u0432\u043E\u0434\u0430.",
        question: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u043E\u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u044C \u0442\u0435\u043C\u0443, \u0430 \u043D\u0435 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u043F\u0440\u0438\u0447\u0438\u043D\u0435?",
        recommendation: "\u041E\u0434\u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0430 \xAB\u043D\u0435 \u043F\u043E\u0432\u0435\u0437\u043B\u043E\xBB \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0443\u0440\u043E\u043A\u043E\u043C. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0444\u0440\u0430\u0437\u0443 \xAB\u0412 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437 \u044F \u0441\u0434\u0435\u043B\u0430\u044E \u0438\u043D\u0430\u0447\u0435, \u0435\u0441\u043B\u0438...\xBB \u2014 \u0438 \u0434\u043E\u043F\u0438\u0441\u0430\u0442\u044C \u0435\u0451 \u0447\u0435\u0441\u0442\u043D\u043E."
      });
    }
  }
  let selected = issues.slice(0, REVIEW_MAX_QUESTIONS);
  if (selected.length < REVIEW_MIN_QUESTIONS) {
    const usedIds = new Set(selected.map((i) => i.id));
    for (const g of questions) {
      if (selected.length >= REVIEW_MIN_QUESTIONS) break;
      if (!usedIds.has(g.id)) selected.push(g);
    }
  }
  return selected;
}
var PATTERN_QUIZ_MAP = {
  fear: { question: "\u0417\u0430\u043C\u0435\u0447\u0430\u0435\u0448\u044C, \u0447\u0442\u043E \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0448\u044C \u0441\u0434\u0435\u043B\u043A\u0443 \u0438\u0437 \u0441\u0442\u0440\u0430\u0445\u0430 \u0447\u0442\u043E-\u0442\u043E \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C, \u0430 \u043D\u0435 \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u044D\u0442\u043E \u0441\u043E\u0432\u043F\u0430\u043B\u043E \u0441 \u043F\u043B\u0430\u043D\u043E\u043C?" },
  too_calm: { question: "\u0411\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0432 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0442\u044B \u043C\u0435\u043D\u044C\u0448\u0435 \u0441\u043B\u0435\u0434\u0438\u0448\u044C \u0437\u0430 \u0440\u0438\u0441\u043A\u043E\u043C, \u0447\u0435\u043C \u043E\u0431\u044B\u0447\u043D\u043E?" },
  confidence_tension: { question: "\u0411\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0432 \u0441\u0434\u0435\u043B\u043A\u0435 \u0441\u043E\u0447\u0435\u0442\u0430\u0435\u0442\u0441\u044F \u0441 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u043C \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435\u043C, \u0430 \u043D\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u0435\u043C?" },
  revenge: { question: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u0442\u0435\u0431\u0435 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043C\u043E\u0436\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u043E\u0442\u044B\u0433\u0440\u0430\u0442\u044C\u0441\u044F \u043D\u043E\u0432\u043E\u0439?" },
  lesson_not_learned: { question: "\u0411\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0442\u044B \u0444\u043E\u0440\u043C\u0443\u043B\u0438\u0440\u0443\u0435\u0448\u044C \u0443\u0440\u043E\u043A, \u043D\u043E \u0432\u0441\u0451 \u0440\u0430\u0432\u043D\u043E \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0448\u044C \u0442\u0443 \u0436\u0435 \u043E\u0448\u0438\u0431\u043A\u0443 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437?" },
  unstable_risk: { question: "\u041C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430 \u043E\u0442 \u0441\u0434\u0435\u043B\u043A\u0438 \u043A \u0441\u0434\u0435\u043B\u043A\u0435 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0441\u0438\u043B\u044C\u043D\u0435\u0435, \u0447\u0435\u043C \u0442\u044B \u0441\u0430\u043C \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u0435\u0448\u044C?" },
  overtrading: { question: "\u0417\u0430\u043C\u0435\u0447\u0430\u0435\u0448\u044C, \u0447\u0442\u043E \u0432 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u0434\u043D\u0438 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0448\u044C \u0441\u0438\u043B\u044C\u043D\u043E \u0431\u043E\u043B\u044C\u0448\u0435 \u0441\u0434\u0435\u043B\u043E\u043A, \u0447\u0435\u043C \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043B \u0441 \u0443\u0442\u0440\u0430?" },
  loss_streak: { question: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u0448\u044C \u0442\u043E\u0440\u0433\u043E\u0432\u0430\u0442\u044C \u0432 \u0442\u043E\u043C \u0436\u0435 \u0440\u0435\u0436\u0438\u043C\u0435, \u0434\u0430\u0436\u0435 \u043F\u043E\u0441\u043B\u0435 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u0443\u0431\u044B\u0442\u043A\u043E\u0432 \u043F\u043E\u0434\u0440\u044F\u0434?" },
  risk_after_win: { question: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0434\u0430\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u0442\u0435\u0431\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u0435\u0435 \u0440\u0438\u0441\u043A\u043E\u0432\u0430\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439?" },
  avoid_loss_review: { question: "\u0422\u0435\u0431\u0435 \u043D\u0435\u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u043F\u0435\u0440\u0435\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C \u0433\u0440\u0430\u0444\u0438\u043A \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438?" },
  shallow_reflection: { question: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u043E\u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0437\u0430\u043A\u0440\u044B\u0442\u044C \u0442\u0435\u043C\u0443, \u0430 \u043D\u0435 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u0442\u044C\u0441\u044F \u0432 \u043F\u0440\u0438\u0447\u0438\u043D\u0435?" }
};
var PATTERN_QUIZ_MAP_EN = {
  fear: { question: "Do you notice yourself opening a trade out of fear of missing something, rather than because it matched your plan?" },
  too_calm: { question: "Does being calm sometimes mean you watch risk less closely than usual?" },
  confidence_tension: { question: "Does confidence in a trade sometimes come with inner tension rather than calm?" },
  revenge: { question: "After a losing trade, do you want to win it back with a new one as fast as possible?" },
  lesson_not_learned: { question: "Do you ever write down a lesson but still repeat the same mistake next time?" },
  unstable_risk: { question: "Does your risk size vary from trade to trade noticeably more than you actually plan?" },
  overtrading: { question: "Do you notice that on some days you open way more trades than you planned that morning?" },
  loss_streak: { question: "Do you keep trading the same way even after several losses in a row?" },
  risk_after_win: { question: "After a winning trade, do you feel more comfortable risking more on the next one?" },
  avoid_loss_review: { question: "Do you feel uncomfortable revisiting the chart after a losing trade?" },
  shallow_reflection: { question: "After a loss, do you want to close the subject quickly rather than dig into the reason?" }
};
function buildReviewIssuesFromPatterns(patternsResult, lang = "ru") {
  const map = lang === "en" ? PATTERN_QUIZ_MAP_EN : PATTERN_QUIZ_MAP;
  return (patternsResult.patterns || []).map((p) => {
    const meta = map[p.id];
    if (!meta) return null;
    return { id: p.id, dataDriven: true, title: p.title, evidence: p.description, question: meta.question, recommendation: p.recommendation };
  }).filter(Boolean);
}
function buildReviewQuiz(entries, lang = "ru") {
  if (entries.length < 3) return [];
  const patternsResult = patternEngineV2(entries, lang);
  if (!patternsResult.available) return analyzeJournalForQuiz(entries, lang);
  const questions = lang === "en" ? GENERIC_REVIEW_QUESTIONS_EN : GENERIC_REVIEW_QUESTIONS;
  let selected = buildReviewIssuesFromPatterns(patternsResult, lang).slice(0, REVIEW_MAX_QUESTIONS);
  if (selected.length < REVIEW_MIN_QUESTIONS) {
    const usedIds = new Set(selected.map((i) => i.id));
    for (const g of questions) {
      if (selected.length >= REVIEW_MIN_QUESTIONS) break;
      if (!usedIds.has(g.id)) selected.push(g);
    }
  }
  return selected;
}
function scoreJournalReview(issues, answers, lang = "ru") {
  const answered = issues.filter((q) => answers[q.id] != null);
  const total = answered.reduce((s, q) => s + answers[q.id].score, 0);
  const maxTotal = answered.length * 3;
  const pct = maxTotal > 0 ? Math.round(total / maxTotal * 100) : 0;
  const tier = lang === "en" ? pct >= 66 ? { label: "Emotions are currently steering your trades more than your plan.", color: LOSS } : pct >= 33 ? { label: "There's something worth watching, but it's not critical.", color: WARN } : { label: "Discipline looks solid.", color: WIN } : pct >= 66 ? { label: "\u042D\u043C\u043E\u0446\u0438\u0438 \u0441\u0435\u0439\u0447\u0430\u0441 \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0442 \u0441\u0434\u0435\u043B\u043A\u0430\u043C\u0438 \u0431\u043E\u043B\u044C\u0448\u0435, \u0447\u0435\u043C \u043F\u043B\u0430\u043D.", color: LOSS } : pct >= 33 ? { label: "\u0415\u0441\u0442\u044C \u043D\u0430 \u0447\u0442\u043E \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u044C \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435, \u043D\u043E \u043D\u0435 \u043A\u0440\u0438\u0442\u0438\u0447\u043D\u043E.", color: WARN } : { label: "\u0414\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0430 \u0432\u044B\u0433\u043B\u044F\u0434\u0438\u0442 \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u043E.", color: WIN };
  const confirmed = issues.filter((q) => (answers[q.id]?.score ?? 0) >= 2).sort((a, b) => (answers[b.id]?.score ?? 0) - (answers[a.id]?.score ?? 0));
  const clear = issues.filter((q) => (answers[q.id]?.score ?? 0) <= 1);
  const priority = confirmed[0] || null;
  const rest = confirmed.slice(1);
  const crossValidated = confirmed.filter((q) => q.dataDriven);
  let narrative;
  if (lang === "en") {
    if (confirmed.length === 0) {
      narrative = "Based on your answers, no strong problem patterns stand out \u2014 that's a good result, but not a reason to drop your guard: take the review again after a few more trades.";
    } else {
      const titles = confirmed.map((q) => q.title.toLowerCase());
      narrative = titles.length === 1 ? `Right now, the biggest influence on your decisions is: ${titles[0]}.` : `Right now, the biggest influence on your decisions is: ${titles.slice(0, -1).join(", ")}, and ${titles[titles.length - 1]}.`;
      if (crossValidated.length > 0) {
        narrative += crossValidated.length === confirmed.length ? " This shows up not just in your answers, but in the journal's own numbers too \u2014 it matches your actual trades, not just how it feels." : ` Some of this (${crossValidated.map((q) => q.title.toLowerCase()).join(", ")}) also shows up in the journal's own numbers, not just in your answers.`;
      }
    }
  } else {
    if (confirmed.length === 0) {
      narrative = "\u041F\u043E \u0442\u0432\u043E\u0438\u043C \u043E\u0442\u0432\u0435\u0442\u0430\u043C \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u044B\u0445 \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u043D\u044B\u0445 \u043F\u0430\u0442\u0442\u0435\u0440\u043D\u043E\u0432 \u043D\u0435 \u0432\u0438\u0434\u043D\u043E \u2014 \u044D\u0442\u043E \u0445\u043E\u0440\u043E\u0448\u0438\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442, \u043D\u043E \u043D\u0435 \u043F\u043E\u0432\u043E\u0434 \u0442\u0435\u0440\u044F\u0442\u044C \u0431\u0434\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C: \u043F\u0440\u043E\u0439\u0434\u0438 \u0440\u0430\u0437\u0431\u043E\u0440 \u0435\u0449\u0451 \u0440\u0430\u0437 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0434\u0435\u043B\u043E\u043A.";
    } else {
      const titles = confirmed.map((q) => q.title.toLowerCase());
      narrative = titles.length === 1 ? `\u0421\u0438\u043B\u044C\u043D\u0435\u0435 \u0432\u0441\u0435\u0433\u043E \u043D\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0441\u0435\u0439\u0447\u0430\u0441 \u0432\u043B\u0438\u044F\u0435\u0442: ${titles[0]}.` : `\u0421\u0438\u043B\u044C\u043D\u0435\u0435 \u0432\u0441\u0435\u0433\u043E \u043D\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0441\u0435\u0439\u0447\u0430\u0441 \u0432\u043B\u0438\u044F\u0435\u0442: ${titles.slice(0, -1).join(", ")} \u0438 ${titles[titles.length - 1]}.`;
      if (crossValidated.length > 0) {
        narrative += crossValidated.length === confirmed.length ? " \u042D\u0442\u043E \u0432\u0438\u0434\u043D\u043E \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E \u043E\u0442\u0432\u0435\u0442\u0430\u043C, \u043D\u043E \u0438 \u0432 \u0441\u0430\u043C\u0438\u0445 \u0446\u0438\u0444\u0440\u0430\u0445 \u0436\u0443\u0440\u043D\u0430\u043B\u0430 \u2014 \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0441 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0441\u0434\u0435\u043B\u043A\u0430\u043C\u0438, \u0430 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u043E\u0449\u0443\u0449\u0435\u043D\u0438\u0435\u043C." : ` \u0427\u0430\u0441\u0442\u044C \u044D\u0442\u043E\u0433\u043E (${crossValidated.map((q) => q.title.toLowerCase()).join(", ")}) \u0432\u0438\u0434\u043D\u043E \u0438 \u0432 \u0441\u0430\u043C\u0438\u0445 \u0446\u0438\u0444\u0440\u0430\u0445 \u0436\u0443\u0440\u043D\u0430\u043B\u0430, \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0432 \u043E\u0442\u0432\u0435\u0442\u0430\u0445.`;
      }
    }
  }
  return { pct, tier, narrative, priority, rest, confirmed, clear };
}
var TA_CONFIDENCE_THRESHOLDS = { low: 5, moderate: 15, high: 30 };
function ta_confidence(sampleSize, thresholds = TA_CONFIDENCE_THRESHOLDS) {
  if (!sampleSize || sampleSize < thresholds.low) return "insufficient";
  if (sampleSize < thresholds.moderate) return "low";
  if (sampleSize < thresholds.high) return "moderate";
  return "high";
}
function ta_metric(value, sampleSize, thresholds) {
  return { value, sampleSize, confidence: ta_confidence(sampleSize, thresholds) };
}
function st_mean(arr) {
  if (!arr || !arr.length) return null;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
function st_median(arr) {
  if (!arr || !arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
function st_stdev(arr) {
  if (!arr || arr.length < 2) return null;
  const m = st_mean(arr);
  const variance = arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}
var st_round2 = (v) => v == null ? null : Math.round(v * 100) / 100;
var TA_TREND_WINDOW = 20;
function ta_splitRecent(sortedEntries, windowSize = TA_TREND_WINDOW) {
  const n = sortedEntries.length;
  const recent = sortedEntries.slice(Math.max(0, n - windowSize));
  const previous = sortedEntries.slice(Math.max(0, n - 2 * windowSize), Math.max(0, n - windowSize));
  return { recent, previous };
}
function ta_trend(currentValue, previousValue, epsilon = 1, higherIsBetter = true) {
  if (currentValue == null || previousValue == null) return "insufficient_data";
  const diff = currentValue - previousValue;
  if (Math.abs(diff) < epsilon) return "stable";
  const rising = diff > 0;
  return rising === higherIsBetter ? "improving" : "declining";
}
var TREND_ARROW = { improving: " \u2191", declining: " \u2193", stable: "", insufficient_data: "" };
var RQ_CAUSE_MARKERS = ["\u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E", "\u0438\u0437-\u0437\u0430", "\u0442.\u043A.", "\u0442\u0430\u043A \u043A\u0430\u043A", "\u043F\u043E\u044D\u0442\u043E\u043C\u0443", "\u0432\u0435\u0434\u044C"];
var RQ_ACTION_MARKERS = ["\u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437", "\u0431\u0443\u0434\u0443", "\u0441\u0434\u0435\u043B\u0430\u044E", "\u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u0443", "\u043D\u0430\u0447\u043D\u0443", "\u043D\u0435 \u0431\u0443\u0434\u0443", "\u043D\u0430\u0434\u043E \u0431\u0443\u0434\u0435\u0442", "\u0441\u0442\u043E\u0438\u0442"];
function ta_reflectionQualityForEntry(entry) {
  const pull = (entry.pull || "").trim();
  const lesson = (entry.lesson || "").trim();
  const hasPull = pull && pull !== "\u2014";
  const hasLesson = lesson && lesson !== "\u2014";
  if (!hasPull && !hasLesson) return 0;
  let score = 0;
  if (hasPull) score += 20;
  if (hasLesson) score += 20;
  const combined = `${pull} ${lesson}`.toLowerCase();
  const hasCause = RQ_CAUSE_MARKERS.some((m) => combined.includes(m));
  const hasAction = RQ_ACTION_MARKERS.some((m) => combined.includes(m));
  const hasNumberOrTime = /\d/.test(combined);
  if (hasCause) score += 20;
  if (hasAction) score += 25;
  if (hasNumberOrTime) score += 15;
  const wordCount = combined.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 6 && (hasCause || hasAction)) score += Math.min(10, Math.floor(wordCount / 6));
  return Math.max(0, Math.min(100, score));
}
function reflectionAnalysis(entries) {
  const withText = entries.filter((e) => e.pull && e.pull !== "\u2014" || e.lesson && e.lesson !== "\u2014");
  const scores = entries.map(ta_reflectionQualityForEntry).filter((_, i) => entries[i].pull && entries[i].pull !== "\u2014" || entries[i].lesson && entries[i].lesson !== "\u2014");
  const avgScore = st_mean(scores);
  const withLessons = entries.filter((e) => e.lesson && e.lesson !== "\u2014" && e.lesson.trim().length > 3);
  const words = withLessons.map((e) => pe_normalizeLesson(e.lesson));
  const clusters = [];
  for (let i = 0; i < withLessons.length; i++) {
    let placed = false;
    for (const c of clusters) {
      if (pe_lessonSimilarity(words[i], words[c.members[0]]) >= 0.5) {
        c.members.push(i);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ members: [i] });
  }
  const repeatedLessons = clusters.filter((c) => c.members.length >= 2).map((c) => ({ text: withLessons[c.members[0]].lesson, count: c.members.length })).sort((a, b) => b.count - a.count);
  const losses = entries.filter((e) => e.outcome === "Loss");
  const lossesWithShots = losses.filter((e) => Array.isArray(e.screenshots) && e.screenshots.length > 0);
  return {
    score: ta_metric(avgScore != null ? Math.round(avgScore) : null, withText.length),
    repeatedLessons,
    lossReviewCoverage: losses.length ? ta_metric(Math.round(lossesWithShots.length / losses.length * 100), losses.length) : ta_metric(null, 0)
  };
}
var EMOTION_ZONES = [
  { id: "fear_avoidance", title: "\u0421\u0442\u0440\u0430\u0445 / \u0438\u0437\u0431\u0435\u0433\u0430\u043D\u0438\u0435", test: (x, y) => x < 50 && y < 50 },
  { id: "tense_confidence", title: "\u041D\u0430\u043F\u0440\u044F\u0436\u0451\u043D\u043D\u0430\u044F \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C", test: (x, y) => x >= 50 && y < 50 },
  { id: "calm_confidence", title: "\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u0430\u044F \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C", test: (x, y) => x >= 50 && y >= 50 },
  { id: "doubt_neutral", title: "\u0421\u043E\u043C\u043D\u0435\u043D\u0438\u0435 / \u043D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C", test: (x, y) => x < 50 && y >= 50 }
];
function ta_zoneStats(group) {
  const withR = group.filter((t) => typeof t.r === "number" && !isNaN(t.r));
  const rs = withR.map((t) => t.r);
  const wins = group.filter((t) => t.outcome === "Win").length;
  const losses = group.filter((t) => t.outcome === "Loss").length;
  let maxLossStreak = 0, streak = 0;
  [...group].sort((a, b) => a.date - b.date).forEach((t) => {
    if (t.outcome === "Loss") {
      streak++;
      maxLossStreak = Math.max(maxLossStreak, streak);
    } else streak = 0;
  });
  return {
    trades: group.length,
    winRate: group.length ? Math.round(wins / group.length * 100) : null,
    meanR: st_round2(st_mean(rs)),
    medianR: st_round2(st_median(rs)),
    meanAbsR: st_round2(st_mean(rs.map(Math.abs))),
    lossShare: group.length ? Math.round(losses / group.length * 100) : null,
    maxLossStreak
  };
}
function emotionalAnalysis(entries) {
  const complete = entries.filter((e) => e.x != null && e.y != null && !isNaN(e.x) && !isNaN(e.y));
  if (!complete.length) {
    return { average: null, volatility: null, zones: [], bestState: null, worstState: null, confidence: "insufficient" };
  }
  const xs = complete.map((e) => e.x), ys = complete.map((e) => e.y);
  const average = { x: Math.round(st_mean(xs)), y: Math.round(st_mean(ys)) };
  const volatility = { x: st_round2(st_stdev(xs)), y: st_round2(st_stdev(ys)) };
  const zones = EMOTION_ZONES.map((z) => {
    const group = complete.filter((e) => z.test(e.x, e.y));
    return { id: z.id, title: z.title, ...ta_zoneStats(group), confidence: ta_confidence(group.length, { low: 5, moderate: 20, high: 30 }) };
  });
  const ranked = zones.filter((z) => z.trades >= 5 && z.medianR != null);
  const bestState = ranked.length ? ranked.reduce((a, b) => b.medianR > a.medianR ? b : a) : null;
  const worstState = ranked.length ? ranked.reduce((a, b) => b.medianR < a.medianR ? b : a) : null;
  return { average, volatility, zones, bestState, worstState, confidence: ta_confidence(complete.length) };
}
function riskAnalysis(sortedEntries) {
  const withR = sortedEntries.filter((t) => typeof t.r === "number" && !isNaN(t.r));
  if (withR.length < 5) {
    return {
      stability: ta_metric(null, withR.length),
      averageRisk: null,
      volatility: null,
      postLossChange: ta_metric(null, 0),
      postWinChange: ta_metric(null, 0)
    };
  }
  const mags = withR.map((t) => Math.abs(t.r));
  const meanMag = st_mean(mags);
  const sd = st_stdev(mags);
  const cv = meanMag ? sd / meanMag : 0;
  const stability = Math.round(Math.max(0, 100 - cv * 100));
  const postLoss = [], postWin = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    const prev = sortedEntries[i - 1], cur = sortedEntries[i];
    if (typeof prev.r !== "number" || typeof cur.r !== "number") continue;
    if (prev.outcome === "Loss") postLoss.push({ prevAbs: Math.abs(prev.r), curAbs: Math.abs(cur.r) });
    else if (prev.outcome === "Win") postWin.push({ prevAbs: Math.abs(prev.r), curAbs: Math.abs(cur.r) });
  }
  const pctChange = (pairs) => {
    if (!pairs.length) return null;
    const prevMean = st_mean(pairs.map((p) => p.prevAbs));
    const curMean = st_mean(pairs.map((p) => p.curAbs));
    if (!prevMean) return null;
    return Math.round((curMean - prevMean) / prevMean * 100);
  };
  return {
    stability: ta_metric(stability, withR.length),
    averageRisk: st_round2(meanMag),
    volatility: st_round2(sd),
    postLossChange: ta_metric(pctChange(postLoss), postLoss.length),
    postWinChange: ta_metric(pctChange(postWin), postWin.length)
  };
}
function sequenceAnalysis(sortedEntries) {
  const revengeGroup = [], normalAfterLoss = [];
  for (let i = 1; i < sortedEntries.length; i++) {
    if (sortedEntries[i - 1].outcome === "Loss") {
      const gapMin = (sortedEntries[i].date - sortedEntries[i - 1].date) / 6e4;
      if (gapMin >= 0 && gapMin <= 30) revengeGroup.push(sortedEntries[i]);
      else normalAfterLoss.push(sortedEntries[i]);
    }
  }
  const revengeStats = pe_summarize(revengeGroup);
  const normalAfterLossStats = pe_summarize(normalAfterLoss.length ? normalAfterLoss : sortedEntries);
  let curLossStreak = 0, maxLossStreak = 0, curWinStreak = 0, maxWinStreak = 0;
  const afterLossStreak2 = [];
  sortedEntries.forEach((t) => {
    if (curLossStreak >= 2) afterLossStreak2.push(t);
    if (t.outcome === "Loss") {
      curLossStreak++;
      maxLossStreak = Math.max(maxLossStreak, curLossStreak);
      curWinStreak = 0;
    } else if (t.outcome === "Win") {
      curWinStreak++;
      maxWinStreak = Math.max(maxWinStreak, curWinStreak);
      curLossStreak = 0;
    } else {
      curLossStreak = 0;
      curWinStreak = 0;
    }
  });
  const afterLossStreakStats = pe_summarize(afterLossStreak2);
  const byDay = /* @__PURE__ */ new Map();
  sortedEntries.forEach((t) => {
    const k = t.date.toDateString();
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(t);
  });
  const dayCounts = [...byDay.values()].map((a) => a.length);
  const medianDayCount = dayCounts.length ? st_median(dayCounts) : null;
  let overtradingGroup = [], normalDaysGroup = [];
  if (dayCounts.length >= 5) {
    const baseline = Math.max(1, medianDayCount);
    const threshold = Math.max(baseline + 3, baseline * 2);
    byDay.forEach((trades) => {
      if (trades.length >= threshold) overtradingGroup.push(...trades);
      else normalDaysGroup.push(...trades);
    });
  }
  const overtradingStats = pe_summarize(overtradingGroup);
  const normalDaysStats = pe_summarize(normalDaysGroup.length ? normalDaysGroup : sortedEntries);
  return {
    revenge: { group: revengeStats, groupSize: revengeGroup.length, rest: normalAfterLossStats },
    lossStreak: { max: maxLossStreak, afterStreak: afterLossStreakStats, afterStreakSize: afterLossStreak2.length },
    winStreak: { max: maxWinStreak },
    overtrading: { medianDayCount, group: overtradingStats, groupSize: overtradingGroup.length, normalDays: normalDaysStats }
  };
}
function disciplineAnalysis(sortedEntries, seq, risk) {
  const n = sortedEntries.length;
  if (n < 5) return { score: ta_metric(null, n), violations: [] };
  const violations = [];
  let penalty = 0;
  const lossCount = sortedEntries.filter((t) => t.outcome === "Loss").length;
  if (lossCount >= 3) {
    const revengeRate = seq.revenge.groupSize / lossCount;
    if (revengeRate > 0.15) {
      const amount = Math.min(30, revengeRate * 60);
      penalty += amount;
      violations.push({ id: "revenge_rate", value: Math.round(revengeRate * 100), impact: Math.round(amount) });
    }
  }
  if (seq.overtrading.groupSize > 0) {
    const share = seq.overtrading.groupSize / n;
    const amount = Math.min(20, share * 100);
    penalty += amount;
    violations.push({ id: "overtrading_days", value: Math.round(share * 100), impact: Math.round(amount) });
  }
  if (risk.postLossChange.value != null && risk.postLossChange.value > 20) {
    const amount = Math.min(20, risk.postLossChange.value / 3);
    penalty += amount;
    violations.push({ id: "risk_after_loss", value: risk.postLossChange.value, impact: Math.round(amount) });
  }
  if (risk.postWinChange.value != null && risk.postWinChange.value > 20) {
    const amount = Math.min(20, risk.postWinChange.value / 3);
    penalty += amount;
    violations.push({ id: "risk_after_win", value: risk.postWinChange.value, impact: Math.round(amount) });
  }
  const score = Math.round(Math.max(0, 100 - penalty));
  return { score: ta_metric(score, n), violations };
}
var AWARENESS_WEIGHTS = {
  selfObservation: 0.2,
  emotionalAwareness: 0.15,
  behavioralConsistency: 0.15,
  reflectionQuality: 0.2,
  patternRecognition: 0.15,
  processDiscipline: 0.15
};
function awarenessAnalysis(entries, closedEntries, reflection, risk, discipline) {
  const n = entries.length;
  if (!n) return { score: ta_metric(55, 0), components: null };
  const closedN = (closedEntries || []).length;
  const selfObservation = closedN ? closedEntries.filter(
    (e) => e.x != null && e.y != null && e.pull && e.pull !== "\u2014" && e.lesson && e.lesson !== "\u2014"
  ).length / closedN * 100 : 50;
  const emotionalAwareness = entries.filter((e) => e.x != null && e.y != null).length / n * 100;
  const behavioralConsistency = risk.stability.value != null ? risk.stability.value : 50;
  const reflectionQuality = reflection.score.value != null ? reflection.score.value : 50;
  const withLessons = entries.filter((e) => e.lesson && e.lesson !== "\u2014" && e.lesson.trim().length > 3).length;
  const repeatedCount = reflection.repeatedLessons.reduce((s, c) => s + c.count, 0);
  const patternRecognition = withLessons ? Math.max(0, 100 - repeatedCount / withLessons * 100) : 50;
  const processDiscipline = discipline.score.value != null ? discipline.score.value : 50;
  const components = { selfObservation, emotionalAwareness, behavioralConsistency, reflectionQuality, patternRecognition, processDiscipline };
  const raw = Object.entries(AWARENESS_WEIGHTS).reduce((s, [k, w]) => s + (components[k] ?? 50) * w, 0);
  const score = Math.round(Math.max(0, Math.min(100, raw)));
  return { score: ta_metric(score, n), components };
}
function calibrationAnalysis(sortedEntries, lastCalibration, lang = "ru") {
  if (!lastCalibration || !lastCalibration.date) {
    return { available: false, confidence: "insufficient" };
  }
  const calDate = new Date(lastCalibration.date);
  if (isNaN(calDate.getTime())) return { available: false, confidence: "insufficient" };
  const dayEntries = sortedEntries.filter((e) => e.date.toDateString() === calDate.toDateString());
  if (dayEntries.length < 2) {
    return { available: false, confidence: "insufficient", dayTradeCount: dayEntries.length };
  }
  let revengeCount = 0;
  for (let i = 1; i < dayEntries.length; i++) {
    if (dayEntries[i - 1].outcome === "Loss") {
      const gapMin = (dayEntries[i].date - dayEntries[i - 1].date) / 6e4;
      if (gapMin >= 0 && gapMin <= 30) revengeCount++;
    }
  }
  const withR = dayEntries.filter((e) => typeof e.r === "number" && !isNaN(e.r));
  let riskGrew = false;
  if (withR.length >= 3) {
    const half = Math.floor(withR.length / 2);
    const m1 = st_mean(withR.slice(0, half).map((e) => Math.abs(e.r)));
    const m2 = st_mean(withR.slice(half).map((e) => Math.abs(e.r)));
    if (m1 && m2 && m2 > m1 * 1.3) riskGrew = true;
  }
  const statedRiskFactors = lastCalibration.riskFactors || [];
  const statedCalm = statedRiskFactors.length === 0;
  let divergenceNote = null;
  if (lang === "en") {
    if (statedCalm && (revengeCount > 0 || riskGrew || dayEntries.length >= 8)) {
      const signals = [];
      if (revengeCount > 0) signals.push(`${revengeCount} ${revengeCount === 1 ? "trade" : "trades"} within 30 minutes of a loss`);
      if (riskGrew) signals.push("risk noticeably grew during the day");
      if (dayEntries.length >= 8) signals.push(`${dayEntries.length} trades in one day`);
      divergenceNote = `Your pre-session calibration didn't flag any risk factors, but during the day: ${signals.join(", ")}. There was a gap between the stated state and actual behavior.`;
    } else if (!statedCalm && revengeCount === 0 && !riskGrew && dayEntries.length < 8) {
      divergenceNote = "Calibration flagged risk factors before the session, and the day went without clear signs of revenge trading, growing risk, or a high trade count \u2014 the stated caution held up in behavior.";
    }
  } else {
    if (statedCalm && (revengeCount > 0 || riskGrew || dayEntries.length >= 8)) {
      const signals = [];
      if (revengeCount > 0) signals.push(`${revengeCount} ${pluralRu(revengeCount, "\u0441\u0434\u0435\u043B\u043A\u0430", "\u0441\u0434\u0435\u043B\u043A\u0438", "\u0441\u0434\u0435\u043B\u043E\u043A")} \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 30 \u043C\u0438\u043D\u0443\u0442 \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430`);
      if (riskGrew) signals.push("\u0440\u0438\u0441\u043A \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0432\u044B\u0440\u043E\u0441 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0434\u043D\u044F");
      if (dayEntries.length >= 8) signals.push(`${dayEntries.length} \u0441\u0434\u0435\u043B\u043E\u043A \u0437\u0430 \u0434\u0435\u043D\u044C`);
      divergenceNote = `\u041A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0430 \u043F\u0435\u0440\u0435\u0434 \u0441\u0435\u0441\u0441\u0438\u0435\u0439 \u043D\u0435 \u043E\u0442\u043C\u0435\u0442\u0438\u043B\u0430 \u0444\u0430\u043A\u0442\u043E\u0440\u043E\u0432 \u0440\u0438\u0441\u043A\u0430, \u043D\u043E \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u0434\u043D\u044F: ${signals.join(", ")}. \u041C\u0435\u0436\u0434\u0443 \u0437\u0430\u044F\u0432\u043B\u0435\u043D\u043D\u044B\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C \u0438 \u0444\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u043F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435\u043C \u0431\u044B\u043B\u043E \u0440\u0430\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0435.`;
    } else if (!statedCalm && revengeCount === 0 && !riskGrew && dayEntries.length < 8) {
      divergenceNote = "\u041A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0430 \u043E\u0442\u043C\u0435\u0442\u0438\u043B\u0430 \u0444\u0430\u043A\u0442\u043E\u0440\u044B \u0440\u0438\u0441\u043A\u0430 \u043F\u0435\u0440\u0435\u0434 \u0441\u0435\u0441\u0441\u0438\u0435\u0439, \u0438 \u0434\u0435\u043D\u044C \u043F\u0440\u043E\u0448\u0451\u043B \u0431\u0435\u0437 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u044B\u0445 \u043F\u0440\u0438\u0437\u043D\u0430\u043A\u043E\u0432 \u0440\u0435\u0432\u0430\u043D\u0448\u0430, \u0440\u043E\u0441\u0442\u0430 \u0440\u0438\u0441\u043A\u0430 \u0438\u043B\u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u0433\u043E \u0447\u0438\u0441\u043B\u0430 \u0441\u0434\u0435\u043B\u043E\u043A \u2014 \u0437\u0430\u044F\u0432\u043B\u0435\u043D\u043D\u0430\u044F \u043E\u0441\u0442\u043E\u0440\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B\u0430\u0441\u044C \u043F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435\u043C.";
    }
  }
  return {
    available: true,
    dayTradeCount: dayEntries.length,
    statedPct: lastCalibration.pct,
    statedRiskFactors,
    actualSignals: { revengeCount, riskGrew, tradeCount: dayEntries.length },
    divergenceNote,
    confidence: ta_confidence(dayEntries.length, { low: 3, moderate: 6, high: 10 }),
    limitation: lang === "en" ? "Only the last calibration completed that day is considered \u2014 there's no per-session calibration history yet, so long-term calibration accuracy isn't calculated." : "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u043D\u0430\u044F \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0430 \u0437\u0430 \u0434\u0435\u043D\u044C \u2014 \u0438\u0441\u0442\u043E\u0440\u0438\u0438 \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043E\u043A \u043F\u043E \u0441\u0435\u0441\u0441\u0438\u044F\u043C \u043F\u043E\u043A\u0430 \u043D\u0435\u0442, \u0434\u043E\u043B\u0433\u043E\u0441\u0440\u043E\u0447\u043D\u0430\u044F \u0442\u043E\u0447\u043D\u043E\u0441\u0442\u044C \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0438 \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F."
  };
}
var PATTERN_MIN_SAMPLE = 20;
var PATTERN_MIN_GROUP = 8;
var PATTERN_MIN_REVENGE = 5;
var PATTERN_MIN_DIFF_R = 0.2;
var PATTERN_SCORE_FLOOR = 0.22;
function pe_isEmotionallyComplete(t) {
  return t && t.x != null && t.y != null && !isNaN(t.x) && !isNaN(t.y) && (t.outcome === "Win" || t.outcome === "Loss" || t.outcome === "Breakeven");
}
function pe_summarize(group) {
  const wins = group.filter((t) => t.outcome === "Win").length;
  const losses = group.filter((t) => t.outcome === "Loss").length;
  const breakevens = group.filter((t) => t.outcome === "Breakeven").length;
  const withR = group.filter((t) => typeof t.r === "number" && !isNaN(t.r));
  const avgR = withR.length ? withR.reduce((s, t) => s + t.r, 0) / withR.length : null;
  const winRate = group.length ? Math.round(wins / group.length * 100) : 0;
  return { trades: group.length, wins, losses, breakevens, winRate, avgR };
}
function pe_scoreCandidate(group, rest, opts = {}) {
  const gStats = pe_summarize(group);
  const rStats = pe_summarize(rest);
  if (gStats.avgR == null || rStats.avgR == null || group.length === 0) return null;
  const diff = gStats.avgR - rStats.avgR;
  if (Math.abs(diff) < (opts.minDiffR ?? PATTERN_MIN_DIFF_R)) return null;
  const uniqueDays = new Set(group.map((t) => t.date.toDateString())).size;
  const sampleNorm = opts.sampleNorm ?? 25;
  const sampleConfidence = Math.min(1, group.length / sampleNorm);
  const statisticalDifference = Math.min(1, Math.abs(diff) / 0.6);
  const recurrence = Math.min(1, uniqueDays / Math.min(8, sampleNorm));
  const score = statisticalDifference * sampleConfidence * recurrence;
  const confidenceLabel = score >= 0.55 ? "high" : score >= 0.32 ? "medium" : "low";
  return { gStats, rStats, diff, uniqueDays, score, confidenceLabel };
}
function pe_pickExamples(group, n = 3) {
  const withR = group.filter((t) => typeof t.r === "number" && !isNaN(t.r));
  if (withR.length === 0) return group.slice(0, n);
  const avg = withR.reduce((s, t) => s + t.r, 0) / withR.length;
  return [...withR].sort((a, b) => Math.abs(a.r - avg) - Math.abs(b.r - avg)).slice(0, n);
}
var PE_STOPWORDS = /* @__PURE__ */ new Set([
  "\u0438",
  "\u0432",
  "\u043D\u0430",
  "\u0441",
  "\u043D\u0435",
  "\u0447\u0442\u043E",
  "\u044F",
  "\u044D\u0442\u043E",
  "\u043F\u043E",
  "\u0437\u0430",
  "\u043A\u0430\u043A",
  "\u043D\u043E",
  "\u0430",
  "\u0442\u043E",
  "\u0438\u0437",
  "\u043A",
  "\u0443",
  "\u0436\u0435",
  "\u0431\u044B",
  "\u0432\u0441\u0435",
  "\u0432\u0441\u0451",
  "\u043C\u043D\u0435",
  "\u043C\u0435\u043D\u044F",
  "\u0442\u0435\u0431\u0435",
  "\u0441\u0435\u0431\u044F",
  "\u0431\u044B\u043B\u043E",
  "\u0431\u044B\u043B",
  "\u0431\u044B\u043B\u0430",
  "\u043D\u0443\u0436\u043D\u043E",
  "\u043D\u0430\u0434\u043E",
  "\u0435\u0441\u043B\u0438",
  "\u0438\u043B\u0438",
  "\u0434\u043B\u044F",
  "\u0434\u043E",
  "\u043E\u0442",
  "\u0440\u0430\u0437",
  "\u043F\u0440\u043E\u0441\u0442\u043E",
  "\u0443\u0436\u0435",
  "\u0435\u0449\u0451",
  "\u0435\u0449\u0435"
]);
function pe_normalizeLesson(text) {
  return (text || "").toLowerCase().replace(/[.,!?;:()«»"'\-—]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !PE_STOPWORDS.has(w));
}
function pe_lessonSimilarity(aWords, bWords) {
  if (!aWords.length || !bWords.length) return 0;
  const a = new Set(aWords), b = new Set(bWords);
  let intersection = 0;
  a.forEach((w) => {
    if (b.has(w)) intersection++;
  });
  const union = (/* @__PURE__ */ new Set([...a, ...b])).size;
  return union ? intersection / union : 0;
}
function pd_confidenceTension(complete, lang = "ru") {
  const group = complete.filter((t) => t.x >= 80 && t.y <= 20);
  if (group.length < PATTERN_MIN_GROUP) return null;
  const rest = complete.filter((t) => !(t.x >= 80 && t.y <= 20));
  return lang === "en" ? {
    id: "confidence_tension",
    title: "Confidence + tension",
    description: "Your worst-performing trades don't come from fear \u2014 they come when confidence is high but tension is high too.",
    healthyDescription: "When confidence and tension are both high, your result is noticeably better than in other trades.",
    group,
    rest
  } : {
    id: "confidence_tension",
    title: "\u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C + \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435",
    description: "\u0422\u0432\u043E\u0438 \u043D\u0430\u0438\u0431\u043E\u043B\u0435\u0435 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u0432\u043E\u0437\u043D\u0438\u043A\u0430\u044E\u0442 \u043D\u0435 \u0432 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0441\u0442\u0440\u0430\u0445\u0430, \u0430 \u043A\u043E\u0433\u0434\u0430 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0432\u044B\u0441\u043E\u043A\u0430\u044F, \u043D\u043E \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u044F \u0442\u043E\u0436\u0435 \u0432\u044B\u0441\u043E\u043A\u0438\u0439.",
    healthyDescription: "\u041A\u043E\u0433\u0434\u0430 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0438 \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435 \u0432\u044B\u0441\u043E\u043A\u0438 \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E, \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u043B\u0443\u0447\u0448\u0435, \u0447\u0435\u043C \u0432 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043A\u0430\u0445.",
    group,
    rest
  };
}
function pd_fear(complete, lang = "ru") {
  const group = complete.filter((t) => t.x <= 20);
  if (group.length < PATTERN_MIN_GROUP) return null;
  const rest = complete.filter((t) => t.x > 20);
  return lang === "en" ? {
    id: "fear",
    title: "Entering out of fear",
    description: "Trades started from a strong fear of missing the move are, on average, noticeably worse than the rest.",
    healthyDescription: "Even your fear-driven entries aren't worse than your other trades on average \u2014 that's unusual and worth knowing.",
    group,
    rest
  } : {
    id: "fear",
    title: "\u0412\u0445\u043E\u0434 \u0438\u0437 \u0441\u0442\u0440\u0430\u0445\u0430",
    description: "\u0421\u0434\u0435\u043B\u043A\u0438, \u043D\u0430\u0447\u0430\u0442\u044B\u0435 \u0438\u0437 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u0442\u0440\u0430\u0445\u0430 \u0443\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435, \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0445\u0443\u0436\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445.",
    healthyDescription: "\u0414\u0430\u0436\u0435 \u0432\u0445\u043E\u0434\u044B \u0438\u0437 \u0441\u0442\u0440\u0430\u0445\u0430 \u0443 \u0442\u0435\u0431\u044F \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C \u043D\u0435 \u0445\u0443\u0436\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u2014 \u044D\u0442\u043E \u0441\u0430\u043C\u043E \u043F\u043E \u0441\u0435\u0431\u0435 \u043D\u0435\u043E\u0431\u044B\u0447\u043D\u043E \u0438 \u0441\u0442\u043E\u0438\u0442 \u0437\u043D\u0430\u0442\u044C.",
    group,
    rest
  };
}
function pd_tooCalm(complete, lang = "ru") {
  const group = complete.filter((t) => t.y >= 80);
  if (group.length < PATTERN_MIN_GROUP) return null;
  const rest = complete.filter((t) => t.y < 80);
  return lang === "en" ? {
    id: "too_calm",
    title: "Too calm",
    description: "In a state of pronounced calm, your result is noticeably worse than in other trades \u2014 maybe it's not calm, but a lack of attention to risk.",
    healthyDescription: "Calm",
    healthyTitle: "Calm works in your favor",
    healthyDescriptionFull: "Trades made in a state of pronounced calm are noticeably better than your other trades \u2014 that's a strength, not something to fix.",
    group,
    rest
  } : {
    id: "too_calm",
    title: "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439",
    description: "\u0412 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u044F \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0445\u0443\u0436\u0435, \u0447\u0435\u043C \u0432 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043A\u0430\u0445 \u2014 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u044D\u0442\u043E \u043D\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u0435, \u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F \u043A \u0440\u0438\u0441\u043A\u0443.",
    healthyDescription: "\u0421\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u0435",
    healthyTitle: "\u0421\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043D\u0430 \u0442\u0435\u0431\u044F",
    healthyDescriptionFull: "\u0421\u0434\u0435\u043B\u043A\u0438 \u0432 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u043D\u043E\u0433\u043E \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u044F \u0443 \u0442\u0435\u0431\u044F \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u043B\u0443\u0447\u0448\u0435 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u2014 \u044D\u0442\u043E \u0441\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430, \u0430 \u043D\u0435 \u0442\u043E, \u0447\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0447\u0438\u043D\u0438\u0442\u044C.",
    group,
    rest
  };
}
function pd_revenge(allSorted, lang = "ru") {
  const revengeTrades = [];
  const normalNextTrades = [];
  for (let i = 1; i < allSorted.length; i++) {
    if (allSorted[i - 1].outcome === "Loss") {
      const gapMin = (allSorted[i].date - allSorted[i - 1].date) / 6e4;
      if (gapMin >= 0 && gapMin <= 30) revengeTrades.push(allSorted[i]);
      else normalNextTrades.push(allSorted[i]);
    }
  }
  if (revengeTrades.length < PATTERN_MIN_REVENGE) return null;
  const rest = normalNextTrades.length ? normalNextTrades : allSorted.filter((t) => !revengeTrades.includes(t));
  return lang === "en" ? {
    id: "revenge",
    title: "Revenge through confidence",
    description: "After a losing trade you often re-enter within a short window, and the quality of the result in those re-entries is noticeably worse.",
    group: revengeTrades,
    rest,
    minDiffR: 0.15,
    sampleNorm: 10
  } : {
    id: "revenge",
    title: "\u0420\u0435\u0432\u0430\u043D\u0448 \u0447\u0435\u0440\u0435\u0437 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C",
    description: "\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u0442\u044B \u0447\u0430\u0441\u0442\u043E \u0432\u0445\u043E\u0434\u0438\u0448\u044C \u0441\u043D\u043E\u0432\u0430 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438, \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430 \u0432 \u044D\u0442\u0438\u0445 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0445 \u0432\u0445\u043E\u0434\u0430\u0445 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0445\u0443\u0436\u0435.",
    group: revengeTrades,
    rest,
    minDiffR: 0.15,
    sampleNorm: 10
    // revenge has its own, lower, spec'd minimum (5) — score against that scale, not the general one
  };
}
function pd_lessonNotLearned(all, lang = "ru") {
  const withLessons = all.filter((t) => t.lesson && t.lesson !== "\u2014" && t.lesson.trim().length > 3);
  if (withLessons.length < 3) return null;
  const words = withLessons.map((t) => pe_normalizeLesson(t.lesson));
  const clusters = [];
  for (let i = 0; i < withLessons.length; i++) {
    let placed = false;
    for (const c of clusters) {
      const rep = c.members[0];
      if (pe_lessonSimilarity(words[i], words[rep]) >= 0.5) {
        c.members.push(i);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push({ members: [i] });
  }
  clusters.sort((a, b) => b.members.length - a.members.length);
  const top = clusters[0];
  if (!top || top.members.length < 3) return null;
  const group = top.members.map((i) => withLessons[i]);
  const groupIds = new Set(group.map((t) => t.id));
  const rest = all.filter((t) => !groupIds.has(t.id));
  return {
    id: "lesson_not_learned",
    title: lang === "en" ? "Lesson not learned" : "\u0423\u0440\u043E\u043A \u043D\u0435 \u0443\u0441\u0432\u043E\u0435\u043D",
    description: lang === "en" ? `A similar lesson repeats in the journal ${group.length} times ("${group[0].lesson}") \u2014 but based on the results, the behavior itself hasn't changed.` : `\u041F\u043E\u0445\u043E\u0436\u0438\u0439 \u0443\u0440\u043E\u043A \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0442\u0441\u044F \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435 ${group.length} \u0440\u0430\u0437 (\xAB${group[0].lesson}\xBB) \u2014 \u0430 \u043F\u043E\u0432\u0435\u0434\u0435\u043D\u0438\u0435, \u0441\u0443\u0434\u044F \u043F\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0443, \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u0435\u0436\u043D\u0438\u043C.`,
    group,
    rest,
    minDiffR: 0.1,
    minGroup: 3,
    sampleNorm: 6
  };
}
function pd_unstableRisk(all, lang = "ru") {
  const withR = all.filter((t) => typeof t.r === "number" && !isNaN(t.r));
  if (withR.length < 10) return null;
  const mags = withR.map((t) => Math.abs(t.r));
  const meanMag = mags.reduce((s, v) => s + v, 0) / mags.length;
  const variance = mags.reduce((s, v) => s + (v - meanMag) ** 2, 0) / mags.length;
  const stdev = Math.sqrt(variance);
  if (stdev < meanMag * 0.6 || stdev < 0.3) return null;
  const spikes = withR.filter((t) => Math.abs(t.r) > meanMag + stdev);
  if (spikes.length < PATTERN_MIN_GROUP) return null;
  const rest = withR.filter((t) => !spikes.includes(t));
  return {
    id: "unstable_risk",
    title: lang === "en" ? "Unstable risk" : "\u041D\u0435\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0439 \u0440\u0438\u0441\u043A",
    description: lang === "en" ? `Your R result swings a lot (average ${meanMag.toFixed(2)}R, spread \xB1${stdev.toFixed(2)}R) \u2014 some trades are noticeably bigger than typical, which usually points to unstable risk, not the market.` : `\u0420\u0430\u0437\u043C\u0435\u0440 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430 \u043F\u043E R \u0441\u0438\u043B\u044C\u043D\u043E \u043A\u043E\u043B\u0435\u0431\u043B\u0435\u0442\u0441\u044F (\u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C ${meanMag.toFixed(2)}R, \u0440\u0430\u0437\u0431\u0440\u043E\u0441 \xB1${stdev.toFixed(2)}R) \u2014 \u0447\u0430\u0441\u0442\u044C \u0441\u0434\u0435\u043B\u043E\u043A \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u043A\u0440\u0443\u043F\u043D\u0435\u0435 \u0442\u0438\u043F\u0438\u0447\u043D\u043E\u0439, \u0447\u0442\u043E \u043E\u0431\u044B\u0447\u043D\u043E \u0433\u043E\u0432\u043E\u0440\u0438\u0442 \u043E \u043D\u0435\u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u043C \u0440\u0438\u0441\u043A\u0435, \u0430 \u043D\u0435 \u043E \u0440\u044B\u043D\u043A\u0435.`,
    group: spikes,
    rest,
    minDiffR: 0.1
  };
}
function pd_overtrading(all, lang = "ru") {
  const byDay = /* @__PURE__ */ new Map();
  all.forEach((t) => {
    const k = t.date.toDateString();
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k).push(t);
  });
  const dayCounts = [...byDay.values()].map((arr) => arr.length);
  if (dayCounts.length < 5) return null;
  const sortedCounts = [...dayCounts].sort((a, b) => a - b);
  const median = sortedCounts[Math.floor(sortedCounts.length / 2)];
  const baseline = Math.max(1, median);
  const anomalyThreshold = Math.max(baseline + 3, baseline * 2);
  const group = [], rest = [];
  byDay.forEach((trades) => {
    if (trades.length >= anomalyThreshold) group.push(...trades);
    else rest.push(...trades);
  });
  if (group.length < PATTERN_MIN_GROUP) return null;
  return {
    id: "overtrading",
    title: lang === "en" ? "Overtrading" : "\u041F\u0435\u0440\u0435\u0442\u0440\u0435\u0439\u0434\u0438\u043D\u0433",
    description: lang === "en" ? `You typically make ${baseline} ${baseline === 1 ? "trade" : "trades"} on an active day. On days with ${anomalyThreshold}+ trades, the result looks noticeably different from a typical day.` : `\u041E\u0431\u044B\u0447\u043D\u043E \u0443 \u0442\u0435\u0431\u044F ${baseline} ${baseline === 1 ? "\u0441\u0434\u0435\u043B\u043A\u0430" : "\u0441\u0434\u0435\u043B\u043A\u0438"} \u0432 \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0434\u0435\u043D\u044C. \u0412 \u0434\u043D\u0438 \u043E\u0442 ${anomalyThreshold} \u0441\u0434\u0435\u043B\u043E\u043A \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u043E\u0442 \u0442\u0438\u043F\u0438\u0447\u043D\u043E\u0433\u043E \u0434\u043D\u044F.`,
    group,
    rest
  };
}
function pd_lossStreak(allSorted, lang = "ru") {
  const afterStreak = [], normal = [];
  let streak = 0;
  for (let i = 0; i < allSorted.length; i++) {
    const t = allSorted[i];
    if (streak >= 2 && t.outcome !== void 0) {
      afterStreak.push(t);
    } else if (i > 0) {
      normal.push(t);
    }
    if (t.outcome === "Loss") streak++;
    else streak = 0;
  }
  if (afterStreak.length < PATTERN_MIN_GROUP) return null;
  return {
    id: "loss_streak",
    title: lang === "en" ? "Loss streak" : "\u0421\u0435\u0440\u0438\u044F \u0443\u0431\u044B\u0442\u043A\u043E\u0432",
    description: lang === "en" ? "Trades right after a streak of two or more losses in a row look noticeably different from your usual result." : "\u0421\u0434\u0435\u043B\u043A\u0438 \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0441\u0435\u0440\u0438\u0438 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0438 \u0431\u043E\u043B\u0435\u0435 \u0443\u0431\u044B\u0442\u043A\u043E\u0432 \u043F\u043E\u0434\u0440\u044F\u0434 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u043E\u0442\u043B\u0438\u0447\u0430\u044E\u0442\u0441\u044F \u043E\u0442 \u043E\u0431\u044B\u0447\u043D\u044B\u0445 \u043F\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0443.",
    group: afterStreak,
    rest: normal.length ? normal : allSorted.filter((t) => !afterStreak.includes(t)),
    minDiffR: 0.15
  };
}
function pd_riskAfterWin(allSorted, lang = "ru") {
  const withR = allSorted.filter((t) => typeof t.r === "number" && !isNaN(t.r));
  const group = [], rest = [];
  for (let i = 1; i < allSorted.length; i++) {
    if (allSorted[i - 1].outcome === "Win" && typeof allSorted[i - 1].r === "number" && typeof allSorted[i].r === "number") {
      const grew = Math.abs(allSorted[i].r) > Math.abs(allSorted[i - 1].r) * 1.3;
      if (grew) group.push(allSorted[i]);
      else rest.push(allSorted[i]);
    }
  }
  if (group.length < PATTERN_MIN_GROUP) return null;
  return {
    id: "risk_after_win",
    title: lang === "en" ? "Risk growth after a win" : "\u0420\u043E\u0441\u0442 \u0440\u0438\u0441\u043A\u0430 \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u0431\u0435\u0434\u044B",
    description: lang === "en" ? "After a winning trade, the size of your next trade in R noticeably grows \u2014 and the result of those trades is worse." : "\u041F\u043E\u0441\u043B\u0435 \u0432\u044B\u0438\u0433\u0440\u044B\u0448\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u0440\u0430\u0437\u043C\u0435\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E R \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0432\u044B\u0440\u0430\u0441\u0442\u0430\u0435\u0442 \u2014 \u0438 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0442\u0430\u043A\u0438\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u0445\u0443\u0436\u0435.",
    group,
    rest: rest.length ? rest : allSorted,
    minDiffR: 0.15
  };
}
function pd_avoidLossReview(all, lang = "ru") {
  const wins = all.filter((t) => t.outcome === "Win");
  const losses = all.filter((t) => t.outcome === "Loss");
  if (losses.length < PATTERN_MIN_GROUP || wins.length < 3) return null;
  const winShotRate = wins.filter((t) => Array.isArray(t.screenshots) && t.screenshots.length > 0).length / wins.length;
  const lossShotRate = losses.filter((t) => Array.isArray(t.screenshots) && t.screenshots.length > 0).length / losses.length;
  if (winShotRate - lossShotRate < 0.25) return null;
  return {
    id: "avoid_loss_review",
    title: lang === "en" ? "Avoiding loss review" : "\u0418\u0437\u0431\u0435\u0433\u0430\u043D\u0438\u0435 \u0440\u0430\u0437\u0431\u043E\u0440\u0430 \u0443\u0431\u044B\u0442\u043A\u043E\u0432",
    description: lang === "en" ? `Winning trades with a screenshot: ${Math.round(winShotRate * 100)}%. Losing trades: ${Math.round(lossShotRate * 100)}%. You visually review losing trades noticeably less often.` : `\u041F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u0441\u043E \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u043E\u043C: ${Math.round(winShotRate * 100)}%. \u0423\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435: ${Math.round(lossShotRate * 100)}%. \u0422\u044B \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0440\u0435\u0436\u0435 \u0440\u0430\u0437\u0431\u0438\u0440\u0430\u0435\u0448\u044C \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0435 \u0441\u0434\u0435\u043B\u043A\u0438 \u0432\u0438\u0437\u0443\u0430\u043B\u044C\u043D\u043E.`,
    group: losses,
    rest: wins,
    skipDiffCheck: true
    // this pattern's evidence is the screenshot rate, not avgR — always show if the gap is real
  };
}
function pd_shallowReflection(all, lang = "ru") {
  const losses = all.filter((t) => t.outcome === "Loss");
  if (losses.length < PATTERN_MIN_GROUP) return null;
  const isShallow = (t) => {
    const text = (t.lesson || "").trim();
    if (!text || text === "\u2014") return true;
    const words = text.split(/\s+/).filter(Boolean);
    return words.length <= 3 || text.length < 15;
  };
  const shallow = losses.filter(isShallow);
  if (shallow.length / losses.length < 0.5) return null;
  const rest = all.filter((t) => !shallow.includes(t));
  return {
    id: "shallow_reflection",
    title: lang === "en" ? "Shallow reflection" : "\u041F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u0430\u044F \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u044F",
    description: lang === "en" ? `${shallow.length} of ${losses.length} losing trades are described without a real takeaway \u2014 briefly or not at all.` : `${shallow.length} \u0438\u0437 ${losses.length} \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u043E\u043F\u0438\u0441\u0430\u043D\u044B \u0431\u0435\u0437 \u0440\u0430\u0437\u0432\u0451\u0440\u043D\u0443\u0442\u043E\u0433\u043E \u0432\u044B\u0432\u043E\u0434\u0430 \u2014 \u043A\u043E\u0440\u043E\u0442\u043A\u043E \u0438\u043B\u0438 \u0432\u043E\u043E\u0431\u0449\u0435 \u0431\u0435\u0437 \u043D\u0435\u0433\u043E.`,
    group: shallow,
    rest: rest.length ? rest : losses,
    minDiffR: 0.1
  };
}
function pd_earlyExit(all, lang = "ru") {
  const candidates = all.filter(
    (t) => t.closeType === "manual" && typeof t.realizedRR === "number" && !isNaN(t.realizedRR) && typeof t.plannedRR === "number" && t.plannedRR > 0 && t.realizedRR > 0
  );
  if (candidates.length < 3) return null;
  const early = candidates.filter((t) => t.realizedRR < t.plannedRR * 0.7);
  if (early.length < 3) return null;
  const rest = all.filter((t) => !early.includes(t));
  const avgPlanned = st_mean(early.map((t) => t.plannedRR));
  const avgRealized = st_mean(early.map((t) => t.realizedRR));
  return {
    id: "early_exit",
    title: lang === "en" ? "Closing before target" : "\u0417\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0434\u043E \u0446\u0435\u043B\u0438",
    description: lang === "en" ? `In your manual closes, you often exit before the planned Take Profit \u2014 in the last cases the average plan was ${avgPlanned.toFixed(1)}R, the average actual exit was ${avgRealized.toFixed(1)}R. Worth checking whether this is a deliberate plan change or a repeating early exit.` : `\u0412 \u0442\u0432\u043E\u0438\u0445 \u0440\u0443\u0447\u043D\u044B\u0445 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F\u0445 \u0447\u0430\u0441\u0442\u043E \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u0442\u0441\u044F \u0432\u044B\u0445\u043E\u0434 \u0434\u043E \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0433\u043E Take Profit \u2014 \u0432 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0441\u043B\u0443\u0447\u0430\u044F\u0445 \u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u043B\u0430\u043D \u0431\u044B\u043B ${avgPlanned.toFixed(1)}R, \u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u0444\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0432\u044B\u0445\u043E\u0434 \u2014 ${avgRealized.toFixed(1)}R. \u0421\u0442\u043E\u0438\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C, \u044D\u0442\u043E \u043E\u0441\u043E\u0437\u043D\u0430\u043D\u043D\u0430\u044F \u0441\u043C\u0435\u043D\u0430 \u043F\u043B\u0430\u043D\u0430 \u0438\u043B\u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u044E\u0449\u0438\u0439\u0441\u044F \u0440\u0430\u043D\u043D\u0438\u0439 \u0432\u044B\u0445\u043E\u0434.`,
    group: early,
    rest: rest.length ? rest : candidates,
    minDiffR: 0.1,
    sampleNorm: 8
  };
}
function analyzeTraderPatterns(trades, lang = "ru") {
  const all = (trades || []).filter((t) => t && t.date instanceof Date && !isNaN(t.date.getTime()));
  const complete = all.filter(pe_isEmotionallyComplete);
  if (complete.length < PATTERN_MIN_SAMPLE) {
    return { available: false, sampleSize: complete.length, needed: PATTERN_MIN_SAMPLE };
  }
  const sorted = [...all].sort((a, b) => a.date - b.date);
  const raw = [
    pd_confidenceTension(complete, lang),
    pd_fear(complete, lang),
    pd_tooCalm(complete, lang),
    pd_revenge(sorted, lang),
    pd_lessonNotLearned(all, lang),
    pd_unstableRisk(all, lang),
    pd_overtrading(all, lang),
    pd_lossStreak(sorted, lang),
    pd_riskAfterWin(sorted, lang),
    pd_avoidLossReview(all, lang),
    pd_shallowReflection(all, lang),
    pd_earlyExit(all, lang)
  ].filter(Boolean);
  const scored = [];
  const healthy = [];
  for (const c of raw) {
    const result = c.skipDiffCheck ? (() => {
      const gStats = pe_summarize(c.group), rStats = pe_summarize(c.rest);
      const uniqueDays = new Set(c.group.map((t) => t.date.toDateString())).size;
      const sampleConfidence = Math.min(1, c.group.length / 25);
      const recurrence = Math.min(1, uniqueDays / 8);
      const score = 0.5 * sampleConfidence * recurrence + 0.25;
      return { gStats, rStats, diff: (gStats.avgR ?? 0) - (rStats.avgR ?? 0), uniqueDays, score, confidenceLabel: score >= 0.4 ? "medium" : "low" };
    })() : pe_scoreCandidate(c.group, c.rest, { minDiffR: c.minDiffR, sampleNorm: c.sampleNorm });
    if (!result) continue;
    const entry = {
      id: c.id,
      title: c.title,
      description: result.diff < 0 || c.skipDiffCheck ? c.description : c.healthyDescriptionFull || c.healthyDescription || c.description,
      confidence: result.confidenceLabel,
      confidenceScore: Math.round(result.score * 100) / 100,
      stats: { ...result.gStats, _trades: c.group },
      comparisonStats: { ...result.rStats, _trades: c.rest },
      diff: Math.round(result.diff * 100) / 100,
      sampleTrades: pe_pickExamples(c.group, 3),
      evidenceCount: c.group.length
    };
    if (!c.skipDiffCheck && result.diff > 0 && c.healthyDescription) {
      healthy.push({ ...entry, title: c.healthyTitle || (lang === "en" ? `${c.title} (strength)` : `${c.title} (\u0441\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430)`) });
    } else if (result.score >= PATTERN_SCORE_FLOOR) {
      scored.push(entry);
    }
  }
  scored.sort((a, b) => b.confidenceScore - a.confidenceScore);
  return {
    available: true,
    sampleSize: complete.length,
    primaryPattern: scored[0] || null,
    secondaryPatterns: scored.slice(1, 4),
    healthyPatterns: healthy
  };
}
var PATTERN_TYPE_MAP = {
  confidence_tension: "emotional",
  fear: "emotional",
  too_calm: "emotional",
  revenge: "behavioral",
  overtrading: "behavioral",
  loss_streak: "behavioral",
  unstable_risk: "risk",
  risk_after_win: "risk",
  lesson_not_learned: "reflection",
  avoid_loss_review: "reflection",
  shallow_reflection: "reflection",
  early_exit: "behavioral"
};
var PATTERN_RECOMMENDATIONS = {
  confidence_tension: "\u041F\u0435\u0440\u0435\u0434 \u0432\u0445\u043E\u0434\u043E\u043C \u0432 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \xAB\u0443\u0432\u0435\u0440\u0435\u043D, \u043D\u043E \u043D\u0430 \u0432\u0437\u0432\u043E\u0434\u0435\xBB \u2014 \u043E\u0434\u043D\u0430 \u043F\u0430\u0443\u0437\u0430 \u0432 60 \u0441\u0435\u043A\u0443\u043D\u0434 \u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430, \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u0435\u0442 \u043B\u0438 \u0441\u0434\u0435\u043B\u043A\u0430 \u0441 \u043F\u043B\u0430\u043D\u043E\u043C, \u0430 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u043C\u043E\u043C\u0435\u043D\u0442\u043E\u043C.",
  fear: "\u041F\u0440\u0435\u0436\u0434\u0435 \u0447\u0435\u043C \u043D\u0430\u0436\u0430\u0442\u044C \xAB\u0432 \u0441\u0434\u0435\u043B\u043A\u0443\xBB, \u0441\u0444\u043E\u0440\u043C\u0443\u043B\u0438\u0440\u0443\u0439 \u043F\u0440\u0438\u0447\u0438\u043D\u0443 \u0432\u0445\u043E\u0434\u0430 \u043E\u0434\u043D\u0438\u043C \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435\u043C. \u0415\u0441\u043B\u0438 \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043F\u0440\u0438\u0447\u0438\u043D\u0430 \u2014 \xAB\u0430 \u0432\u0434\u0440\u0443\u0433 \u0443\u0435\u0434\u0443 \u0431\u0435\u0437 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F\xBB, \u044D\u0442\u043E \u0441\u0442\u0440\u0430\u0445, \u0430 \u043D\u0435 \u043F\u043B\u0430\u043D.",
  too_calm: "\u0412 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u0441\u0438\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u043F\u043E\u043A\u043E\u0439\u0441\u0442\u0432\u0438\u044F \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u043F\u0435\u0440\u0435\u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0439 \u0440\u0438\u0441\u043A \u2014 \xAB\u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\xBB \u0438\u043D\u043E\u0433\u0434\u0430 \u0437\u043D\u0430\u0447\u0438\u0442 \xAB\u043D\u0435 \u0441\u043B\u0435\u0436\u0443\xBB, \u0430 \u043D\u0435 \xAB\u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u0443\u044E\xBB.",
  revenge: "\u0412\u0432\u0435\u0434\u0438 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u043F\u0430\u0443\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u2014 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 20\u201330 \u043C\u0438\u043D\u0443\u0442 \u0431\u0435\u0437 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430.",
  lesson_not_learned: "\u041F\u0435\u0440\u0435\u043F\u0438\u0448\u0438 \u0443\u0440\u043E\u043A \u0432 \u0444\u043E\u0440\u043C\u0430\u0442 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u043E\u0433\u043E \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F, \u0430 \u043D\u0435 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F \u2014 \u043D\u0435 \xAB\u043D\u0435 \u0442\u043E\u0440\u043E\u043F\u0438\u0442\u044C\u0441\u044F\xBB, \u0430 \xAB\u0436\u0434\u0430\u0442\u044C \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F \u0441\u0432\u0435\u0447\u0438 \u043F\u0435\u0440\u0435\u0434 \u0432\u0445\u043E\u0434\u043E\u043C\xBB.",
  unstable_risk: "\u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u0443\u0439 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 % \u0440\u0438\u0441\u043A\u0430 \u043D\u0430 \u0441\u0434\u0435\u043B\u043A\u0443 \u0438 \u0434\u0435\u0440\u0436\u0438\u0441\u044C \u0435\u0433\u043E \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0443\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0432 \u043C\u043E\u043C\u0435\u043D\u0442\u0435.",
  overtrading: "\u0417\u0430\u0440\u0430\u043D\u0435\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u0438 \u043B\u0438\u043C\u0438\u0442 \u0441\u0434\u0435\u043B\u043E\u043A \u043D\u0430 \u0434\u0435\u043D\u044C \u0438 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0439\u0441\u044F \u043F\u0440\u0438 \u0435\u0433\u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0438.",
  loss_streak: "\u041F\u043E\u0441\u043B\u0435 \u0432\u0442\u043E\u0440\u043E\u0439 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u0434\u0440\u044F\u0434 \u2014 \u0441\u0438\u0433\u043D\u0430\u043B \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0430\u0443\u0437\u0443 \u0438 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C\u0441\u044F, \u0430 \u043D\u0435 \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0442\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C.",
  risk_after_win: "\u041F\u043E\u0431\u0435\u0434\u0430 \u043D\u0435 \u0434\u0435\u043B\u0430\u0435\u0442 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u0435\u0442\u0430\u043F \u0431\u043E\u043B\u0435\u0435 \u0432\u0435\u0440\u043D\u044B\u043C \u2014 \u0434\u0435\u0440\u0436\u0438 \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u043C \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0433\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430.",
  avoid_loss_review: "\u0412\u043E\u0437\u044C\u043C\u0438 \u0437\u0430 \u043F\u0440\u0438\u0432\u044B\u0447\u043A\u0443 \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0442\u044C \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u0438\u043C\u0435\u043D\u043D\u043E \u0442\u0435\u0445 \u0441\u0434\u0435\u043B\u043E\u043A, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043D\u0435 \u0445\u043E\u0447\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0435\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C \u2014 \u044D\u0442\u043E \u0441\u0430\u043C\u044B\u0439 \u043F\u043E\u043B\u0435\u0437\u043D\u044B\u0439 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u0432 \u0436\u0443\u0440\u043D\u0430\u043B\u0435.",
  shallow_reflection: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438 \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u0444\u0440\u0430\u0437\u0443 \xAB\u0412 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437 \u044F \u0441\u0434\u0435\u043B\u0430\u044E \u0438\u043D\u0430\u0447\u0435, \u0435\u0441\u043B\u0438...\xBB \u0438 \u0434\u043E\u043F\u0438\u0448\u0438 \u0435\u0451 \u0447\u0435\u0441\u0442\u043D\u043E.",
  early_exit: "\u041F\u0435\u0440\u0435\u0434 \u0440\u0443\u0447\u043D\u044B\u043C \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435\u043C \u0441\u043F\u0440\u043E\u0441\u0438 \u0441\u0435\u0431\u044F: \u044D\u0442\u043E \u043E\u0441\u043E\u0437\u043D\u0430\u043D\u043D\u0430\u044F \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043B\u0430\u043D\u0430 \u0438\u043B\u0438 \u0440\u0435\u0444\u043B\u0435\u043A\u0441 \u043D\u0430 \u0442\u0440\u0435\u0432\u043E\u0433\u0443? \u0415\u0441\u043B\u0438 \u043E\u0442\u0432\u0435\u0442 \u043D\u0435 \u043E\u0447\u0435\u0432\u0438\u0434\u0435\u043D \u2014 \u0434\u0430\u0439 \u0441\u0434\u0435\u043B\u043A\u0435 \u0447\u0443\u0442\u044C \u0431\u043E\u043B\u044C\u0448\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0434\u043E \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u044F."
};
var PATTERN_RECOMMENDATIONS_EN = {
  confidence_tension: 'Before entering while feeling "confident but on edge" \u2014 take a 60-second pause and check the trade against your plan, not just against the moment.',
  fear: `Before you hit "enter," state your reason for the trade in one sentence. If the only reason is "what if it moves without me," that's fear, not a plan.`,
  too_calm: 'In a state of strong calm, double-check your risk separately \u2014 "calm" can sometimes mean "not watching," not "in control."',
  revenge: "Set a mandatory pause after a loss \u2014 at least 20-30 minutes away from the terminal.",
  lesson_not_learned: `Rewrite the lesson as a specific action, not an observation \u2014 not "don't rush," but "wait for the candle to close before entering."`,
  unstable_risk: "Fix a constant % risk per trade and stick to it regardless of how confident you feel in the moment.",
  overtrading: "Set a daily trade limit in advance and physically stop once you hit it.",
  loss_streak: "After the second loss in a row \u2014 that's a signal to pause and figure out why, not to trade more.",
  risk_after_win: "A win doesn't make the next setup any more valid \u2014 keep your risk size constant regardless of the previous result.",
  avoid_loss_review: "Make a habit of saving a screenshot of exactly the trades you don't want to revisit \u2014 that's the most useful material in the journal.",
  shallow_reflection: `After a loss, finish the sentence "Next time I'll do it differently if..." and write it honestly.`,
  early_exit: "Before closing manually, ask yourself: is this a deliberate plan change or anxiety talking? If unsure, give the trade a bit more time before closing."
};
function ta_severity(score, diff) {
  const mag = Math.abs(diff ?? 0);
  if (score >= 0.55 && mag >= 0.4) return "high";
  if (score >= 0.35) return "medium";
  return "low";
}
function ta_buildPatternRecord(c, result, isHealthy, lang = "ru") {
  const recs = lang === "en" ? PATTERN_RECOMMENDATIONS_EN : PATTERN_RECOMMENDATIONS;
  return {
    id: c.id,
    type: PATTERN_TYPE_MAP[c.id] || "behavioral",
    severity: isHealthy ? "info" : ta_severity(result.score, result.diff),
    confidence: result.confidenceLabel,
    sampleSize: c.group.length,
    title: isHealthy ? c.healthyTitle || (lang === "en" ? `${c.title} (strength)` : `${c.title} (\u0441\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430)`) : c.title,
    description: isHealthy ? c.healthyDescriptionFull || c.healthyDescription || c.description : c.description,
    evidence: pe_pickExamples(c.group, 3).map((t) => ({ id: t.id, date: t.date, outcome: t.outcome, r: t.r, instrument: t.instrument, tag: t.tag })),
    metrics: { group: result.gStats, rest: result.rStats, diff: st_round2(result.diff), uniqueDays: result.uniqueDays, confidenceScore: st_round2(result.score) },
    recommendation: isHealthy ? null : recs[c.id] || null
  };
}
function patternEngineV2(trades, lang = "ru") {
  const all = (trades || []).filter((t) => t && t.date instanceof Date && !isNaN(t.date.getTime()));
  const complete = all.filter(pe_isEmotionallyComplete);
  if (complete.length < PATTERN_MIN_SAMPLE) {
    return { available: false, sampleSize: complete.length, needed: PATTERN_MIN_SAMPLE, patterns: [], healthyPatterns: [] };
  }
  const sorted = [...all].sort((a, b) => a.date - b.date);
  const raw = [
    pd_confidenceTension(complete, lang),
    pd_fear(complete, lang),
    pd_tooCalm(complete, lang),
    pd_revenge(sorted, lang),
    pd_lessonNotLearned(all, lang),
    pd_unstableRisk(all, lang),
    pd_overtrading(all, lang),
    pd_lossStreak(sorted, lang),
    pd_riskAfterWin(sorted, lang),
    pd_avoidLossReview(all, lang),
    pd_shallowReflection(all, lang),
    pd_earlyExit(all, lang)
  ].filter(Boolean);
  const patterns = [], healthy = [];
  for (const c of raw) {
    const result = c.skipDiffCheck ? (() => {
      const gStats = pe_summarize(c.group), rStats = pe_summarize(c.rest);
      const uniqueDays = new Set(c.group.map((t) => t.date.toDateString())).size;
      const sampleConfidence = Math.min(1, c.group.length / 25);
      const recurrence = Math.min(1, uniqueDays / 8);
      const score = 0.5 * sampleConfidence * recurrence + 0.25;
      return { gStats, rStats, diff: (gStats.avgR ?? 0) - (rStats.avgR ?? 0), uniqueDays, score, confidenceLabel: score >= 0.4 ? "medium" : "low" };
    })() : pe_scoreCandidate(c.group, c.rest, { minDiffR: c.minDiffR, sampleNorm: c.sampleNorm });
    if (!result) continue;
    if (!c.skipDiffCheck && result.diff > 0 && c.healthyDescription) {
      healthy.push(ta_buildPatternRecord(c, result, true, lang));
    } else if (result.score >= PATTERN_SCORE_FLOOR) {
      patterns.push(ta_buildPatternRecord(c, result, false, lang));
    }
  }
  patterns.sort((a, b) => b.metrics.confidenceScore - a.metrics.confidenceScore);
  return { available: true, sampleSize: complete.length, patterns, healthyPatterns: healthy };
}
function computeRRWinRateStats(closedEntries) {
  const withRealized = closedEntries.filter((e) => typeof e.realizedRR === "number" && !isNaN(e.realizedRR));
  const avgRealizedRR = withRealized.length ? st_mean(withRealized.map((e) => e.realizedRR)) : null;
  const wins = closedEntries.filter((e) => e.outcome === "Win");
  const losses = closedEntries.filter((e) => e.outcome === "Loss");
  const breakevens = closedEntries.filter((e) => e.outcome === "Breakeven");
  const winRate = wins.length + losses.length > 0 ? wins.length / (wins.length + losses.length) * 100 : null;
  const winsWithR = wins.filter((e) => typeof e.r === "number" && !isNaN(e.r));
  const lossesWithR = losses.filter((e) => typeof e.r === "number" && !isNaN(e.r));
  const avgWinR = winsWithR.length ? st_mean(winsWithR.map((e) => e.r)) : null;
  const avgLossR = lossesWithR.length ? Math.abs(st_mean(lossesWithR.map((e) => e.r))) : null;
  const total = wins.length + losses.length;
  const expectancy = total > 0 && avgWinR != null && avgLossR != null ? wins.length / total * avgWinR - losses.length / total * avgLossR : null;
  return {
    sampleSize: closedEntries.length,
    avgRealizedRR: avgRealizedRR != null ? st_round2(avgRealizedRR) : null,
    winRate: winRate != null ? Math.round(winRate) : null,
    wins: wins.length,
    losses: losses.length,
    breakevens: breakevens.length,
    avgWinR: avgWinR != null ? st_round2(avgWinR) : null,
    avgLossR: avgLossR != null ? st_round2(avgLossR) : null,
    expectancy: expectancy != null ? st_round2(expectancy) : null
  };
}
function rrWinRateInsightText(rr, lang = "ru") {
  if (!rr || rr.sampleSize < PATTERN_MIN_SAMPLE || rr.avgRealizedRR == null || rr.winRate == null || rr.expectancy == null) return null;
  if (rr.expectancy < 0) {
    return lang === "en" ? `Your journal currently shows a combination of an average realized RR of ${rr.avgRealizedRR}R and a ${rr.winRate}% win rate \u2014 based on these numbers the expectancy is negative. Worth checking whether this holds up on a larger sample or reflects a specific stretch.` : `\u0412 \u0442\u0432\u043E\u0451\u043C \u0436\u0443\u0440\u043D\u0430\u043B\u0435 \u0441\u0435\u0439\u0447\u0430\u0441 \u0441\u043E\u0447\u0435\u0442\u0430\u043D\u0438\u0435 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E realized RR \u2248 ${rr.avgRealizedRR}R \u0438 Win Rate ${rr.winRate}% \u2014 \u043F\u0440\u0438 \u0442\u0430\u043A\u0438\u0445 \u0446\u0438\u0444\u0440\u0430\u0445 \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435. \u0421\u0442\u043E\u0438\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043B\u0438 \u044D\u0442\u043E \u043D\u0430 \u0431\u043E\u043B\u044C\u0448\u0435\u0439 \u0432\u044B\u0431\u043E\u0440\u043A\u0435 \u0438\u043B\u0438 \u044D\u0442\u043E \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0440\u0435\u0437\u043E\u043A.`;
  }
  if (rr.avgRealizedRR < 1.3 && rr.winRate < 50 && rr.expectancy < 0.15) {
    return lang === "en" ? `Average realized RR (\u2248${rr.avgRealizedRR}R) and win rate (${rr.winRate}%) currently sit in a zone where the result depends heavily on win frequency. Worth checking whether your system has a stable statistical edge.` : `\u0421\u0440\u0435\u0434\u043D\u0438\u0439 realized RR (\u2248${rr.avgRealizedRR}R) \u0438 Win Rate (${rr.winRate}%) \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0430\u0445\u043E\u0434\u044F\u0442\u0441\u044F \u0432 \u0437\u043E\u043D\u0435, \u0433\u0434\u0435 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0441\u0438\u043B\u044C\u043D\u043E \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0447\u0430\u0441\u0442\u043E\u0442\u044B \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A. \u0421\u0442\u043E\u0438\u0442 \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C, \u0435\u0441\u0442\u044C \u043B\u0438 \u0443 \u0442\u0432\u043E\u0435\u0439 \u0441\u0438\u0441\u0442\u0435\u043C\u044B \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u043E\u0435 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u0440\u0435\u0438\u043C\u0443\u0449\u0435\u0441\u0442\u0432\u043E.`;
  }
  return null;
}
function buildInsights(patternsResult, calibration, discipline, lang = "ru", rrStats = null) {
  const insights = [];
  (patternsResult.patterns || []).slice(0, 3).forEach((p) => {
    insights.push({ id: `pattern_${p.id}`, basis: "pattern", confidence: p.confidence, sampleSize: p.sampleSize, text: p.description });
  });
  if (calibration.available && calibration.divergenceNote) {
    insights.push({ id: "calibration_divergence", basis: "calibration", confidence: calibration.confidence, sampleSize: calibration.dayTradeCount, text: calibration.divergenceNote });
  }
  if (discipline.violations && discipline.violations.length) {
    const top = discipline.violations[0];
    const text = lang === "en" ? {
      revenge_rate: `You re-enter a new trade within half an hour of a loss about ${top.value}% of the time.`,
      overtrading_days: `About ${top.value}% of your trades fall on days with abnormally high activity.`,
      risk_after_loss: `After a loss, your average risk increases by about ${top.value}%.`,
      risk_after_win: `After a win, your average risk increases by about ${top.value}%.`
    }[top.id] : {
      revenge_rate: `\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u0442\u044B \u0432\u0445\u043E\u0434\u0438\u0448\u044C \u0432 \u043D\u043E\u0432\u0443\u044E \u0441\u0434\u0435\u043B\u043A\u0443 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0443\u0447\u0430\u0441\u0430 \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E \u0432 ${top.value}% \u0441\u043B\u0443\u0447\u0430\u0435\u0432.`,
      overtrading_days: `\u041F\u0440\u0438\u043C\u0435\u0440\u043D\u043E ${top.value}% \u0442\u0432\u043E\u0438\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043D\u0430 \u0434\u043D\u0438 \u0441 \u0430\u043D\u043E\u043C\u0430\u043B\u044C\u043D\u043E \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C\u044E.`,
      risk_after_loss: `\u041F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u0442\u0432\u043E\u0439 \u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0438\u0441\u043A \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E \u043D\u0430 ${top.value}%.`,
      risk_after_win: `\u041F\u043E\u0441\u043B\u0435 \u043F\u043E\u0431\u0435\u0434\u044B \u0442\u0432\u043E\u0439 \u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0438\u0441\u043A \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E \u043D\u0430 ${top.value}%.`
    }[top.id];
    if (text) insights.push({ id: `discipline_${top.id}`, basis: "discipline", confidence: discipline.score.confidence, sampleSize: discipline.score.sampleSize, text });
  }
  const rrText = rrWinRateInsightText(rrStats, lang);
  if (rrText) insights.push({ id: "rr_winrate", basis: "rr_winrate", confidence: rrStats.sampleSize >= PATTERN_MIN_SAMPLE * 1.5 ? "medium" : "low", sampleSize: rrStats.sampleSize, text: rrText });
  return insights;
}
function calculateTraderAnalytics(entries, lastCalibration, lang = "ru") {
  const validEntries = (entries || []).filter((e) => e && e.date instanceof Date && !isNaN(e.date.getTime()));
  const closedEntries = validEntries.filter(isEntryClosed);
  const sorted = [...closedEntries].sort((a, b) => a.date - b.date);
  const seq = sequenceAnalysis(sorted);
  const risk = riskAnalysis(sorted);
  const reflection = reflectionAnalysis(validEntries);
  const discipline = disciplineAnalysis(sorted, seq, risk);
  const emotional = emotionalAnalysis(validEntries);
  const awareness = awarenessAnalysis(validEntries, closedEntries, reflection, risk, discipline);
  const patternsResult = patternEngineV2(closedEntries, lang);
  const calibration = calibrationAnalysis(sorted, lastCalibration, lang);
  const rrStats = computeRRWinRateStats(closedEntries);
  const { recent, previous } = ta_splitRecent(sorted);
  let trend = { awareness: "insufficient_data", discipline: "insufficient_data", riskStability: "insufficient_data", reflectionQuality: "insufficient_data" };
  if (recent.length >= 5 && previous.length >= 5) {
    const rRisk = riskAnalysis(recent), pRisk = riskAnalysis(previous);
    const rReflection = reflectionAnalysis(recent), pReflection = reflectionAnalysis(previous);
    const rDiscipline = disciplineAnalysis(recent, sequenceAnalysis(recent), rRisk);
    const pDiscipline = disciplineAnalysis(previous, sequenceAnalysis(previous), pRisk);
    const rAwareness = awarenessAnalysis(recent, recent, rReflection, rRisk, rDiscipline);
    const pAwareness = awarenessAnalysis(previous, previous, pReflection, pRisk, pDiscipline);
    trend = {
      awareness: ta_trend(rAwareness.score.value, pAwareness.score.value, 3, true),
      discipline: ta_trend(rDiscipline.score.value, pDiscipline.score.value, 3, true),
      riskStability: ta_trend(rRisk.stability.value, pRisk.stability.value, 3, true),
      reflectionQuality: ta_trend(rReflection.score.value, pReflection.score.value, 3, true)
    };
  }
  const dataQuality = {
    totalTrades: validEntries.length,
    completeTrades: validEntries.filter(pe_isEmotionallyComplete).length,
    missingEmotion: validEntries.filter((e) => e.x == null || e.y == null).length,
    missingReflection: validEntries.filter((e) => (!e.pull || e.pull === "\u2014") && (!e.lesson || e.lesson === "\u2014")).length,
    missingRisk: validEntries.filter((e) => typeof e.r !== "number" || isNaN(e.r)).length,
    missingScreenshots: validEntries.filter((e) => !Array.isArray(e.screenshots) || e.screenshots.length === 0).length
  };
  const insights = buildInsights(patternsResult, calibration, discipline, lang, rrStats);
  return {
    awareness: { ...awareness, trend: trend.awareness },
    emotionalState: emotional,
    discipline: { ...discipline, trend: trend.discipline },
    risk: { ...risk, stability: { ...risk.stability, trend: trend.riskStability } },
    execution: { score: discipline.score, consistency: risk.stability, confidence: discipline.score.confidence },
    reflection: { ...reflection, trend: trend.reflectionQuality },
    calibration,
    rrStats,
    patterns: patternsResult.patterns,
    healthyPatterns: patternsResult.healthyPatterns,
    insights,
    dataQuality
  };
}
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
var lerp = (a, b, t) => a + (b - a) * t;
var SIM_DURATION = 180;
var SIM_START_CAPITAL = 1e4;
var CANDLE_MS = 5e3;
var VISIBLE_CANDLES = 30;
var MARGIN_FRACTION = 0.65;
var LEVERAGE_OPTIONS = [2, 3, 5, 10, 20, 30, 50];
var NEWS_INTERVAL_SEC = 30;
var NEWS_VISIBLE_MS = 11e3;
var NEWS_HEADLINES = [
  "\u0420\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440 \u0430\u043D\u043E\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043B \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0443 \u0434\u0435\u0440\u0438\u0432\u0430\u0442\u0438\u0432\u043D\u044B\u0445 \u043F\u043B\u043E\u0449\u0430\u0434\u043E\u043A",
  "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u043C\u0430\u0440\u043A\u0435\u0442-\u043C\u0435\u0439\u043A\u0435\u0440 \u0441\u043E\u043E\u0431\u0449\u0438\u043B \u043E\u0431 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0438 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u0438",
  "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u0430 \u043C\u0430\u043A\u0440\u043E\u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u2014 \u0440\u044B\u043D\u043A\u0438 \u043E\u0446\u0435\u043D\u0438\u0432\u0430\u044E\u0442 \u0432\u043B\u0438\u044F\u043D\u0438\u0435",
  "\u0422\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0441\u0431\u043E\u0439 \u043D\u0430 \u043E\u0434\u043D\u043E\u0439 \u0438\u0437 \u0431\u0438\u0440\u0436-\u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0442\u043E\u0432",
  "\u041F\u043E\u044F\u0432\u0438\u043B\u0438\u0441\u044C \u0441\u043B\u0443\u0445\u0438 \u043E \u0434\u0435\u043B\u0438\u0441\u0442\u0438\u043D\u0433\u0435 \u0430\u043A\u0442\u0438\u0432\u0430 \u0441 \u043E\u0434\u043D\u043E\u0439 \u0438\u0437 \u043F\u043B\u043E\u0449\u0430\u0434\u043E\u043A",
  "\u0426\u0435\u043D\u0442\u0440\u043E\u0431\u0430\u043D\u043A \u043D\u0435 \u0438\u0441\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0432\u043D\u0435\u043E\u0447\u0435\u0440\u0435\u0434\u043D\u043E\u0433\u043E \u0437\u0430\u0441\u0435\u0434\u0430\u043D\u0438\u044F",
  "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438 \u0440\u0430\u0437\u043E\u0448\u043B\u0438\u0441\u044C \u0432 \u043E\u0446\u0435\u043D\u043A\u0430\u0445 \u0434\u0430\u043B\u044C\u043D\u0435\u0439\u0448\u0435\u0433\u043E \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F",
  "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0444\u043E\u043D\u0434 \u0438\u0437\u043C\u0435\u043D\u0438\u043B \u0440\u0430\u0437\u043C\u0435\u0440 \u043E\u0442\u043A\u0440\u044B\u0442\u044B\u0445 \u043F\u043E\u0437\u0438\u0446\u0438\u0439",
  "\u0421\u041C\u0418 \u0441\u043E\u043E\u0431\u0449\u0430\u044E\u0442 \u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u044B\u0445 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F\u0445 \u0432 \u0440\u0435\u0433\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0438",
  "\u041E\u043D\u0447\u0435\u0439\u043D-\u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0431\u0438\u0440\u0436\u0438",
  "\u041E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D \u043E\u0442\u0447\u0451\u0442 \u043E \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438 \u0440\u044B\u043D\u043A\u0430",
  "\u041F\u043E\u044F\u0432\u0438\u043B\u0430\u0441\u044C \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043A\u0440\u0443\u043F\u043D\u043E\u0439 \u0432\u043D\u0435\u0431\u0438\u0440\u0436\u0435\u0432\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0435",
  "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0442\u043E\u043A\u043E\u043B\u0430 \u043F\u0440\u043E\u0448\u043B\u043E \u0431\u0435\u0437 \u0438\u043D\u0446\u0438\u0434\u0435\u043D\u0442\u043E\u0432",
  "\u0421\u0431\u043E\u0439 \u0443 \u043A\u0440\u0443\u043F\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430 \u043B\u0438\u043A\u0432\u0438\u0434\u043D\u043E\u0441\u0442\u0438",
  "\u0420\u0435\u0439\u0442\u0438\u043D\u0433\u043E\u0432\u043E\u0435 \u0430\u0433\u0435\u043D\u0442\u0441\u0442\u0432\u043E \u043F\u0435\u0440\u0435\u0441\u043C\u043E\u0442\u0440\u0435\u043B\u043E \u043F\u0440\u043E\u0433\u043D\u043E\u0437",
  "\u041F\u043E\u044F\u0432\u0438\u043B\u0438\u0441\u044C \u0441\u043B\u0443\u0445\u0438 \u043E \u043D\u043E\u0432\u043E\u043C \u043A\u0440\u0443\u043F\u043D\u043E\u043C \u0438\u0433\u0440\u043E\u043A\u0435 \u043D\u0430 \u0440\u044B\u043D\u043A\u0435",
  "\u041E\u043F\u0440\u043E\u0441 \u0442\u0440\u0435\u0439\u0434\u0435\u0440\u043E\u0432 \u043F\u043E\u043A\u0430\u0437\u0430\u043B \u0440\u043E\u0441\u0442 \u043D\u0435\u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0451\u043D\u043D\u043E\u0441\u0442\u0438",
  "\u0411\u0438\u0440\u0436\u0430 \u043E\u0431\u044A\u044F\u0432\u0438\u043B\u0430 \u043E \u043F\u043B\u0430\u043D\u043E\u0432\u044B\u0445 \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0440\u0430\u0431\u043E\u0442\u0430\u0445",
  "\u0412\u044B\u0448\u043B\u0430 \u0441\u0442\u0430\u0442\u044C\u044F \u0441 \u043A\u0440\u0438\u0442\u0438\u043A\u043E\u0439 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u0440\u044B\u043D\u043A\u0430",
  "\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u043A\u043E\u0448\u0435\u043B\u0451\u043A \u043F\u0435\u0440\u0435\u043C\u0435\u0441\u0442\u0438\u043B \u0437\u043D\u0430\u0447\u0438\u0442\u0435\u043B\u044C\u043D\u0443\u044E \u0441\u0443\u043C\u043C\u0443",
  "\u0420\u0435\u0433\u0443\u043B\u044F\u0442\u043E\u0440 \u043E\u0434\u043E\u0431\u0440\u0438\u043B \u043D\u043E\u0432\u044B\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0442 \u0434\u043B\u044F \u0438\u043D\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u043E\u043D\u0430\u043B\u043E\u0432",
  "\u0420\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u0447\u0438\u043A\u0438 \u0430\u043D\u043E\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043B\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0434\u043E\u0440\u043E\u0436\u043D\u043E\u0439 \u043A\u0430\u0440\u0442\u044B",
  "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0441\u043E\u043E\u0431\u0449\u0430\u044E\u0442 \u043E \u043F\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u0440\u0430\u0445 \u043C\u0435\u0436\u0434\u0443 \u043A\u0440\u0443\u043F\u043D\u044B\u043C\u0438 \u0438\u0433\u0440\u043E\u043A\u0430\u043C\u0438",
  "\u0417\u0430\u043C\u0435\u0447\u0435\u043D\u0430 \u0430\u043D\u043E\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0432 \u0434\u0435\u0440\u0438\u0432\u0430\u0442\u0438\u0432\u0430\u0445"
];
var NEWS_HEADLINES_EN = [
  "Regulator announces review of derivatives venues",
  "Major market maker reports strategy shift",
  "Macro data released \u2014 markets weigh the impact",
  "Technical outage at a rival exchange",
  "Delisting rumors surface on one platform",
  "Central bank doesn't rule out an emergency meeting",
  "Analysts split on the next move",
  "Large fund changes its open position size",
  "Media reports possible regulatory changes",
  "On-chain data shows funds flowing to exchanges",
  "Market liquidity report published",
  "Word of a large OTC deal surfaces",
  "Protocol upgrade completed without incident",
  "Outage at a major liquidity provider",
  "Rating agency revises its outlook",
  "Rumors of a new major market player",
  "Trader survey shows rising uncertainty",
  "Exchange announces scheduled maintenance",
  "Article critical of the current market model published",
  "A large wallet moves a significant sum",
  "Regulator approves a new product for institutions",
  "Developers announce a roadmap update",
  "Sources report talks between major players",
  "Unusual activity spotted in derivatives"
];
var SIM_ACHIEVEMENTS = {
  lowRisk: "\u041D\u0438\u0437\u043A\u0438\u0439 \u0440\u0438\u0441\u043A",
  noImpulsive: "\u041D\u0438 \u043E\u0434\u043D\u043E\u0439 \u0438\u043C\u043F\u0443\u043B\u044C\u0441\u0438\u0432\u043D\u043E\u0439 \u0441\u0434\u0435\u043B\u043A\u0438",
  tightDrawdown: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0440\u043E\u0441\u0430\u0434\u043A\u0430 \u043C\u0435\u043D\u0435\u0435 5%",
  survivedVol: "\u041F\u0435\u0440\u0435\u0436\u0438\u043B \u0432\u044B\u0441\u043E\u043A\u0443\u044E \u0432\u043E\u043B\u0430\u0442\u0438\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0431\u0435\u0437 \u043B\u0438\u043A\u0432\u0438\u0434\u0430\u0446\u0438\u0438"
};
var SIM_ACHIEVEMENTS_EN = {
  lowRisk: "Low risk",
  noImpulsive: "No impulsive trades",
  tightDrawdown: "Max drawdown under 5%",
  survivedVol: "Survived high volatility without liquidation"
};
var REGIMES = {
  accumulation: { drift: 0, vol: 0.11, revert: 0.09 },
  trend_up: { drift: 0.05, vol: 0.17, revert: 0 },
  trend_down: { drift: -0.05, vol: 0.17, revert: 0 },
  impulse_up: { drift: 0.22, vol: 0.42, revert: 0 },
  impulse_down: { drift: -0.22, vol: 0.42, revert: 0 },
  panic: { drift: -0.42, vol: 0.75, revert: 0 },
  euphoria: { drift: 0.32, vol: 0.58, revert: 0 },
  fakeout_up: { drift: 0.08, vol: 0.23, revert: 0.02 },
  fakeout_down: { drift: -0.08, vol: 0.23, revert: 0.02 },
  highvol_chop: { drift: 0, vol: 0.35, revert: 0.11 },
  lowvol_chop: { drift: 0, vol: 0.09, revert: 0.09 }
};
var REGIME_TRANSITIONS = {
  accumulation: ["accumulation", "trend_up", "trend_down", "highvol_chop", "lowvol_chop"],
  trend_up: ["trend_up", "euphoria", "fakeout_down", "highvol_chop", "accumulation"],
  trend_down: ["trend_down", "panic", "fakeout_up", "highvol_chop", "accumulation"],
  impulse_up: ["euphoria", "trend_up", "highvol_chop", "fakeout_down"],
  impulse_down: ["panic", "trend_down", "highvol_chop", "fakeout_up"],
  panic: ["highvol_chop", "trend_down", "accumulation", "fakeout_up"],
  euphoria: ["highvol_chop", "trend_up", "fakeout_down", "impulse_up"],
  fakeout_up: ["trend_down", "panic", "accumulation"],
  fakeout_down: ["trend_up", "euphoria", "accumulation"],
  highvol_chop: ["accumulation", "trend_up", "trend_down", "impulse_up", "impulse_down", "lowvol_chop"],
  lowvol_chop: ["accumulation", "highvol_chop", "trend_up", "trend_down"]
};
function instantiateRegime(rand, name) {
  const base = REGIMES[name];
  return {
    name,
    drift: base.drift * (0.6 + rand() * 0.8),
    // 0.6x - 1.4x
    vol: base.vol * (0.75 + rand() * 0.5),
    // 0.75x - 1.25x
    revert: base.revert * (0.5 + rand() * 1)
    // 0.5x - 1.5x
  };
}
function createMarketEngine(seed, startPrice = 100, lang = "ru") {
  const rand = mulberry32(seed);
  const regime = "accumulation";
  const inst = instantiateRegime(rand, regime);
  const startCandle = { open: startPrice, high: startPrice, low: startPrice, close: startPrice, t: 0 };
  const eng = {
    rand,
    lang,
    price: startPrice,
    anchor: startPrice,
    emaFast: startPrice,
    emaSlow: startPrice,
    regime,
    prevTickPrice: startPrice,
    regimeElapsed: 0,
    regimeDuration: (10 + rand() * 20) * 1e3,
    // 10-30s — long enough that shifts don't feel mechanical
    transitioning: false,
    transitionT: 0,
    transitionDur: 1e3,
    fromP: inst,
    toP: inst,
    nextRegime: regime,
    activeDrift: inst.drift,
    activeVol: inst.vol,
    activeRevert: inst.revert,
    whaleTimer: 3 + rand() * 6,
    playerFlow: 0,
    // signed, size-scaled exposure of the player's own open position — a real participant too
    candles: [],
    currentCandle: startCandle,
    radarOrders: [],
    radarTimer: 1 + rand() * 2,
    newsEvent: null,
    newsTimer: 999999,
    // set for real right after warmup, below
    elapsedMs: 0
  };
  const WARMUP_SECONDS = 150;
  let warmed = 0;
  while (warmed < WARMUP_SECONDS) {
    stepEngine(eng, 1 / 20);
    warmed += 1 / 20;
  }
  eng.newsEvent = null;
  eng.newsTimer = 8 + rand() * 10;
  return eng;
}
function stepEngine(eng, dtSec, playerFlow = 0) {
  eng.elapsedMs += dtSec * 1e3;
  eng.regimeElapsed += dtSec * 1e3;
  eng.playerFlow = playerFlow;
  if (eng.transitioning) {
    eng.transitionT += dtSec * 1e3;
    const p = Math.min(1, eng.transitionT / eng.transitionDur);
    const jitter = 1 + (eng.rand() - 0.5) * 0.12;
    eng.activeDrift = lerp(eng.fromP.drift, eng.toP.drift, p) * jitter;
    eng.activeVol = lerp(eng.fromP.vol, eng.toP.vol, p);
    eng.activeRevert = lerp(eng.fromP.revert, eng.toP.revert, p);
    if (p >= 1) {
      eng.transitioning = false;
      eng.regime = eng.nextRegime;
      eng.activeDrift = eng.toP.drift;
      eng.regimeDuration = (10 + eng.rand() * 25) * 1e3;
      eng.regimeElapsed = 0;
    }
  } else {
    eng.activeDrift = eng.fromP.drift;
    eng.activeVol = eng.fromP.vol;
    eng.activeRevert = eng.fromP.revert;
    if (eng.regimeElapsed >= eng.regimeDuration) {
      const options = REGIME_TRANSITIONS[eng.regime];
      const next = options[Math.floor(eng.rand() * options.length)];
      eng.fromP = { name: eng.regime, drift: eng.activeDrift, vol: eng.activeVol, revert: eng.activeRevert };
      eng.toP = instantiateRegime(eng.rand, next);
      eng.nextRegime = next;
      eng.transitioning = true;
      eng.transitionT = 0;
      eng.transitionDur = eng.rand() < 0.25 ? 200 + eng.rand() * 400 : 600 + eng.rand() * 2600;
    }
  }
  eng.emaFast += (eng.price - eng.emaFast) * Math.min(1, dtSec * 2.2);
  eng.emaSlow += (eng.price - eng.emaSlow) * Math.min(1, dtSec * 0.6);
  const slope = (eng.emaFast - eng.emaSlow) / eng.emaSlow;
  const crowdMomentum = clamp(slope * 4, -0.028, 0.028);
  eng.whaleTimer -= dtSec;
  if (eng.whaleTimer <= 0) {
    eng.whaleTimer = 4 + eng.rand() * 10;
    if (eng.rand() < 0.3) {
      const shockPct = (eng.rand() < 0.5 ? -1 : 1) * (6e-3 + eng.rand() * 0.016);
      eng.price = Math.max(1, eng.price * (1 + shockPct));
    }
  }
  const scalperNoise = (eng.rand() - 0.5) * 2;
  const panicKick = eng.regime === "panic" || eng.nextRegime === "panic" ? -Math.abs(eng.rand() - 0.5) * 0.4 : 0;
  const meanRevertForce = -((eng.price - eng.anchor) / eng.anchor) * eng.activeRevert;
  const driftPerSec = eng.activeDrift / 100;
  const pctChange = (driftPerSec + crowdMomentum * 0.22 + meanRevertForce + panicKick * 0.01) * dtSec + scalperNoise * (eng.activeVol / 100) * Math.sqrt(dtSec) * 3.2;
  eng.prevTickPrice = eng.price;
  eng.price = Math.max(1, eng.price * (1 + pctChange));
  eng.anchor += (eng.price - eng.anchor) * dtSec * 0.035 + (eng.rand() - 0.5) * eng.price * 5e-4 * Math.sqrt(dtSec) * 3;
  updateCandle(eng);
  updateRadarOrders(eng, dtSec);
  updateNewsEvent(eng, dtSec);
}
function applyMarketImpact(eng, side, marginUsd, leverageUsed) {
  const exposure = marginUsd * leverageUsed;
  const ratio = clamp(exposure / (SIM_START_CAPITAL * 6), 0, 2);
  const impactPct = Math.min(0.02, ratio * 0.012) * (0.7 + eng.rand() * 0.6);
  const sign = side === "buy" ? 1 : -1;
  eng.prevTickPrice = eng.price;
  eng.price = Math.max(1, eng.price * (1 + sign * impactPct));
  updateCandle(eng);
  return impactPct;
}
function updateCandle(eng) {
  const c = eng.currentCandle;
  c.high = Math.max(c.high, eng.price);
  c.low = Math.min(c.low, eng.price);
  c.close = eng.price;
  const candleIndex = Math.floor(eng.elapsedMs / CANDLE_MS);
  if (candleIndex !== c.t) {
    eng.candles.push(c);
    if (eng.candles.length > VISIBLE_CANDLES * 4) eng.candles.shift();
    eng.currentCandle = { open: eng.price, high: eng.price, low: eng.price, close: eng.price, t: candleIndex };
  }
}
var RADAR_MAX_ORDERS = 7;
function spawnRadarOrder(eng) {
  const askBias = clamp(0.5 + eng.playerFlow * 0.12, 0.15, 0.85);
  const side = eng.rand() < askBias ? "ask" : "bid";
  const distPct = 15e-4 + Math.pow(eng.rand(), 1.6) * 0.02;
  const price = side === "bid" ? eng.price * (1 - distPct) : eng.price * (1 + distPct);
  const sizeRoll = eng.rand();
  const size = sizeRoll < 0.5 ? 1 : sizeRoll < 0.82 ? 2 : sizeRoll < 0.96 ? 3 : 4;
  return {
    id: `ro_${Math.floor(eng.elapsedMs)}_${eng.rand().toString(36).slice(2, 7)}`,
    side,
    price,
    size,
    bornMs: eng.elapsedMs,
    ttlMs: 8e3 + eng.rand() * 14e3,
    state: "active",
    // active | pulled | filled
    animMs: 0,
    justMovedMs: null
  };
}
function updateRadarOrders(eng, dtSec) {
  eng.radarTimer -= dtSec;
  const activeCount = eng.radarOrders.reduce((n, o) => n + (o.state === "active" ? 1 : 0), 0);
  if (eng.radarTimer <= 0 && activeCount < RADAR_MAX_ORDERS) {
    eng.radarOrders.push(spawnRadarOrder(eng));
    eng.radarTimer = 1.2 + eng.rand() * 2.6;
  }
  const proximityPct = 9e-4;
  for (const o of eng.radarOrders) {
    if (o.state === "active") {
      const dist = Math.abs(eng.price - o.price) / o.price;
      const expired = eng.elapsedMs - o.bornMs > o.ttlMs;
      if (dist < proximityPct) {
        const r = eng.rand();
        if (r < 0.38) {
          o.state = "pulled";
          o.animMs = 0;
        } else if (r < 0.74) {
          o.state = "filled";
          o.animMs = 0;
          const sign = o.side === "bid" ? -1 : 1;
          eng.price = Math.max(1, eng.price * (1 + sign * 4e-4 * o.size * (0.5 + eng.rand())));
        } else {
          const distPct2 = 2e-3 + eng.rand() * 0.012;
          o.price = o.side === "bid" ? eng.price * (1 - distPct2) : eng.price * (1 + distPct2);
          o.bornMs = eng.elapsedMs;
          o.ttlMs = 6e3 + eng.rand() * 1e4;
          o.justMovedMs = 0;
        }
      } else if (expired) {
        o.state = "pulled";
        o.animMs = 0;
      }
    } else {
      o.animMs += dtSec * 1e3;
    }
    if (o.justMovedMs != null) o.justMovedMs += dtSec * 1e3;
  }
  eng.radarOrders = eng.radarOrders.filter((o) => o.state === "active" || o.animMs < 550);
}
function spawnNewsEvent(eng) {
  const headlines = eng.lang === "en" ? NEWS_HEADLINES_EN : NEWS_HEADLINES;
  const hasEffect = eng.rand() < 0.6;
  const direction = eng.rand() < 0.5 ? 1 : -1;
  const tierRoll = eng.rand();
  const magnitudePct = !hasEffect ? 0 : tierRoll < 0.5 ? 3e-3 + eng.rand() * 6e-3 : tierRoll < 0.85 ? 0.01 + eng.rand() * 0.014 : 0.026 + eng.rand() * 0.03;
  return {
    id: `news_${Math.floor(eng.elapsedMs)}`,
    headline: headlines[Math.floor(eng.rand() * headlines.length)],
    hasEffect,
    targetPct: direction * magnitudePct,
    spawnMs: eng.elapsedMs,
    rampMs: 2e3 + eng.rand() * 1e3,
    // 2-3s
    appliedPct: 0
  };
}
function updateNewsEvent(eng, dtSec) {
  eng.newsTimer -= dtSec;
  if (eng.newsTimer <= 0) {
    eng.newsEvent = spawnNewsEvent(eng);
    eng.newsTimer = NEWS_INTERVAL_SEC + (eng.rand() - 0.5) * 8;
  }
  const ev = eng.newsEvent;
  if (ev && ev.targetPct !== 0) {
    const age = eng.elapsedMs - ev.spawnMs;
    if (age < ev.rampMs) {
      const shouldBeApplied = ev.targetPct * Math.min(1, age / ev.rampMs);
      const delta = shouldBeApplied - ev.appliedPct;
      const jitter = 1 + (eng.rand() - 0.5) * 0.3;
      eng.price = Math.max(1, eng.price * (1 + delta * jitter));
      ev.appliedPct = shouldBeApplied;
    }
  }
}
function aggregateCandles(candles, current, factor) {
  if (factor <= 1) return [...candles, current];
  const all = [...candles, current];
  const groups = [];
  const byKey = /* @__PURE__ */ new Map();
  for (const c of all) {
    const key = Math.floor(c.t / factor);
    let g = byKey.get(key);
    if (!g) {
      g = { open: c.open, high: c.high, low: c.low, close: c.close, t: key };
      byKey.set(key, g);
      groups.push(g);
    } else {
      g.high = Math.max(g.high, c.high);
      g.low = Math.min(g.low, c.low);
      g.close = c.close;
    }
  }
  return groups;
}
function LogoMark({ size = 26, color, accent, animated = false }) {
  const c = color || BASE.ink;
  const dashProps = animated ? { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 } : {};
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: "0 0 64 64", fill: "none", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M13 30 V19 Q13 14 18 14 H38 L47 14",
        stroke: c,
        strokeWidth: "6",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...dashProps,
        style: animated ? { animation: "drawMark 0.8s ease forwards" } : void 0
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M51 34 V45 Q51 50 46 50 H26 L17 50",
        stroke: c,
        strokeWidth: "6",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...dashProps,
        style: animated ? { animation: "drawMark 0.8s ease 0.2s forwards" } : void 0
      }
    ),
    /* @__PURE__ */ jsx(
      "path",
      {
        d: "M13 32 H23 L27 23 L32 41 L36 32 H51",
        stroke: accent,
        strokeWidth: "2.6",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...dashProps,
        style: animated ? { animation: "drawMark 0.7s ease 0.75s forwards" } : void 0
      }
    ),
    /* @__PURE__ */ jsx("rect", { x: "45", y: "8", width: "3.5", height: "3.5", fill: c, opacity: "0.55", style: animated ? { animation: "dotIn 0.3s ease 1.2s backwards" } : void 0 }),
    /* @__PURE__ */ jsx("rect", { x: "54", y: "17", width: "2.5", height: "2.5", fill: c, opacity: "0.35", style: animated ? { animation: "dotIn 0.3s ease 1.32s backwards" } : void 0 }),
    /* @__PURE__ */ jsx("rect", { x: "9", y: "45", width: "2.5", height: "2.5", fill: c, opacity: "0.35", style: animated ? { animation: "dotIn 0.3s ease 1.44s backwards" } : void 0 })
  ] });
}
function LogoSpinner({ size = 22, color, accent }) {
  return /* @__PURE__ */ jsx("span", { style: { display: "inline-flex", animation: "logoPulseFade 1.1s ease-in-out infinite" }, children: /* @__PURE__ */ jsx(LogoMark, { size, color, accent }) });
}
// ---- DecodeText.js -----------------------------------------------------------
// Reveal effect for text/numbers. Was a per-character random-glyph "decrypt" animation; replaced
// with a calmer word-by-word blur+fade cascade — each word starts slightly blurred, dimmed and
// offset, and settles into place left-to-right. No random noise, no per-frame re-renders (it's a
// single CSS animation per word via animation-delay, so the browser drives it, not JS timers).
// Total cascade length is capped via maxTotalMs regardless of word count, so a short label and a
// long AI paragraph both settle in roughly the same perceived time. Respects
// prefers-reduced-motion by skipping straight to the final text with no animation.
var decodeReduceMotion = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
// Long text (an AI paragraph, a chat reply) is rendered as one single fade instead of a
// per-word cascade: with enough words the per-word stagger step shrinks to almost nothing, so
// a big chunk of the paragraph ends up mid-fade at once — a screenshot taken in that window
// shows a messy "half the words sharp, half still blurred, no clear order" mix rather than a
// clean wave. One synchronized block-fade reads as calm regardless of length or timing.
var DECODE_WORD_CASCADE_LIMIT = 24;
function DecodeText({ text, as = "span", className = "", style, maxTotalMs = 520 }) {
  const value = text == null ? "" : String(text);
  const reduced = decodeReduceMotion && decodeReduceMotion.matches;
  const tokens = useMemo(() => value.split(/(\s+)/), [value]);
  const wordCount = useMemo(() => tokens.filter((w) => w.trim()).length || 1, [tokens]);
  if (reduced) return /* @__PURE__ */ jsx(as, { className, style, children: value });
  if (wordCount > DECODE_WORD_CASCADE_LIMIT) {
    return /* @__PURE__ */ jsx(as, { className, style: { ...style, display: style?.display || "inline-block", animation: "softReveal 0.55s cubic-bezier(0.22,0.61,0.36,1) both" }, children: value });
  }
  const stepMs = Math.max(10, Math.min(38, maxTotalMs / wordCount));
  let wordIndex = -1;
  return /* @__PURE__ */ jsx(as, { className, style, children: tokens.map((w, i) => {
    if (!w.trim()) return w;
    wordIndex++;
    return /* @__PURE__ */ jsx("span", { style: { display: "inline-block", animation: `softReveal 0.5s cubic-bezier(0.22,0.61,0.36,1) ${wordIndex * stepMs}ms both` }, children: w }, i);
  }) });
}
function Wordmark({ accent, size = 15, animated = false, wide = false }) {
  return /* @__PURE__ */ jsxs("span", { className: "flex items-baseline", style: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500, fontSize: size, letterSpacing: wide ? "0.28em" : void 0, color: BASE.ink, animation: animated ? "riseIn 0.5s ease 1.55s backwards" : void 0 }, children: [
    "mind",
    /* @__PURE__ */ jsxs("span", { className: "relative", style: { color: accent }, children: [
      ".exe",
      /* @__PURE__ */ jsx("span", { className: "absolute left-0 -bottom-[3px] w-full h-px", style: { background: `repeating-linear-gradient(90deg, ${accent} 0, ${accent} 3px, transparent 3px, transparent 6px)` } })
    ] })
  ] });
}
var SPLASH_BLACKHOLE_IMG = "data:image/jpeg;base64,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";
var SPLASH_BLACKHOLE_MASK = "data:image/png;base64,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";
function Splash({ accent, fading }) {
  return /* @__PURE__ */ jsxs("div", { className: "splash2-root fixed inset-0 z-50 transition-opacity duration-500", style: { opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "splash2-bh-scene", children: [
      /* @__PURE__ */ jsx("img", { className: "splash2-bh-img", src: SPLASH_BLACKHOLE_IMG, alt: "" }),
      /* @__PURE__ */ jsx("div", { className: "splash2-bh-shimmer" }),
      /* @__PURE__ */ jsx("div", { className: "splash2-bh-glow" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "splash2-vignette" }),
    /* @__PURE__ */ jsxs("div", { className: "splash2-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "splash2-radar", children: [
        /* @__PURE__ */ jsx("span", { className: "splash2-ring ring-a" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-ring ring-b" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-crosshair ch-h" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-crosshair ch-v" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-node node-1" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-node node-2" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-node node-3" }),
        /* @__PURE__ */ jsx(LogoMark, { size: 42, accent, animated: true })
      ] }),
      /* @__PURE__ */ jsx(Wordmark, { accent, size: 24, animated: true, wide: true }),
      /* @__PURE__ */ jsx("div", { className: "splash2-divider" }),
      /* @__PURE__ */ jsx("p", { className: "splash2-tagline", children: "your mind leaves a pattern" }),
      /* @__PURE__ */ jsxs("div", { className: "splash2-dots", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx("span", { className: "splash2-dots-line" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-dot" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-dot" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-dot active" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-dot" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-dot" }),
        /* @__PURE__ */ jsx("span", { className: "splash2-dots-line" })
      ] })
    ] })
  ] });
}
function Pill({ active, children, onClick, accent }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      className: "px-3.5 py-1.5 rounded-full text-[12.5px] transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0",
      style: { background: active ? `${accent}12` : "transparent", color: active ? accent : BASE.inkDim, border: `1px solid ${active ? accent + "40" : BASE.line}` },
      children
    }
  );
}
function Card({ children, className = "", glowing = false, accent, style = {} }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `rounded-2xl p-4 transition-shadow duration-300 break-inside-avoid ${className}`,
      style: {
        background: BASE.surface,
        border: `1px solid ${glowing ? accent + "45" : BASE.line}`,
        boxShadow: glowing ? ring(accent) + ", inset 0 1px 0 rgba(255,255,255,0.02)" : "inset 0 1px 0 rgba(255,255,255,0.02)",
        ...style
      },
      children
    }
  );
}
function Toast({ text }) {
  if (!text) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs toast-in",
      style: { background: BASE.surface2, border: `1px solid ${BASE.line}`, color: BASE.ink, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" },
      children: text
    }
  );
}
function WalletBadge({ balance, accent, onClick }) {
  return /* @__PURE__ */ jsxs(
    "button",
    {
      onClick,
      className: "flex items-center gap-1.5 pl-2 pr-2.5 py-1.5 rounded-full transition-all duration-150 active:scale-95",
      style: { border: `1px solid ${BASE.line}`, background: BASE.surface },
      children: [
        /* @__PURE__ */ jsx(Coins, { size: 13, style: { color: accent } }),
        /* @__PURE__ */ jsx("span", { className: "text-[12px] leading-none", style: { fontFamily: "'JetBrains Mono', monospace", color: BASE.ink, fontWeight: 500 }, children: groupThousands(balance) })
      ]
    }
  );
}
function WalletSheet({ open, onClose, balance, ledger, accent }) {
  if (!open) return null;
  const rows = [...ledger].reverse();
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-end justify-center",
      onClick: onClose,
      style: { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          onClick: (e) => e.stopPropagation(),
          className: "w-full max-w-md rounded-t-[28px] px-5 pt-4 pb-8",
          style: { background: BASE.surface, border: `1px solid ${BASE.line}`, borderBottom: "none", maxHeight: "78vh", overflowY: "auto", animation: "riseIn 0.28s ease-out" },
          children: [
            /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4", style: { width: 36, height: 4, borderRadius: 2, background: BASE.line } }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: "MindCoin" }),
              /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-1 -m-1", children: /* @__PURE__ */ jsx(XIcon, { size: 16, style: { color: BASE.inkFaint } }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-1", children: [
              /* @__PURE__ */ jsx(Coins, { size: 24, style: { color: accent } }),
              /* @__PURE__ */ jsx("span", { className: "text-[30px] leading-none", style: { fontFamily: "'JetBrains Mono', monospace", color: BASE.ink, fontWeight: 600 }, children: groupThousands(balance) })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[11px] mb-6", style: { color: BASE.inkFaint }, children: "\u041F\u043E\u043A\u0430 \u043D\u0435 \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u043D\u044B \u043A \u043F\u043E\u043A\u0443\u043F\u043A\u0430\u043C \u2014 \u043E\u0431\u043C\u0435\u043D \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u043E\u0437\u0436\u0435, \u0432 App Store-\u0432\u0435\u0440\u0441\u0438\u0438." }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: "\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F" }),
            rows.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm py-2", style: { color: BASE.inkFaint }, children: "\u041F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E. +10 \u043D\u0430\u0447\u0438\u0441\u043B\u044F\u0435\u0442\u0441\u044F \u0437\u0430 \u0432\u0445\u043E\u0434 \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C, +5 \u2014 \u0437\u0430 \u043F\u043E\u0431\u0435\u0434\u0443 \u043D\u0430\u0434 \u0440\u044B\u043D\u043A\u043E\u043C \u0432 \u0438\u0433\u0440\u0435." }) : /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: rows.map((tx) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-2.5", style: { borderBottom: `1px solid ${BASE.line}` }, children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm", style: { color: BASE.ink }, children: tx.reason }),
                /* @__PURE__ */ jsx("div", { className: "text-[11px]", style: { color: BASE.inkFaint }, children: relTime(new Date(tx.date)) })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-sm", style: { color: WIN, fontFamily: "'JetBrains Mono', monospace" }, children: [
                "+",
                tx.amount
              ] })
            ] }, tx.id)) })
          ]
        }
      )
    }
  );
}
var RU_WEEKDAY_SHORT = ["\u0412\u0441", "\u041F\u043D", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041F\u0442", "\u0421\u0431"];
var EN_WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
function useStreak(entries, lang = "ru") {
  return useMemo(() => {
    const dateSet = new Set(entries.map((e) => e.date.toDateString()));
    const cursor = /* @__PURE__ */ new Date();
    if (!dateSet.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (dateSet.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const today = /* @__PURE__ */ new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    const weekdayLabels = lang === "en" ? EN_WEEKDAY_SHORT : RU_WEEKDAY_SHORT;
    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push({ label: weekdayLabels[d.getDay()], filled: dateSet.has(d.toDateString()) });
    }
    return { streak, week };
  }, [entries, lang]);
}
function calculateChallengeProgress(entries, lang = "ru") {
  const sortedDesc = [...entries].sort((a, b) => b.date - a.date);
  let noRevenge = 0;
  for (const e of sortedDesc) {
    if (e.tag === "\u0420\u0435\u0432\u0430\u043D\u0448") break;
    noRevenge++;
    if (noRevenge >= 5) break;
  }
  const last5 = sortedDesc.slice(0, 5);
  const reflected = last5.filter((e) => e.pull && e.pull !== "\u2014" && e.lesson && e.lesson !== "\u2014").length;
  let winStreak = 0;
  for (const e of sortedDesc) {
    if (e.r === null || e.r === void 0 || e.r <= 0) break;
    winStreak++;
    if (winStreak >= 3) break;
  }
  if (lang === "en") {
    return [
      { id: "revenge", title: "No revenge trades", desc: '5 trades in a row without the "Revenge" tag.', progress: noRevenge, goal: 5 },
      { id: "reflect", title: "Full reflection", desc: "Fill in both reflection fields \u2014 in your last 5 trades.", progress: reflected, goal: 5 },
      { id: "winstreak", title: "Positive streak", desc: "3 trades in a row with a positive result.", progress: winStreak, goal: 3 }
    ];
  }
  return [
    { id: "revenge", title: "\u0411\u0435\u0437 \u0440\u0435\u0432\u0430\u043D\u0448-\u0442\u0440\u0435\u0439\u0434\u043E\u0432", desc: "5 \u0441\u0434\u0435\u043B\u043E\u043A \u043F\u043E\u0434\u0440\u044F\u0434 \u0431\u0435\u0437 \u0442\u0435\u0433\u0430 \xAB\u0420\u0435\u0432\u0430\u043D\u0448\xBB.", progress: noRevenge, goal: 5 },
    { id: "reflect", title: "\u041F\u043E\u043B\u043D\u0430\u044F \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u044F", desc: "\u0417\u0430\u043F\u043E\u043B\u043D\u044F\u0439 \u043E\u0431\u0430 \u043F\u043E\u043B\u044F \u0440\u0435\u0444\u043B\u0435\u043A\u0441\u0438\u0438 \u2014 \u0432 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 5 \u0441\u0434\u0435\u043B\u043A\u0430\u0445.", progress: reflected, goal: 5 },
    { id: "winstreak", title: "\u041F\u043B\u044E\u0441\u043E\u0432\u0430\u044F \u0441\u0435\u0440\u0438\u044F", desc: "3 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u0434\u0440\u044F\u0434 \u0441 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u043C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u043C.", progress: winStreak, goal: 3 }
  ];
}
function WeekDots({ week, accent }) {
  return /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: week.map((d, i) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-1", children: [
    /* @__PURE__ */ jsx("span", { className: "text-[9px]", style: { color: BASE.inkFaint }, children: d.label }),
    /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full transition-all duration-300", style: { background: d.filled ? accent : "transparent", border: `1px solid ${d.filled ? accent : BASE.line}` } })
  ] }, i)) });
}
function Sparkline({ points, color, width = 68, height = 26 }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((v, i) => `${(i * stepX).toFixed(1)},${(height - 3 - (v - min) / range * (height - 6)).toFixed(1)}`).join(" ");
  return /* @__PURE__ */ jsx("svg", { width, height, viewBox: `0 0 ${width} ${height}`, children: /* @__PURE__ */ jsx("polyline", { points: coords, fill: "none", stroke: color, strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) });
}
function Home({ entries, goTo, accent, name, measureMode, currency, startingCapital, lastCalibration, analytics, t, lang, tradingAsset, notify }) {
  const total = entries.length;
  const [patternOpen, setPatternOpen] = useState(false);
  const [marketSnapshot, setMarketSnapshot] = useState(null);
  const [marketRefreshing, setMarketRefreshing] = useState(false);
  useEffect(() => {
    if (!tradingAsset) {
      setMarketSnapshot(null);
      return;
    }
    let cancelled = false;
    getMarketSnapshot(tradingAsset, lang).then((snap) => {
      if (!cancelled && snap) setMarketSnapshot(snap);
    }).catch((err) => {
      console.error("mind.exe market snapshot (auto) failed:", err);
    });
    return () => {
      cancelled = true;
    };
  }, [tradingAsset, lang]);
  const refreshMarketSnapshot = async () => {
    if (!tradingAsset || marketRefreshing) return;
    setMarketRefreshing(true);
    try {
      const fresh = await aiFetchMarketSnapshot(tradingAsset, lang);
      const withBucket = { ...fresh, hourBucket: marketHourBucket() };
      saveCachedMarketSnapshot(tradingAsset, withBucket);
      setMarketSnapshot(withBucket);
    } catch (err) {
      console.error("mind.exe market snapshot (manual) failed:", err);
      notify?.(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0438\u043D\u0441\u0430\u0439\u0442\u0430: ${err?.message || err}`);
    } finally {
      setMarketRefreshing(false);
    }
  };
  const closedEntries = useMemo(() => entries.filter(isEntryClosed), [entries]);
  const traderPatterns = useMemo(() => analyzeTraderPatterns(closedEntries, lang), [closedEntries, lang]);
  const calibratedToday = lastCalibration && isToday(lastCalibration.date);
  const consciousScoreTarget = analytics.awareness.score.value ?? 55;
  const reflectionScore = analytics.reflection.score.value;
  const disciplineScore = analytics.discipline.score.value;
  const riskStabilityScore = analytics.risk.stability.value;
  const level = calculateTraderLevel(total);
  const { streak, week } = useStreak(entries, lang);
  const moodKey = marketSnapshot?.moodLabel || (consciousScoreTarget > 80 ? t.home.moodCalm : consciousScoreTarget > 60 ? t.home.moodStable : t.home.moodReactive);
  const withR = entries.filter((e) => e.r !== null && e.r !== void 0);
  const cumResult = withR.reduce((s, e) => s + e.r, 0);
  const heroTarget = measureMode === "currency" ? startingCapital + cumResult : cumResult;
  const sparkPoints = useMemo(() => {
    const sorted = [...withR].sort((a, b) => a.date - b.date);
    let cum = measureMode === "currency" ? startingCapital : 0;
    return sorted.map((e) => {
      cum += e.r;
      return cum;
    }).slice(-10);
  }, [withR, measureMode, startingCapital]);
  const consciousScore = Math.round(useAnimatedNumber(consciousScoreTarget));
  const animatedStreak = Math.round(useAnimatedNumber(streak));
  const animatedHero = useAnimatedNumber(heroTarget);
  const tiles = [
    { id: "new", label: t.home.newEntryTile, icon: BookOpen, primary: true },
    { id: "log", label: t.home.logTile, icon: NotebookText },
    { id: "patterns", label: t.home.patternsTile, icon: LineChartIcon },
    { id: "simulator", label: t.home.simulatorTile, icon: Swords }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "stagger", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-[24px] leading-tight mb-1", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 500 }, children: t.home.welcomeBack(name || t.home.defaultName) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: BASE.inkFaint }, children: t.home.subtitle })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:columns-2 lg:gap-4", children: [
    /* @__PURE__ */ jsxs(Card, { accent, glowing: true, className: "mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-1.5", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-[10px] uppercase tracking-wide", style: { color: BASE.inkFaint }, children: [
          /* @__PURE__ */ jsx(Wallet, { size: 11, className: "inline mr-1 -mt-0.5", style: { color: accent } }),
          measureMode === "currency" ? t.home.capital : t.home.totalResult
        ] }),
        sparkPoints.length >= 2 && /* @__PURE__ */ jsx(Sparkline, { points: sparkPoints, color: cumResult >= 0 ? WIN : LOSS })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-[28px] leading-none mb-1", style: { fontFamily: "'JetBrains Mono', monospace", color: BASE.ink, fontWeight: 500 }, children: measureMode === "currency" ? formatBalance(animatedHero, currency) : formatResult(animatedHero, "R", currency) }),
      measureMode === "currency" && /* @__PURE__ */ jsxs("span", { className: "text-[11px]", style: { color: cumResult >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: [
        formatResult(cumResult, "currency", currency),
        " ",
        t.home.sinceStart
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => goTo("calibration"),
        className: "w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-3 text-left transition-all duration-200 active:scale-[0.98] break-inside-avoid",
        style: { border: `1px solid ${calibratedToday ? BASE.line : accent + "40"}`, background: calibratedToday ? BASE.surface : `${accent}0D` },
        children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2.5 text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: [
            /* @__PURE__ */ jsx(Gauge, { size: 15, style: { color: calibratedToday ? lastCalibration.tierColor : accent } }),
            calibratedToday ? t.home.calibrationToday(lastCalibration.pct) : t.home.calibrationCta
          ] }),
          /* @__PURE__ */ jsx(ChevronRight, { size: 15, style: { color: BASE.inkFaint } })
        ]
      }
    ),
    /* @__PURE__ */ jsxs(Card, { accent, className: "mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[11px]", style: { color: BASE.inkDim, fontFamily: "'Space Grotesk', sans-serif" }, children: [
          /* @__PURE__ */ jsx(Sparkles, { size: 12, style: { color: accent } }),
          " ",
          t.home.insight
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          tradingAsset && /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: refreshMarketSnapshot,
              disabled: marketRefreshing,
              title: t.home.marketRefresh,
              className: "flex items-center justify-center w-5 h-5 rounded-full transition-all active:scale-90",
              style: { color: accent, opacity: marketRefreshing ? 0.5 : 1 },
              children: /* @__PURE__ */ jsx(RotateCcw, { size: 11, className: marketRefreshing ? "animate-spin" : void 0 })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { background: accent } })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm leading-relaxed", style: { color: BASE.ink }, children: [
        t.home.moodPrefix,
        /* @__PURE__ */ jsx("span", { style: { color: accent }, children: moodKey }),
        ".",
        " ",
        marketSnapshot?.summary || (total >= 4 ? t.home.insightConfident : t.home.insightFocus)
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { className: "mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 divide-x", style: { borderColor: BASE.line }, children: [
        /* @__PURE__ */ jsxs("div", { className: "pr-4", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-1", style: { color: BASE.inkFaint }, children: t.home.traderLevel }),
          /* @__PURE__ */ jsx("div", { className: "text-[26px] leading-none", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 500 }, children: level })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "pl-4", style: { borderLeft: `1px solid ${BASE.line}` }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-1", style: { color: BASE.inkFaint }, children: t.home.awareness }),
          /* @__PURE__ */ jsxs("div", { className: "text-[26px] leading-none", style: { fontFamily: "'Space Grotesk', sans-serif", color: accent, fontWeight: 500 }, children: [
            consciousScore,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full mt-3 mb-2.5", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-700 ease-out", style: { width: `${consciousScore}%`, background: accent } }) }),
      total > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap text-[10px]", style: { color: BASE.inkFaint }, children: [
        reflectionScore != null && /* @__PURE__ */ jsxs("span", { children: [
          t.home.reflection,
          " ",
          reflectionScore,
          "%"
        ] }),
        reflectionScore != null && (disciplineScore != null || riskStabilityScore != null) && /* @__PURE__ */ jsx("span", { children: "\xB7" }),
        disciplineScore != null && /* @__PURE__ */ jsxs("span", { children: [
          t.home.discipline,
          " ",
          disciplineScore,
          "%"
        ] }),
        disciplineScore != null && riskStabilityScore != null && /* @__PURE__ */ jsx("span", { children: "\xB7" }),
        riskStabilityScore != null && /* @__PURE__ */ jsxs("span", { children: [
          t.home.riskStability,
          " ",
          riskStabilityScore,
          "%"
        ] }),
        calibratedToday && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { children: "\xB7" }),
          /* @__PURE__ */ jsxs("span", { style: { color: lastCalibration.tierColor }, children: [
            t.home.calibrationTodayShort,
            " ",
            lastCalibration.pct,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 mt-3", style: { borderTop: `1px solid ${BASE.line}` }, children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => goTo("challenge"), className: "flex items-center gap-1.5 text-xs transition-transform duration-150 active:scale-95", style: { color: BASE.inkDim }, children: [
          /* @__PURE__ */ jsx(Flame, { size: 13, className: streak > 0 ? "flame-flicker" : "", style: { color: streak > 0 ? "#D98A4A" : BASE.inkFaint } }),
          streak > 0 ? t.home.streakDays(animatedStreak) : t.home.startStreak
        ] }),
        /* @__PURE__ */ jsx(WeekDots, { week, accent })
      ] })
    ] }),
    traderPatterns.available ? traderPatterns.primaryPattern ? /* @__PURE__ */ jsxs(Card, { accent, glowing: true, className: "mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide", style: { color: BASE.inkFaint }, children: t.pattern.yourPattern }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] px-2 py-0.5 rounded-full", style: { color: accent, border: `1px solid ${accent}40` }, children: traderPatterns.primaryPattern.confidence === "high" ? t.pattern.strongSignal : traderPatterns.primaryPattern.confidence === "medium" ? t.pattern.observedPattern : t.pattern.someSigns })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-base mb-1.5", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: traderPatterns.primaryPattern.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2 text-[11px]", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
        /* @__PURE__ */ jsx("span", { children: t.pattern.trades(traderPatterns.primaryPattern.stats.trades) }),
        /* @__PURE__ */ jsxs("span", { children: [
          traderPatterns.primaryPattern.stats.winRate,
          "% ",
          t.pattern.winShort
        ] }),
        /* @__PURE__ */ jsxs("span", { style: { color: traderPatterns.primaryPattern.stats.avgR >= 0 ? WIN : LOSS }, children: [
          formatResult(traderPatterns.primaryPattern.stats.avgR ?? 0, "R", currency),
          " ",
          t.pattern.avgShort
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed mb-3", style: { color: BASE.inkDim }, children: traderPatterns.primaryPattern.description }),
      /* @__PURE__ */ jsx("button", { onClick: () => setPatternOpen(true), className: "text-sm transition-transform duration-150 active:scale-95", style: { color: accent, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: t.pattern.breakdown })
    ] }) : traderPatterns.healthyPatterns.length > 0 ? /* @__PURE__ */ jsxs(Card, { accent, className: "mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide", style: { color: BASE.inkFaint }, children: t.pattern.yourPattern }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] px-2 py-0.5 rounded-full", style: { color: WIN, border: `1px solid ${WIN}40` }, children: t.pattern.strength })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-base mb-1.5", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: traderPatterns.healthyPatterns[0].title }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2 text-[11px]", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
        /* @__PURE__ */ jsx("span", { children: t.pattern.trades(traderPatterns.healthyPatterns[0].stats.trades) }),
        /* @__PURE__ */ jsxs("span", { children: [
          traderPatterns.healthyPatterns[0].stats.winRate,
          "% ",
          t.pattern.winShort
        ] }),
        /* @__PURE__ */ jsxs("span", { style: { color: WIN }, children: [
          formatResult(traderPatterns.healthyPatterns[0].stats.avgR ?? 0, "R", currency),
          " ",
          t.pattern.avgShort
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.inkDim }, children: traderPatterns.healthyPatterns[0].description })
    ] }) : /* @__PURE__ */ jsxs(Card, { className: "mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-1.5", style: { color: BASE.inkFaint }, children: t.pattern.yourPattern }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.inkDim }, children: t.pattern.noClearPattern })
    ] }) : /* @__PURE__ */ jsxs(Card, { className: "mb-3", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-1.5", style: { color: BASE.inkFaint }, children: t.pattern.yourPattern }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-2", style: { color: BASE.ink }, children: t.pattern.buildingUp(traderPatterns.sampleSize, traderPatterns.needed) }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full mb-2", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-700 ease-out", style: { width: `${Math.min(100, traderPatterns.sampleSize / traderPatterns.needed * 100)}%`, background: accent } }) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed", style: { color: BASE.inkFaint }, children: t.pattern.buildingUpDesc })
    ] }),
    patternOpen && traderPatterns.primaryPattern && /* @__PURE__ */ jsx(TraderPatternDetail, { pattern: traderPatterns.primaryPattern, accent, currency, onClose: () => setPatternOpen(false), t, lang }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-3 break-inside-avoid", children: tiles.map((tile) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => goTo(tile.id),
        className: "flex items-center justify-between px-4 py-3.5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98]",
        style: { border: `1px solid ${BASE.line}`, background: BASE.surface, color: BASE.ink },
        children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2.5 text-sm", style: { fontFamily: "'Space Grotesk', sans-serif" }, children: [
            /* @__PURE__ */ jsx(tile.icon, { size: 15, style: { color: tile.primary ? accent : BASE.inkDim } }),
            " ",
            tile.label
          ] }),
          /* @__PURE__ */ jsx(ChevronRight, { size: 15, style: { color: BASE.inkFaint } })
        ]
      },
      tile.id
    )) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs px-1 pt-3", style: { borderTop: `1px solid ${BASE.line}`, color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
      (!tradingAsset || tradingAsset === "crypto") && /* @__PURE__ */ jsxs("span", { children: [
        "BTC.D ",
        /* @__PURE__ */ jsxs("span", { style: { color: BASE.ink }, children: [
          marketSnapshot?.btcDominance ?? BTC_DOMINANCE,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "F&G ",
        /* @__PURE__ */ jsxs("span", { style: { color: BASE.ink }, children: [
          marketSnapshot?.sentimentScore ?? FEAR_GREED.score,
          " \xB7 ",
          marketSnapshot?.sentimentLabel || FEAR_GREED.label
        ] })
      ] }),
      /* @__PURE__ */ jsxs("span", { style: { fontFamily: "'Space Grotesk', sans-serif" }, children: [
        t.home.market,
        ": ",
        moodKey
      ] })
    ] })
  ] });
}
function TraderPatternDetail({ pattern, accent, currency, onClose, t, lang }) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center", onClick: onClose, style: { background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }, children: /* @__PURE__ */ jsxs(
    "div",
    {
      onClick: (e) => e.stopPropagation(),
      className: "w-full max-w-md rounded-t-[28px] px-5 pt-4 pb-8",
      style: { background: BASE.surface, border: `1px solid ${BASE.line}`, borderBottom: "none", maxHeight: "88vh", overflowY: "auto", animation: "riseIn 0.28s ease-out" },
      children: [
        /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4", style: { width: 36, height: 4, borderRadius: 2, background: BASE.line } }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide", style: { color: BASE.inkFaint }, children: t.pattern.detailTitle }),
          /* @__PURE__ */ jsx("button", { onClick: onClose, className: "p-1 -m-1", children: /* @__PURE__ */ jsx(XIcon, { size: 16, style: { color: BASE.inkFaint } }) })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-xl mb-2", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: pattern.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed mb-4", style: { color: BASE.inkDim }, children: pattern.description }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 mb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg px-2 py-2 text-center", style: { background: BASE.surface2, border: `1px solid ${BASE.line}` }, children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: t.pattern.tradesLabel }),
            /* @__PURE__ */ jsx("div", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: pattern.stats.trades })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg px-2 py-2 text-center", style: { background: BASE.surface2, border: `1px solid ${BASE.line}` }, children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: t.pattern.winRateLabel }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: [
              pattern.stats.winRate,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg px-2 py-2 text-center", style: { background: BASE.surface2, border: `1px solid ${BASE.line}` }, children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: t.pattern.avgRLabel }),
            /* @__PURE__ */ jsx("div", { className: "text-sm", style: { color: (pattern.stats.avgR ?? 0) >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(pattern.stats.avgR ?? 0, "R", currency) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { className: "mb-4", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.pattern.comparison }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink }, children: t.pattern.similarSituations }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: (pattern.stats.avgR ?? 0) >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(pattern.stats.avgR ?? 0, "R", currency) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between py-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.inkFaint }, children: t.pattern.otherTrades }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: (pattern.comparisonStats.avgR ?? 0) >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(pattern.comparisonStats.avgR ?? 0, "R", currency) })
          ] })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.pattern.whereOnMap }),
        /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 220 }, className: "mb-4", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(ScatterChart, { margin: { top: 10, right: 10, bottom: 20, left: 0 }, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { stroke: BASE.line }),
          /* @__PURE__ */ jsx(
            XAxis,
            {
              type: "number",
              dataKey: "x",
              domain: [0, 100],
              tick: { fill: BASE.inkFaint, fontSize: 10 },
              stroke: BASE.line,
              label: { value: t.pattern.fearToConfidence, position: "insideBottom", offset: -10, fill: BASE.inkFaint, fontSize: 10 }
            }
          ),
          /* @__PURE__ */ jsx(
            YAxis,
            {
              type: "number",
              dataKey: "y",
              domain: [0, 100],
              reversed: true,
              tick: { fill: BASE.inkFaint, fontSize: 10 },
              stroke: BASE.line,
              label: { value: t.pattern.nervousToCalm, angle: -90, position: "insideLeft", fill: BASE.inkFaint, fontSize: 10 }
            }
          ),
          /* @__PURE__ */ jsx(ZAxis, { range: [70, 70] }),
          /* @__PURE__ */ jsx(Scatter, { data: pattern.comparisonStats._trades || [], fill: BASE.line, isAnimationActive: false }),
          /* @__PURE__ */ jsx(Scatter, { data: pattern.stats._trades || [], isAnimationActive: false, children: (pattern.stats._trades || []).map((t2) => /* @__PURE__ */ jsx(Cell, { fill: accent }, t2.id)) })
        ] }) }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.pattern.tradeExamples }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 mb-4", children: pattern.sampleTrades.map((tr) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm py-1.5", style: { borderBottom: `1px solid ${BASE.line}` }, children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: outcomeColor(tr.outcome) } }),
          /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, className: "text-xs shrink-0", children: tr.date.toLocaleDateString(lang === "en" ? "en-US" : "ru-RU", { day: "2-digit", month: "2-digit" }) }),
          /* @__PURE__ */ jsx("span", { style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, className: "shrink-0", children: tr.instrument }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs shrink-0", style: { color: BASE.inkFaint }, children: [
            "x",
            Math.round(tr.x),
            " y",
            Math.round(tr.y)
          ] }),
          tr.r !== null && tr.r !== void 0 && /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0", style: { color: outcomeColor(tr.outcome), fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(tr.r, "R", currency) })
        ] }, tr.id)) }),
        /* @__PURE__ */ jsxs(Card, { className: "mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.pattern.whyShown }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.ink }, children: t.pattern.whyShownText(pattern.evidenceCount, formatResult(pattern.stats.avgR ?? 0, "R", currency), formatResult(pattern.comparisonStats.avgR ?? 0, "R", currency)) })
        ] })
      ]
    }
  ) });
}
function emotionLerpHex(c1, c2, t) {
  const a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
  const ar = a >> 16 & 255, ag = a >> 8 & 255, ab = a & 255;
  const br = b >> 16 & 255, bg = b >> 8 & 255, bb = b & 255;
  const r = Math.round(ar + (br - ar) * t), g = Math.round(ag + (bg - ag) * t), bl = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1)}`;
}
function emotionPositionColor(x, y) {
  const positivity = Math.max(0, Math.min(100, (x + (100 - y)) / 2)) / 100;
  return positivity < 0.5 ? emotionLerpHex(LOSS, WARN, positivity * 2) : emotionLerpHex(WARN, WIN, (positivity - 0.5) * 2);
}
function EmotionGrid({ x, y, onChange, accent, t }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [justPlaced, setJustPlaced] = useState(false);
  const eg = t.newEntry.emotionGrid;
  const place = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const px = (clientX - rect.left) / rect.width * 100;
    const py = (clientY - rect.top) / rect.height * 100;
    onChange({ x: Math.min(100, Math.max(0, Math.round(px))), y: Math.min(100, Math.max(0, Math.round(py))) });
  };
  const onDown = (e) => {
    setDragging(true);
    if (ref.current.setPointerCapture && e.pointerId !== void 0) {
      try {
        ref.current.setPointerCapture(e.pointerId);
      } catch (_) {
      }
    }
    place(e);
  };
  const onMove = (e) => {
    if (dragging) place(e);
  };
  const onUp = () => {
    setDragging(false);
    setJustPlaced(true);
    setTimeout(() => setJustPlaced(false), 500);
  };
  const has = x !== null && y !== null;
  const label = "text-[10px] uppercase tracking-wide";
  // 3x3 banding (fear/neutral/confidence x nervous/balanced/calm) instead of the old 4-quadrant
  // split, so the written-out state actually reflects a middling position instead of forcing it
  // into one of two extremes either axis is closest to.
  const band = (v) => v < 34 ? 0 : v < 67 ? 1 : 2;
  const stateText = has ? eg.states[band(y) * 3 + band(x)] : null;
  const stateColor = has ? emotionPositionColor(x, y) : BASE.inkFaint;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "text-center mb-1.5", children: /* @__PURE__ */ jsx("span", { className: label, style: { color: BASE.inkFaint }, children: eg.axisTop }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2.5", children: [
      /* @__PURE__ */ jsx("span", { className: label, style: { color: BASE.inkFaint, writingMode: "vertical-rl", transform: "rotate(180deg)" }, children: eg.axisLeft }),
      /* @__PURE__ */ jsxs(
        "div",
        {
          ref,
          onPointerDown: onDown,
          onPointerMove: onMove,
          onPointerUp: onUp,
          onPointerLeave: onUp,
          className: "relative flex-1 aspect-square rounded-2xl cursor-crosshair touch-none select-none overflow-hidden",
          style: {
            background: `radial-gradient(circle at 10% 10%, ${LOSS}1A 0%, transparent 50%), radial-gradient(circle at 90% 90%, ${WIN}1A 0%, transparent 50%), radial-gradient(circle at 50% 50%, ${WARN}0D 0%, transparent 55%), ${BASE.surface2}`,
            border: `1px solid ${BASE.line}`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), inset 0 0 24px rgba(0,0,0,0.25)"
          },
          children: [
            [33.333, 66.667].map((p) => /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0 w-px", style: { left: `${p}%`, background: BASE.line, opacity: 0.4 } }, `v${p}`)),
            [33.333, 66.667].map((p) => /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 h-px", style: { top: `${p}%`, background: BASE.line, opacity: 0.4 } }, `h${p}`)),
            /* @__PURE__ */ jsx("div", { className: "absolute left-1/2 top-0 bottom-0 w-px", style: { background: BASE.line } }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-1/2 left-0 right-0 h-px", style: { background: BASE.line } }),
            has && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0", style: { top: `${y}%`, borderTop: `1px dashed ${accent}45`, transition: dragging ? "none" : "top 0.15s ease-out" } }),
              /* @__PURE__ */ jsx("div", { className: "absolute top-0 bottom-0", style: { left: `${x}%`, borderLeft: `1px dashed ${accent}45`, transition: dragging ? "none" : "left 0.15s ease-out" } }),
              justPlaced && /* @__PURE__ */ jsx("div", { className: "absolute rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none emotion-ripple", style: { left: `${x}%`, top: `${y}%`, border: `1.5px solid ${stateColor}` } }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2",
                  style: { left: `${x}%`, top: `${y}%`, background: stateColor, boxShadow: `0 0 0 5px ${stateColor}28, 0 0 14px ${stateColor}55`, transition: dragging ? "none" : "left 0.15s ease-out, top 0.15s ease-out, background 0.15s ease-out" }
                }
              )
            ] }),
            !has && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center text-center px-6 text-xs", style: { color: BASE.inkFaint }, children: eg.hint })
          ]
        }
      ),
      /* @__PURE__ */ jsx("span", { className: label, style: { color: BASE.inkFaint, writingMode: "vertical-rl" }, children: eg.axisRight })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-center mt-1.5 mb-1", children: /* @__PURE__ */ jsx("span", { className: label, style: { color: BASE.inkFaint }, children: eg.axisBottom }) }),
    has && /* @__PURE__ */ jsx("div", { className: "text-center text-xs mt-1", style: { color: stateColor }, children: stateText })
  ] });
}
function PickerField({ value, onChange, options, placeholder, accent, allowCustom, flat, mono, onCustomAdd }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const closeIfOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", closeIfOutside);
    document.addEventListener("touchstart", closeIfOutside);
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      document.removeEventListener("touchstart", closeIfOutside);
    };
  }, [open]);
  const flatOptions = flat ? options : options.flatMap((g) => g.items);
  const filtered = query.trim() ? flatOptions.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase())) : null;
  const exactMatch = filtered && filtered.some((o) => o.toLowerCase() === query.trim().toLowerCase());
  const select = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };
  const addCustom = (val) => {
    select(val);
    onCustomAdd && onCustomAdd(val);
  };
  const rowStyle = (o) => ({ color: BASE.ink, fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit", background: value === o ? `${accent}12` : "transparent" });
  return /* @__PURE__ */ jsx("div", { ref: containerRef, className: "relative", children: !open ? /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setOpen(true), className: "w-full flex items-center justify-between border-b py-2.5 text-sm text-left", style: { borderColor: BASE.line }, children: [
    /* @__PURE__ */ jsx("span", { style: { color: value ? BASE.ink : BASE.inkDim, fontFamily: value && mono ? "'JetBrains Mono', monospace" : "inherit" }, children: value || placeholder }),
    /* @__PURE__ */ jsx(ChevronDown, { size: 14, style: { color: BASE.inkFaint } })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-xl overflow-hidden", style: { border: `1px solid ${accent}45`, background: BASE.surface2, boxShadow: ring(accent) }, children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-3 py-2.5", style: { borderBottom: `1px solid ${BASE.line}` }, children: [
      /* @__PURE__ */ jsx(Search, { size: 13, style: { color: BASE.inkFaint } }),
      /* @__PURE__ */ jsx("input", { ref: inputRef, value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A \u0438\u043B\u0438 \u0441\u0432\u043E\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u2026", className: "bg-transparent outline-none text-sm flex-1", style: { color: BASE.ink } }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => {
        setOpen(false);
        setQuery("");
      }, children: /* @__PURE__ */ jsx(XIcon, { size: 14, style: { color: BASE.inkFaint } }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-h-52 overflow-y-auto", children: filtered ? /* @__PURE__ */ jsxs(Fragment, { children: [
      filtered.map((o) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => select(o), className: "w-full text-left px-3 py-2.5 text-sm transition-colors duration-100", style: rowStyle(o), children: o }, o)),
      allowCustom && query.trim() && !exactMatch && /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => addCustom(query.trim()), className: "w-full text-left px-3 py-2.5 text-sm flex items-center gap-2", style: { color: accent }, children: [
        /* @__PURE__ */ jsx(Plus, { size: 13 }),
        " \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \xAB",
        query.trim(),
        "\xBB"
      ] }),
      filtered.length === 0 && !allowCustom && /* @__PURE__ */ jsx("div", { className: "px-3 py-3 text-xs", style: { color: BASE.inkFaint }, children: "\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E" })
    ] }) : flat ? options.map((o) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => select(o), className: "w-full text-left px-3 py-2.5 text-sm transition-colors duration-100", style: rowStyle(o), children: o }, o)) : options.map((g) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "px-3 pt-2.5 pb-1 text-[10px] uppercase tracking-wide", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children: g.category }),
      g.items.map((o) => /* @__PURE__ */ jsx("button", { type: "button", onClick: () => select(o), className: "w-full text-left px-3 py-2 text-sm transition-colors duration-100", style: rowStyle(o), children: o }, o))
    ] }, g.category)) })
  ] }) });
}
// ---- AI text polish (Gemini) ---------------------------------------------------
// Replaces the old voice-input mic button. Lightly copyedits the trader's own typed reflection —
// fixes grammar/flow, merges fragments into full sentences — without changing meaning, adding
// advice, or answering as if it were a question. Separate model instance from aiGetModel(): that
// one's system instruction is scoped to journal-analysis coaching, wrong fit for a copyedit task.
var aiPolishModel = null;
function aiGetPolishModel() {
  if (!aiPolishModel) {
    aiPolishModel = getGenerativeModel(aiLogic, {
      model: AI_MODEL,
      generationConfig: { temperature: 0.3, maxOutputTokens: 300 }
    });
  }
  return aiPolishModel;
}
var AI_POLISH_TASK = "Lightly copyedit the trader's own journal note below: fix grammar, punctuation and awkward phrasing, and merge fragments into smooth sentences. Preserve the original meaning, tone, facts and language exactly \u2014 do not add, remove, reinterpret, or answer it as if it were a question, and do not give advice. Return ONLY the edited text, no quotes, no commentary, no markdown.";
async function aiPolishText(text) {
  const trimmed = (text || "").trim();
  if (!trimmed) throw new Error("ai_empty_text");
  const model = aiGetPolishModel();
  const result = await model.generateContent(`${AI_POLISH_TASK}

TEXT:
${trimmed}`);
  const out = result?.response?.text?.();
  if (!out || !out.trim()) throw new Error("ai_empty_response");
  return out.trim();
}
function PolishButton({ accent, notify, text, onPolished }) {
  const [busy, setBusy] = useState(false);
  const handleClick = async () => {
    if (!text || !text.trim()) {
      notify?.("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u0430\u043F\u0438\u0448\u0438 \u0442\u0435\u043A\u0441\u0442");
      return;
    }
    setBusy(true);
    try {
      const polished = await aiPolishText(text);
      onPolished(polished);
    } catch {
      notify?.("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      onClick: handleClick,
      disabled: busy,
      title: "\u0423\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0442\u0435\u043A\u0441\u0442 \u0441 \u0418\u0418",
      className: "shrink-0 flex items-center gap-1 px-2 h-6 rounded-full text-[10px] transition-all active:scale-90",
      style: { background: `${accent}12`, color: accent, border: `1px solid ${accent}30`, opacity: busy ? 0.55 : 1 },
      children: [/* @__PURE__ */ jsx(Sparkles, { size: 11 }), busy ? "\u2026" : ""]
    }
  );
}
function NewEntry({ onSave, accent, customInstruments, customTags, onAddCustomInstrument, onAddCustomTag, notify, t }) {
  const [instrument, setInstrument] = useState("");
  const [direction, setDirection] = useState("Long");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [tag, setTag] = useState("");
  const [point, setPoint] = useState({ x: null, y: null });
  const [pull, setPull] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [recognizing, setRecognizing] = useState(false);
  const fileInputRef = useRef(null);
  const recognizeInputRef = useRef(null);
  const MAX_SHOTS = 4;
  const handleRecognizeFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      notify(`\xAB${file.name}\xBB \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0439 (\u043C\u0430\u043A\u0441. 15 \u041C\u0411)`);
      return;
    }
    if (screenshots.length >= MAX_SHOTS) {
      notify(`\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ${MAX_SHOTS} \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430`);
      return;
    }
    setRecognizing(true);
    try {
      const dataUrl = await compressImageFile(file);
      setScreenshots((prev) => prev.length < MAX_SHOTS ? [...prev, dataUrl] : prev);
      const rec = await aiRecognizeTradeFromImage(dataUrl);
      if (rec.asset) setInstrument(rec.asset);
      if (rec.direction) setDirection(rec.direction);
      if (rec.entryPrice != null) setEntryPrice(String(rec.entryPrice));
      if (rec.stopLoss != null) setStopLoss(String(rec.stopLoss));
      if (rec.takeProfit != null) setTakeProfit(String(rec.takeProfit));
      if (rec.entryPrice != null && rec.stopLoss != null && rec.takeProfit != null) {
        const check = computePlannedRR(rec.direction || direction, rec.entryPrice, rec.stopLoss, rec.takeProfit);
        notify(check.ok ? "\u0421\u0434\u0435\u043B\u043A\u0430 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u0430 \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F" : "\u041F\u0440\u043E\u0432\u0435\u0440\u044C \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F");
      } else {
        notify("\u0421\u0434\u0435\u043B\u043A\u0430 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u0430 \u0447\u0430\u0441\u0442\u0438\u0447\u043D\u043E \u2014 \u0434\u043E\u0437\u0430\u043F\u043E\u043B\u043D\u0438 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E");
      }
    } catch {
      notify("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u0441\u0434\u0435\u043B\u043A\u0443. \u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0432\u0440\u0443\u0447\u043D\u0443\u044E.");
    } finally {
      setRecognizing(false);
    }
  };
  const plannedRRResult = useMemo(() => {
    const en = parseFloat(entryPrice), sl = parseFloat(stopLoss), tp = parseFloat(takeProfit);
    if (entryPrice === "" || stopLoss === "" || takeProfit === "" || isNaN(en) || isNaN(sl) || isNaN(tp)) return { ok: false, error: null };
    return computePlannedRR(direction, en, sl, tp);
  }, [entryPrice, stopLoss, takeProfit, direction]);
  const canSave = instrument.trim() && point.x !== null && plannedRRResult.ok;
  const instrumentOptions = useMemo(
    () => customInstruments.length ? [{ category: "\u0421\u0432\u043E\u0438", items: customInstruments }, ...INSTRUMENTS] : INSTRUMENTS,
    [customInstruments]
  );
  const tagOptions = useMemo(() => [...customTags, ...SETUP_TAGS], [customTags]);
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_SHOTS - screenshots.length;
    if (room <= 0) {
      notify(`\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ${MAX_SHOTS} \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430`);
      return;
    }
    files.slice(0, room).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        notify(`\xAB${file.name}\xBB \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0439 (\u043C\u0430\u043A\u0441. 15 \u041C\u0411)`);
        return;
      }
      compressImageFile(file).then((dataUrl) => setScreenshots((prev) => prev.length < MAX_SHOTS ? [...prev, dataUrl] : prev)).catch(() => notify(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \xAB${file.name}\xBB`));
    });
    if (files.length > room) notify(`\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u043D\u0435 \u0432\u0441\u0435 \u2014 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ${MAX_SHOTS} \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430`);
  };
  const submit = () => {
    if (!instrument.trim() || point.x === null) return;
    const en = parseFloat(entryPrice), sl = parseFloat(stopLoss), tp = parseFloat(takeProfit);
    const rrCheck = computePlannedRR(direction, en, sl, tp);
    if (!rrCheck.ok) {
      notify(rrCheck.error || "\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043F\u043B\u0430\u043D SL/TP");
      return;
    }
    onSave({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: "open",
      instrument: instrument.trim(),
      direction,
      outcome: null,
      r: null,
      tag: tag.trim() || "\u041E\u0431\u0449\u0435\u0435",
      x: point.x,
      y: point.y,
      pull: pull.trim() || "\u2014",
      lesson: "\u2014",
      date: /* @__PURE__ */ new Date(),
      exitDate: null,
      screenshots,
      exitScreenshots: [],
      entryPrice: en,
      stopLoss: sl,
      takeProfit: tp,
      plannedRR: rrCheck.rr,
      exitPrice: null,
      closeType: null,
      realizedRR: null,
      rr: rrCheck.rr
    });
    setInstrument("");
    setDirection("Long");
    setTag("");
    setPoint({ x: null, y: null });
    setPull("");
    setScreenshots([]);
    setEntryPrice("");
    setStopLoss("");
    setTakeProfit("");
  };
  const L = ({ children }) => /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-1.5", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children });
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-4 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(BookOpen, { size: 17, style: { color: accent } }),
      " ",
      t.newEntry.title
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start", children: [
    /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => recognizeInputRef.current?.click(),
          disabled: recognizing,
          className: "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs transition-all active:scale-95",
          style: { border: `1px solid ${accent}40`, color: accent, background: `${accent}0d`, opacity: recognizing ? 0.6 : 1, fontFamily: "'Space Grotesk', sans-serif" },
          children: [
            /* @__PURE__ */ jsx(Camera, { size: 13 }),
            recognizing ? "\u0410\u043D\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u043C \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u2026" : "\u0420\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u0441\u0434\u0435\u043B\u043A\u0443 \u043F\u043E \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0443"
          ]
        }
      ),
      /* @__PURE__ */ jsx("input", { ref: recognizeInputRef, type: "file", accept: "image/*", onChange: handleRecognizeFile, className: "hidden" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.instrument }),
        /* @__PURE__ */ jsx(PickerField, { value: instrument, onChange: setInstrument, options: instrumentOptions, placeholder: t.newEntry.pickOrAdd, accent, allowCustom: true, mono: true, onCustomAdd: onAddCustomInstrument })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.setupType }),
        /* @__PURE__ */ jsx(PickerField, { value: tag, onChange: setTag, options: tagOptions, placeholder: t.newEntry.pickOrAdd, accent, allowCustom: true, flat: true, onCustomAdd: onAddCustomTag })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.entry }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: entryPrice,
            onChange: (e) => setEntryPrice(e.target.value),
            placeholder: "67 230",
            type: "number",
            step: "any",
            inputMode: "decimal",
            className: "w-full bg-transparent border-b outline-none py-2 text-sm",
            style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.direction }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["Long", "Short"].map((d) => /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setDirection(d),
            className: "flex-1 px-2 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
            style: { background: direction === d ? `${accent}12` : "transparent", color: direction === d ? accent : BASE.inkDim, border: `1px solid ${direction === d ? accent + "40" : BASE.line}` },
            children: DIRECTION_LABEL[d]
          },
          d
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: "Stop Loss" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: stopLoss,
            onChange: (e) => setStopLoss(e.target.value),
            placeholder: "66 800",
            type: "number",
            step: "any",
            inputMode: "decimal",
            className: "w-full bg-transparent border-b outline-none py-2 text-sm",
            style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: "Take Profit" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: takeProfit,
            onChange: (e) => setTakeProfit(e.target.value),
            placeholder: "68 500",
            type: "number",
            step: "any",
            inputMode: "decimal",
            className: "w-full bg-transparent border-b outline-none py-2 text-sm",
            style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-5 text-xs", style: { color: plannedRRResult.ok ? accent : plannedRRResult.error ? LOSS : BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: plannedRRResult.ok ? `Planned RR \u2248 1:${plannedRRResult.rr.toFixed(2)}` : plannedRRResult.error || "\u0423\u043A\u0430\u0436\u0438 Entry, SL \u0438 TP \u2014 RR \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx(L, { children: t.newEntry.screenshots(MAX_SHOTS) }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        screenshots.map((src, i) => /* @__PURE__ */ jsxs("div", { className: "relative w-20 h-20 rounded-xl overflow-hidden shrink-0", style: { border: `1px solid ${BASE.line}` }, children: [
          /* @__PURE__ */ jsx("img", { src, alt: `\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 ${i + 1}`, className: "w-full h-full object-cover block" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setScreenshots((prev) => prev.filter((_, idx) => idx !== i)),
              className: "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90",
              style: { background: "rgba(0,0,0,0.55)" },
              children: /* @__PURE__ */ jsx(XIcon, { size: 11, color: "#fff" })
            }
          )
        ] }, i)),
        screenshots.length < MAX_SHOTS && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => fileInputRef.current?.click(),
            className: "w-20 h-20 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150",
            style: { border: `1px dashed ${BASE.line}`, color: BASE.inkDim },
            children: /* @__PURE__ */ jsx(ImagePlus, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: handleFiles, className: "hidden" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.pullQuestion }),
        /* @__PURE__ */ jsx(PolishButton, { accent, notify, text: pull, onPolished: setPull })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: pull,
          onChange: (e) => setPull(e.target.value),
          rows: 2,
          placeholder: t.newEntry.pullPlaceholder,
          className: "w-full bg-transparent border rounded-xl outline-none p-3 text-sm resize-none",
          style: { borderColor: BASE.line, color: BASE.ink }
        }
      )
    ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(L, { children: t.newEntry.emotionQuestion }),
    /* @__PURE__ */ jsx(EmotionGrid, { x: point.x, y: point.y, onChange: setPoint, accent, t })
    ] })
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: submit,
        disabled: !canSave,
        className: "w-full mt-6 py-3 rounded-full text-sm transition-all active:scale-[0.98] lg:max-w-sm lg:mx-auto lg:block",
        style: {
          background: accent,
          color: "#06120F",
          opacity: canSave ? 1 : 0.3,
          cursor: canSave ? "pointer" : "not-allowed",
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 600,
          boxShadow: canSave ? softLift(accent) : "none"
        },
        children: t.newEntry.save
      }
    )
  ] });
}
function CloseTrade({ entry, onSave, onCancel, accent, measureMode, currency, notify, t }) {
  const hasPlan = entry && typeof entry.entryPrice === "number" && typeof entry.stopLoss === "number" && typeof entry.takeProfit === "number";
  const [closeType, setCloseType] = useState("manual");
  const [manualExit, setManualExit] = useState("");
  const [resultR, setResultR] = useState("");
  const [lesson, setLesson] = useState("");
  const [exitScreenshots, setExitScreenshots] = useState([]);
  const fileInputRef = useRef(null);
  const MAX_SHOTS = 4;
  const L = ({ children }) => /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-1.5", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children });
  const effectiveExit = hasPlan ? closeType === "tp" ? entry.takeProfit : closeType === "sl" ? entry.stopLoss : manualExit === "" ? null : parseFloat(manualExit) : manualExit === "" ? null : parseFloat(manualExit);
  const realizedRR = hasPlan && effectiveExit != null && !isNaN(effectiveExit) ? computeRealizedRR(entry.direction, entry.entryPrice, entry.stopLoss, effectiveExit) : null;
  const resultNum = resultR === "" ? null : parseFloat(resultR);
  const derivedOutcome = resultNum == null || isNaN(resultNum) ? null : resultNum > 0 ? "Win" : resultNum < 0 ? "Loss" : "Breakeven";
  const canSave = resultR !== "" && !isNaN(parseFloat(resultR));
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_SHOTS - exitScreenshots.length;
    if (room <= 0) {
      notify?.(`\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ${MAX_SHOTS} \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430`);
      return;
    }
    files.slice(0, room).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        notify?.(`\xAB${file.name}\xBB \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0439 (\u043C\u0430\u043A\u0441. 15 \u041C\u0411)`);
        return;
      }
      compressImageFile(file).then((dataUrl) => setExitScreenshots((prev) => prev.length < MAX_SHOTS ? [...prev, dataUrl] : prev)).catch(() => notify?.(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \xAB${file.name}\xBB`));
    });
  };
  const submit = () => {
    if (!canSave) return;
    onSave({
      status: "closed",
      closeType: hasPlan ? closeType : "manual",
      exitPrice: effectiveExit,
      realizedRR,
      r: resultNum,
      outcome: derivedOutcome,
      lesson: lesson.trim() || "\u2014",
      exitDate: /* @__PURE__ */ new Date(),
      exitScreenshots
    });
  };
  if (!entry) return null;
  const closeTypeOptions = [
    { id: "tp", label: "\u041F\u043E Take Profit" },
    { id: "sl", label: "\u041F\u043E Stop Loss" },
    { id: "manual", label: "\u0412\u0440\u0443\u0447\u043D\u0443\u044E" }
  ];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-1 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(BookOpen, { size: 17, style: { color: accent } }),
      " \u0417\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0434\u0435\u043B\u043A\u0438"
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm mb-4", style: { color: BASE.inkFaint }, children: [
      entry.instrument, " \xB7 ", DIRECTION_LABEL[entry.direction],
      entry.entryPrice != null ? ` \xB7 \u0432\u0445\u043E\u0434 ${formatPriceValue(entry.entryPrice)}` : "",
      hasPlan ? ` \xB7 \u043F\u043B\u0430\u043D 1:${entry.plannedRR.toFixed(2)}` : ""
    ] }),
    hasPlan && /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-4 text-xs", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
      /* @__PURE__ */ jsxs("span", { children: ["SL ", formatPriceValue(entry.stopLoss)] }),
      /* @__PURE__ */ jsxs("span", { children: ["TP ", formatPriceValue(entry.takeProfit)] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start", children: [
    /* @__PURE__ */ jsxs("div", { children: [
    hasPlan && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx(L, { children: "\u041A\u0430\u043A \u0437\u0430\u043A\u0440\u044B\u043B\u0430\u0441\u044C \u0441\u0434\u0435\u043B\u043A\u0430" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: closeTypeOptions.map((o) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setCloseType(o.id),
          className: "flex-1 px-2 py-1.5 rounded-full text-[12px] transition-all duration-200 active:scale-95",
          style: { background: closeType === o.id ? `${accent}12` : "transparent", color: closeType === o.id ? accent : BASE.inkDim, border: `1px solid ${closeType === o.id ? accent + "40" : BASE.line}` },
          children: o.label
        },
        o.id
      )) })
    ] }),
    (!hasPlan || closeType === "manual") && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx(L, { children: t.newEntry.exit }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: manualExit,
          onChange: (e) => setManualExit(e.target.value),
          placeholder: "68 412",
          type: "number",
          step: "any",
          inputMode: "decimal",
          className: "w-full bg-transparent border-b outline-none py-2 text-sm",
          style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }
        }
      )
    ] }),
    hasPlan && /* @__PURE__ */ jsx("div", { className: "mb-4 text-xs", style: { color: realizedRR != null ? accent : BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: realizedRR != null ? `\u0420\u0430\u0441\u0447\u0451\u0442\u043D\u044B\u0439 RR \u043F\u043E \u0446\u0435\u043D\u0430\u043C: ${realizedRR >= 0 ? "+" : ""}${realizedRR.toFixed(2)}R` : "RR \u043F\u043E \u0446\u0435\u043D\u0430\u043C \u2014" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx(L, { children: t.newEntry.result(unitSymbol(measureMode, currency)) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: resultR,
          onChange: (e) => setResultR(e.target.value),
          placeholder: measureMode === "R" ? "1.5 / -1" : "150 / -80",
          type: "number",
          step: "0.1",
          className: "w-full bg-transparent border-b outline-none py-2 text-sm",
          style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] mt-1.5", style: { color: BASE.inkFaint }, children: "\u0412\u0432\u0435\u0434\u0438 \u0438\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u2014 \u043E\u043D \u0438\u0434\u0451\u0442 \u0432 PnL \u0438 \u0431\u0430\u043B\u0430\u043D\u0441." })
    ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx(L, { children: "\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u044B \u0432\u044B\u0445\u043E\u0434\u0430" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
        exitScreenshots.map((src, i) => /* @__PURE__ */ jsxs("div", { className: "relative w-20 h-20 rounded-xl overflow-hidden shrink-0", style: { border: `1px solid ${BASE.line}` }, children: [
          /* @__PURE__ */ jsx("img", { src, alt: `\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 ${i + 1}`, className: "w-full h-full object-cover block" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => setExitScreenshots((prev) => prev.filter((_, idx) => idx !== i)),
              className: "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90",
              style: { background: "rgba(0,0,0,0.55)" },
              children: /* @__PURE__ */ jsx(XIcon, { size: 11, color: "#fff" })
            }
          )
        ] }, i)),
        exitScreenshots.length < MAX_SHOTS && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => fileInputRef.current?.click(),
            className: "w-20 h-20 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150",
            style: { border: `1px dashed ${BASE.line}`, color: BASE.inkDim },
            children: /* @__PURE__ */ jsx(ImagePlus, { size: 18 })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", multiple: true, onChange: handleFiles, className: "hidden" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.lessonQuestion }),
        /* @__PURE__ */ jsx(PolishButton, { accent, notify, text: lesson, onPolished: setLesson })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          value: lesson,
          onChange: (e) => setLesson(e.target.value),
          rows: 2,
          placeholder: t.newEntry.lessonPlaceholder,
          className: "w-full bg-transparent border rounded-xl outline-none p-3 text-sm resize-none",
          style: { borderColor: BASE.line, color: BASE.ink }
        }
      )
    ] })
    ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onCancel,
          className: "px-4 py-3 rounded-full text-sm transition-all active:scale-[0.98]",
          style: { border: `1px solid ${BASE.line}`, color: BASE.inkDim, fontFamily: "'Space Grotesk', sans-serif" },
          children: "\u041E\u0442\u043C\u0435\u043D\u0430"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: submit,
          disabled: !canSave,
          className: "flex-1 py-3 rounded-full text-sm transition-all active:scale-[0.98]",
          style: {
            background: accent,
            color: "#06120F",
            opacity: canSave ? 1 : 0.3,
            cursor: canSave ? "pointer" : "not-allowed",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            boxShadow: canSave ? softLift(accent) : "none"
          },
          children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0441\u0434\u0435\u043B\u043A\u0443"
        }
      )
    ] })
  ] });
}
function EditTrade({ entry, onSave, onCancel, accent, customInstruments, customTags, onAddCustomInstrument, onAddCustomTag, measureMode, currency, notify, t }) {
  const [instrument, setInstrument] = useState(entry?.instrument || "");
  const [direction, setDirection] = useState(entry?.direction || "Long");
  const [tag, setTag] = useState(entry?.tag === "\u041E\u0431\u0449\u0435\u0435" ? "" : entry?.tag || "");
  const [entryPrice, setEntryPrice] = useState(entry?.entryPrice != null ? String(entry.entryPrice) : "");
  const [stopLoss, setStopLoss] = useState(entry?.stopLoss != null ? String(entry.stopLoss) : "");
  const [takeProfit, setTakeProfit] = useState(entry?.takeProfit != null ? String(entry.takeProfit) : "");
  const [point, setPoint] = useState({ x: entry?.x ?? null, y: entry?.y ?? null });
  const [pull, setPull] = useState(entry?.pull === "\u2014" ? "" : entry?.pull || "");
  const [screenshots, setScreenshots] = useState(entry?.screenshots || []);
  const [closeType, setCloseType] = useState(entry?.closeType || "manual");
  const [manualExit, setManualExit] = useState(entry?.exitPrice != null ? String(entry.exitPrice) : "");
  const [resultR, setResultR] = useState(entry?.r != null ? String(entry.r) : "");
  const [lesson, setLesson] = useState(entry?.lesson === "\u2014" ? "" : entry?.lesson || "");
  const [exitScreenshots, setExitScreenshots] = useState(entry?.exitScreenshots || []);
  const entryFileRef = useRef(null);
  const exitFileRef = useRef(null);
  const MAX_SHOTS = 4;
  const instrumentOptions = useMemo(
    () => customInstruments.length ? [{ category: "\u0421\u0432\u043E\u0438", items: customInstruments }, ...INSTRUMENTS] : INSTRUMENTS,
    [customInstruments]
  );
  const tagOptions = useMemo(() => [...customTags, ...SETUP_TAGS], [customTags]);
  const plannedRRResult = useMemo(() => {
    const en = parseFloat(entryPrice), sl = parseFloat(stopLoss), tp = parseFloat(takeProfit);
    if (entryPrice === "" || stopLoss === "" || takeProfit === "" || isNaN(en) || isNaN(sl) || isNaN(tp)) return { ok: false, error: null };
    return computePlannedRR(direction, en, sl, tp);
  }, [entryPrice, stopLoss, takeProfit, direction]);
  const hasPlanNow = plannedRRResult.ok;
  const effectiveExit = hasPlanNow ? closeType === "tp" ? parseFloat(takeProfit) : closeType === "sl" ? parseFloat(stopLoss) : manualExit === "" ? null : parseFloat(manualExit) : manualExit === "" ? null : parseFloat(manualExit);
  const realizedRR = hasPlanNow && effectiveExit != null && !isNaN(effectiveExit) ? computeRealizedRR(direction, parseFloat(entryPrice), parseFloat(stopLoss), effectiveExit) : null;
  const resultNum = resultR === "" ? null : parseFloat(resultR);
  const derivedOutcome = resultNum == null || isNaN(resultNum) ? null : resultNum > 0 ? "Win" : resultNum < 0 ? "Loss" : "Breakeven";
  const canSave = instrument.trim() && point.x !== null && resultR !== "" && !isNaN(parseFloat(resultR));
  const L = ({ children }) => /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-1.5", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children });
  const makeHandleFiles = (list, setList) => (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_SHOTS - list.length;
    if (room <= 0) {
      notify?.(`\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C ${MAX_SHOTS} \u0441\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u0430`);
      return;
    }
    files.slice(0, room).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        notify?.(`\xAB${file.name}\xBB \u0441\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0439 (\u043C\u0430\u043A\u0441. 15 \u041C\u0411)`);
        return;
      }
      compressImageFile(file).then((dataUrl) => setList((prev) => prev.length < MAX_SHOTS ? [...prev, dataUrl] : prev)).catch(() => notify?.(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \xAB${file.name}\xBB`));
    });
  };
  const ShotRow = ({ list, setList, fileRef, onFiles }) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
    list.map((src, i) => /* @__PURE__ */ jsxs("div", { className: "relative w-20 h-20 rounded-xl overflow-hidden shrink-0", style: { border: `1px solid ${BASE.line}` }, children: [
      /* @__PURE__ */ jsx("img", { src, alt: `\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 ${i + 1}`, className: "w-full h-full object-cover block" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setList((prev) => prev.filter((_, idx) => idx !== i)),
          className: "absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90",
          style: { background: "rgba(0,0,0,0.55)" },
          children: /* @__PURE__ */ jsx(XIcon, { size: 11, color: "#fff" })
        }
      )
    ] }, i)),
    list.length < MAX_SHOTS && /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => fileRef.current?.click(),
        className: "w-20 h-20 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-150",
        style: { border: `1px dashed ${BASE.line}`, color: BASE.inkDim },
        children: /* @__PURE__ */ jsx(ImagePlus, { size: 18 })
      }
    ),
    /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", accept: "image/*", multiple: true, onChange: onFiles, className: "hidden" })
  ] });
  const submit = () => {
    if (!canSave) return;
    const num = (s) => s === "" || isNaN(parseFloat(s)) ? null : parseFloat(s);
    onSave({
      instrument: instrument.trim(),
      direction,
      tag: tag.trim() || "\u041E\u0431\u0449\u0435\u0435",
      x: point.x,
      y: point.y,
      pull: pull.trim() || "\u2014",
      screenshots,
      entryPrice: num(entryPrice),
      stopLoss: hasPlanNow ? parseFloat(stopLoss) : null,
      takeProfit: hasPlanNow ? parseFloat(takeProfit) : null,
      plannedRR: hasPlanNow ? plannedRRResult.rr : null,
      closeType: hasPlanNow ? closeType : "manual",
      exitPrice: effectiveExit,
      realizedRR,
      r: resultNum,
      outcome: derivedOutcome,
      lesson: lesson.trim() || "\u2014",
      exitScreenshots
    });
  };
  if (!entry) return null;
  const closeTypeOptions = [
    { id: "tp", label: "\u041F\u043E TP" },
    { id: "sl", label: "\u041F\u043E SL" },
    { id: "manual", label: "\u0412\u0440\u0443\u0447\u043D\u0443\u044E" }
  ];
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-4 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(BookOpen, { size: 17, style: { color: accent } }),
      " \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0434\u0435\u043B\u043A\u0438"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-2", style: { color: BASE.inkFaint }, children: "ENTRY" }),
    /* @__PURE__ */ jsxs("div", { className: "lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start", children: [
    /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.instrument }),
        /* @__PURE__ */ jsx(PickerField, { value: instrument, onChange: setInstrument, options: instrumentOptions, placeholder: t.newEntry.pickOrAdd, accent, allowCustom: true, mono: true, onCustomAdd: onAddCustomInstrument })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.setupType }),
        /* @__PURE__ */ jsx(PickerField, { value: tag, onChange: setTag, options: tagOptions, placeholder: t.newEntry.pickOrAdd, accent, allowCustom: true, flat: true, onCustomAdd: onAddCustomTag })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.entry }),
        /* @__PURE__ */ jsx("input", { value: entryPrice, onChange: (e) => setEntryPrice(e.target.value), type: "number", step: "any", inputMode: "decimal", className: "w-full bg-transparent border-b outline-none py-2 text-sm", style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" } })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.direction }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["Long", "Short"].map((d) => /* @__PURE__ */ jsx(
          "button",
          { onClick: () => setDirection(d), className: "flex-1 px-2 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95", style: { background: direction === d ? `${accent}12` : "transparent", color: direction === d ? accent : BASE.inkDim, border: `1px solid ${direction === d ? accent + "40" : BASE.line}` }, children: DIRECTION_LABEL[d] },
          d
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 mb-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: "Stop Loss" }),
        /* @__PURE__ */ jsx("input", { value: stopLoss, onChange: (e) => setStopLoss(e.target.value), type: "number", step: "any", inputMode: "decimal", className: "w-full bg-transparent border-b outline-none py-2 text-sm", style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" } })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx(L, { children: "Take Profit" }),
        /* @__PURE__ */ jsx("input", { value: takeProfit, onChange: (e) => setTakeProfit(e.target.value), type: "number", step: "any", inputMode: "decimal", className: "w-full bg-transparent border-b outline-none py-2 text-sm", style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" } })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-4 text-xs", style: { color: hasPlanNow ? accent : plannedRRResult.error ? LOSS : BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: hasPlanNow ? `Planned RR \u2248 1:${plannedRRResult.rr.toFixed(2)}` : plannedRRResult.error || "\u0411\u0435\u0437 SL/TP \u2014 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0431\u0443\u0434\u0435\u0442 \u0432\u0432\u043E\u0434\u0438\u0442\u044C\u0441\u044F \u0432\u0440\u0443\u0447\u043D\u0443\u044E" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx(L, { children: t.newEntry.screenshots(MAX_SHOTS) }),
      /* @__PURE__ */ jsx(ShotRow, { list: screenshots, setList: setScreenshots, fileRef: entryFileRef, onFiles: makeHandleFiles(screenshots, setScreenshots) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.pullQuestion }),
        /* @__PURE__ */ jsx(PolishButton, { accent, notify, text: pull, onPolished: setPull })
      ] }),
      /* @__PURE__ */ jsx("textarea", { value: pull, onChange: (e) => setPull(e.target.value), rows: 2, placeholder: t.newEntry.pullPlaceholder, className: "w-full bg-transparent border rounded-xl outline-none p-3 text-sm resize-none", style: { borderColor: BASE.line, color: BASE.ink } })
    ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(L, { children: t.newEntry.emotionQuestion }),
    /* @__PURE__ */ jsx(EmotionGrid, { x: point.x, y: point.y, onChange: setPoint, accent, t }),
    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mt-6 mb-2", style: { color: BASE.inkFaint }, children: "EXIT" }),
    hasPlanNow && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx(L, { children: "\u041A\u0430\u043A \u0437\u0430\u043A\u0440\u044B\u043B\u0430\u0441\u044C \u0441\u0434\u0435\u043B\u043A\u0430" }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: closeTypeOptions.map((o) => /* @__PURE__ */ jsx(
        "button",
        { onClick: () => setCloseType(o.id), className: "flex-1 px-2 py-1.5 rounded-full text-[12px] transition-all duration-200 active:scale-95", style: { background: closeType === o.id ? `${accent}12` : "transparent", color: closeType === o.id ? accent : BASE.inkDim, border: `1px solid ${closeType === o.id ? accent + "40" : BASE.line}` }, children: o.label },
        o.id
      )) })
    ] }),
    (!hasPlanNow || closeType === "manual") && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsx(L, { children: t.newEntry.exit }),
      /* @__PURE__ */ jsx("input", { value: manualExit, onChange: (e) => setManualExit(e.target.value), type: "number", step: "any", inputMode: "decimal", className: "w-full bg-transparent border-b outline-none py-2 text-sm", style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" } })
    ] }),
    hasPlanNow && /* @__PURE__ */ jsx("div", { className: "mb-4 text-xs", style: { color: realizedRR != null ? accent : BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: realizedRR != null ? `\u0420\u0430\u0441\u0447\u0451\u0442\u043D\u044B\u0439 RR \u043F\u043E \u0446\u0435\u043D\u0430\u043C: ${realizedRR >= 0 ? "+" : ""}${realizedRR.toFixed(2)}R` : "RR \u043F\u043E \u0446\u0435\u043D\u0430\u043C \u2014" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx(L, { children: t.newEntry.result(unitSymbol(measureMode, currency)) }),
      /* @__PURE__ */ jsx("input", { value: resultR, onChange: (e) => setResultR(e.target.value), type: "number", step: "0.1", className: "w-full bg-transparent border-b outline-none py-2 text-sm", style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" } }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] mt-1.5", style: { color: BASE.inkFaint }, children: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0432\u0432\u043E\u0434\u0438\u0442\u0441\u044F \u0432\u0440\u0443\u0447\u043D\u0443\u044E \u2014 \u043E\u043D \u0438\u0434\u0451\u0442 \u0432 PnL \u0438 \u0431\u0430\u043B\u0430\u043D\u0441." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsx(L, { children: "\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442\u044B \u0432\u044B\u0445\u043E\u0434\u0430" }),
      /* @__PURE__ */ jsx(ShotRow, { list: exitScreenshots, setList: setExitScreenshots, fileRef: exitFileRef, onFiles: makeHandleFiles(exitScreenshots, setExitScreenshots) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsx(L, { children: t.newEntry.lessonQuestion }),
        /* @__PURE__ */ jsx(PolishButton, { accent, notify, text: lesson, onPolished: setLesson })
      ] }),
      /* @__PURE__ */ jsx("textarea", { value: lesson, onChange: (e) => setLesson(e.target.value), rows: 2, placeholder: t.newEntry.lessonPlaceholder, className: "w-full bg-transparent border rounded-xl outline-none p-3 text-sm resize-none", style: { borderColor: BASE.line, color: BASE.ink } })
    ] })
    ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsx("button", { onClick: onCancel, className: "px-4 py-3 rounded-full text-sm transition-all active:scale-[0.98]", style: { border: `1px solid ${BASE.line}`, color: BASE.inkDim, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041E\u0442\u043C\u0435\u043D\u0430" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: submit,
          disabled: !canSave,
          className: "flex-1 py-3 rounded-full text-sm transition-all active:scale-[0.98]",
          style: { background: accent, color: "#06120F", opacity: canSave ? 1 : 0.3, cursor: canSave ? "pointer" : "not-allowed", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, boxShadow: canSave ? softLift(accent) : "none" },
          children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C"
        }
      )
    ] })
  ] });
}
function LogMiniStat({ label, value, color }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wide mb-0.5 truncate", style: { color: BASE.inkFaint }, children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-xs truncate", style: { color: color || BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: value })
  ] });
}
function Log({ entries, onDelete, onCloseTrade, onEditTrade, accent, measureMode, currency, t }) {
  const [openId, setOpenId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const logFilters = [
    { id: "All", label: t.log.filters.All },
    { id: "Open", label: "\u041E\u0442\u043A\u0440\u044B\u0442\u044B\u0435" },
    { id: "Win", label: t.log.filters.Win },
    { id: "Loss", label: t.log.filters.Loss },
    { id: "Long", label: t.log.filters.Long },
    { id: "Short", label: t.log.filters.Short }
  ];
  const filtered = entries.filter((e) => {
    const matchesFilter = filter === "All" ? true : filter === "Open" ? !isEntryClosed(e) : filter === "Win" || filter === "Loss" ? e.outcome === filter : e.direction === filter;
    const matchesQuery = e.instrument.toLowerCase().includes(query.toLowerCase());
    return matchesFilter && matchesQuery;
  });
  const closedEntries = entries.filter(isEntryClosed);
  const winsCount = closedEntries.filter((e) => e.outcome === "Win").length;
  const lossesCount = closedEntries.filter((e) => e.outcome === "Loss").length;
  const winRate = winsCount + lossesCount > 0 ? Math.round(winsCount / (winsCount + lossesCount) * 100) : 0;
  const withR = closedEntries.filter((e) => e.r !== null && e.r !== void 0);
  const netR = withR.reduce((s, e) => s + e.r, 0);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-4 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(NotebookText, { size: 17, style: { color: accent } }),
      " ",
      t.log.title
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: t.log.totalTrades, value: entries.length, accent: BASE.ink }),
      /* @__PURE__ */ jsx(StatCard, { label: t.log.profitable, value: `${winRate}%`, accent: BASE.ink }),
      /* @__PURE__ */ jsx(StatCard, { label: `PnL (${unitSymbol(measureMode, currency)})`, value: formatResult(netR, measureMode, currency), accent: netR >= 0 ? WIN : LOSS })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 px-3 py-2 rounded-full", style: { border: `1px solid ${BASE.line}`, background: BASE.surface }, children: [
      /* @__PURE__ */ jsx(Search, { size: 13, style: { color: BASE.inkFaint } }),
      /* @__PURE__ */ jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: t.log.searchPlaceholder, className: "bg-transparent outline-none text-sm flex-1", style: { color: BASE.ink } })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-4 overflow-x-auto", children: logFilters.map((f) => /* @__PURE__ */ jsx(Pill, { active: filter === f.id, onClick: () => setFilter(f.id), accent, children: f.label }, f.id)) }),
    filtered.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: BASE.inkFaint }, children: t.log.empty }) : /* @__PURE__ */ jsx("div", { className: "space-y-2 md:space-y-0 md:grid md:grid-cols-2 md:gap-3 md:items-start xl:grid-cols-3", children: filtered.slice().reverse().map((e) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl overflow-hidden", style: { border: `1px solid ${BASE.line}` }, children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setOpenId(openId === e.id ? null : e.id), className: "w-full text-left transition-colors duration-150", style: { background: BASE.surface }, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-4 pt-3 pb-2.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: outcomeColor(e.outcome) } }),
          /* @__PURE__ */ jsx("span", { className: "text-sm truncate", style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: e.instrument }),
          /* @__PURE__ */ jsx("span", { className: "text-xs shrink-0", style: { color: BASE.inkDim }, children: DIRECTION_LABEL[e.direction] }),
          e.screenshots?.length > 0 && /* @__PURE__ */ jsx(ImagePlus, { size: 11, className: "shrink-0", style: { color: BASE.inkFaint } }),
          !isEntryClosed(e) && /* @__PURE__ */ jsx("span", { className: "text-[10px] ml-auto shrink-0 px-1.5 py-0.5 rounded-full", style: { color: accent, border: `1px solid ${accent}40` }, children: "\u041E\u0442\u043A\u0440\u044B\u0442\u0430" }),
          isEntryClosed(e) && e.r !== null && e.r !== void 0 && /* @__PURE__ */ jsx("span", { className: "text-sm ml-auto shrink-0", style: { color: outcomeColor(e.outcome), fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }, children: formatResult(e.r, measureMode, currency) }),
          /* @__PURE__ */ jsx("span", { className: "text-[11px] shrink-0", style: { color: BASE.inkFaint }, children: relTime(e.date) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-2 px-4 pb-3", children: [
          /* @__PURE__ */ jsx(LogMiniStat, { label: t.log.colEntry, value: formatPriceValue(e.entryPrice) }),
          /* @__PURE__ */ jsx(LogMiniStat, { label: t.log.colExit, value: formatPriceValue(e.exitPrice) }),
          /* @__PURE__ */ jsx(LogMiniStat, { label: t.log.colRR, value: e.rr != null ? e.rr.toFixed(1) : "\u2014" }),
          /* @__PURE__ */ jsx(LogMiniStat, { label: t.log.colResult, value: formatResult(e.r, measureMode, currency), color: e.r != null ? outcomeColor(e.outcome) : void 0 })
        ] })
      ] }),
      openId === e.id && /* @__PURE__ */ jsxs("div", { className: "tab-content px-4 py-3 space-y-3 text-sm", style: { background: BASE.bg, color: BASE.inkDim }, children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-1.5", style: { color: BASE.inkFaint }, children: "ENTRY" }),
          (e.stopLoss != null || e.takeProfit != null) && /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-xs mb-2", style: { fontFamily: "'JetBrains Mono', monospace" }, children: [
            e.stopLoss != null && /* @__PURE__ */ jsxs("span", { children: ["SL ", formatPriceValue(e.stopLoss)] }),
            e.takeProfit != null && /* @__PURE__ */ jsxs("span", { children: ["TP ", formatPriceValue(e.takeProfit)] }),
            e.plannedRR != null && /* @__PURE__ */ jsxs("span", { style: { color: accent }, children: ["\u041F\u043B\u0430\u043D 1:", e.plannedRR.toFixed(2)] })
          ] }),
          e.screenshots?.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 mb-2", children: e.screenshots.map((src, i) => /* @__PURE__ */ jsx("img", { src, alt: `\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 ${i + 1}`, className: "w-24 h-24 object-cover rounded-lg shrink-0", style: { border: `1px solid ${BASE.line}` } }, i)) }),
          /* @__PURE__ */ jsx("span", { className: "inline-block px-2 py-0.5 rounded-full text-[11px] mb-1", style: { border: `1px solid ${BASE.line}`, color: accent }, children: e.tag }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: "\u0417\u0430\u0442\u044F\u043D\u0443\u043B\u043E \u2014 " }),
            e.pull
          ] })
        ] }),
        isEntryClosed(e) && /* @__PURE__ */ jsxs("div", { className: "pt-2", style: { borderTop: `1px solid ${BASE.line}` }, children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-1.5", style: { color: BASE.inkFaint }, children: "EXIT" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 text-xs mb-2 flex-wrap", style: { fontFamily: "'JetBrains Mono', monospace" }, children: [
            e.closeType && /* @__PURE__ */ jsx("span", { children: { tp: "\u041F\u043E TP", sl: "\u041F\u043E SL", manual: "\u0412\u0440\u0443\u0447\u043D\u0443\u044E" }[e.closeType] || e.closeType }),
            e.exitPrice != null && /* @__PURE__ */ jsxs("span", { children: ["Exit ", formatPriceValue(e.exitPrice)] }),
            e.realizedRR != null && /* @__PURE__ */ jsxs("span", { style: { color: outcomeColor(e.outcome) }, children: [e.realizedRR >= 0 ? "+" : "", e.realizedRR.toFixed(2), "R"] })
          ] }),
          e.exitScreenshots?.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 mb-2", children: e.exitScreenshots.map((src, i) => /* @__PURE__ */ jsx("img", { src, alt: `\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u0432\u044B\u0445\u043E\u0434\u0430 ${i + 1}`, className: "w-24 h-24 object-cover rounded-lg shrink-0", style: { border: `1px solid ${BASE.line}` } }, i)) }),
          /* @__PURE__ */ jsxs("p", { children: [
            /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: "\u0412 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0440\u0430\u0437 \u2014 " }),
            e.lesson
          ] })
        ] }),
        !isEntryClosed(e) && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onCloseTrade(e.id),
            className: "flex items-center gap-1.5 text-xs pt-1",
            style: { color: accent },
            children: [/* @__PURE__ */ jsx(ChevronRight, { size: 12 }), " \u0417\u0430\u043A\u0440\u044B\u0442\u044C \u0441\u0434\u0435\u043B\u043A\u0443"]
          }
        ),
        isEntryClosed(e) && /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => onEditTrade(e.id),
            className: "flex items-center gap-1.5 text-xs pt-1",
            style: { color: accent },
            children: [/* @__PURE__ */ jsx(PenLine, { size: 12 }), " \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"]
          }
        ),
        confirmId === e.id ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 pt-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: BASE.inkFaint }, children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E?" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            onDelete(e.id);
            setConfirmId(null);
          }, className: "text-xs", style: { color: LOSS }, children: "\u0414\u0430, \u0443\u0434\u0430\u043B\u0438\u0442\u044C" }),
          /* @__PURE__ */ jsx("button", { onClick: () => setConfirmId(null), className: "text-xs", style: { color: BASE.inkFaint }, children: "\u041E\u0442\u043C\u0435\u043D\u0430" })
        ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setConfirmId(e.id), className: "flex items-center gap-1.5 text-xs pt-1", style: { color: LOSS }, children: [
          /* @__PURE__ */ jsx(Trash2, { size: 12 }),
          " \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C"
        ] })
      ] })
    ] }, e.id)) })
  ] });
}
function StatCard({ label, value, accent }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 rounded-xl px-3 py-3", style: { border: `1px solid ${BASE.line}`, background: BASE.surface }, children: [
    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-1", style: { color: BASE.inkFaint }, children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-lg", style: { color: accent, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }, children: value })
  ] });
}
function TagBars({ data, measureMode, currency }) {
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.avgR)), 0.1);
  return /* @__PURE__ */ jsx("div", { className: "space-y-3", children: data.map((d) => {
    const positive = d.avgR >= 0;
    const width = Math.max(4, Math.abs(d.avgR) / maxAbs * 100);
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink }, children: d.tag }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
          formatResult(d.avgR, measureMode, currency),
          " \xB7 ",
          d.count,
          " \u0441\u0434."
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-500 ease-out", style: { width: `${width}%`, background: positive ? WIN : LOSS } }) })
    ] }, d.tag);
  }) });
}
function CalendarView({ entries, accent, measureMode, currency }) {
  const [viewMonth, setViewMonth] = useState(() => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => {
      const key = e.date.toDateString();
      (map[key] = map[key] || []).push(e);
    });
    return map;
  }, [entries]);
  const cells = useMemo(() => {
    const year = viewMonth.getFullYear(), month = viewMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d));
    return arr;
  }, [viewMonth]);
  const dayColor = (date) => {
    const dayEntries = entriesByDate[date.toDateString()];
    if (!dayEntries?.length) return null;
    const netR = dayEntries.reduce((s, e) => s + (e.r || 0), 0);
    if (netR > 0) return WIN;
    if (netR < 0) return LOSS;
    return BASE.inkDim;
  };
  const selectedEntries = selectedDate ? entriesByDate[selectedDate.toDateString()] || [] : [];
  const selectedNet = selectedEntries.reduce((s, e) => s + (e.r || 0), 0);
  const daySummary = useMemo(() => calculateCalendarStats(selectedEntries, selectedEntries.filter(isEntryClosed)), [selectedEntries]);
  const monthLabel = viewMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  const weekdayLabels = ["\u041F\u043D", "\u0412\u0442", "\u0421\u0440", "\u0427\u0442", "\u041F\u0442", "\u0421\u0431", "\u0412\u0441"];
  const changeMonth = (delta) => {
    setSelectedDate(null);
    setViewMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "tab-content max-w-md mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => changeMonth(-1), className: "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90", style: { border: `1px solid ${BASE.line}` }, children: /* @__PURE__ */ jsx(ChevronLeft, { size: 14, style: { color: BASE.inkDim } }) }),
      /* @__PURE__ */ jsx("span", { className: "text-sm capitalize", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: monthLabel }),
      /* @__PURE__ */ jsx("button", { onClick: () => changeMonth(1), className: "w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-150 active:scale-90", style: { border: `1px solid ${BASE.line}` }, children: /* @__PURE__ */ jsx(ChevronRight, { size: 14, style: { color: BASE.inkDim } }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1.5 mb-1", children: weekdayLabels.map((w) => /* @__PURE__ */ jsx("div", { className: "text-center text-[10px]", style: { color: BASE.inkFaint }, children: w }, w)) }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 gap-1.5 mb-4", children: cells.map((date, i) => {
      if (!date) return /* @__PURE__ */ jsx("div", {}, i);
      const color = dayColor(date);
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      const isTodayCell = date.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
      return /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setSelectedDate(date),
          className: "aspect-square rounded-lg flex items-center justify-center text-xs transition-all duration-150 active:scale-90",
          style: {
            background: color ? `${color}18` : BASE.surface,
            border: `1px solid ${isSelected ? accent : color ? color + "50" : BASE.line}`,
            color: color || BASE.inkDim,
            boxShadow: isTodayCell ? `0 0 0 1px ${accent}60 inset` : "none"
          },
          children: date.getDate()
        },
        i
      );
    }) }),
    selectedDate ? /* @__PURE__ */ jsxs(Card, { accent, glowing: selectedEntries.length > 0, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: selectedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) }),
        selectedEntries.length > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: selectedNet >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(selectedNet, measureMode, currency) })
      ] }),
      selectedEntries.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: BASE.inkFaint }, children: "\u0421\u0434\u0435\u043B\u043E\u043A \u0432 \u044D\u0442\u043E\u0442 \u0434\u0435\u043D\u044C \u043D\u0435 \u0431\u044B\u043B\u043E." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 mb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg px-2 py-2 text-center", style: { background: BASE.surface2, border: `1px solid ${BASE.line}` }, children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: "\u0421\u0434\u0435\u043B\u043E\u043A" }),
            /* @__PURE__ */ jsx("div", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: selectedEntries.length })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg px-2 py-2 text-center", style: { background: BASE.surface2, border: `1px solid ${BASE.line}` }, children: [
            /* @__PURE__ */ jsx("div", { className: "text-[9px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: "W / L / BE" }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: [
              daySummary.wins,
              "/",
              daySummary.losses,
              "/",
              daySummary.breakevens
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg px-2 py-2 text-center", style: { background: BASE.surface2, border: `1px solid ${BASE.line}` }, children: [
            /* @__PURE__ */ jsxs("div", { className: "text-[9px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: [
              "\u0421\u0440. ",
              unitSymbol(measureMode, currency)
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-sm", style: { color: daySummary.avgR >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(daySummary.avgR, measureMode, currency) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 mb-3 text-xs", children: [
          daySummary.topInstrument && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442" }),
            /* @__PURE__ */ jsxs("span", { style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: [
              daySummary.topInstrument.value,
              daySummary.topInstrument.count > 1 ? ` \xD7${daySummary.topInstrument.count}` : ""
            ] })
          ] }),
          daySummary.topTag && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: "\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0441\u0435\u0442\u0430\u043F" }),
            /* @__PURE__ */ jsxs("span", { style: { color: BASE.ink }, children: [
              daySummary.topTag.value,
              daySummary.topTag.count > 1 ? ` \xD7${daySummary.topTag.count}` : ""
            ] })
          ] }),
          daySummary.mood && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: "\u042D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0444\u043E\u043D" }),
            /* @__PURE__ */ jsx("span", { style: { color: daySummary.moodColor }, children: daySummary.mood })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-3 space-y-2", style: { borderTop: `1px solid ${BASE.line}` }, children: selectedEntries.map((e) => /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full shrink-0", style: { background: outcomeColor(e.outcome) } }),
            /* @__PURE__ */ jsx("span", { style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: e.instrument }),
            /* @__PURE__ */ jsx("span", { style: { color: BASE.inkDim }, children: DIRECTION_LABEL[e.direction] }),
            !isEntryClosed(e) && /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0 text-[10px]", style: { color: BASE.inkFaint }, children: "\u041E\u0442\u043A\u0440\u044B\u0442\u0430" }),
            isEntryClosed(e) && e.r !== null && e.r !== void 0 && /* @__PURE__ */ jsx("span", { className: "ml-auto shrink-0", style: { color: outcomeColor(e.outcome), fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(e.r, measureMode, currency) })
          ] }),
          e.lesson && e.lesson !== "\u2014" && /* @__PURE__ */ jsx("p", { className: "text-xs pl-3.5 mt-0.5", style: { color: BASE.inkFaint }, children: e.lesson })
        ] }, e.id)) })
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-center", style: { color: BASE.inkFaint }, children: "\u041D\u0430\u0436\u043C\u0438 \u043D\u0430 \u0447\u0438\u0441\u043B\u043E, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u0441\u0432\u043E\u0434\u043A\u0443 \u0437\u0430 \u0434\u0435\u043D\u044C." })
  ] });
}
function Patterns({ entries, accent, measureMode, currency, analytics, t, lang }) {
  const [view, setView] = useState("emotions");
  const [reviewOpen, setReviewOpen] = useState(false);
  const closedEntries = useMemo(() => entries.filter(isEntryClosed), [entries]);
  const grouped = useMemo(() => {
    const g = { Win: [], Loss: [], Breakeven: [] };
    closedEntries.forEach((e) => g[e.outcome]?.push(e));
    return g;
  }, [closedEntries]);
  const winRate = grouped.Win.length + grouped.Loss.length > 0 ? Math.round(grouped.Win.length / (grouped.Win.length + grouped.Loss.length) * 100) : 0;
  const withR = closedEntries.filter((e) => e.r !== null && e.r !== void 0);
  const avgR = withR.length ? withR.reduce((s, e) => s + e.r, 0) / withR.length : null;
  const traderPatterns = useMemo(() => analyzeTraderPatterns(closedEntries, lang), [closedEntries, lang]);
  const insight = useMemo(() => {
    if (grouped.Win.length < 2 || grouped.Loss.length < 2) return t.pattern.needMoreEntries;
    if (analytics.insights.length) return analytics.insights[0].text;
    if (traderPatterns.available) return t.pattern.noPatternYetLong;
    return t.pattern.accumulating(traderPatterns.needed - traderPatterns.sampleSize);
  }, [grouped, traderPatterns, analytics, t]);
  const equityCurve = useMemo(() => {
    const sorted = [...withR].sort((a, b) => a.date - b.date);
    let cum = 0;
    return sorted.map((e) => {
      cum += e.r;
      return { ...e, cum, dateLabel: e.date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) };
    });
  }, [withR]);
  const tagStats = useMemo(() => {
    const stats = {};
    withR.forEach((e) => {
      stats[e.tag] = stats[e.tag] || { count: 0, sumR: 0 };
      stats[e.tag].count += 1;
      stats[e.tag].sumR += e.r;
    });
    return Object.entries(stats).map(([tag, s]) => ({ tag, avgR: s.sumR / s.count, count: s.count })).sort((a, b) => b.avgR - a.avgR);
  }, [withR]);
  const planVsFact = useMemo(() => {
    const withPlan = closedEntries.filter((e) => typeof e.plannedRR === "number" && typeof e.realizedRR === "number");
    if (withPlan.length < 3) return null;
    const avgPlanned = st_mean(withPlan.map((e) => e.plannedRR));
    const avgRealized = st_mean(withPlan.map((e) => e.realizedRR));
    const captures = withPlan.filter((e) => e.plannedRR > 0).map((e) => Math.max(0, Math.min(1, e.realizedRR / e.plannedRR)));
    const captureRatio = captures.length ? st_mean(captures) * 100 : null;
    const closeCounts = { tp: 0, sl: 0, manual: 0 };
    closedEntries.forEach((e) => {
      if (e.closeType && closeCounts[e.closeType] != null) closeCounts[e.closeType]++;
    });
    const closeTotal = closeCounts.tp + closeCounts.sl + closeCounts.manual;
    return { count: withPlan.length, avgPlanned, avgRealized, captureRatio, closeCounts, closeTotal };
  }, [closedEntries]);
  const EquityTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const e = payload[0].payload;
    return /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 rounded-lg text-xs", style: { background: BASE.surface2, border: `1px solid ${BASE.line}`, color: BASE.ink }, children: [
      /* @__PURE__ */ jsxs("div", { style: { color: BASE.inkFaint }, children: [
        e.dateLabel,
        " \xB7 ",
        e.instrument
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { fontFamily: "'JetBrains Mono', monospace" }, children: [
        "\u0418\u0442\u043E\u0433\u043E: ",
        formatResult(e.cum, measureMode, currency)
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { color: outcomeColor(e.outcome) }, children: [
        formatResult(e.r, measureMode, currency),
        " \u0437\u0430 \u044D\u0442\u0443 \u0441\u0434\u0435\u043B\u043A\u0443"
      ] })
    ] });
  };
  const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const e = payload[0].payload;
    return /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 rounded-lg text-xs", style: { background: BASE.surface2, border: `1px solid ${BASE.line}`, color: BASE.ink }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontFamily: "'JetBrains Mono', monospace" }, children: e.instrument }),
      /* @__PURE__ */ jsxs("div", { style: { color: outcomeColor(e.outcome) }, children: [
        OUTCOME_LABEL[e.outcome],
        e.r !== null && e.r !== void 0 ? ` \xB7 ${formatResult(e.r, measureMode, currency)}` : ""
      ] })
    ] });
  };
  if (reviewOpen) {
    return /* @__PURE__ */ jsx(JournalReview, { entries: closedEntries, accent, onClose: () => setReviewOpen(false), t, lang });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-4 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(LineChartIcon, { size: 17, style: { color: accent } }),
      " \u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsx(StatCard, { label: "\u0421\u0434\u0435\u043B\u043A\u0438", value: entries.length, accent: BASE.ink }),
      /* @__PURE__ */ jsx(StatCard, { label: "\u0412\u0438\u043D\u0440\u0435\u0439\u0442", value: `${winRate}%`, accent }),
      /* @__PURE__ */ jsx(StatCard, { label: "\u0421\u0440\u0435\u0434\u043D\u0438\u0439 RR", value: analytics.rrStats?.avgRealizedRR != null ? `${analytics.rrStats.avgRealizedRR >= 0 ? "+" : ""}${analytics.rrStats.avgRealizedRR}R` : "\u2014", accent: BASE.ink })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-5", children: [
      /* @__PURE__ */ jsx(Pill, { active: view === "emotions", onClick: () => setView("emotions"), accent, children: "\u042D\u043C\u043E\u0446\u0438\u0438" }),
      /* @__PURE__ */ jsx(Pill, { active: view === "performance", onClick: () => setView("performance"), accent, children: "\u0414\u0438\u043D\u0430\u043C\u0438\u043A\u0430" }),
      /* @__PURE__ */ jsx(Pill, { active: view === "calendar", onClick: () => setView("calendar"), accent, children: "\u041A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C" })
    ] }),
    view === "calendar" && /* @__PURE__ */ jsx(CalendarView, { entries, accent, measureMode, currency }),
    view === "emotions" && /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
      /* @__PURE__ */ jsxs(Card, { accent, glowing: true, className: "mb-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 text-[11px]", style: { color: BASE.inkDim, fontFamily: "'Space Grotesk', sans-serif" }, children: [
            /* @__PURE__ */ jsx(Sparkles, { size: 12, style: { color: accent } }),
            " \u0427\u0442\u043E \u0433\u043E\u0432\u043E\u0440\u0438\u0442 \u0436\u0443\u0440\u043D\u0430\u043B"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setReviewOpen(true),
              className: "shrink-0 px-2.5 py-1 rounded-full text-[10.5px] transition-all duration-150 active:scale-95",
              style: { color: accent, border: `1px solid ${accent}40`, background: `${accent}0F`, fontFamily: "'Space Grotesk', sans-serif" },
              children: "\u0420\u0430\u0437\u0431\u043E\u0440"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.ink }, children: insight })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-wrap text-[10px] mb-6", style: { color: BASE.inkFaint }, children: [
        analytics.awareness.score.value != null && /* @__PURE__ */ jsxs("span", { children: [
          t.home.awareness,
          " ",
          analytics.awareness.score.value,
          "%",
          TREND_ARROW[analytics.awareness.trend] || ""
        ] }),
        analytics.discipline.score.value != null && /* @__PURE__ */ jsxs("span", { children: [
          "\xB7 ",
          t.home.discipline,
          " ",
          analytics.discipline.score.value,
          "%",
          TREND_ARROW[analytics.discipline.trend] || ""
        ] }),
        analytics.risk.stability.value != null && /* @__PURE__ */ jsxs("span", { children: [
          "\xB7 ",
          t.home.riskStability,
          " ",
          analytics.risk.stability.value,
          "%",
          TREND_ARROW[analytics.risk.stability.trend] || ""
        ] }),
        analytics.reflection.score.value != null && /* @__PURE__ */ jsxs("span", { children: [
          "\xB7 ",
          t.home.reflection,
          " ",
          analytics.reflection.score.value,
          "%",
          TREND_ARROW[analytics.reflection.trend] || ""
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 300 }, children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(ScatterChart, { margin: { top: 10, right: 20, bottom: 20, left: 0 }, children: [
        /* @__PURE__ */ jsx(CartesianGrid, { stroke: BASE.line }),
        /* @__PURE__ */ jsx(
          XAxis,
          {
            type: "number",
            dataKey: "x",
            domain: [0, 100],
            tick: { fill: BASE.inkFaint, fontSize: 11 },
            stroke: BASE.line,
            label: { value: "\u0421\u0442\u0440\u0430\u0445  \u2192  \u0423\u0432\u0435\u0440\u0435\u043D\u043D\u043E\u0441\u0442\u044C", position: "insideBottom", offset: -10, fill: BASE.inkFaint, fontSize: 11 }
          }
        ),
        /* @__PURE__ */ jsx(
          YAxis,
          {
            type: "number",
            dataKey: "y",
            domain: [0, 100],
            reversed: true,
            tick: { fill: BASE.inkFaint, fontSize: 11 },
            stroke: BASE.line,
            label: { value: "\u041D\u0430 \u043D\u0435\u0440\u0432\u0430\u0445  \u2192  \u0421\u043F\u043E\u043A\u043E\u0435\u043D", angle: -90, position: "insideLeft", fill: BASE.inkFaint, fontSize: 11 }
          }
        ),
        /* @__PURE__ */ jsx(ZAxis, { range: [90, 90] }),
        /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(ChartTooltip, {}), cursor: { stroke: BASE.line } }),
        /* @__PURE__ */ jsx(Scatter, { data: entries, isAnimationActive: true, animationDuration: 600, children: entries.map((e) => /* @__PURE__ */ jsx(Cell, { fill: outcomeColor(e.outcome) }, e.id)) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-5 mt-2 justify-center", children: ["Win", "Loss", "Breakeven"].map((o) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full", style: { background: outcomeColor(o) } }),
        /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: BASE.inkFaint }, children: OUTCOME_LABEL[o] })
      ] }, o)) })
    ] }),
    view === "performance" && /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-2 flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041A\u0440\u0438\u0432\u0430\u044F \u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u0438" }),
        equityCurve.length > 0 && /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: equityCurve[equityCurve.length - 1].cum >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: formatResult(equityCurve[equityCurve.length - 1].cum, measureMode, currency) })
      ] }),
      equityCurve.length < 2 ? /* @__PURE__ */ jsx("p", { className: "text-sm mb-6", style: { color: BASE.inkFaint }, children: "\u0414\u043E\u0431\u0430\u0432\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0445\u043E\u0442\u044F \u0431\u044B \u043A \u043F\u0430\u0440\u0435 \u0441\u0434\u0435\u043B\u043E\u043A, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043A\u0440\u0438\u0432\u0443\u044E \u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0441\u0442\u0438 \u0432\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438." }) : /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 220 }, className: "mb-6", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(AreaChart, { data: equityCurve, margin: { top: 10, right: 10, bottom: 0, left: -10 }, children: [
        /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsxs("linearGradient", { id: "eqGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: accent, stopOpacity: 0.3 }),
          /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: accent, stopOpacity: 0 })
        ] }) }),
        /* @__PURE__ */ jsx(CartesianGrid, { stroke: BASE.line, vertical: false }),
        /* @__PURE__ */ jsx(XAxis, { dataKey: "dateLabel", tick: { fill: BASE.inkFaint, fontSize: 10 }, stroke: BASE.line }),
        /* @__PURE__ */ jsx(YAxis, { tick: { fill: BASE.inkFaint, fontSize: 10 }, stroke: BASE.line, width: 32 }),
        /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(EquityTooltip, {}), cursor: { stroke: BASE.line } }),
        /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "cum", stroke: accent, strokeWidth: 2, fill: "url(#eqGrad)", dot: { r: 3, fill: accent, strokeWidth: 0 }, isAnimationActive: true, animationDuration: 700 })
      ] }) }) }),
      /* @__PURE__ */ jsx("span", { className: "text-sm block mb-3", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043F\u043E \u0442\u0438\u043F\u0443 \u0441\u0435\u0442\u0430\u043F\u0430" }),
      /* @__PURE__ */ jsxs("div", { className: "lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start", children: [
      tagStats.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm lg:col-span-2", style: { color: BASE.inkFaint }, children: "\u0414\u043E\u0431\u0430\u0432\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043A \u0441\u0434\u0435\u043B\u043A\u0430\u043C, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C, \u043A\u0430\u043A\u0438\u0435 \u0441\u0435\u0442\u0430\u043F\u044B \u0440\u0435\u0430\u043B\u044C\u043D\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0442." }) : /* @__PURE__ */ jsx(Card, { className: "mb-6", children: /* @__PURE__ */ jsx(TagBars, { data: tagStats, measureMode, currency }) }),
      analytics.rrStats && analytics.rrStats.sampleSize > 0 && /* @__PURE__ */ jsxs(Card, { className: "mb-6", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm block mb-3", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: "Average RR \u0438 Win Rate" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(StatCard, { label: "Average RR", value: analytics.rrStats.avgRealizedRR != null ? `${analytics.rrStats.avgRealizedRR >= 0 ? "+" : ""}${analytics.rrStats.avgRealizedRR}R` : "\u2014", accent: analytics.rrStats.avgRealizedRR != null ? analytics.rrStats.avgRealizedRR >= 0 ? WIN : LOSS : BASE.ink }),
          /* @__PURE__ */ jsx(StatCard, { label: "Win Rate", value: analytics.rrStats.winRate != null ? `${analytics.rrStats.winRate}%` : "\u2014", accent: BASE.ink })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3 text-[11px]", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
          /* @__PURE__ */ jsxs("span", { children: ["Wins ", analytics.rrStats.wins] }),
          /* @__PURE__ */ jsxs("span", { children: ["Losses ", analytics.rrStats.losses] }),
          /* @__PURE__ */ jsxs("span", { children: ["Breakeven ", analytics.rrStats.breakevens] })
        ] })
      ] }),
      planVsFact && /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm block mb-3", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041F\u043B\u0430\u043D vs \u0424\u0430\u043A\u0442" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-3", children: [
          /* @__PURE__ */ jsx(StatCard, { label: "\u0421\u0440. Planned RR", value: `${planVsFact.avgPlanned.toFixed(1)}R`, accent: BASE.ink }),
          /* @__PURE__ */ jsx(StatCard, { label: "\u0421\u0440. Realized RR", value: `${planVsFact.avgRealized.toFixed(1)}R`, accent: planVsFact.avgRealized >= 0 ? WIN : LOSS }),
          planVsFact.captureRatio != null && /* @__PURE__ */ jsx(StatCard, { label: "TP Capture", value: `${Math.round(planVsFact.captureRatio)}%`, accent: BASE.ink })
        ] }),
        planVsFact.closeTotal > 0 && /* @__PURE__ */ jsxs("div", { className: "flex gap-3 text-[11px]", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
          /* @__PURE__ */ jsxs("span", { children: ["TP ", Math.round(planVsFact.closeCounts.tp / planVsFact.closeTotal * 100), "%"] }),
          /* @__PURE__ */ jsxs("span", { children: ["SL ", Math.round(planVsFact.closeCounts.sl / planVsFact.closeTotal * 100), "%"] }),
          /* @__PURE__ */ jsxs("span", { children: ["Manual ", Math.round(planVsFact.closeCounts.manual / planVsFact.closeTotal * 100), "%"] })
        ] })
      ] })
      ] })
    ] })
  ] });
}
function ChallengeCard({ icon: Icon, title, desc, progress, goal, accent }) {
  const pct = Math.min(100, Math.round(progress / goal * 100));
  const completed = progress >= goal;
  return /* @__PURE__ */ jsxs(Card, { accent, glowing: completed, className: "mb-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-7 h-7 rounded-full flex items-center justify-center shrink-0", style: { background: completed ? `${accent}14` : BASE.surface2, border: `1px solid ${completed ? accent + "40" : BASE.line}` }, children: /* @__PURE__ */ jsx(Icon, { size: 13, style: { color: completed ? accent : BASE.inkDim } }) }),
        /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: title })
      ] }),
      completed && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full", style: { color: accent, border: `1px solid ${accent}40` }, children: [
        /* @__PURE__ */ jsx(Check, { size: 10 }),
        " \u0413\u043E\u0442\u043E\u0432\u043E"
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs mb-2.5", style: { color: BASE.inkFaint }, children: desc }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 h-1 rounded-full", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-700 ease-out", style: { width: `${pct}%`, background: completed ? accent : BASE.inkDim } }) }),
      /* @__PURE__ */ jsxs("span", { className: "text-[11px] shrink-0", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
        Math.min(progress, goal),
        "/",
        goal
      ] })
    ] })
  ] });
}
function Challenge({ entries, accent, weeklyGoal, t, lang }) {
  const { streak, week } = useStreak(entries, lang);
  const daysThisWeek = week.filter((d) => d.filled).length;
  const pct = Math.min(100, Math.round(daysThisWeek / weeklyGoal * 100));
  const animatedStreak = Math.round(useAnimatedNumber(streak));
  const CHALLENGE_ICONS = { revenge: ShieldCheck, reflect: PenLine, winstreak: TrendingUp };
  const challenges = useMemo(() => calculateChallengeProgress(entries, lang), [entries, lang]);
  return /* @__PURE__ */ jsxs("div", { className: "stagger", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-5 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(Flame, { size: 17, style: { color: "#D98A4A" } }),
      " ",
      t.challenge.title
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:columns-2 lg:gap-4", children: [
    /* @__PURE__ */ jsxs(Card, { accent, glowing: true, className: "mb-4 text-center py-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-4xl mb-1", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 500 }, children: animatedStreak }),
      /* @__PURE__ */ jsx("div", { className: "text-xs uppercase tracking-wide", style: { color: BASE.inkFaint }, children: t.challenge.daysInARow })
    ] }),
    /* @__PURE__ */ jsx(ChallengeCard, { icon: CalendarCheck, title: t.challenge.weeklyConsistency, desc: t.challenge.weeklyConsistencyDesc(weeklyGoal), progress: daysThisWeek, goal: weeklyGoal, accent }),
    challenges.map((c) => /* @__PURE__ */ jsx(ChallengeCard, { icon: CHALLENGE_ICONS[c.id], title: c.title, desc: c.desc, progress: c.progress, goal: c.goal, accent }, c.id)),
    /* @__PURE__ */ jsxs(Card, { className: "mt-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: t.challenge.thisWeek }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs", style: { color: BASE.inkFaint }, children: [
          daysThisWeek,
          "/",
          weeklyGoal
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full mb-4", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-700 ease-out", style: { width: `${pct}%`, background: accent } }) }),
      /* @__PURE__ */ jsx(WeekDots, { week, accent })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed break-inside-avoid", style: { color: BASE.inkFaint }, children: t.challenge.footer })
    ] })
  ] });
}
function CalibrationRing({ pct, color, size = 172 }) {
  const animated = useAnimatedNumber(pct, 1100);
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - animated / 100);
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, children: [
    /* @__PURE__ */ jsx("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: BASE.line, strokeWidth: "9" }),
    /* @__PURE__ */ jsx(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: "none",
        stroke: color,
        strokeWidth: "9",
        strokeLinecap: "round",
        strokeDasharray: circumference,
        strokeDashoffset: offset,
        style: { transform: "rotate(-90deg)", transformOrigin: "50% 50%" }
      }
    ),
    /* @__PURE__ */ jsxs("text", { x: "50%", y: "50%", textAnchor: "middle", dy: "0.35em", fill: BASE.ink, fontSize: "30", fontFamily: "'Space Grotesk', sans-serif", fontWeight: "600", children: [
      Math.round(animated),
      "%"
    ] })
  ] });
}
function Calibration({ accent, onComplete, lang, t, entries, analytics, userId }) {
  const [stage, setStage] = useState("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState(() => (lang === "en" ? CALIBRATION_QUESTIONS_EN : CALIBRATION_QUESTIONS).map((q) => ({ ...q, category: "baseline", source: "baseline" })));
  const [adaptiveActive, setAdaptiveActive] = useState(false);
  const historyRef = useRef([]);
  const q = questions[qIndex];
  // Runs only on explicit "Start" tap (never on render/state change, matching the Coach tab's
  // request rule). Cache: if a set was already generated today, reuse it instead of calling
  // Gemini again. Falls back through: Gemini adaptive -> local factor-based fallback questions ->
  // the original static 6-question CALIBRATION_QUESTIONS set, so this screen can never break.
  const prepareAndStart = async () => {
    setStage("loading");
    try {
      const history = await caLoadCalibrationHistory(userId);
      historyRef.current = history;
      const todayKey = (/* @__PURE__ */ new Date()).toDateString();
      const cached = history[0] && new Date(history[0].date).toDateString() === todayKey ? history[0] : null;
      // Guard against a same-day cache record saved by an older version of this code path that
      // didn't persist `options` (would otherwise crash the quiz render on `q.options.map`).
      // Any such stale/malformed record is treated as a cache miss and a fresh set is generated.
      const cachedValid = cached && Array.isArray(cached.questions) && cached.questions.length && cached.questions.every((qq) => Array.isArray(qq.options) && qq.options.length);
      if (cachedValid) {
        setQuestions(cached.questions);
        setAdaptiveActive(cached.questions.some((qq) => qq.category === "adaptive"));
        setStage("quiz");
        return;
      }
      const factors = caComputeAdaptiveFactors(entries, analytics, history, lang);
      let adaptiveQuestions = [];
      if (factors.length) {
        try {
          const context = caBuildContext(entries, analytics, factors, history, lang);
          adaptiveQuestions = await aiGenerateCalibrationQuestions(context);
        } catch (e) {
          adaptiveQuestions = [];
        }
        if (!adaptiveQuestions.length) adaptiveQuestions = caLocalFallbackQuestions(factors, lang);
      }
      const finalQuestions = assembleCalibrationQuestions(adaptiveQuestions, lang);
      setQuestions(finalQuestions);
      setAdaptiveActive(adaptiveQuestions.length > 0);
    } catch (e) {
      setQuestions((lang === "en" ? CALIBRATION_QUESTIONS_EN : CALIBRATION_QUESTIONS).map((qq) => ({ ...qq, category: "baseline", source: "baseline" })));
      setAdaptiveActive(false);
    } finally {
      setStage("quiz");
    }
  };
  const selectAnswer = (option) => {
    const next = { ...answers, [q.id]: option };
    setAnswers(next);
    setTimeout(() => {
      if (qIndex + 1 < questions.length) {
        setQIndex(qIndex + 1);
      } else {
        const r = scoreCalibrationDynamic(questions, next, lang);
        setResult(r);
        onComplete({ pct: r.pct, tierColor: r.tier.color, date: (/* @__PURE__ */ new Date()).toISOString(), riskFactors: r.riskFactors });
        const record = {
          date: (/* @__PURE__ */ new Date()).toISOString(),
          questions: questions.map((qq) => ({ id: qq.id, text: qq.text, factor: qq.factor || null, category: qq.category, source: qq.source, options: qq.options })),
          answers: next,
          pct: r.pct,
          riskFactors: r.riskFactors
        };
        caSaveCalibrationHistory(userId, [record, ...historyRef.current]);
        setStage("result");
      }
    }, 200);
  };
  const restart = () => {
    setStage("intro");
    setQIndex(0);
    setAnswers({});
    setResult(null);
  };
  if (stage === "intro") {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-4 stagger", children: [
      /* @__PURE__ */ jsx(Gauge, { size: 38, style: { color: accent }, className: "mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl mb-2 tracking-wide", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: t.calibration.heading }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-6", style: { color: BASE.inkDim }, children: t.calibration.subtitle }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed mb-8 px-2", style: { color: BASE.inkFaint }, children: t.calibration.intro }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: prepareAndStart,
          className: "px-10 py-3 rounded-full text-sm transition-all active:scale-95",
          style: { background: accent, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, boxShadow: softLift(accent) },
          children: t.calibration.start
        }
      )
    ] });
  }
  if (stage === "loading") {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx(LogoSpinner, { size: 26, accent }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: BASE.inkFaint }, children: t.calibration.loading })
    ] });
  }
  if (stage === "quiz") {
    if (!q || !Array.isArray(q.options) || !q.options.length) {
      return /* @__PURE__ */ jsxs("div", { className: "text-center py-16", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm mb-4", style: { color: BASE.inkFaint }, children: t.coach.error }),
        /* @__PURE__ */ jsx("button", { onClick: restart, className: "text-sm", style: { color: accent }, children: t.calibration.restart })
      ] });
    }
    return /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2 text-xs", style: { color: BASE.inkFaint }, children: [
        /* @__PURE__ */ jsx("span", { children: t.calibration.questionOf(qIndex + 1, questions.length) }),
        /* @__PURE__ */ jsx("button", { onClick: restart, style: { color: BASE.inkFaint }, children: t.calibration.cancel })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full mb-6", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-500 ease-out", style: { width: `${qIndex / questions.length * 100}%`, background: accent } }) }),
      qIndex === 0 && adaptiveActive && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-4 text-[11px]", style: { color: accent }, children: [
        /* @__PURE__ */ jsx(Sparkles, { size: 11 }),
        t.calibration.adaptiveNote
      ] }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg mb-5 leading-snug", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 500 }, children: q.text }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: q.options.map((opt) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => selectAnswer(opt),
          className: "text-left px-4 py-3.5 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]",
          style: { border: `1px solid ${answers[q.id] === opt ? accent : BASE.line}`, background: answers[q.id] === opt ? `${accent}12` : BASE.surface, color: BASE.ink },
          children: opt.label
        },
        opt.label
      )) })
    ] }, qIndex);
  }
  return /* @__PURE__ */ jsxs("div", { className: "text-center stagger", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx(CalibrationRing, { pct: result.pct, color: result.tier.color }) }),
    /* @__PURE__ */ jsx("p", { className: "text-base mb-6 px-2 leading-relaxed", style: { color: result.tier.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: result.tier.label }),
    result.riskFactors.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "mb-4 text-left", style: { border: `1px solid ${LOSS}50`, background: `${LOSS}0D` }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 14, style: { color: LOSS } }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wide", style: { color: LOSS }, children: t.calibration.mainRiskFactor })
      ] }),
      result.riskFactors.map((f, i) => /* @__PURE__ */ jsx("p", { className: "text-sm", style: { color: BASE.ink }, children: f }, i))
    ] }),
    result.factors.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "text-left mb-4", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.calibration.whatInfluenced }),
      result.factors.map((f, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm py-1", children: [
        /* @__PURE__ */ jsx("span", { style: { color: f.type === "positive" ? WIN : WARN }, children: f.type === "positive" ? "\u2713" : "\u26A0" }),
        /* @__PURE__ */ jsx("span", { style: { color: BASE.ink }, children: f.text })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsx("button", { onClick: restart, className: "text-sm transition-opacity duration-150", style: { color: BASE.inkFaint }, children: t.calibration.restart })
  ] });
}
function JournalReview({ entries, accent, onClose, t, lang }) {
  const issues = useMemo(() => buildReviewQuiz(entries, lang), [entries, lang]);
  const likert = lang === "en" ? REVIEW_LIKERT_EN : REVIEW_LIKERT;
  const [stage, setStage] = useState("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const q = issues[qIndex];
  const selectAnswer = (opt) => {
    const next = { ...answers, [q.id]: opt };
    setAnswers(next);
    setTimeout(() => {
      if (qIndex + 1 < issues.length) {
        setQIndex(qIndex + 1);
      } else {
        setResult(scoreJournalReview(issues, next, lang));
        setStage("result");
      }
    }, 200);
  };
  const restart = () => {
    setStage("intro");
    setQIndex(0);
    setAnswers({});
    setResult(null);
  };
  if (issues.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-4 stagger", children: [
      /* @__PURE__ */ jsx(Sparkles, { size: 38, style: { color: accent }, className: "mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl mb-2 tracking-wide", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: t.review.heading }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-8 px-4 leading-relaxed", style: { color: BASE.inkFaint }, children: t.review.notEnough }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-10 py-3 rounded-full text-sm transition-all active:scale-95",
          style: { background: accent, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, boxShadow: softLift(accent) },
          children: t.review.back
        }
      )
    ] });
  }
  if (stage === "intro") {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-4 stagger", children: [
      /* @__PURE__ */ jsx(Sparkles, { size: 38, style: { color: accent }, className: "mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl mb-2 tracking-wide", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: t.review.heading }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-6", style: { color: BASE.inkDim }, children: t.review.questionsCount(issues.length) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed mb-8 px-2", style: { color: BASE.inkFaint }, children: t.review.intro }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setStage("quiz"),
          className: "px-10 py-3 rounded-full text-sm transition-all active:scale-95",
          style: { background: accent, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, boxShadow: softLift(accent) },
          children: t.calibration.start
        }
      ),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "block mx-auto mt-4 text-sm", style: { color: BASE.inkFaint }, children: t.review.back })
    ] });
  }
  if (stage === "quiz") {
    return /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2 text-xs", style: { color: BASE.inkFaint }, children: [
        /* @__PURE__ */ jsx("span", { children: t.calibration.questionOf(qIndex + 1, issues.length) }),
        /* @__PURE__ */ jsx("button", { onClick: onClose, style: { color: BASE.inkFaint }, children: t.calibration.cancel })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full mb-6", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-500 ease-out", style: { width: `${qIndex / issues.length * 100}%`, background: accent } }) }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] uppercase tracking-wide mb-2", style: { color: BASE.inkFaint }, children: q.title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed mb-4", style: { color: BASE.inkDim }, children: q.evidence }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg mb-5 leading-snug", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 500 }, children: q.question }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: likert.map((opt) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => selectAnswer(opt),
          className: "text-left px-4 py-3.5 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]",
          style: { border: `1px solid ${answers[q.id] === opt ? accent : BASE.line}`, background: answers[q.id] === opt ? `${accent}12` : BASE.surface, color: BASE.ink },
          children: opt.label
        },
        opt.label
      )) })
    ] }, qIndex);
  }
  const totalAnswered = result ? result.confirmed.length + result.clear.length : 0;
  const dataDrivenAnswered = result ? result.confirmed.filter((q2) => q2.dataDriven).length + result.clear.filter((q2) => q2.dataDriven).length : 0;
  return /* @__PURE__ */ jsxs("div", { className: "text-center stagger", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsx(CalibrationRing, { pct: result.pct, color: result.tier.color }) }),
    /* @__PURE__ */ jsx("p", { className: "text-base mb-1 px-2 leading-relaxed", style: { color: result.tier.color, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: result.tier.label }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] mb-5", style: { color: BASE.inkFaint }, children: t.review.questionsAnswered(totalAnswered, dataDrivenAnswered) }),
    /* @__PURE__ */ jsx(Card, { className: "text-left mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.ink }, children: result.narrative }) }),
    result.priority && /* @__PURE__ */ jsxs(Card, { className: "mb-4 text-left", style: { border: `1px solid ${LOSS}50`, background: `${LOSS}0D` }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 14, style: { color: LOSS } }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wide", style: { color: LOSS }, children: t.review.startHere })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-1", style: { color: BASE.ink, fontWeight: 600 }, children: result.priority.title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed mb-2", style: { color: BASE.inkDim }, children: result.priority.evidence }),
      /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.ink }, children: result.priority.recommendation })
    ] }),
    result.rest.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "mb-4 text-left", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.review.alsoWorthNoting }),
      result.rest.map((f) => /* @__PURE__ */ jsxs("div", { className: "mb-3 last:mb-0", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm mb-1", style: { color: BASE.ink, fontWeight: 500 }, children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed", style: { color: BASE.inkDim }, children: f.recommendation })
      ] }, f.id))
    ] }),
    result.clear.length > 0 && /* @__PURE__ */ jsxs(Card, { className: "text-left mb-4", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.review.looksFine }),
      result.clear.map((f) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm py-1", children: [
        /* @__PURE__ */ jsx(Check, { size: 13, style: { color: WIN, marginTop: 2, flexShrink: 0 } }),
        /* @__PURE__ */ jsx("span", { style: { color: BASE.ink }, children: f.title })
      ] }, f.id))
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-[11px] mb-5", style: { color: BASE.inkFaint }, children: t.review.disclaimer }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4", children: [
      /* @__PURE__ */ jsx("button", { onClick: restart, className: "text-sm", style: { color: BASE.inkFaint }, children: t.calibration.restart }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onClose,
          className: "px-8 py-2.5 rounded-full text-sm transition-all active:scale-95",
          style: { background: accent, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 },
          children: t.review.done
        }
      )
    ] })
  ] });
}
function formatSimMoney(v) {
  const sign = v < 0 ? "-" : "";
  return `${sign}$${groupThousands(Math.round(Math.abs(v)))}`;
}
function formatPrice(v) {
  return v.toFixed(v >= 1e3 ? 1 : 2);
}
function drawChart(canvas, eng, opts) {
  const { accent, entryPrice, liqPrice, tpPrice, slPrice, direction, groupFactor = 1 } = opts;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!eng) return;
  const BARS = 26;
  const aggregated = aggregateCandles(eng.candles, eng.currentCandle, groupFactor);
  const all = aggregated.slice(-BARS);
  if (all.length === 0) return;
  const formingKey = Math.floor(eng.currentCandle.t / groupFactor);
  const padL = 4, padR = 54, padT = 10, padB = 10;
  const plotW = Math.max(1, w - padL - padR);
  const plotH = Math.max(1, h - padT - padB);
  let lo = Math.min(...all.map((c) => c.low));
  let hi = Math.max(...all.map((c) => c.high));
  if (entryPrice != null) {
    lo = Math.min(lo, entryPrice);
    hi = Math.max(hi, entryPrice);
  }
  if (liqPrice != null) {
    lo = Math.min(lo, liqPrice);
    hi = Math.max(hi, liqPrice);
  }
  if (tpPrice != null) {
    lo = Math.min(lo, tpPrice);
    hi = Math.max(hi, tpPrice);
  }
  if (slPrice != null) {
    lo = Math.min(lo, slPrice);
    hi = Math.max(hi, slPrice);
  }
  const span = Math.max(hi - lo, hi * 1e-3);
  lo -= span * 0.12;
  hi += span * 0.12;
  const yOf = (p) => padT + (1 - (p - lo) / (hi - lo)) * plotH;
  ctx.strokeStyle = BASE.line;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  for (let i = 0; i <= 3; i++) {
    const y = padT + plotH / 3 * i;
    ctx.beginPath();
    ctx.moveTo(padL, Math.round(y) + 0.5);
    ctx.lineTo(w - padR, Math.round(y) + 0.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  const slotW = plotW / BARS;
  const bodyW = Math.max(2, slotW * 0.56);
  const rightPad = BARS - all.length;
  all.forEach((c, i) => {
    const slot = i + rightPad;
    const x = padL + slot * slotW + slotW / 2;
    const isUp = c.close >= c.open;
    const color = isUp ? WIN : LOSS;
    const isForming = c.t === formingKey;
    ctx.globalAlpha = isForming ? 0.92 : 1;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, yOf(c.high));
    ctx.lineTo(x, yOf(c.low));
    ctx.stroke();
    const yO = yOf(c.open), yC = yOf(c.close);
    const top = Math.min(yO, yC), bh = Math.max(1.5, Math.abs(yC - yO));
    ctx.fillRect(x - bodyW / 2, top, bodyW, bh);
    ctx.globalAlpha = 1;
  });
  const drawDashed = (price, color, label) => {
    if (price == null) return;
    const y = yOf(price);
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.8;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR + 6, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textBaseline = "middle";
    ctx.fillText(label, w - padR + 8, y);
  };
  if (entryPrice != null) drawDashed(entryPrice, direction === "long" ? WIN : LOSS, formatPrice(entryPrice));
  if (liqPrice != null) drawDashed(liqPrice, WARN, opts.lang === "en" ? "liq." : "\u043B\u0438\u043A\u0432.");
  if (tpPrice != null) drawDashed(tpPrice, WIN, "TP");
  if (slPrice != null) drawDashed(slPrice, LOSS, "SL");
  const last = eng.price;
  const yLast = yOf(last);
  const upTick = last >= eng.prevTickPrice;
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, yLast);
  ctx.lineTo(w - padR + 6, yLast);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#06120F";
  const tagColor = upTick ? WIN : LOSS;
  const tagY = clamp(yLast, padT + 8, h - padB - 8);
  ctx.fillStyle = tagColor;
  ctx.fillRect(w - padR + 4, tagY - 8, padR - 6, 16);
  ctx.fillStyle = "#06120F";
  ctx.font = "600 10px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(formatPrice(last), w - padR + 8, tagY);
  ctx.textAlign = "left";
}
function CandleChart({ engineRef, accent, entryPrice, liqPrice, tpPrice, slPrice, direction, groupFactor = 1, lang = "ru" }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const loop = () => {
      if (canvasRef.current) {
        drawChart(canvasRef.current, engineRef.current, { accent, entryPrice, liqPrice, tpPrice, slPrice, direction, groupFactor, lang });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [accent, entryPrice, liqPrice, tpPrice, slPrice, direction, groupFactor]);
  return /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 150 }, children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { width: "100%", height: "100%", display: "block" } }) });
}
function drawRadar(canvas, eng, opts) {
  const { accent } = opts;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  if (!eng) return;
  const padR = 46, padY = 8;
  const plotW = w - padR;
  const plotH = h - padY * 2;
  const price = eng.price;
  const rangePct = 0.016;
  const lo = price * (1 - rangePct), hi = price * (1 + rangePct);
  const yOf = (p) => padY + (1 - (p - lo) / (hi - lo)) * plotH;
  ctx.font = "9px 'JetBrains Mono', monospace";
  ctx.textBaseline = "middle";
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const p = lo + (hi - lo) * (i / steps);
    const y = yOf(p);
    ctx.strokeStyle = BASE.line;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(y) + 0.5);
    ctx.lineTo(plotW, Math.round(y) + 0.5);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = BASE.inkFaint;
    ctx.fillText(formatPrice(p), plotW + 6, y);
  }
  const yPrice = yOf(price);
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, yPrice);
  ctx.lineTo(plotW, yPrice);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
  ctx.fillStyle = accent;
  ctx.font = "600 9px 'JetBrains Mono', monospace";
  ctx.fillText(formatPrice(price), plotW + 6, clamp(yPrice, padY + 8, h - padY - 8));
  const orders = eng.radarOrders || [];
  for (const o of orders) {
    if (o.price < lo || o.price > hi) continue;
    const y = yOf(o.price);
    const color = o.side === "bid" ? WIN : LOSS;
    let alpha = 1, scale = 1, glow = 0, fillColor = color;
    if (o.state === "pulled") {
      const t = Math.min(1, o.animMs / 500);
      alpha = 1 - t;
      scale = 1 - t * 0.4;
    } else if (o.state === "filled") {
      const t = Math.min(1, o.animMs / 500);
      alpha = 1 - t * 0.7;
      scale = 1 + t * 0.8;
      glow = 1 - t;
      fillColor = accent;
    } else {
      const age = eng.elapsedMs - o.bornMs;
      scale = 1 + Math.sin(age / 450) * 0.06;
      if (o.justMovedMs != null && o.justMovedMs < 400) glow = 1 - o.justMovedMs / 400;
    }
    const barLen = (16 + o.size * 11) * scale;
    const barH = Math.max(3, 3 + o.size * 1.3);
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.fillStyle = fillColor;
    if (glow > 0) {
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 10 * glow;
    }
    ctx.fillRect(plotW - barLen, y - barH / 2, barLen, barH);
    ctx.shadowBlur = 0;
  }
  ctx.globalAlpha = 1;
}
function OrderRadar({ engineRef, accent, t }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const loop = () => {
      if (canvasRef.current) drawRadar(canvasRef.current, engineRef.current, { accent });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [accent]);
  return /* @__PURE__ */ jsxs(Card, { className: "mb-2.5", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide", style: { color: BASE.inkFaint }, children: t.sim.bigOrders }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-[9px]", style: { color: BASE.inkFaint }, children: [
        /* @__PURE__ */ jsx("span", { style: { width: 5, height: 5, borderRadius: 999, background: WIN, display: "inline-block" } }),
        " ",
        t.sim.bid,
        /* @__PURE__ */ jsx("span", { style: { width: 5, height: 5, borderRadius: 999, background: LOSS, display: "inline-block", marginLeft: 4 } }),
        " ",
        t.sim.ask
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { width: "100%", height: 118 }, children: /* @__PURE__ */ jsx("canvas", { ref: canvasRef, style: { width: "100%", height: "100%", display: "block" } }) }),
    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-center mt-1.5", style: { color: BASE.inkFaint }, children: t.sim.noGuarantee })
  ] });
}
function LeverageBar({ value, onChange, accent, disabled }) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-1.5", style: { color: BASE.inkFaint }, children: "\u041F\u043B\u0435\u0447\u043E" }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5", children: LEVERAGE_OPTIONS.map((lv) => /* @__PURE__ */ jsxs(
      "button",
      {
        disabled,
        onClick: () => onChange(lv),
        className: "px-3 py-1.5 rounded-full text-[12px] transition-all duration-150 active:scale-95 whitespace-nowrap shrink-0",
        style: {
          background: value === lv ? accent : "transparent",
          color: value === lv ? "#06120F" : disabled ? BASE.inkFaint : BASE.inkDim,
          border: `1px solid ${value === lv ? accent : BASE.line}`,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: value === lv ? 700 : 400,
          opacity: disabled ? 0.5 : 1
        },
        children: [
          "x",
          lv
        ]
      },
      lv
    )) })
  ] });
}

// ============================================================================
// src/services/ai/ — Gemini AI layer for the Coach tab, built via Firebase AI
// Logic (client SDK, Gemini Developer API backend — no Cloud Function, no
// Blaze plan required). Kept as one section of this file (the app ships as a
// single bundled module) but organized as three logically separate pieces,
// exactly like separate files would be:
//   - aiContextBuilder: turns existing analytics/journal data into a compact,
//     privacy-safe object. Never invents a metric the app doesn't compute.
//   - aiPrompts: the fixed system instruction + task templates.
//   - aiService: the only place that talks to Gemini; owns error handling.
// Nothing outside this section calls the Gemini SDK directly.
// ============================================================================

// ---- aiContextBuilder.js ----------------------------------------------------
function aiSafeNum(v) {
  return typeof v === "number" && isFinite(v) ? v : null;
}
function aiComputeStreakDays(entries) {
  const dateSet = new Set((entries || []).map((e) => e.date.toDateString()));
  const cursor = /* @__PURE__ */ new Date();
  if (!dateSet.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dateSet.has(cursor.toDateString())) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
function aiComputeStreaks(sortedClosed) {
  let curLoss = 0, maxLoss = 0, curWin = 0, maxWin = 0;
  sortedClosed.forEach((t) => {
    if (t.outcome === "Loss") {
      curLoss++;
      maxLoss = Math.max(maxLoss, curLoss);
      curWin = 0;
    } else if (t.outcome === "Win") {
      curWin++;
      maxWin = Math.max(maxWin, curWin);
      curLoss = 0;
    } else {
      curLoss = 0;
      curWin = 0;
    }
  });
  return { maxLossStreak: maxLoss, maxWinStreak: maxWin };
}
function aiComputePlanVsFact(closedEntries) {
  const withPlan = closedEntries.filter((e) => typeof e.plannedRR === "number" && typeof e.realizedRR === "number");
  if (withPlan.length < 3) return null;
  const avgPlanned = st_mean(withPlan.map((e) => e.plannedRR));
  const avgRealized = st_mean(withPlan.map((e) => e.realizedRR));
  const captures = withPlan.filter((e) => e.plannedRR > 0).map((e) => Math.max(0, Math.min(1, e.realizedRR / e.plannedRR)));
  const captureRatioPct = captures.length ? Math.round(st_mean(captures) * 100) : null;
  const closeCounts = { tp: 0, sl: 0, manual: 0 };
  closedEntries.forEach((e) => {
    if (e.closeType && closeCounts[e.closeType] != null) closeCounts[e.closeType]++;
  });
  const closeTotal = closeCounts.tp + closeCounts.sl + closeCounts.manual;
  return {
    sample: withPlan.length,
    avgPlannedRR: st_round2(avgPlanned),
    avgRealizedRR: st_round2(avgRealized),
    captureRatioPct,
    tpSharePct: closeTotal ? Math.round(closeCounts.tp / closeTotal * 100) : null,
    slSharePct: closeTotal ? Math.round(closeCounts.sl / closeTotal * 100) : null,
    manualSharePct: closeTotal ? Math.round(closeCounts.manual / closeTotal * 100) : null
  };
}
function aiSummarizePattern(p) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    type: p.type || null,
    severity: p.severity || null,
    confidence: p.confidence || null,
    sampleSize: aiSafeNum(p.sampleSize),
    avgR: p.metrics?.group?.avgR != null ? aiSafeNum(p.metrics.group.avgR) : null,
    winRatePct: p.metrics?.group?.winRate != null ? aiSafeNum(p.metrics.group.winRate) : null,
    summary: p.description || null
  };
}
function aiBuildContext(entries, analytics, lang) {
  const validEntries = (entries || []).filter((e) => e && e.date instanceof Date && !isNaN(e.date.getTime()));
  const closedEntries = validEntries.filter(isEntryClosed);
  const sortedClosed = [...closedEntries].sort((a, b) => a.date - b.date);
  const streaks = aiComputeStreaks(sortedClosed);
  const rr = analytics?.rrStats || null;
  const violation = (id) => analytics?.discipline?.violations?.find((v) => v.id === id)?.value ?? null;
  const context = {
    lang: lang === "en" ? "en" : "ru",
    trader: {
      level: calculateTraderLevel(validEntries.length),
      awarenessScore: aiSafeNum(analytics?.awareness?.score?.value),
      awarenessTrend: analytics?.awareness?.trend || null,
      currentStreakDays: aiComputeStreakDays(validEntries)
    },
    statistics: rr ? {
      totalTrades: validEntries.length,
      closedTrades: aiSafeNum(rr.sampleSize),
      winRate: aiSafeNum(rr.winRate),
      wins: aiSafeNum(rr.wins),
      losses: aiSafeNum(rr.losses),
      breakevens: aiSafeNum(rr.breakevens),
      avgRealizedRR: aiSafeNum(rr.avgRealizedRR),
      avgWinR: aiSafeNum(rr.avgWinR),
      avgLossR: aiSafeNum(rr.avgLossR),
      expectancy: aiSafeNum(rr.expectancy)
    } : { totalTrades: validEntries.length, closedTrades: 0 },
    planVsFact: aiComputePlanVsFact(closedEntries),
    behavior: {
      disciplineScore: aiSafeNum(analytics?.discipline?.score?.value),
      revengeTradeRatePct: aiSafeNum(violation("revenge_rate")),
      overtradingDaySharePct: aiSafeNum(violation("overtrading_days")),
      riskChangeAfterLossPct: aiSafeNum(analytics?.risk?.postLossChange?.value),
      riskChangeAfterWinPct: aiSafeNum(analytics?.risk?.postWinChange?.value),
      maxLossStreak: streaks.maxLossStreak,
      maxWinStreak: streaks.maxWinStreak
    },
    risk: {
      averageRiskR: aiSafeNum(analytics?.risk?.averageRisk),
      stabilityScore: aiSafeNum(analytics?.risk?.stability?.value),
      volatility: aiSafeNum(analytics?.risk?.volatility)
    },
    reflection: {
      reflectionScore: aiSafeNum(analytics?.reflection?.score?.value),
      lossReviewCoveragePct: aiSafeNum(analytics?.reflection?.lossReviewCoverage?.value),
      repeatedLessonsCount: analytics?.reflection?.repeatedLessons?.length ?? 0
    },
    emotional: analytics?.emotionalState?.average ? {
      average: analytics.emotionalState.average,
      confidence: analytics.emotionalState.confidence || null,
      bestState: analytics.emotionalState.bestState ? {
        title: analytics.emotionalState.bestState.title,
        winRatePct: aiSafeNum(analytics.emotionalState.bestState.winRate),
        meanR: aiSafeNum(analytics.emotionalState.bestState.meanR),
        trades: aiSafeNum(analytics.emotionalState.bestState.trades)
      } : null,
      worstState: analytics.emotionalState.worstState ? {
        title: analytics.emotionalState.worstState.title,
        winRatePct: aiSafeNum(analytics.emotionalState.worstState.winRate),
        meanR: aiSafeNum(analytics.emotionalState.worstState.meanR),
        trades: aiSafeNum(analytics.emotionalState.worstState.trades)
      } : null
    } : null,
    patterns: (analytics?.patterns || []).slice(0, 5).map(aiSummarizePattern).filter(Boolean),
    healthyPatterns: (analytics?.healthyPatterns || []).slice(0, 3).map(aiSummarizePattern).filter(Boolean),
    dataQuality: analytics?.dataQuality || null
  };
  return context;
}
function aiHashContext(context) {
  const str = JSON.stringify(context);
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
  h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
function aiCompactRecentEntries(entries, limit) {
  return (entries || []).slice(-limit).map((e) => ({
    date: e.date instanceof Date ? e.date.toISOString().slice(0, 10) : null,
    instrument: e.instrument || null,
    direction: e.direction || null,
    outcome: e.outcome || null,
    r: aiSafeNum(e.r),
    tag: e.tag && e.tag !== "\u041E\u0431\u0449\u0435\u0435" ? e.tag : null,
    plannedRR: aiSafeNum(e.plannedRR),
    realizedRR: aiSafeNum(e.realizedRR),
    closeType: e.closeType || null,
    pull: e.pull && e.pull !== "\u2014" ? String(e.pull).slice(0, 200) : null,
    lesson: e.lesson && e.lesson !== "\u2014" ? String(e.lesson).slice(0, 200) : null
  }));
}

// ---- aiPrompts.js ------------------------------------------------------------
var AI_SYSTEM_INSTRUCTION = `You are the analytical assistant inside mind.exe, a trading journal app.
You analyze a trader's already-computed journal statistics and behavioral patterns. You are NOT a
financial advisor and must never give trading signals or instructions ("buy", "sell", "go long",
"set your stop here", specific entries/exits/instruments/position sizing).

You analyze: discipline, execution of the trader's own plan, emotional state, statistics, recurring
behavioral patterns, and gaps between plan and outcome.

Rules:
- Every number you cite must come from the JSON context you are given. Never invent statistics,
  dates, trade counts, or patterns that are not present in the data.
- Clearly separate FACT (a number from the data) from INTERPRETATION (your reading of it). Prefer
  phrasing like "this may indicate..." over flat claims.
- Never issue a psychological diagnosis ("you are afraid of profit", "you are addicted to..."). You
  may describe an observed behavioral tendency, but not label the person.
- Win rate and RR (risk/reward) must always be read together, never in isolation. A low win rate
  with a higher RR is not automatically bad trading, and a high win rate with a low RR is not
  automatically good trading. If the app-computed expectancy is available and positive, say so
  explicitly rather than criticizing win rate or RR individually.
- If the sample size for a metric is small or a field is null/missing, say plainly that there isn't
  enough data for a confident conclusion on that point, instead of guessing.
- Never reference the exact time period unless dates are present in the data — don't say "over the
  last few months" if you don't know the span.
- Keep responses concise, concrete, and grounded in the numbers you were given.
- Respond in the language given by the context's "lang" field: "ru" \u2192 Russian, "en" \u2192 English.`;
var AI_INSIGHT_TASK = `Write a short journal insight (3-6 sentences) for the Home/Coach screen, based only on
the AGGREGATED_CONTEXT JSON below. Reference at least one concrete number from the data. If the
sample size is too small anywhere relevant, say so instead of speculating. Do not use headers or
bullet lists \u2014 plain prose.`;
var AI_CHAT_TASK = `Answer the trader's USER_QUESTION using AGGREGATED_CONTEXT and, if provided,
RECENT_TRADES as your only source of truth. Use CONVERSATION_SO_FAR for context on the ongoing
chat. If the data doesn't support a confident answer, say so directly rather than guessing.`;

// ---- aiService.js ------------------------------------------------------------
var aiGeminiModel = null;
function aiGetModel() {
  if (!aiGeminiModel) {
    aiGeminiModel = getGenerativeModel(aiLogic, {
      model: AI_MODEL,
      systemInstruction: AI_SYSTEM_INSTRUCTION,
      generationConfig: { temperature: 0.4, maxOutputTokens: 700 }
    });
  }
  return aiGeminiModel;
}
async function aiCallGemini(prompt) {
  const model = aiGetModel();
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text || !text.trim()) throw new Error("ai_empty_response");
  return text.trim();
}
async function aiGenerateInsight(context) {
  const prompt = `${AI_INSIGHT_TASK}

AGGREGATED_CONTEXT:
${JSON.stringify(context)}`;
  return aiCallGemini(prompt);
}
async function aiChatReply(context, recentTrades, history, question) {
  const historyText = (history || []).slice(-10).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");
  const prompt = `${AI_CHAT_TASK}

AGGREGATED_CONTEXT:
${JSON.stringify(context)}

RECENT_TRADES:
${JSON.stringify(recentTrades)}

CONVERSATION_SO_FAR:
${historyText || "(none yet)"}

USER_QUESTION:
${question}`;
  return aiCallGemini(prompt);
}
// ---- aiService.js: Vision (trade screenshot recognition) ----------------------
// Reuses the same aiGeminiModel singleton — Gemini flash-lite is multimodal, no second
// client/model is created. Called only from an explicit user action (NewEntry "Распознать").
var AI_VISION_TRADE_TASK = `You are analyzing a screenshot of a trading platform or chart (TradingView,
Binance, Bybit, or similar — light or dark theme, desktop or mobile). Extract ONLY information that is
clearly and visibly present in the image: asset/instrument symbol, trade direction, entry price, stop
loss, take profit. Do NOT guess, calculate, or infer any value not directly visible. If a field is
missing, ambiguous, or poorly readable, its value must be null. Do not give trading advice or interpret
future price scenarios. Return ONLY this JSON shape, no markdown fences, no commentary:
{"asset":{"value":string|null,"confidence":0-1},"direction":{"value":"LONG"|"SHORT"|null,"confidence":0-1},"entryPrice":{"value":number|null,"confidence":0-1},"stopLoss":{"value":number|null,"confidence":0-1},"takeProfit":{"value":number|null,"confidence":0-1}}`;
async function aiCallGeminiVision(prompt, base64Data, mimeType) {
  const model = aiGetModel();
  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { mimeType, data: base64Data } }
  ]);
  const text = result?.response?.text?.();
  if (!text || !text.trim()) throw new Error("ai_empty_response");
  return text.trim();
}
async function aiRecognizeTradeFromImage(dataUrl) {
  const m = /^data:(image\/[a-zA-Z]+);base64,(.+)$/.exec(dataUrl || "");
  if (!m) throw new Error("ai_bad_image");
  const raw = await aiCallGeminiVision(AI_VISION_TRADE_TASK, m[2], m[1]);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const val = (f) => parsed?.[f]?.value ?? null;
  const num = (f) => {
    const v = val(f);
    return typeof v === "number" && isFinite(v) ? v : null;
  };
  const dir = val("direction");
  const asset = val("asset");
  return {
    asset: typeof asset === "string" && asset.trim() ? asset.trim() : null,
    direction: dir === "LONG" ? "Long" : dir === "SHORT" ? "Short" : null,
    entryPrice: num("entryPrice"),
    stopLoss: num("stopLoss"),
    takeProfit: num("takeProfit")
  };
}
// ---- aiService.js: Market snapshot (hourly, Google Search-grounded) -----------
// Separate model instance from aiGetModel(): the journal-analysis model's system instruction
// explicitly forbids inventing facts not present in the user's own data, which is the right rule
// for coaching but wrong here — this one needs to go out and read the actual current market via
// Gemini's Google Search grounding tool. Same aiLogic/Firebase AI Logic client, same Gemini
// Developer API key setup, just a different getGenerativeModel() config — not a second AI
// integration. Result is cached in Firestore (storageGet/storageSet, shared:true) once per hour
// PER ASSET CLASS, not per user — everyone trading the same asset class reads the same cached
// snapshot for that hour instead of triggering a fresh Gemini+Search call each time someone opens
// the Home tab. Any failure (unsupported tool, quota, network, bad JSON) falls back to the last
// cached snapshot, then to null — the Home screen already has its own local-only fallback text for
// that case, so nothing breaks if this never succeeds.
var aiMarketModel = null;
function aiGetMarketModel() {
  if (!aiMarketModel) {
    aiMarketModel = getGenerativeModel(aiLogic, {
      model: AI_MODEL,
      tools: [{ googleSearch: {} }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 }
    });
  }
  return aiMarketModel;
}
var aiMarketModelPlain = null;
function aiGetMarketModelPlain() {
  if (!aiMarketModelPlain) {
    aiMarketModelPlain = getGenerativeModel(aiLogic, {
      model: AI_MODEL,
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 }
    });
  }
  return aiMarketModelPlain;
}
function marketFocusText(assetClass) {
  if (assetClass === "forex") return "the FX/forex market \u2014 DXY direction, major pairs, central bank policy and macro data releases that could move currencies in the next few hours";
  if (assetClass === "stocks") return "the stock market \u2014 major indices, macro catalysts, earnings or data releases that could move equities in the next few hours";
  return "the crypto market (BTC, ETH and majors) \u2014 price action, the dominant narrative, and anything that could move prices in the next few hours";
}
function buildMarketPrompt(assetClass, lang, grounded) {
  const langName = lang === "en" ? "English" : "Russian";
  const lead = grounded ? "Using current, real information from the web, summarize" : "Summarize, using your best current knowledge,";
  return `${lead} ${marketFocusText(assetClass)} right now.
Return ONLY this JSON, no markdown fences, no commentary, no extra keys:
{"moodLabel":"<one or two words in ${langName}, e.g. 'Reactive'/'Calm'/'Volatile'>","summary":"<1-2 concise sentences in ${langName}>","btcDominance":<number 0-100 or null${assetClass !== "crypto" ? " (null unless directly relevant)" : ""}>,"sentimentScore":<number 0-100, general market risk sentiment, or null>,"sentimentLabel":"<short label in ${langName} matching sentimentScore, or null>"}`;
}
async function aiRunMarketModel(model, prompt) {
  const result = await model.generateContent(prompt);
  const text = result?.response?.text?.();
  if (!text || !text.trim()) throw new Error("ai_empty_response");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  const num = (v) => typeof v === "number" && isFinite(v) ? v : null;
  return {
    moodLabel: typeof parsed.moodLabel === "string" && parsed.moodLabel.trim() ? parsed.moodLabel.trim() : null,
    summary: typeof parsed.summary === "string" && parsed.summary.trim() ? parsed.summary.trim() : null,
    btcDominance: num(parsed.btcDominance),
    sentimentScore: num(parsed.sentimentScore),
    sentimentLabel: typeof parsed.sentimentLabel === "string" && parsed.sentimentLabel.trim() ? parsed.sentimentLabel.trim() : null
  };
}
async function aiFetchMarketSnapshot(assetClass, lang) {
  try {
    return await aiRunMarketModel(aiGetMarketModel(), buildMarketPrompt(assetClass, lang, true));
  } catch (groundedErr) {
    // Google Search grounding (tools:[{googleSearch:{}}]) may not be supported for this
    // model/SDK combo, or may refuse strict-JSON output while grounded — either way, fall back to
    // a plain (non-grounded) call so the insight still updates with Gemini's own knowledge instead
    // of silently doing nothing. Logged clearly so the actual cause is visible in devtools.
    console.error("mind.exe market snapshot: grounded call failed, retrying without Search tool:", groundedErr);
    return await aiRunMarketModel(aiGetMarketModelPlain(), buildMarketPrompt(assetClass, lang, false));
  }
}
function marketHourBucket() {
  return Math.floor(Date.now() / 36e5);
}
function marketSnapshotKey(assetClass) {
  return `market-snapshot:${assetClass}`;
}
async function loadCachedMarketSnapshot(assetClass) {
  try {
    const res = await storageGet(marketSnapshotKey(assetClass), true);
    return res?.value ? JSON.parse(res.value) : null;
  } catch {
    return null;
  }
}
async function saveCachedMarketSnapshot(assetClass, snapshot) {
  try {
    await storageSet(marketSnapshotKey(assetClass), JSON.stringify(snapshot), true);
  } catch {
  }
}
async function getMarketSnapshot(assetClass, lang) {
  if (!assetClass) return null;
  const bucket = marketHourBucket();
  const cached = await loadCachedMarketSnapshot(assetClass);
  if (cached && cached.hourBucket === bucket) return cached;
  try {
    const fresh = await aiFetchMarketSnapshot(assetClass, lang);
    const withBucket = { ...fresh, hourBucket: bucket };
    saveCachedMarketSnapshot(assetClass, withBucket);
    return withBucket;
  } catch {
    return cached || null;
  }
}

// ============================================================================
// ---- Adaptive Calibration Engine ---------------------------------------------
// New layer on top of the existing Calibration/scoreCalibrationDynamic UI and the existing
// aiCallGemini plumbing above. Nothing here replaces Analytics Engine, Pattern Engine,
// Calibration Score math, Firebase Auth, or Firestore — it only adds:
//   caComputeAdaptiveFactors: reads existing `analytics` + entries.slice for the last trading
//     day and a short rolling window, and turns that into a small list of typed, severity-scored
//     factors (recent_losses, revenge_risk, increased_risk, overtrading_risk, early_exit_pattern,
//     euphoria_risk, fomo_risk, repeated_lesson, poor_sleep, decreased_discipline, reflection_note).
//     Nothing is invented — every factor requires the underlying sample to actually exist.
//   caBuildContext: compresses entries+analytics+factors+recent question history into the same
//     kind of compact JSON aiBuildContext already builds for the Coach tab.
//   aiGenerateCalibrationQuestions: the only new Gemini call site. Gemini returns question TEXT
//     + factor/category/priority metadata only — never scores, never awareness, per the client's
//     explicit constraint. All questions (adaptive or fallback) are scored afterwards through the
//     existing shared CALIBRATION_READINESS_SCALE via scoreCalibrationDynamic.
//   caLocalFallbackQuestions: used whenever Gemini is unavailable or returns something unusable,
//     so the calibration screen can never break.
//   caLoadCalibrationHistory/caSaveCalibrationHistory: Firestore-backed (same storageGet/Set
//     pattern as loadAiState/saveAiState), doubles as same-day cache (don't regenerate if a set
//     was already produced today) and as the "don't ask the same thing again" question history.
// ============================================================================
function caMinutesBetween(a, b) {
  if (!a || !b) return null;
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return Math.round(diff / 6e4);
}
function caDayKey(d) {
  return d instanceof Date && !isNaN(d.getTime()) ? d.toDateString() : null;
}
function caLastSessionEntries(closedSorted) {
  if (!closedSorted.length) return { dayKey: null, list: [] };
  const dayKey = caDayKey(closedSorted[closedSorted.length - 1].exitDate || closedSorted[closedSorted.length - 1].date);
  const list = closedSorted.filter((e) => caDayKey(e.exitDate || e.date) === dayKey);
  return { dayKey, list };
}
function caTrailingStreak(closedSorted) {
  if (!closedSorted.length) return { type: null, count: 0 };
  let type = null, count = 0;
  for (let i = closedSorted.length - 1; i >= 0; i--) {
    const o = closedSorted[i].outcome;
    if (o !== "Win" && o !== "Loss") break;
    if (type === null) type = o;
    if (o !== type) break;
    count++;
  }
  return { type: type === "Win" ? "win" : type === "Loss" ? "loss" : null, count };
}
function caComputeAdaptiveFactors(entries, analytics, calibrationHistory, lang) {
  const closedSorted = (entries || []).filter(isEntryClosed).slice().sort((a, b) => (a.exitDate || a.date) - (b.exitDate || b.date));
  const factors = [];
  if (!closedSorted.length) return factors;
  const { list: lastSession } = caLastSessionEntries(closedSorted);
  const streak = caTrailingStreak(closedSorted);
  if (streak.type === "loss" && streak.count >= 2) {
    factors.push({
      type: "consecutive_losses",
      severity: Math.min(1, 0.4 + streak.count * 0.13),
      evidence: lang === "en" ? `${streak.count} losing trades in a row (most recent trend)` : `${streak.count} \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u0434\u0440\u044F\u0434 (\u0441\u0430\u043C\u044B\u0439 \u0441\u0432\u0435\u0436\u0438\u0439 \u0442\u0440\u0435\u043D\u0434)`,
      source: "journal"
    });
  }
  if (streak.type === "win" && streak.count >= 2) {
    factors.push({
      type: "euphoria_risk",
      severity: Math.min(1, 0.35 + streak.count * 0.12),
      evidence: lang === "en" ? `${streak.count} winning trades in a row` : `${streak.count} \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043A\u0438 \u043F\u043E\u0434\u0440\u044F\u0434`,
      source: "journal"
    });
  }
  for (let i = 0; i < lastSession.length - 1; i++) {
    const cur = lastSession[i], next = lastSession[i + 1];
    if (cur.outcome !== "Loss") continue;
    const mins = caMinutesBetween(cur.exitDate || cur.date, next.date);
    if (mins != null && mins <= 25) {
      factors.push({
        type: "revenge_risk",
        severity: mins <= 10 ? 0.8 : mins <= 20 ? 0.6 : 0.4,
        evidence: lang === "en" ? `Re-entered ${mins} min after a loss in the last session` : `\u041D\u043E\u0432\u044B\u0439 \u0432\u0445\u043E\u0434 \u0447\u0435\u0440\u0435\u0437 ${mins} \u043C\u0438\u043D \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u0432 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0439 \u0441\u0435\u0441\u0441\u0438\u0438`,
        source: "journal"
      });
      break;
    }
  }
  const riskChange = analytics?.risk?.postLossChange?.value;
  if (riskChange != null && riskChange > 15) {
    factors.push({
      type: "increased_risk",
      severity: Math.min(1, riskChange / 40),
      evidence: lang === "en" ? `Risk tends to run ${Math.round(riskChange)}% higher right after a loss` : `\u0420\u0438\u0441\u043A \u043F\u043E\u0441\u043B\u0435 \u0443\u0431\u044B\u0442\u043A\u0430 \u043E\u0431\u044B\u0447\u043D\u043E \u0432\u044B\u0448\u0435 \u043D\u0430 ${Math.round(riskChange)}%`,
      source: "pattern_engine"
    });
  }
  const recentByDay = {};
  closedSorted.slice(-40).forEach((e) => {
    const k = caDayKey(e.exitDate || e.date);
    if (k) recentByDay[k] = (recentByDay[k] || 0) + 1;
  });
  const dayCounts = Object.values(recentByDay);
  const avgPerDay = dayCounts.length ? dayCounts.reduce((s, n) => s + n, 0) / dayCounts.length : 0;
  if (lastSession.length >= 3 && avgPerDay > 0 && lastSession.length > avgPerDay * 1.6) {
    factors.push({
      type: "overtrading_risk",
      severity: Math.min(1, 0.4 + (lastSession.length / Math.max(1, avgPerDay) - 1) * 0.3),
      evidence: lang === "en" ? `${lastSession.length} trades last session vs a usual ~${Math.round(avgPerDay)}` : `${lastSession.length} \u0441\u0434\u0435\u043B\u043E\u043A \u0432 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0439 \u0441\u0435\u0441\u0441\u0438\u0438 \u043F\u0440\u043E\u0442\u0438\u0432 \u043E\u0431\u044B\u0447\u043D\u044B\u0445 ~${Math.round(avgPerDay)}`,
      source: "journal"
    });
  }
  const earlyCandidates = closedSorted.slice(-15).filter((e) => e.closeType === "manual" && typeof e.plannedRR === "number" && e.plannedRR > 0 && typeof e.realizedRR === "number" && e.realizedRR > 0);
  const earlyExits = earlyCandidates.filter((e) => e.realizedRR < e.plannedRR * 0.7);
  if (earlyCandidates.length >= 3 && earlyExits.length / earlyCandidates.length >= 0.4) {
    factors.push({
      type: "early_exit_pattern",
      severity: Math.min(1, 0.4 + earlyExits.length / earlyCandidates.length * 0.5),
      evidence: lang === "en" ? `${earlyExits.length} of the last ${earlyCandidates.length} manual closes exited well before planned RR` : `${earlyExits.length} \u0438\u0437 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 ${earlyCandidates.length} \u0440\u0443\u0447\u043D\u044B\u0445 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0439 \u0431\u044B\u043B\u0438 \u0437\u0430\u043C\u0435\u0442\u043D\u043E \u0440\u0430\u043D\u044C\u0448\u0435 \u043F\u043B\u0430\u043D\u043E\u0432\u043E\u0433\u043E RR`,
      source: "pattern_engine"
    });
  }
  const yesterday = /* @__PURE__ */ new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const hadTradesYesterday = closedSorted.some((e) => caDayKey(e.exitDate || e.date) === caDayKey(yesterday));
  if (!hadTradesYesterday) {
    factors.push({
      type: "fomo_risk",
      severity: 0.35,
      evidence: lang === "en" ? "No trades yesterday" : "\u0412\u0447\u0435\u0440\u0430 \u043D\u0435 \u0431\u044B\u043B\u043E \u0441\u0434\u0435\u043B\u043E\u043A",
      source: "journal"
    });
  }
  const repeatedLessons = analytics?.reflection?.repeatedLessons?.length ?? 0;
  if (repeatedLessons >= 2) {
    factors.push({
      type: "repeated_lesson",
      severity: Math.min(1, 0.4 + repeatedLessons * 0.12),
      evidence: lang === "en" ? `The same lesson has repeated ${repeatedLessons} times` : `\u041E\u0434\u0438\u043D \u0438 \u0442\u043E\u0442 \u0436\u0435 \u0443\u0440\u043E\u043A \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u043B\u0441\u044F ${repeatedLessons} \u0440\u0430\u0437`,
      source: "pattern_engine"
    });
  }
  const disciplineScore = analytics?.discipline?.score?.value;
  if (disciplineScore != null && disciplineScore < 50) {
    factors.push({
      type: "decreased_discipline",
      severity: Math.min(1, (50 - disciplineScore) / 50),
      evidence: lang === "en" ? `Discipline score is at ${Math.round(disciplineScore)}/100` : `\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u044C \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u044B \u2014 ${Math.round(disciplineScore)}/100`,
      source: "pattern_engine"
    });
  }
  const lastSleepCal = (calibrationHistory || []).find((h) => h.answers?.sleep);
  if (lastSleepCal && lastSleepCal.answers.sleep.score <= -1) {
    factors.push({
      type: "poor_sleep",
      severity: lastSleepCal.answers.sleep.score === -2 ? 0.7 : 0.4,
      evidence: lang === "en" ? "Reported poor sleep at a recent calibration" : "\u0412 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0435\u0439 \u043A\u0430\u043B\u0438\u0431\u0440\u043E\u0432\u043A\u0435 \u043E\u0442\u043C\u0435\u0447\u0435\u043D \u043F\u043B\u043E\u0445\u043E\u0439 \u0441\u043E\u043D",
      source: "calibration_history"
    });
  }
  const reflectionSnippets = lastSession.map((e) => [e.pull, e.lesson].filter((v) => v && v !== "\u2014").join(" / ")).filter(Boolean);
  if (reflectionSnippets.length) {
    factors.push({
      type: "reflection_note",
      severity: 0.5,
      evidence: reflectionSnippets.slice(0, 2).join(" | ").slice(0, 220),
      source: "journal"
    });
  }
  return factors;
}
function caBuildContext(entries, analytics, adaptiveFactors, calibrationHistory, lang) {
  const closedSorted = (entries || []).filter(isEntryClosed).slice().sort((a, b) => (a.exitDate || a.date) - (b.exitDate || b.date));
  const { list: lastSession } = caLastSessionEntries(closedSorted);
  const closeCounts = { tp: 0, sl: 0, manual: 0 };
  lastSession.forEach((e) => {
    if (e.closeType && closeCounts[e.closeType] != null) closeCounts[e.closeType]++;
  });
  const last7 = closedSorted.filter((e) => {
    const days = ((/* @__PURE__ */ new Date()).getTime() - (e.exitDate || e.date).getTime()) / 864e5;
    return days <= 7;
  });
  return {
    lang: lang === "en" ? "en" : "ru",
    todayDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    yesterday: lastSession.length ? {
      trades: lastSession.length,
      wins: lastSession.filter((e) => e.outcome === "Win").length,
      losses: lastSession.filter((e) => e.outcome === "Loss").length,
      totalR: aiSafeNum(st_round2(lastSession.reduce((s, e) => s + (e.realizedRR || 0), 0))),
      closeTypes: closeCounts
    } : null,
    recent: {
      last7DaysTrades: last7.length,
      winRate: last7.length ? Math.round(last7.filter((e) => e.outcome === "Win").length / last7.length * 100) : null,
      awarenessScore: aiSafeNum(analytics?.awareness?.score?.value)
    },
    patterns: (analytics?.patterns || []).slice(0, 3).map(aiSummarizePattern).filter(Boolean),
    adaptiveFactors: adaptiveFactors.map((f) => ({ type: f.type, severity: Math.round(f.severity * 100) / 100, evidence: f.evidence })),
    recentQuestions: (calibrationHistory || []).slice(0, 5).flatMap((h) => h.questions || []).filter((q) => q.source === "adaptive").map((q) => ({ factor: q.factor, text: q.text })).slice(0, 12)
  };
}
var AI_CALIBRATION_TASK = `You are generating a pre-session trading-psychology calibration for mind.exe. You will
receive ADAPTIVE_CONTEXT: a compact JSON with yesterday's trading facts, a short recent window, detected
patterns, a list of adaptiveFactors (each with type/severity/evidence, already computed by the app \u2014
never invent new ones), and recentQuestions already asked in previous calibrations.

Pick the 2 to 4 adaptiveFactors that are most relevant RIGHT NOW (prefer higher severity, but rotate away
from factors that already dominate recentQuestions \u2014 don't ask essentially the same question again).
For each chosen factor, write ONE short, concrete, specific question that references the actual evidence
(a number, a time gap, a streak \u2014 whatever is in the context) rather than a generic mood question. Cover
both directions: a loss-related factor implies possible revenge/fear, a win-streak factor implies possible
euphoria/overconfidence, a no-trades factor implies possible FOMO \u2014 match the question's tone to the
factor's actual direction, don't treat everything as a problem.

Rules:
- Never diagnose or label the person ("you have a problem with...", "you are addicted to..."). Use the
  observation \u2192 question \u2192 awareness pattern instead.
- Never phrase a question so there's an obviously "correct" answer to pick \u2014 it must honestly probe the
  person's actual state, not lead them.
- Do not calculate any score, tier, or awareness value yourself \u2014 only write the question text.
- Each question must be a single sentence or two, in plain conversational language, in the language given
  by ADAPTIVE_CONTEXT.lang ("ru" \u2192 Russian, "en" \u2192 English).
- Return ONLY a JSON array, no markdown fences, no commentary: [{"question": "...", "factor": "...",
  "category": "adaptive", "priority": 0.0}]. "factor" must be one of the adaptiveFactors' type values you
  were given. "priority" is 0-1, how relevant this question is right now.`;
async function aiGenerateCalibrationQuestions(context) {
  if (!context.adaptiveFactors.length) return [];
  const prompt = `${AI_CALIBRATION_TASK}

ADAPTIVE_CONTEXT:
${JSON.stringify(context)}`;
  const raw = await aiCallGemini(prompt);
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("ai_calibration_bad_shape");
  return parsed.filter((q) => q && typeof q.question === "string" && q.question.trim() && typeof q.factor === "string").slice(0, 4).map((q, i) => ({
    id: `adaptive_${i}`,
    text: q.question.trim(),
    factor: q.factor,
    category: "adaptive",
    source: "adaptive",
    priority: typeof q.priority === "number" ? q.priority : 0.5
  }));
}
function caLocalFallbackQuestions(adaptiveFactors, lang) {
  const bank = lang === "en" ? {
    consecutive_losses: "Given the recent losing trades, how comfortable would you be pausing for a while after your next loss today, if it happens?",
    euphoria_risk: "After the recent winning trades, how confident are you that you'll keep your usual risk size even if today starts well too?",
    revenge_risk: "If a trade goes against you today, how easy will it be to wait before entering the next one, instead of re-entering quickly?",
    increased_risk: "How committed are you to keeping your normal risk size today, regardless of how the first trade goes?",
    overtrading_risk: "If today gives fewer setups than usual, how comfortable are you trading less than you did recently?",
    early_exit_pattern: "If a position moves in your favor today, how easy will it be to wait for your planned exit instead of closing early?",
    fomo_risk: "If today doesn't offer a clean setup for a while, how comfortable are you ending the session without a trade?",
    repeated_lesson: "A similar lesson has come up more than once recently \u2014 how present is that lesson for you as you start today?",
    decreased_discipline: "How closely do you expect to follow your written plan today, entry to exit?",
    poor_sleep: "Given you weren't well rested recently, how ready do you feel to make clear-headed decisions today?",
    reflection_note: "Thinking back to your notes from the last session, how much is that still on your mind as you start today?"
  } : {
    consecutive_losses: "\u0421 \u0443\u0447\u0451\u0442\u043E\u043C \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0445 \u0443\u0431\u044B\u0442\u043E\u0447\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0442\u0435\u0431\u0435 \u0431\u0443\u0434\u0435\u0442 \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u043F\u0430\u0443\u0437\u0443 \u043F\u043E\u0441\u043B\u0435 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0443\u0431\u044B\u0442\u043A\u0430 \u0441\u0435\u0433\u043E\u0434\u043D\u044F, \u0435\u0441\u043B\u0438 \u043E\u043D \u0441\u043B\u0443\u0447\u0438\u0442\u0441\u044F?",
    euphoria_risk: "\u041F\u043E\u0441\u043B\u0435 \u043D\u0435\u0434\u0430\u0432\u043D\u0438\u0445 \u043F\u0440\u0438\u0431\u044B\u043B\u044C\u043D\u044B\u0445 \u0441\u0434\u0435\u043B\u043E\u043A \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0442\u044B \u0443\u0432\u0435\u0440\u0435\u043D, \u0447\u0442\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0448\u044C \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430, \u0434\u0430\u0436\u0435 \u0435\u0441\u043B\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0442\u043E\u0436\u0435 \u043D\u0430\u0447\u043D\u0451\u0442\u0441\u044F \u0443\u0434\u0430\u0447\u043D\u043E?",
    revenge_risk: "\u0415\u0441\u043B\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0441\u0434\u0435\u043B\u043A\u0430 \u0443\u0439\u0434\u0451\u0442 \u043D\u0435 \u0432 \u0442\u0432\u043E\u044E \u0441\u0442\u043E\u0440\u043E\u043D\u0443 \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043B\u0435\u0433\u043A\u043E \u0431\u0443\u0434\u0435\u0442 \u0432\u044B\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u043F\u0430\u0443\u0437\u0443 \u043F\u0435\u0440\u0435\u0434 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u043C \u0432\u0445\u043E\u0434\u043E\u043C, \u0432\u043C\u0435\u0441\u0442\u043E \u0442\u043E\u0433\u043E \u0447\u0442\u043E\u0431\u044B \u0431\u044B\u0441\u0442\u0440\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F?",
    increased_risk: "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0442\u044B \u0433\u043E\u0442\u043E\u0432 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0438\u0441\u043A\u0430, \u043D\u0435\u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E \u043E\u0442 \u0442\u043E\u0433\u043E, \u043A\u0430\u043A \u043F\u0440\u043E\u0439\u0434\u0451\u0442 \u043F\u0435\u0440\u0432\u0430\u044F \u0441\u0434\u0435\u043B\u043A\u0430?",
    overtrading_risk: "\u0415\u0441\u043B\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0441\u0435\u0442\u0430\u043F\u043E\u0432 \u0431\u0443\u0434\u0435\u0442 \u043C\u0435\u043D\u044C\u0448\u0435 \u043E\u0431\u044B\u0447\u043D\u043E\u0433\u043E \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u0442\u0435\u0431\u0435 \u0442\u043E\u0440\u0433\u043E\u0432\u0430\u0442\u044C \u043C\u0435\u043D\u044C\u0448\u0435, \u0447\u0435\u043C \u043E\u0431\u044B\u0447\u043D\u043E?",
    early_exit_pattern: "\u0415\u0441\u043B\u0438 \u043F\u043E\u0437\u0438\u0446\u0438\u044F \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043F\u043E\u0439\u0434\u0451\u0442 \u0432 \u043F\u043B\u044E\u0441 \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043B\u0435\u0433\u043A\u043E \u0431\u0443\u0434\u0435\u0442 \u0434\u043E\u0436\u0434\u0430\u0442\u044C\u0441\u044F \u0437\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430, \u0430 \u043D\u0435 \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0440\u0430\u043D\u044C\u0448\u0435?",
    fomo_risk: "\u0415\u0441\u043B\u0438 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0434\u043E\u043B\u0433\u043E \u043D\u0435 \u0431\u0443\u0434\u0435\u0442 \u0447\u0451\u0442\u043A\u043E\u0433\u043E \u0441\u0435\u0442\u0430\u043F\u0430 \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u0442\u044C \u0441\u0435\u0441\u0441\u0438\u044E \u0431\u0435\u0437 \u0441\u0434\u0435\u043B\u043A\u0438?",
    repeated_lesson: "\u041F\u043E\u0445\u043E\u0436\u0438\u0439 \u0443\u0440\u043E\u043A \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u043B\u0441\u044F \u0443\u0436\u0435 \u043D\u0435 \u0432 \u043F\u0435\u0440\u0432\u044B\u0439 \u0440\u0430\u0437 \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043E\u043D \u0441\u0435\u0439\u0447\u0430\u0441 \u0443 \u0442\u0435\u0431\u044F \u0432 \u0433\u043E\u043B\u043E\u0432\u0435, \u043A\u043E\u0433\u0434\u0430 \u0442\u044B \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0448\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F\u0448\u043D\u0438\u0439 \u0434\u0435\u043D\u044C?",
    decreased_discipline: "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0447\u043D\u043E \u0442\u044B \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u0435\u0448\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u044C \u0441\u0432\u043E\u0435\u043C\u0443 \u043F\u0438\u0441\u044C\u043C\u0435\u043D\u043D\u043E\u043C\u0443 \u043F\u043B\u0430\u043D\u0443 \u043E\u0442 \u0432\u0445\u043E\u0434\u0430 \u0434\u043E \u0432\u044B\u0445\u043E\u0434\u0430?",
    poor_sleep: "\u0423\u0447\u0438\u0442\u044B\u0432\u0430\u044F, \u0447\u0442\u043E \u0442\u044B \u043D\u0435\u0434\u0430\u0432\u043D\u043E \u043F\u043B\u043E\u0445\u043E \u0432\u044B\u0441\u043F\u0430\u043B\u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0433\u043E\u0442\u043E\u0432 \u0442\u0432\u043E\u0439 \u0443\u043C \u043A \u044F\u0441\u043D\u044B\u043C \u0440\u0435\u0448\u0435\u043D\u0438\u044F\u043C \u0441\u0435\u0433\u043E\u0434\u043D\u044F?",
    reflection_note: "\u0412\u0441\u043F\u043E\u043C\u043D\u0438 \u0441\u0432\u043E\u0438 \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u043F\u043E \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0439 \u0441\u0435\u0441\u0441\u0438\u0438 \u2014 \u043D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043E\u043D\u0438 \u0435\u0449\u0451 \u0441 \u0442\u043E\u0431\u043E\u0439, \u043A\u043E\u0433\u0434\u0430 \u0442\u044B \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0448\u044C \u0441\u0435\u0433\u043E\u0434\u043D\u044F?"
  };
  return adaptiveFactors.filter((f) => bank[f.type]).sort((a, b) => b.severity - a.severity).slice(0, 4).map((f, i) => ({
    id: `fallback_${i}`,
    text: bank[f.type],
    factor: f.type,
    category: "adaptive",
    source: "fallback",
    priority: f.severity
  }));
}
function assembleCalibrationQuestions(adaptiveQuestions, lang) {
  const questions = lang === "en" ? CALIBRATION_QUESTIONS_EN : CALIBRATION_QUESTIONS;
  const scale = lang === "en" ? CALIBRATION_READINESS_SCALE_EN : CALIBRATION_READINESS_SCALE;
  const baseline = questions.filter((q) => q.id === "sleep" || q.id === "emotion").map((q) => ({ ...q, category: "baseline", source: "baseline" }));
  const adaptive = adaptiveQuestions.slice(0, 4).map((q) => ({ ...q, options: scale }));
  return [...baseline, ...adaptive];
}
function calibHistoryKey(userId) {
  return `mind-exe-calib-history:${userId}`;
}
async function caLoadCalibrationHistory(userId) {
  if (!window.storage || !userId) return [];
  try {
    const res = await storageGet(calibHistoryKey(userId), false);
    return res?.value ? JSON.parse(res.value) : [];
  } catch (_) {
    return [];
  }
}
async function caSaveCalibrationHistory(userId, history) {
  if (!window.storage || !userId) return;
  try {
    await storageSet(calibHistoryKey(userId), JSON.stringify(history.slice(0, 14)), false);
  } catch (_) {
  }
}

function Coach({ entries, analytics, accent, userId, lang, t }) {
  const [analysis, setAnalysis] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const loadedRef = useRef(false);
  const scrollRef = useRef(null);
  const lastContextHashRef = useRef(null);
  useEffect(() => {
    let cancelled = false;
    loadAiState(userId).then((s) => {
      if (cancelled) return;
      setAnalysis(s.analysis || "");
      setChatMessages(Array.isArray(s.chatMessages) ? s.chatMessages : []);
      lastContextHashRef.current = s.lastContextHash || null;
      loadedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);
  useEffect(() => {
    if (!loadedRef.current) return;
    saveAiState(userId, { analysis, chatMessages, lastContextHash: lastContextHashRef.current });
  }, [analysis, chatMessages, userId]);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, sending]);
  // Gemini request is only ever triggered by an explicit user action below (button press /
  // send message) — never inside a useEffect tied to entries/state, per the no-request-per-render
  // rule. runAnalyze also skips the network call entirely when the underlying stats haven't
  // changed since the last generated insight (context hash cache).
  const runAnalyze = async () => {
    if (analyzing || entries.length === 0) return;
    const context = aiBuildContext(entries, analytics, lang);
    const hash = aiHashContext(context);
    if (hash === lastContextHashRef.current && analysis) return;
    setAnalyzing(true);
    setError("");
    try {
      const text = await aiGenerateInsight(context);
      setAnalysis(text);
      lastContextHashRef.current = hash;
    } catch (e) {
      setError(t.coach.error);
    } finally {
      setAnalyzing(false);
    }
  };
  const sendMessage = async (overrideText) => {
    const text = (overrideText ?? chatInput).trim();
    if (!text || sending) return;
    setChatInput("");
    setError("");
    const nextMessages = [...chatMessages, { role: "user", content: text }];
    setChatMessages(nextMessages);
    setSending(true);
    try {
      const context = aiBuildContext(entries, analytics, lang);
      const recentTrades = aiCompactRecentEntries(entries, 15);
      const reply = await aiChatReply(context, recentTrades, nextMessages, text);
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(t.coach.error);
    } finally {
      setSending(false);
    }
  };
  const quickQuestions = [
    { icon: Brain, text: t.coach.quick.lateCloses },
    { icon: Star, text: t.coach.quick.strengths },
    { icon: TrendingDown, text: t.coach.quick.losses },
    { icon: Target, text: t.coach.quick.discipline },
    { icon: RotateCcw, text: t.coach.quick.strategy },
    { icon: LineChartIcon, text: t.coach.quick.style }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "stagger", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-1 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
        /* @__PURE__ */ jsx(Bot, { size: 17, style: { color: accent } }),
        " ",
        /* @__PURE__ */ jsx(DecodeText, { text: t.coach.title })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs", style: { color: BASE.inkDim }, children: /* @__PURE__ */ jsx(DecodeText, { text: t.coach.subtitle }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { accent, className: "mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wide mb-3", style: { color: accent, fontFamily: "'Space Grotesk', sans-serif" }, children: /* @__PURE__ */ jsx(DecodeText, { text: t.coach.analyzeTitle }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 mb-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex-1", children: analyzing ? /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 py-1", children: /* @__PURE__ */ jsx(LogoSpinner, { size: 20, accent }) }) : analysis ? /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed whitespace-pre-wrap", style: { color: BASE.ink }, children: /* @__PURE__ */ jsx(DecodeText, { as: "span", text: analysis, maxTotalMs: 750 }) }) : /* @__PURE__ */ jsx("p", { className: "text-xs leading-relaxed", style: { color: BASE.inkFaint }, children: /* @__PURE__ */ jsx(DecodeText, { text: entries.length === 0 ? t.coach.analyzeNoEntries : t.coach.analyzeDesc }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "relative shrink-0 w-16 h-16 rounded-full flex items-center justify-center", style: { background: `radial-gradient(circle at 35% 30%, ${accent}30, transparent 72%)`, border: `1px solid ${accent}35`, boxShadow: ring(accent) }, children: [
          /* @__PURE__ */ jsx("div", { className: "absolute inset-2 rounded-full", style: { border: `1px solid ${accent}25` } }),
          /* @__PURE__ */ jsx(Sparkles, { size: 20, style: { color: accent } })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: runAnalyze,
          disabled: analyzing || entries.length === 0,
          className: "w-full py-2.5 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2",
          style: { border: `1px solid ${accent}40`, background: `linear-gradient(135deg, ${accent}30, ${accent}12)`, color: accent, fontFamily: "'Space Grotesk', sans-serif" },
          children: [
            /* @__PURE__ */ jsx(Sparkles, { size: 14 }),
            /* @__PURE__ */ jsx(DecodeText, { text: analyzing ? t.coach.analyzeBusy : t.coach.analyzeBtn })
          ]
        }
      ),
      entries.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mt-3 pt-3 text-[11px]", style: { borderTop: `1px solid ${BASE.line}`, color: BASE.inkFaint }, children: [
        /* @__PURE__ */ jsx(Info, { size: 12 }),
        /* @__PURE__ */ jsx(DecodeText, { text: t.coach.analyzeScopeInfo })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { accent, className: "mb-4 flex flex-col", style: { height: "52vh", maxHeight: 560 }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] uppercase tracking-wide", style: { color: accent, fontFamily: "'Space Grotesk', sans-serif" }, children: /* @__PURE__ */ jsx(DecodeText, { text: t.coach.chatTitle }) }),
        chatMessages.length > 0 && /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => {
              setChatMessages([]);
              setError("");
            },
            className: "flex items-center gap-1 text-[10px] transition-all active:scale-95",
            style: { color: BASE.inkFaint },
            title: t.coach.resetChat,
            children: [/* @__PURE__ */ jsx(Trash2, { size: 11 }), t.coach.resetChat]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mb-3", style: { color: BASE.inkFaint }, children: /* @__PURE__ */ jsx(DecodeText, { text: t.coach.chatDesc }) }),
      /* @__PURE__ */ jsxs("div", { ref: scrollRef, className: "flex-1 min-h-0 overflow-y-auto mb-3 pr-1", children: [
        chatMessages.length === 0 && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: quickQuestions.map((q, i) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => sendMessage(q.text),
            disabled: sending,
            className: "flex items-center gap-2 text-left p-2.5 rounded-xl text-[12px] leading-snug transition-all duration-200 active:scale-[0.97] disabled:opacity-40",
            style: { background: BASE.surface2, border: `1px solid ${BASE.line}`, color: BASE.ink },
            children: [
              /* @__PURE__ */ jsx("span", { className: "shrink-0 w-6 h-6 rounded-lg flex items-center justify-center", style: { background: `${accent}14`, color: accent }, children: /* @__PURE__ */ jsx(q.icon, { size: 13 }) }),
              /* @__PURE__ */ jsx(DecodeText, { text: q.text, maxTotalMs: 420 })
            ]
          },
          i
        )) }),
        chatMessages.map((m, i) => /* @__PURE__ */ jsx(
          "div",
          {
            className: `mt-2.5 max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "ml-auto" : ""}`,
            style: m.role === "user" ? { background: `${accent}14`, color: BASE.ink } : { background: BASE.surface2, color: BASE.ink },
            children: m.role === "assistant" ? /* @__PURE__ */ jsx(DecodeText, { text: m.content, maxTotalMs: 750 }) : m.content
          },
          i
        ))
      ] }),
      sending && /* @__PURE__ */ jsx("div", { className: "mb-2.5 max-w-[85%] rounded-xl px-3 py-2 flex items-center", style: { background: BASE.surface2 }, children: /* @__PURE__ */ jsx(LogoSpinner, { size: 18, accent }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            value: chatInput,
            onChange: (e) => setChatInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") sendMessage();
            },
            placeholder: t.coach.chatPlaceholder,
            className: "flex-1 bg-transparent outline-none text-sm px-3 py-2 rounded-xl",
            style: { border: `1px solid ${BASE.line}`, color: BASE.ink }
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => sendMessage(),
            disabled: sending || !chatInput.trim(),
            className: "shrink-0 p-2.5 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-40",
            style: { border: `1px solid ${accent}40`, background: `${accent}12`, color: accent },
            "aria-label": t.coach.send,
            children: /* @__PURE__ */ jsx(Send, { size: 15 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10.5px]", style: { color: BASE.inkFaint }, children: [
        /* @__PURE__ */ jsx(ShieldCheck, { size: 11 }),
        /* @__PURE__ */ jsx(DecodeText, { text: t.coach.disclaimer })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { accent, className: "mb-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { background: WIN } }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs", style: { color: BASE.ink }, children: /* @__PURE__ */ jsx(DecodeText, { text: t.coach.statusReady }) }),
          /* @__PURE__ */ jsx("p", { className: "text-[10.5px]", style: { color: BASE.inkFaint }, children: /* @__PURE__ */ jsx(DecodeText, { text: t.coach.statusOnline }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-[10.5px]", style: { color: accent }, children: [
        /* @__PURE__ */ jsx(Zap, { size: 11 }),
        /* @__PURE__ */ jsx(DecodeText, { text: t.coach.modelLabel })
      ] })
    ] }),
    error && /* @__PURE__ */ jsx("p", { className: "text-xs text-center", style: { color: LOSS }, children: error })
  ] });
}
function Simulator({ accent, onWin, t, lang }) {
  const [stage, setStage] = useState("intro");
  const [leverage, setLeverage] = useState(10);
  const [timeframeSec, setTimeframeSec] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(SIM_DURATION);
  const [capital, setCapital] = useState(SIM_START_CAPITAL);
  const [position, setPosition] = useState(null);
  const [takeProfitPct, setTakeProfitPct] = useState(null);
  const [stopLossPct, setStopLossPct] = useState(null);
  const [trades, setTrades] = useState([]);
  const [result, setResult] = useState(null);
  const [liquidated, setLiquidated] = useState(false);
  const [autoClosedTag, setAutoClosedTag] = useState(null);
  const engineRef = useRef(null);
  const positionRef = useRef(null);
  const capitalRef = useRef(SIM_START_CAPITAL);
  const tradesRef = useRef([]);
  const stageRef = useRef("intro");
  const rafRef = useRef(null);
  const lastUiSyncRef = useRef(0);
  const tpSlRef = useRef({ tp: null, sl: null });
  const [uiPrice, setUiPrice] = useState(100);
  const [uiNews, setUiNews] = useState(null);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);
  useEffect(() => {
    capitalRef.current = capital;
  }, [capital]);
  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);
  useEffect(() => {
    tpSlRef.current = { tp: takeProfitPct, sl: stopLossPct };
  }, [takeProfitPct, stopLossPct]);
  const floatingPnlPct = (pos, price) => {
    if (!pos || price == null) return 0;
    const movePct = pos.direction === "long" ? (price - pos.entryPrice) / pos.entryPrice : (pos.entryPrice - price) / pos.entryPrice;
    return movePct * pos.leverage;
  };
  const liqPriceOf = (pos) => {
    if (!pos) return null;
    const adverse = 1 / pos.leverage;
    return pos.direction === "long" ? pos.entryPrice * (1 - adverse) : pos.entryPrice * (1 + adverse);
  };
  const finalizeSession = (finalCapital, finalTrades) => {
    const capitalSeq = [SIM_START_CAPITAL, ...finalTrades.map((t2) => t2.capitalAfter)];
    let peak = SIM_START_CAPITAL, maxDD = 0;
    capitalSeq.forEach((c) => {
      peak = Math.max(peak, c);
      maxDD = Math.max(maxDD, (peak - c) / peak);
    });
    const eng = engineRef.current;
    const marketReturn = eng ? (eng.price - 100) / 100 : 0;
    const playerReturn = (finalCapital - SIM_START_CAPITAL) / SIM_START_CAPITAL;
    const impulsive = finalTrades.filter((t2) => t2.durationMs < 3e3).length;
    const anyLiquidated = finalTrades.some((t2) => t2.liquidated);
    const achievementLabels = lang === "en" ? SIM_ACHIEVEMENTS_EN : SIM_ACHIEVEMENTS;
    const achievements = [];
    if (maxDD < 0.15) achievements.push(achievementLabels.lowRisk);
    if (finalTrades.length > 0 && impulsive === 0) achievements.push(achievementLabels.noImpulsive);
    if (maxDD < 0.05) achievements.push(achievementLabels.tightDrawdown);
    if (!anyLiquidated && finalTrades.length > 0) achievements.push(achievementLabels.survivedVol);
    const beatMarket = playerReturn > marketReturn;
    setCapital(finalCapital);
    setTrades(finalTrades);
    setPosition(null);
    setResult({ finalCapital, playerReturn, marketReturn, beatMarket, achievements, maxDD, tradesCount: finalTrades.length, liquidated: anyLiquidated });
    setStage("result");
    if (beatMarket && onWin) onWin();
  };
  useEffect(() => {
    if (stage !== "playing") return;
    let last = performance.now();
    const tick = (now) => {
      const dtSec = Math.min(0.05, (now - last) / 1e3);
      last = now;
      const eng = engineRef.current;
      if (eng) {
        const pos0 = positionRef.current;
        const playerFlow = pos0 ? (pos0.direction === "long" ? 1 : -1) * clamp(pos0.margin * pos0.leverage / (SIM_START_CAPITAL * 5), 0, 2) : 0;
        stepEngine(eng, dtSec, playerFlow);
        const pos = positionRef.current;
        if (pos) {
          const pnlPct = floatingPnlPct(pos, eng.price);
          if (pnlPct <= -1) {
            const newCapital = Math.max(0, capitalRef.current - pos.margin);
            const closedTrade = { direction: pos.direction, durationMs: eng.elapsedMs - pos.openedAtMs, pnl: -pos.margin, capitalAfter: newCapital, liquidated: true };
            capitalRef.current = newCapital;
            tradesRef.current = [...tradesRef.current, closedTrade];
            positionRef.current = null;
            setCapital(newCapital);
            setTrades(tradesRef.current);
            setPosition(null);
            setLiquidated(true);
            setTimeout(() => setLiquidated(false), 1600);
          } else {
            const movePct = pos.direction === "long" ? (eng.price - pos.entryPrice) / pos.entryPrice : (pos.entryPrice - eng.price) / pos.entryPrice;
            const { tp, sl } = tpSlRef.current;
            const hitSL = sl != null && movePct <= -sl / 100;
            const hitTP = !hitSL && tp != null && movePct >= tp / 100;
            if (hitSL || hitTP) {
              applyMarketImpact(eng, pos.direction === "long" ? "sell" : "buy", pos.margin, pos.leverage);
              const finalPnlPct = clamp(floatingPnlPct(pos, eng.price), -1, Infinity);
              const pnl = pos.margin * finalPnlPct;
              const newCapital = Math.max(0, capitalRef.current + pnl);
              const closedTrade = { direction: pos.direction, durationMs: eng.elapsedMs - pos.openedAtMs, pnl, capitalAfter: newCapital, liquidated: false };
              capitalRef.current = newCapital;
              tradesRef.current = [...tradesRef.current, closedTrade];
              positionRef.current = null;
              setCapital(newCapital);
              setTrades(tradesRef.current);
              setPosition(null);
              setAutoClosedTag(hitSL ? "sl" : "tp");
              setTimeout(() => setAutoClosedTag(null), 1600);
            }
          }
        }
      }
      if (now - lastUiSyncRef.current > 100) {
        lastUiSyncRef.current = now;
        if (eng) {
          setUiPrice(eng.price);
          const ev = eng.newsEvent;
          const age = ev ? eng.elapsedMs - ev.spawnMs : Infinity;
          setUiNews(ev && age < NEWS_VISIBLE_MS ? { headline: ev.headline, ageMs: age, rampMs: ev.rampMs } : null);
        }
      }
      if (stageRef.current === "playing") rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [stage]);
  useEffect(() => {
    if (stage !== "playing") return;
    if (secondsLeft <= 0) {
      const eng = engineRef.current;
      let finalCapital = capitalRef.current;
      let finalTrades = tradesRef.current;
      const pos = positionRef.current;
      if (pos && eng) {
        const pnlPct = clamp(floatingPnlPct(pos, eng.price), -1, Infinity);
        const pnl = pos.margin * pnlPct;
        finalCapital = Math.max(0, finalCapital + pnl);
        finalTrades = [...finalTrades, { direction: pos.direction, durationMs: eng.elapsedMs - pos.openedAtMs, pnl, capitalAfter: finalCapital, liquidated: pnlPct <= -1 }];
      }
      finalizeSession(finalCapital, finalTrades);
      return;
    }
    const t2 = setTimeout(() => setSecondsLeft((s) => s - 1), 1e3);
    return () => clearTimeout(t2);
  }, [stage, secondsLeft]);
  const startSession = () => {
    const seed = Math.floor(Math.random() * 1e9);
    const eng = createMarketEngine(seed, 100, lang);
    engineRef.current = eng;
    capitalRef.current = SIM_START_CAPITAL;
    tradesRef.current = [];
    positionRef.current = null;
    setSecondsLeft(SIM_DURATION);
    setCapital(SIM_START_CAPITAL);
    setPosition(null);
    setTrades([]);
    setResult(null);
    setLiquidated(false);
    setUiPrice(eng.price);
    setStage("playing");
  };
  const openPosition = (direction) => {
    if (position || !engineRef.current) return;
    const eng = engineRef.current;
    const margin = capital * MARGIN_FRACTION;
    applyMarketImpact(eng, direction === "long" ? "buy" : "sell", margin, leverage);
    const pos = { direction, entryPrice: eng.price, margin, leverage, openedAtMs: eng.elapsedMs };
    positionRef.current = pos;
    setPosition(pos);
    setUiPrice(eng.price);
  };
  const closePosition = () => {
    const pos = positionRef.current;
    const eng = engineRef.current;
    if (!pos || !eng) return;
    applyMarketImpact(eng, pos.direction === "long" ? "sell" : "buy", pos.margin, pos.leverage);
    const pnlPct = clamp(floatingPnlPct(pos, eng.price), -1, Infinity);
    const pnl = pos.margin * pnlPct;
    const newCapital = Math.max(0, capital + pnl);
    const closedTrade = { direction: pos.direction, durationMs: eng.elapsedMs - pos.openedAtMs, pnl, capitalAfter: newCapital, liquidated: false };
    setTrades((prev) => [...prev, closedTrade]);
    setCapital(newCapital);
    positionRef.current = null;
    setPosition(null);
    setUiPrice(eng.price);
  };
  const maxAddableMargin = position ? Math.max(0, capital - position.margin) : 0;
  const addMarginAmount = Math.min(capital * 0.2, maxAddableMargin);
  const addMargin = () => {
    const pos = positionRef.current;
    const eng = engineRef.current;
    if (!pos || !eng || addMarginAmount < 50) return;
    applyMarketImpact(eng, pos.direction === "long" ? "buy" : "sell", addMarginAmount, pos.leverage);
    const newMargin = pos.margin + addMarginAmount;
    const newEntry = (pos.entryPrice * pos.margin + eng.price * addMarginAmount) / newMargin;
    const updated = { ...pos, margin: newMargin, entryPrice: newEntry };
    positionRef.current = updated;
    setPosition(updated);
    setUiPrice(eng.price);
  };
  const liveFloatingPct = position ? floatingPnlPct(position, uiPrice) : 0;
  const liveFloatingPnl = position ? position.margin * clamp(liveFloatingPct, -1, Infinity) : 0;
  const liveEquity = capital + liveFloatingPnl;
  const liqPrice = position ? liqPriceOf(position) : null;
  const tpPrice = position && takeProfitPct != null ? position.direction === "long" ? position.entryPrice * (1 + takeProfitPct / 100) : position.entryPrice * (1 - takeProfitPct / 100) : null;
  const slPrice = position && stopLossPct != null ? position.direction === "long" ? position.entryPrice * (1 - stopLossPct / 100) : position.entryPrice * (1 + stopLossPct / 100) : null;
  const upTick = engineRef.current ? uiPrice >= engineRef.current.prevTickPrice : true;
  const groupFactor = timeframeSec / 5;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  if (stage === "intro") {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-4 stagger", children: [
      /* @__PURE__ */ jsx(Swords, { size: 38, style: { color: accent }, className: "mx-auto mb-4" }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl mb-2 tracking-wide", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: t.sim.heading }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-8", style: { color: BASE.inkDim }, children: t.sim.subtitle }),
      /* @__PURE__ */ jsxs(Card, { accent, glowing: true, className: "text-left mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: t.sim.terminal }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full", style: { color: accent, border: `1px solid ${accent}40` }, children: t.sim.beta })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-sm leading-relaxed", style: { color: BASE.inkDim }, children: t.sim.introText })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: startSession,
          className: "px-10 py-3 rounded-full text-sm transition-all active:scale-95",
          style: { background: accent, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, boxShadow: softLift(accent) },
          children: t.sim.startSession
        }
      )
    ] });
  }
  if (stage === "playing") {
    return /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children: "SYNTH/USD" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [5, 15].map((tf) => /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setTimeframeSec(tf),
              className: "px-1.5 py-0.5 rounded-md text-[9.5px] transition-all duration-150",
              style: {
                fontFamily: "'JetBrains Mono', monospace",
                color: timeframeSec === tf ? accent : BASE.inkFaint,
                border: `1px solid ${timeframeSec === tf ? accent + "40" : BASE.line}`,
                background: timeframeSec === tf ? `${accent}0F` : "transparent"
              },
              children: [
                tf,
                lang === "en" ? "s" : "\u0441"
              ]
            },
            tf
          )) })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm", style: { color: secondsLeft <= 10 ? LOSS : BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: [
          mm,
          ":",
          ss
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-full h-1 rounded-full mb-2.5", style: { background: BASE.line }, children: /* @__PURE__ */ jsx("div", { className: "h-1 rounded-full transition-all duration-1000 ease-linear", style: { width: `${secondsLeft / SIM_DURATION * 100}%`, background: secondsLeft <= 10 ? LOSS : accent } }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: t.sim.capital }),
          /* @__PURE__ */ jsx("div", { className: "text-[22px] leading-none", style: { fontFamily: "'JetBrains Mono', monospace", color: BASE.ink, fontWeight: 500 }, children: formatSimMoney(liveEquity) }),
          /* @__PURE__ */ jsxs("span", { className: "text-[11px]", style: { color: liveEquity >= SIM_START_CAPITAL ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: [
            liveEquity >= SIM_START_CAPITAL ? "+" : "",
            ((liveEquity - SIM_START_CAPITAL) / SIM_START_CAPITAL * 100).toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-wide mb-0.5", style: { color: BASE.inkFaint }, children: t.sim.price }),
          /* @__PURE__ */ jsx("div", { className: "text-[18px] leading-none transition-colors duration-150", style: { fontFamily: "'JetBrains Mono', monospace", color: upTick ? WIN : LOSS, fontWeight: 500 }, children: formatPrice(uiPrice) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { className: "mb-2", style: { padding: "8px 6px 4px 6px", position: "relative", overflow: "hidden" }, children: [
        /* @__PURE__ */ jsx(
          CandleChart,
          {
            engineRef,
            accent,
            entryPrice: position?.entryPrice ?? null,
            liqPrice,
            tpPrice,
            slPrice,
            direction: position?.direction ?? null,
            groupFactor,
            lang
          }
        ),
        uiNews && /* @__PURE__ */ jsxs(
          "div",
          {
            className: "absolute top-0 left-0 right-0 flex items-center gap-1.5 px-2.5 py-1.5",
            style: { background: "rgba(19,19,21,0.92)", borderBottom: `1px solid ${BASE.line}`, animation: "riseIn 0.25s ease-out" },
            children: [
              /* @__PURE__ */ jsx(Newspaper, { size: 11, style: { color: accent, flexShrink: 0 } }),
              /* @__PURE__ */ jsx("span", { className: "text-[10.5px] leading-tight overflow-hidden text-ellipsis whitespace-nowrap", style: { color: BASE.ink }, children: uiNews.headline }),
              uiNews.ageMs < uiNews.rampMs && /* @__PURE__ */ jsx("span", { className: "text-[9px] shrink-0 ml-auto", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: t.sim.reacting })
            ]
          }
        ),
        liquidated && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", style: { background: `${LOSS}18`, backdropFilter: "blur(1px)" }, children: /* @__PURE__ */ jsx("span", { className: "px-3 py-1.5 rounded-full text-[12px]", style: { background: LOSS, color: "#1A0806", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }, children: t.sim.positionLiquidated }) }),
        autoClosedTag && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center", style: { background: `${autoClosedTag === "tp" ? WIN : LOSS}18`, backdropFilter: "blur(1px)" }, children: /* @__PURE__ */ jsx("span", { className: "px-3 py-1.5 rounded-full text-[12px]", style: { background: autoClosedTag === "tp" ? WIN : LOSS, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }, children: autoClosedTag === "tp" ? t.sim.takeProfitHit : t.sim.stopLossHit }) })
      ] }),
      /* @__PURE__ */ jsx(LeverageBar, { value: leverage, onChange: setLeverage, accent, disabled: !!position }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] w-6 shrink-0", style: { color: WIN }, children: "TP" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto no-scrollbar", children: [null, 1, 2, 3, 5].map((v) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setTakeProfitPct(v),
              className: "px-1.5 py-0.5 rounded-md text-[9.5px] transition-all duration-150 shrink-0",
              style: {
                fontFamily: "'JetBrains Mono', monospace",
                color: takeProfitPct === v ? WIN : BASE.inkFaint,
                border: `1px solid ${takeProfitPct === v ? WIN + "40" : BASE.line}`,
                background: takeProfitPct === v ? `${WIN}0F` : "transparent"
              },
              children: v == null ? "\u2014" : `+${v}%`
            },
            `tp${v}`
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] w-6 shrink-0", style: { color: LOSS }, children: "SL" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-1 overflow-x-auto no-scrollbar", children: [null, 1, 2, 3, 5].map((v) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setStopLossPct(v),
              className: "px-1.5 py-0.5 rounded-md text-[9.5px] transition-all duration-150 shrink-0",
              style: {
                fontFamily: "'JetBrains Mono', monospace",
                color: stopLossPct === v ? LOSS : BASE.inkFaint,
                border: `1px solid ${stopLossPct === v ? LOSS + "40" : BASE.line}`,
                background: stopLossPct === v ? `${LOSS}0F` : "transparent"
              },
              children: v == null ? "\u2014" : `-${v}%`
            },
            `sl${v}`
          )) })
        ] })
      ] }),
      position ? /* @__PURE__ */ jsxs(Card, { className: "mb-2.5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2 text-sm", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: [
            /* @__PURE__ */ jsxs("span", { className: "px-2 py-0.5 rounded-full text-[11px]", style: { color: position.direction === "long" ? WIN : LOSS, border: `1px solid ${position.direction === "long" ? WIN : LOSS}40` }, children: [
              position.direction === "long" ? t.sim.long : t.sim.short,
              " x",
              position.leverage
            ] }),
            t.sim.entry,
            " ",
            formatPrice(position.entryPrice)
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm", style: { color: liveFloatingPct >= 0 ? WIN : LOSS, fontFamily: "'JetBrains Mono', monospace" }, children: [
            liveFloatingPct >= 0 ? "+" : "",
            (liveFloatingPct * 100).toFixed(1),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px] mb-3", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
          /* @__PURE__ */ jsxs("span", { children: [
            t.sim.margin,
            " ",
            formatSimMoney(position.margin)
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "P&L ",
            liveFloatingPnl >= 0 ? "+" : "",
            formatSimMoney(liveFloatingPnl)
          ] }),
          /* @__PURE__ */ jsxs("span", { style: { color: WARN }, children: [
            t.sim.liq,
            " ",
            formatPrice(liqPrice)
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          addMarginAmount >= 50 && /* @__PURE__ */ jsxs("button", { onClick: addMargin, className: "flex-1 py-2.5 rounded-full text-[13px] transition-all duration-150 active:scale-95", style: { border: `1px solid ${accent}40`, color: accent, background: `${accent}0D` }, children: [
            t.sim.add,
            " ",
            formatSimMoney(addMarginAmount)
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: closePosition, className: "flex-1 py-2.5 rounded-full text-[13px] transition-all duration-150 active:scale-95", style: { border: `1px solid ${BASE.line}`, color: BASE.ink, background: BASE.surface2 }, children: t.sim.closePosition })
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-center mb-1.5", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: [
          t.sim.margin,
          " ",
          formatSimMoney(capital * MARGIN_FRACTION),
          " \xB7 ",
          t.sim.volume,
          " x",
          leverage,
          " = ",
          formatSimMoney(capital * MARGIN_FRACTION * leverage)
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-2.5", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => openPosition("long"), className: "flex-1 py-3 rounded-2xl text-sm transition-all duration-150 active:scale-95", style: { border: `1px solid ${WIN}40`, color: WIN, background: `${WIN}0D` }, children: t.sim.long }),
          /* @__PURE__ */ jsx("button", { onClick: () => openPosition("short"), className: "flex-1 py-3 rounded-2xl text-sm transition-all duration-150 active:scale-95", style: { border: `1px solid ${LOSS}40`, color: LOSS, background: `${LOSS}0D` }, children: t.sim.short })
        ] })
      ] }),
      /* @__PURE__ */ jsx(OrderRadar, { engineRef, accent, t })
    ] });
  }
  const r = result;
  return /* @__PURE__ */ jsxs("div", { className: "text-center stagger", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-lg mb-1 tracking-wide", style: { fontFamily: "'Space Grotesk', sans-serif", color: BASE.ink, fontWeight: 600 }, children: t.sim.sessionOver }),
    /* @__PURE__ */ jsxs("p", { className: "text-xs mb-6", style: { color: BASE.inkFaint }, children: [
      t.sim.finalCapital,
      ": ",
      formatSimMoney(r.finalCapital)
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "text-[40px] leading-none mb-2", style: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: r.playerReturn >= 0 ? WIN : LOSS }, children: [
      r.playerReturn >= 0 ? "+" : "",
      (r.playerReturn * 100).toFixed(1),
      "%"
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-base mb-6", style: { color: r.beatMarket ? WIN : LOSS, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: r.beatMarket ? t.sim.beatMarket : t.sim.lostToMarket }),
    /* @__PURE__ */ jsxs(Card, { className: "text-left mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm py-1", children: [
        /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: t.sim.marketReturn }),
        /* @__PURE__ */ jsxs("span", { style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: [
          r.marketReturn >= 0 ? "+" : "",
          (r.marketReturn * 100).toFixed(1),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm py-1", children: [
        /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: t.sim.tradesCount }),
        /* @__PURE__ */ jsx("span", { style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: r.tradesCount })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm py-1", children: [
        /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: t.sim.maxDrawdown }),
        /* @__PURE__ */ jsxs("span", { style: { color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }, children: [
          (r.maxDD * 100).toFixed(1),
          "%"
        ] })
      ] }),
      r.liquidated && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm py-1", children: [
        /* @__PURE__ */ jsx("span", { style: { color: BASE.inkFaint }, children: t.sim.liquidations }),
        /* @__PURE__ */ jsx("span", { style: { color: WARN, fontFamily: "'JetBrains Mono', monospace" }, children: t.sim.wasLiquidated })
      ] })
    ] }),
    r.achievements.length > 0 && /* @__PURE__ */ jsxs(Card, { accent, glowing: true, className: "text-left mb-4", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[11px] uppercase tracking-wide block mb-2", style: { color: BASE.inkFaint }, children: t.sim.achievements }),
      r.achievements.map((a) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm py-1", children: [
        /* @__PURE__ */ jsx(Check, { size: 13, style: { color: accent } }),
        /* @__PURE__ */ jsx("span", { style: { color: BASE.ink }, children: a })
      ] }, a))
    ] }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: startSession,
        className: "px-10 py-3 rounded-full text-sm transition-all active:scale-95",
        style: { background: accent, color: "#06120F", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, boxShadow: softLift(accent) },
        children: t.sim.playAgain
      }
    )
  ] });
}
function SettingsSection({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "mb-6 break-inside-avoid", children });
}
function SettingsSectionLabel({ children }) {
  return /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-2.5", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children });
}
function Settings({
  accent,
  setAccent,
  name,
  setName,
  onThemeChange,
  soundOn,
  setSoundOn,
  weeklyGoal,
  setWeeklyGoal,
  onExport,
  onImport,
  onExportBackup,
  onImportBackup,
  onReset,
  onFullReset,
  measureMode,
  setMeasureMode,
  currency,
  setCurrency,
  tradingAsset,
  setTradingAsset,
  startingCapital,
  setStartingCapital,
  username,
  accountProvider,
  onLogout,
  lang,
  setLang,
  t
}) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmFullReset, setConfirmFullReset] = useState(false);
  const importInputRef = useRef(null);
  const importBackupInputRef = useRef(null);
  const [capitalDraft, setCapitalDraft] = useState(String(startingCapital));
  useEffect(() => {
    setCapitalDraft(String(startingCapital));
  }, [startingCapital]);
  const Section = SettingsSection;
  const SectionLabel = SettingsSectionLabel;
  return /* @__PURE__ */ jsxs("div", { className: "stagger", children: [
    /* @__PURE__ */ jsxs("h2", { className: "text-lg mb-5 flex items-center gap-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }, children: [
      /* @__PURE__ */ jsx(SettingsIcon, { size: 17, style: { color: accent } }),
      " ",
      t.settings.title
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "lg:columns-2 lg:gap-6", children: [
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.language }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [{ id: "ru", label: t.settings.russian }, { id: "en", label: t.settings.english }].map((l) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setLang(l.id),
          className: "flex-1 px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
          style: { background: lang === l.id ? `${accent}12` : "transparent", color: lang === l.id ? accent : BASE.inkDim, border: `1px solid ${lang === l.id ? accent + "40" : BASE.line}` },
          children: l.label
        },
        l.id
      )) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mt-2", style: { color: BASE.inkFaint }, children: t.settings.languageNote })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.tradingAssetLabel }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", children: [
        { id: "crypto", label: t.settings.tradingAssetCrypto },
        { id: "forex", label: t.settings.tradingAssetForex },
        { id: "stocks", label: t.settings.tradingAssetStocks }
      ].map((o) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setTradingAsset(o.id),
          className: "px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
          style: { background: tradingAsset === o.id ? `${accent}12` : "transparent", color: tradingAsset === o.id ? accent : BASE.inkDim, border: `1px solid ${tradingAsset === o.id ? accent + "40" : BASE.line}` },
          children: o.label
        },
        o.id
      )) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mt-2", style: { color: BASE.inkFaint }, children: t.settings.tradingAssetNote })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.account }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 rounded-xl mb-2", style: { border: `1px solid ${BASE.line}`, background: BASE.surface }, children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2.5 text-sm", style: { color: BASE.ink }, children: [
          /* @__PURE__ */ jsx(User, { size: 15, style: { color: accent } }),
          " ",
          username || "\u2014"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase", style: { color: BASE.inkFaint, fontFamily: "'JetBrains Mono', monospace" }, children: accountProvider || "\u2014" })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: onLogout, className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${BASE.line}`, background: BASE.surface, color: BASE.inkDim }, children: [
        /* @__PURE__ */ jsx(LogOut, { size: 15 }),
        " ",
        t.settings.logout
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mt-2", style: { color: BASE.inkFaint }, children: t.settings.localAccountNote })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.operatorName }),
      /* @__PURE__ */ jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: t.settings.operatorPlaceholder, className: "w-full bg-transparent border-b outline-none py-2 text-sm", style: { borderColor: BASE.line, color: BASE.ink } })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.accentColor }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: ACCENTS.map((a) => /* @__PURE__ */ jsxs("button", { onClick: () => {
        setAccent(a);
        onThemeChange(a.name);
      }, className: "flex flex-col items-center gap-1.5 transition-transform duration-150 active:scale-90", children: [
        /* @__PURE__ */ jsx("span", { className: "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300", style: { background: a.value, boxShadow: accent === a.value ? `0 0 0 3px ${BASE.bg}, 0 0 0 4.5px ${a.value}60` : "none" }, children: accent === a.value && /* @__PURE__ */ jsx(Check, { size: 16, color: "#06120F" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-[10px]", style: { color: BASE.inkFaint }, children: a.name })
      ] }, a.name)) })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.resultUnits }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 mb-3", children: [{ id: "R", label: t.settings.rMultiplier }, { id: "currency", label: t.settings.currencyLabel }].map((m) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setMeasureMode(m.id),
          className: "px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
          style: { background: measureMode === m.id ? `${accent}12` : "transparent", color: measureMode === m.id ? accent : BASE.inkDim, border: `1px solid ${measureMode === m.id ? accent + "40" : BASE.line}` },
          children: m.label
        },
        m.id
      )) }),
      measureMode === "currency" && /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
        /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap mb-3", children: CURRENCIES.map((c) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setCurrency(c.code),
            className: "px-3.5 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
            style: { background: currency === c.code ? `${accent}12` : "transparent", color: currency === c.code ? accent : BASE.inkDim, border: `1px solid ${currency === c.code ? accent + "40" : BASE.line}`, fontFamily: "'JetBrains Mono', monospace" },
            children: [
              c.symbol,
              " ",
              c.code
            ]
          },
          c.code
        )) }),
        /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.startingCapital }),
        /* @__PURE__ */ jsx(
          "input",
          {
            value: capitalDraft,
            onChange: (e) => setCapitalDraft(e.target.value.replace(/^0+(?=\d)/, "")),
            onBlur: () => {
              const parsed = parseFloat(capitalDraft);
              const next = Number.isFinite(parsed) && parsed >= 0 ? parsed : startingCapital;
              setStartingCapital(next);
              setCapitalDraft(String(next));
            },
            type: "text",
            inputMode: "decimal",
            className: "w-full bg-transparent border-b outline-none py-2 text-sm",
            style: { borderColor: BASE.line, color: BASE.ink, fontFamily: "'JetBrains Mono', monospace" }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.weeklyGoalLabel }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [3, 5, 7].map((g) => /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: () => setWeeklyGoal(g),
          className: "px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
          style: { background: weeklyGoal === g ? `${accent}12` : "transparent", color: weeklyGoal === g ? accent : BASE.inkDim, border: `1px solid ${weeklyGoal === g ? accent + "40" : BASE.line}` },
          children: [
            g,
            " ",
            t.settings.daysSuffix
          ]
        },
        g
      )) }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mt-2", style: { color: BASE.inkFaint }, children: t.settings.weeklyGoalNote })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.sound }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setSoundOn(!soundOn), className: "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200", style: { border: `1px solid ${BASE.line}`, background: BASE.surface }, children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2.5 text-sm", style: { color: BASE.ink }, children: [
          soundOn ? /* @__PURE__ */ jsx(Volume2, { size: 16, style: { color: accent } }) : /* @__PURE__ */ jsx(VolumeX, { size: 16, style: { color: BASE.inkFaint } }),
          t.settings.soundToggleLabel
        ] }),
        /* @__PURE__ */ jsx("span", { className: "w-9 h-5 rounded-full relative transition-all duration-200", style: { background: soundOn ? accent : BASE.line }, children: /* @__PURE__ */ jsx("span", { className: "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-200", style: { left: soundOn ? "18px" : "2px" } }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.data }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mb-2.5", style: { color: BASE.inkFaint }, children: t.settings.dataNote }),
      /* @__PURE__ */ jsxs("button", { onClick: onExportBackup, className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-2 transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${accent}40`, background: `${accent}0D`, color: BASE.ink }, children: [
        /* @__PURE__ */ jsx(Download, { size: 15, style: { color: accent } }),
        " ",
        t.settings.fullBackup
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => importBackupInputRef.current?.click(), className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-3 transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${accent}40`, background: `${accent}0D`, color: BASE.ink }, children: [
        /* @__PURE__ */ jsx(Upload, { size: 15, style: { color: accent } }),
        " ",
        t.settings.restoreBackup
      ] }),
      /* @__PURE__ */ jsx("input", { ref: importBackupInputRef, type: "file", accept: "application/json,.json", className: "hidden", onChange: (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) onImportBackup(f);
      } }),
      /* @__PURE__ */ jsxs("button", { onClick: onExport, className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-2 transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${BASE.line}`, background: BASE.surface, color: BASE.ink }, children: [
        /* @__PURE__ */ jsx(Download, { size: 15, style: { color: accent } }),
        " ",
        t.settings.exportJournalOnly
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => importInputRef.current?.click(), className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm mb-2 transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${BASE.line}`, background: BASE.surface, color: BASE.ink }, children: [
        /* @__PURE__ */ jsx(Upload, { size: 15, style: { color: accent } }),
        " ",
        t.settings.importJournalOnly
      ] }),
      /* @__PURE__ */ jsx("input", { ref: importInputRef, type: "file", accept: "application/json,.json", className: "hidden", onChange: (e) => {
        const f = e.target.files?.[0];
        e.target.value = "";
        if (f) onImport(f);
      } }),
      confirmReset ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-xl", style: { border: `1px solid ${LOSS}50`, background: `${LOSS}0D` }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 15, style: { color: LOSS } }),
        /* @__PURE__ */ jsx("span", { className: "text-xs flex-1", style: { color: BASE.ink }, children: t.settings.confirmClearJournal }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          onReset();
          setConfirmReset(false);
        }, className: "text-xs shrink-0", style: { color: LOSS }, children: t.settings.yes }),
        /* @__PURE__ */ jsx("button", { onClick: () => setConfirmReset(false), className: "text-xs shrink-0", style: { color: BASE.inkFaint }, children: t.settings.cancel })
      ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setConfirmReset(true), className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${BASE.line}`, background: BASE.surface, color: LOSS }, children: [
        /* @__PURE__ */ jsx(Trash2, { size: 15 }),
        " ",
        t.settings.clearJournal
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Section, { children: [
      /* @__PURE__ */ jsx(SectionLabel, { children: t.settings.fullResetTitle }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mb-3", style: { color: BASE.inkFaint }, children: t.settings.fullResetNote }),
      confirmFullReset ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-4 py-3 rounded-xl", style: { border: `1px solid ${LOSS}50`, background: `${LOSS}0D` }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 15, style: { color: LOSS } }),
        /* @__PURE__ */ jsx("span", { className: "text-xs flex-1", style: { color: BASE.ink }, children: t.settings.confirmFullReset }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          onFullReset();
          setConfirmFullReset(false);
        }, className: "text-xs shrink-0", style: { color: LOSS }, children: t.settings.yesReset }),
        /* @__PURE__ */ jsx("button", { onClick: () => setConfirmFullReset(false), className: "text-xs shrink-0", style: { color: BASE.inkFaint }, children: t.settings.cancel })
      ] }) : /* @__PURE__ */ jsxs("button", { onClick: () => setConfirmFullReset(true), className: "w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98]", style: { border: `1px solid ${LOSS}50`, background: `${LOSS}0D`, color: LOSS }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 15 }),
        " ",
        t.settings.fullResetButton
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs break-inside-avoid", style: { color: BASE.inkFaint }, children: t.settings.footerNote })
    ] })
  ] });
}
function sanitizeImportedEntry(e, fallbackIndex) {
  if (!e || typeof e !== "object") return null;
  const date = new Date(e.date);
  if (isNaN(date.getTime())) return null;
  const exitDate = e.exitDate ? new Date(e.exitDate) : null;
  const clampCoord = (v) => typeof v === "number" && !isNaN(v) ? Math.max(0, Math.min(100, v)) : null;
  const outcome = ["Win", "Loss", "Breakeven"].includes(e.outcome) ? e.outcome : null;
  return migrateEntry({
    id: e.id != null ? String(e.id) : `imported_${Date.now()}_${fallbackIndex}_${Math.random().toString(36).slice(2, 6)}`,
    status: e.status === "open" || e.status === "closed" ? e.status : void 0,
    instrument: typeof e.instrument === "string" && e.instrument ? e.instrument : "\u2014",
    direction: e.direction === "Short" ? "Short" : "Long",
    outcome,
    r: typeof e.r === "number" && !isNaN(e.r) ? e.r : null,
    tag: typeof e.tag === "string" && e.tag ? e.tag : "\u041E\u0431\u0449\u0435\u0435",
    x: clampCoord(e.x),
    y: clampCoord(e.y),
    pull: typeof e.pull === "string" && e.pull ? e.pull : "\u2014",
    lesson: typeof e.lesson === "string" && e.lesson ? e.lesson : "\u2014",
    date,
    exitDate: !isNaN(exitDate?.getTime()) ? exitDate : null,
    screenshots: Array.isArray(e.screenshots) ? e.screenshots.filter((s) => typeof s === "string").slice(0, 4) : [],
    exitScreenshots: Array.isArray(e.exitScreenshots) ? e.exitScreenshots.filter((s) => typeof s === "string").slice(0, 4) : [],
    entryPrice: typeof e.entryPrice === "number" && !isNaN(e.entryPrice) ? e.entryPrice : null,
    exitPrice: typeof e.exitPrice === "number" && !isNaN(e.exitPrice) ? e.exitPrice : null,
    stopLoss: e.stopLoss,
    takeProfit: e.takeProfit,
    plannedRR: e.plannedRR,
    closeType: e.closeType,
    realizedRR: e.realizedRR,
    rr: typeof e.rr === "number" && !isNaN(e.rr) ? e.rr : null
  });
}
var SCHEMA_VERSION = 2;
var PROFILE_KEY = "mind-exe-journal-state";
var MEDIA_KEY = "mind-exe-journal-media";
var ANON_ID_KEY = "mind-exe-anon-id";
function getOrCreateAnonId() {
  try {
    let id = window.localStorage?.getItem(ANON_ID_KEY);
    if (!id) {
      id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage?.setItem(ANON_ID_KEY, id);
    }
    return id;
  } catch (_) {
    return "anon_local";
  }
}
function migrateProfile(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.version === SCHEMA_VERSION) return raw;
  if (!raw.version) {
    return {
      version: 2,
      user: { name: typeof raw.name === "string" ? raw.name : "" },
      journal: { entries: Array.isArray(raw.entries) ? raw.entries : [] },
      settings: {
        accentIndex: typeof raw.accentIndex === "number" ? raw.accentIndex : void 0,
        soundOn: typeof raw.soundOn === "boolean" ? raw.soundOn : true,
        weeklyGoal: typeof raw.weeklyGoal === "number" ? raw.weeklyGoal : 5,
        measureMode: raw.measureMode || "R",
        currency: raw.currency || "USD",
        startingCapital: typeof raw.startingCapital === "number" ? raw.startingCapital : 1e3,
        customInstruments: Array.isArray(raw.customInstruments) ? raw.customInstruments : [],
        customTags: Array.isArray(raw.customTags) ? raw.customTags : []
      },
      progress: { lastCalibration: raw.lastCalibration ?? null },
      wallet: {
        mindCoins: typeof raw.mindCoins === "number" ? raw.mindCoins : 0,
        coinLedger: Array.isArray(raw.coinLedger) ? raw.coinLedger : [],
        lastDailyReward: raw.lastDailyReward ?? null
      }
    };
  }
  return raw;
}
var __storageChain = Promise.resolve();
function queueStorage(fn) {
  const run = __storageChain.then(fn, fn);
  __storageChain = run.then(() => {
  }, () => {
  });
  return run;
}
async function withStorageRetry(fn, attempts = 4, delayMs = 150) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      const isBridgeGlitch = /unexpected response/i.test(String(e?.message || e || ""));
      if (i === attempts - 1 || !isBridgeGlitch) throw e;
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
}
var storageDegraded = false;
function markStorageDegraded(e) {
  if (/unexpected response/i.test(String(e?.message || e || ""))) storageDegraded = true;
}
async function legacyStorageGet(key, shared = false) {
  if (!window.storage || storageDegraded) return null;
  try {
    return await queueStorage(() => withStorageRetry(() => window.storage.get(key, shared)));
  } catch (e) {
    markStorageDegraded(e);
    throw e;
  }
}
async function legacyStorageSet(key, value, shared = false) {
  if (!window.storage || storageDegraded) return null;
  try {
    return await queueStorage(() => withStorageRetry(() => window.storage.set(key, value, shared)));
  } catch (e) {
    markStorageDegraded(e);
    throw e;
  }
}
async function legacyStorageDelete(key, shared = false) {
  if (!window.storage || storageDegraded) return null;
  try {
    return await queueStorage(() => withStorageRetry(() => window.storage.delete(key, shared)));
  } catch (e) {
    markStorageDegraded(e);
    throw e;
  }
}
async function storageGet(key, shared = false) {
  const ref = fsDocRef(key, shared);
  if (!ref) return null;
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { key, value: snap.data().value, shared: !!shared };
}
async function storageSet(key, value, shared = false) {
  const ref = fsDocRef(key, shared);
  if (!ref) return null;
  await setDoc(ref, { value, updatedAt: Date.now() });
  return { key, value, shared: !!shared };
}
async function storageDelete(key, shared = false) {
  const ref = fsDocRef(key, shared);
  if (!ref) return null;
  await deleteDoc(ref);
  return { key, deleted: true, shared: !!shared };
}
function profileKey(userId) {
  return `${PROFILE_KEY}:${userId}`;
}
function mediaKey(userId) {
  return `${MEDIA_KEY}:${userId}`;
}
function aiKey(userId) {
  return `mind-exe-ai:${userId}`;
}
async function loadAiState(userId) {
  if (!window.storage || !userId) return { analysis: "", chatMessages: [] };
  try {
    const res = await storageGet(aiKey(userId), false);
    return res?.value ? JSON.parse(res.value) : { analysis: "", chatMessages: [] };
  } catch (_) {
    return { analysis: "", chatMessages: [] };
  }
}
async function saveAiState(userId, aiState) {
  if (!window.storage || !userId) return;
  try {
    await storageSet(aiKey(userId), JSON.stringify(aiState), false);
  } catch (_) {
  }
}
async function loadProfile(userId) {
  if (!window.storage || !userId) return null;
  const res = await storageGet(profileKey(userId), false);
  if (!res?.value) return null;
  return migrateProfile(JSON.parse(res.value));
}
async function saveProfile(userId, profile) {
  if (!window.storage || !userId) return;
  await storageSet(profileKey(userId), JSON.stringify({ ...profile, version: SCHEMA_VERSION }), false);
}
async function loadMedia(userId) {
  if (!window.storage || !userId) return {};
  try {
    const res = await storageGet(mediaKey(userId), false);
    return res?.value ? JSON.parse(res.value) : {};
  } catch (_) {
    return {};
  }
}
async function saveMedia(userId, mediaMap) {
  if (!window.storage || !userId) return;
  try {
    await storageSet(mediaKey(userId), JSON.stringify(mediaMap), false);
  } catch (e) {
    console.warn("mind.exe: could not save screenshots (quota?)", e);
  }
}
var AUTH_USERS_KEY = "mind-exe-auth-users";
var LEGACY_CLAIMED_KEY = "mind-exe-legacy-claimed";
var LOCAL_MIGRATED_KEY = "mind-exe-local-migrated";
var USERNAME_RE = /^[a-z0-9_.-]{3,32}$/;
function usernameToEmail(username) {
  return `${username.trim().toLowerCase()}@mindexe.local`;
}
function emailToUsername(email) {
  return (email || "").split("@")[0];
}
async function findLegacyLocalUser(username) {
  try {
    const res = await legacyStorageGet(AUTH_USERS_KEY, false);
    const users = res?.value ? JSON.parse(res.value) : {};
    return users[username.trim().toLowerCase()] || null;
  } catch (_) {
    return null;
  }
}
async function migrateLocalAccountIfNeeded(uid, username) {
  try {
    const already = await storageGet(LOCAL_MIGRATED_KEY, false);
    if (already?.value) return;
    const legacyUser = await findLegacyLocalUser(username);
    if (!legacyUser) return;
    const [legacyProfile, legacyMedia] = await Promise.all([
      legacyStorageGet(profileKey(legacyUser.id), false).catch(() => null),
      legacyStorageGet(mediaKey(legacyUser.id), false).catch(() => null)
    ]);
    if (legacyProfile?.value) await storageSet(profileKey(uid), legacyProfile.value, false);
    if (legacyMedia?.value) await storageSet(mediaKey(uid), legacyMedia.value, false);
    await storageSet(LOCAL_MIGRATED_KEY, "1", false);
  } catch (e) {
    console.warn("mind.exe: local\u2192Firebase account migration skipped", e);
  }
}
function createFirebaseAuthProvider() {
  return {
    async register(username, password) {
      const uname = (username || "").trim();
      if (!USERNAME_RE.test(uname.toLowerCase())) {
        throw new Error("\u041B\u043E\u0433\u0438\u043D: 3-32 \u0441\u0438\u043C\u0432\u043E\u043B\u0430, \u043B\u0430\u0442\u0438\u043D\u0438\u0446\u0430/\u0446\u0438\u0444\u0440\u044B/._-");
      }
      if ((password || "").length < 6) {
        throw new Error("\u041F\u0430\u0440\u043E\u043B\u044C \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u043E\u0442 6 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432");
      }
      const cred = await createUserWithEmailAndPassword(fbAuth, usernameToEmail(uname), password);
      await firebaseUpdateProfile(cred.user, { displayName: uname });
      await migrateLocalAccountIfNeeded(cred.user.uid, uname);
      return { id: cred.user.uid, username: uname };
    },
    async login(username, password) {
      const uname = (username || "").trim();
      const cred = await signInWithEmailAndPassword(fbAuth, usernameToEmail(uname), password);
      await migrateLocalAccountIfNeeded(cred.user.uid, uname);
      return { id: cred.user.uid, username: cred.user.displayName || emailToUsername(cred.user.email) };
    },
    async logout() {
      await firebaseSignOut(fbAuth);
    },
    async loginWithGoogle() {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(fbAuth, provider);
      const uname = cred.user.displayName || emailToUsername(cred.user.email) || `user_${cred.user.uid.slice(0, 6)}`;
      return { id: cred.user.uid, username: uname };
    },
    async getSession() {
      return new Promise((resolve) => {
        const unsub = onAuthStateChanged(fbAuth, (u) => {
          unsub();
          resolve(u ? { id: u.uid, username: u.displayName || emailToUsername(u.email) } : null);
        });
      });
    }
  };
}
function authProviderLabel() {
  const pid = fbAuth.currentUser?.providerData?.[0]?.providerId;
  if (pid === "google.com") return "google";
  if (pid === "password") return "email";
  return "\u2014";
}
var authProvider = createFirebaseAuthProvider();
var authService = {
  register: (username, password) => {
    const friendly = (e) => {
      const code = e?.code || "";
      if (code === "auth/email-already-in-use") return new Error("\u0422\u0430\u043A\u043E\u0439 \u043B\u043E\u0433\u0438\u043D \u0443\u0436\u0435 \u0437\u0430\u043D\u044F\u0442");
      if (code === "auth/weak-password") return new Error("\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043F\u0440\u043E\u0441\u0442\u043E\u0439 \u043F\u0430\u0440\u043E\u043B\u044C");
      return e;
    };
    return authProvider.register(username, password).catch((e) => { throw friendly(e); });
  },
  login: (username, password) => {
    const friendly = (e) => {
      const code = e?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        return new Error("\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043B\u043E\u0433\u0438\u043D \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C");
      }
      return e;
    };
    return authProvider.login(username, password).catch((e) => { throw friendly(e); });
  },
  logout: () => authProvider.logout(),
  loginWithGoogle: () => {
    const friendly = (e) => {
      const code = e?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return new Error("\u0412\u0445\u043E\u0434 \u043E\u0442\u043C\u0435\u043D\u0451\u043D");
      }
      if (code === "auth/popup-blocked") {
        return new Error("\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043B \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u044E\u0449\u0435\u0435 \u043E\u043A\u043D\u043E \u2014 \u0440\u0430\u0437\u0440\u0435\u0448\u0438 \u0432\u0441\u043F\u043B\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u043E\u043A\u043D\u0430 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437");
      }
      return e;
    };
    return authProvider.loginWithGoogle().catch((e) => { throw friendly(e); });
  },
  getCurrentUser: () => authProvider.getSession()
};
async function checkLegacyDataAvailable() {
  if (!window.storage) return false;
  try {
    const claimed = await legacyStorageGet(LEGACY_CLAIMED_KEY, false);
    if (claimed?.value) return false;
    const legacy = await legacyStorageGet(PROFILE_KEY, false);
    return !!legacy?.value;
  } catch (_) {
    return false;
  }
}
async function claimLegacyData(userId) {
  if (!window.storage) return;
  try {
    const [legacyProfile, legacyMedia] = await Promise.all([
      legacyStorageGet(PROFILE_KEY, false).catch(() => null),
      legacyStorageGet(MEDIA_KEY, false).catch(() => null)
    ]);
    if (legacyProfile?.value) await storageSet(profileKey(userId), legacyProfile.value, false);
    if (legacyMedia?.value) await storageSet(mediaKey(userId), legacyMedia.value, false);
  } finally {
    try {
      await legacyStorageSet(LEGACY_CLAIMED_KEY, "1", false);
    } catch (_) {
    }
  }
}
async function skipLegacyData() {
  if (!window.storage) return;
  try {
    await legacyStorageSet(LEGACY_CLAIMED_KEY, "1", false);
  } catch (_) {
  }
}
function useAuth() {
  const [status, setStatus] = useState("checking");
  const [user, setUser] = useState(null);
  useEffect(() => {
    let cancelled = false;
    authService.getCurrentUser().then((u) => {
      if (!cancelled) {
        setUser(u);
        setStatus(u ? "authenticated" : "unauthenticated");
      }
    }).catch(() => {
      if (!cancelled) setStatus("unauthenticated");
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const register = async (username, password) => {
    const u = await authService.register(username, password);
    setUser(u);
    setStatus("authenticated");
    return u;
  };
  const login = async (username, password) => {
    const u = await authService.login(username, password);
    setUser(u);
    setStatus("authenticated");
    return u;
  };
  const loginWithGoogle = async () => {
    const u = await authService.loginWithGoogle();
    setUser(u);
    setStatus("authenticated");
    return u;
  };
  const logout = async () => {
    await authService.logout();
    setUser(null);
    setStatus("unauthenticated");
  };
  return { status, user, register, login, loginWithGoogle, logout };
}
function AuthScreen({ accent, onRegister, onLogin, onGoogle }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const switchMode = (m) => {
    setMode(m);
    setError("");
  };
  const submit = async () => {
    if (busy) return;
    setError("");
    if (mode === "register" && password !== confirmPassword) {
      setError("\u041F\u0430\u0440\u043E\u043B\u0438 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u0434\u0430\u044E\u0442");
      return;
    }
    setBusy(true);
    try {
      if (mode === "register") await onRegister(username, password);
      else await onLogin(username, password);
    } catch (e) {
      const raw = e?.message || "";
      setError(/unexpected response/i.test(raw) ? "\u0425\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u043D\u0435 \u043E\u0442\u0432\u0435\u0442\u0438\u043B\u043E \u2014 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439 \u0435\u0449\u0451 \u0440\u0430\u0437." : raw || "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A");
    } finally {
      setBusy(false);
    }
  };
  const submitGoogle = async () => {
    if (googleBusy) return;
    setError("");
    setGoogleBusy(true);
    try {
      await onGoogle();
    } catch (e) {
      setError(e?.message || "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A");
    } finally {
      setGoogleBusy(false);
    }
  };
  const disabled = busy || !username.trim() || !password || mode === "register" && !confirmPassword;
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-40 flex flex-col items-center justify-center px-8", style: { background: "#040405" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none fixed inset-0 overflow-hidden", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "cosmic-core" }),
      /* @__PURE__ */ jsx("div", { className: "cosmic-stars cosmic-stars-1" }),
      /* @__PURE__ */ jsx("div", { className: "cosmic-stars cosmic-stars-2" }),
      /* @__PURE__ */ jsx("div", { className: "cosmic-vignette" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-3 mb-9", children: [
        /* @__PURE__ */ jsx(LogoMark, { size: 38, accent }),
        /* @__PURE__ */ jsx(Wordmark, { accent, size: 17 })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-6 justify-center", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => switchMode("login"),
            className: "px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
            style: { background: mode === "login" ? `${accent}12` : "transparent", color: mode === "login" ? accent : BASE.inkDim, border: `1px solid ${mode === "login" ? accent + "40" : BASE.line}` },
            children: "\u0412\u043E\u0439\u0442\u0438"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => switchMode("register"),
            className: "px-4 py-1.5 rounded-full text-sm transition-all duration-200 active:scale-95",
            style: { background: mode === "register" ? `${accent}12` : "transparent", color: mode === "register" ? accent : BASE.inkDim, border: `1px solid ${mode === "register" ? accent + "40" : BASE.line}` },
            children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(Card, { accent, className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-2", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041B\u043E\u0433\u0438\u043D" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b py-2", style: { borderColor: BASE.line }, children: [
            /* @__PURE__ */ jsx(User, { size: 14, style: { color: BASE.inkFaint } }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: username,
                onChange: (e) => setUsername(e.target.value),
                placeholder: "trader01",
                autoCapitalize: "none",
                autoCorrect: "off",
                spellCheck: false,
                className: "flex-1 bg-transparent outline-none text-sm",
                style: { color: BASE.ink }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: mode === "register" ? "mb-4" : "mb-1", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-2", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041F\u0430\u0440\u043E\u043B\u044C" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b py-2", style: { borderColor: BASE.line }, children: [
            /* @__PURE__ */ jsx(KeyRound, { size: 14, style: { color: BASE.inkFaint } }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: password,
                onChange: (e) => setPassword(e.target.value),
                type: showPw ? "text" : "password",
                placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022",
                className: "flex-1 bg-transparent outline-none text-sm",
                style: { color: BASE.ink }
              }
            ),
            /* @__PURE__ */ jsx("button", { onClick: () => setShowPw((v) => !v), className: "shrink-0", type: "button", "aria-label": "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C", children: showPw ? /* @__PURE__ */ jsx(EyeOff, { size: 14, style: { color: BASE.inkFaint } }) : /* @__PURE__ */ jsx(Eye, { size: 14, style: { color: BASE.inkFaint } }) })
          ] })
        ] }),
        mode === "register" && /* @__PURE__ */ jsxs("div", { className: "mb-1", children: [
          /* @__PURE__ */ jsx("label", { className: "block text-[11px] uppercase tracking-wide mb-2", style: { color: BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 border-b py-2", style: { borderColor: BASE.line }, children: [
            /* @__PURE__ */ jsx(KeyRound, { size: 14, style: { color: BASE.inkFaint } }),
            /* @__PURE__ */ jsx(
              "input",
              {
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                type: showPw ? "text" : "password",
                placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022",
                className: "flex-1 bg-transparent outline-none text-sm",
                style: { color: BASE.ink }
              }
            )
          ] })
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("p", { className: "text-xs mb-3 text-center", style: { color: LOSS }, children: error }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: submit,
          disabled,
          className: "w-full py-3 rounded-xl text-sm mb-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-40",
          style: { border: `1px solid ${accent}40`, background: `${accent}12`, color: accent, fontFamily: "'Space Grotesk', sans-serif" },
          children: busy ? "\u2026" : mode === "register" ? "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442" : "\u0412\u043E\u0439\u0442\u0438"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: submitGoogle,
          disabled: googleBusy,
          type: "button",
          className: "w-full py-3 rounded-xl text-sm mb-6 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-40",
          style: { border: `1px solid ${BASE.line}`, color: BASE.ink, background: BASE.surface2 },
          children: [
            /* @__PURE__ */ jsxs("svg", { width: 16, height: 16, viewBox: "0 0 48 48", "aria-hidden": "true", children: [
              /* @__PURE__ */ jsx("path", { fill: "#FFC107", d: "M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z" }),
              /* @__PURE__ */ jsx("path", { fill: "#FF3D00", d: "M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z" }),
              /* @__PURE__ */ jsx("path", { fill: "#4CAF50", d: "M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.4 34.9 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 44 24 44z" }),
              /* @__PURE__ */ jsx("path", { fill: "#1976D2", d: "M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.5 5.5C41.5 35.7 44 30.4 44 24c0-1.2-.1-2.4-.4-3.5z" })
            ] }),
            googleBusy ? "\u2026" : "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0441 Google"
          ]
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-center mb-2", style: { color: BASE.inkFaint }, children: mode === "login" ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "\u041D\u0435\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430? ",
        /* @__PURE__ */ jsx("span", { onClick: () => switchMode("register"), className: "underline cursor-pointer", style: { color: accent }, children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        "\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442? ",
        /* @__PURE__ */ jsx("span", { onClick: () => switchMode("login"), className: "underline cursor-pointer", style: { color: accent }, children: "\u0412\u043E\u0439\u0442\u0438" })
      ] }) }),
      /* @__PURE__ */ jsx("p", { className: "text-[11px] text-center", style: { color: BASE.inkFaint }, children: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0442\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435." })
    ] })
  ] });
}
function LegacyMigratePrompt({ accent, onMigrate, onSkip }) {
  const [busy, setBusy] = useState(false);
  const run = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "fixed inset-0 z-40 flex flex-col items-center justify-center px-8", style: { background: "#040405" }, children: [
    /* @__PURE__ */ jsxs("div", { className: "pointer-events-none fixed inset-0 overflow-hidden", "aria-hidden": "true", children: [
      /* @__PURE__ */ jsx("div", { className: "cosmic-core" }),
      /* @__PURE__ */ jsx("div", { className: "cosmic-stars cosmic-stars-1" }),
      /* @__PURE__ */ jsx("div", { className: "cosmic-vignette" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-sm text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx(LogoMark, { size: 32, accent }) }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mb-2", style: { color: BASE.ink, fontFamily: "'Space Grotesk', sans-serif" }, children: "\u041D\u0430\u0439\u0434\u0435\u043D \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u044E\u0449\u0438\u0439 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs mb-8 leading-relaxed", style: { color: BASE.inkFaint }, children: "\u0414\u043D\u0435\u0432\u043D\u0438\u043A, \u043A\u043E\u0448\u0435\u043B\u0451\u043A MindCoin, streak \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438, \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0435 \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435 \u0440\u0430\u043D\u044C\u0448\u0435. \u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438 \u0438\u0445 \u0432 \u043D\u043E\u0432\u044B\u0439 \u0430\u043A\u043A\u0430\u0443\u043D\u0442?" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => run(onMigrate),
          disabled: busy,
          className: "w-full py-3 rounded-xl text-sm mb-3 transition-all duration-200 active:scale-[0.98] disabled:opacity-50",
          style: { border: `1px solid ${accent}40`, background: `${accent}12`, color: accent, fontFamily: "'Space Grotesk', sans-serif" },
          children: "\u041F\u0435\u0440\u0435\u043D\u0435\u0441\u0442\u0438"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => run(onSkip),
          disabled: busy,
          className: "w-full py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50",
          style: { border: `1px solid ${BASE.line}`, color: BASE.inkDim },
          children: "\u041D\u0430\u0447\u0430\u0442\u044C \u0437\u0430\u043D\u043E\u0432\u043E"
        }
      )
    ] })
  ] });
}
function BootIntro({ accent, name, lang, onDone }) {
  const isEn = lang === "en";
  const lines = isEn ? [
    "> mind.exe",
    "> auth\u2026 ok",
    "> syncing journal\u2026",
    `> welcome, ${name || "operator"}`
  ] : [
    "> mind.exe",
    "> \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F\u2026 ok",
    "> \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u044F \u0434\u043D\u0435\u0432\u043D\u0438\u043A\u0430\u2026",
    `> \u0434\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C, ${name || "\u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440"}`
  ];
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const lineDelay = 420;
    const holdAfter = 600;
    const totalTypeTime = lines.length * lineDelay + holdAfter;
    const fadeTimer = setTimeout(() => setFading(true), totalTypeTime);
    const doneTimer = setTimeout(() => onDone(), totalTypeTime + 480);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex flex-col items-center justify-center px-8 transition-opacity duration-500",
      style: { background: "#040405", opacity: fading ? 0 : 1 },
      children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-xs", children: lines.map((line, i) => /* @__PURE__ */ jsx(
        "p",
        {
          className: "text-sm mb-2",
          style: {
            color: i === lines.length - 1 ? accent : BASE.inkDim,
            fontFamily: "'JetBrains Mono', monospace",
            opacity: 0,
            animation: `riseIn 0.4s ease ${i * 0.42}s forwards`
          },
          children: line
        },
        i
      )) })
    }
  );
}
function DesktopSidebar({ nav, tab, setTab, accent, mindCoins, onWalletClick }) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "hidden md:flex fixed left-0 top-0 bottom-0 w-[232px] flex-col px-3 pt-6 pb-5 z-20",
      style: { background: "rgba(10,10,12,0.6)", borderRight: `1px solid ${BASE.line}`, backdropFilter: "blur(10px)" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 mb-1", children: [
          /* @__PURE__ */ jsx(LogoMark, { size: 24, accent }),
          /* @__PURE__ */ jsx(Wordmark, { accent })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-6 mt-2 px-2", children: /* @__PURE__ */ jsx(WalletBadge, { balance: mindCoins, accent, onClick: onWalletClick }) }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1 flex-1", children: nav.map((n) => {
          const active = tab === n.id;
          return /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setTab(n.id),
              className: "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
              style: { background: active ? `${accent}12` : "transparent", border: `1px solid ${active ? accent + "35" : "transparent"}` },
              children: [
                /* @__PURE__ */ jsx(n.icon, { size: 16, strokeWidth: 2, style: { color: active ? accent : BASE.inkFaint } }),
                /* @__PURE__ */ jsx("span", { className: "text-[13px]", style: { color: active ? accent : BASE.inkDim, fontFamily: "'Space Grotesk', sans-serif" }, children: n.label })
              ]
            },
            n.id
          );
        }) })
      ]
    }
  );
}
function MindExe() {
  const [entries, setEntries] = useState(() => seedEntries.map(migrateEntry));
  const [tab, setTab] = useState("home");
  const [closingId, setClosingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [accentPreset, setAccentPreset] = useState(ACCENTS.find((a) => a.cosmic) || ACCENTS[0]);
  const [name, setName] = useState("");
  const [toast, setToast] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [weeklyGoal, setWeeklyGoal] = useState(5);
  const [lang, setLang] = useState("ru");
  const [measureMode, setMeasureMode] = useState("R");
  const [currency, setCurrency] = useState("USD");
  const [tradingAsset, setTradingAsset] = useState(null);
  const [startingCapital, setStartingCapital] = useState(1e3);
  const [customInstruments, setCustomInstruments] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [lastCalibration, setLastCalibration] = useState(null);
  const [mindCoins, setMindCoins] = useState(0);
  const [coinLedger, setCoinLedger] = useState([]);
  const [lastDailyReward, setLastDailyReward] = useState(null);
  const analytics = useMemo(() => calculateTraderAnalytics(entries, lastCalibration, lang), [entries, lastCalibration, lang]);
  const t = STRINGS[lang] || STRINGS.ru;
  const [walletOpen, setWalletOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showBootIntro, setShowBootIntro] = useState(false);
  const [introResolved, setIntroResolved] = useState(false);
  const [anonId] = useState(getOrCreateAnonId);
  const toastTimer = useRef(null);
  const firstLoadRef = useRef(true);
  const firstDailyRewardRef = useRef(true);
  const canPersistRef = useRef(false);
  const { status: authStatus, user: authUser, register: authRegister, login: authLogin, loginWithGoogle: authLoginWithGoogle, logout: authLogout } = useAuth();
  const userId = authUser?.id || null;
  const [migrateFor, setMigrateFor] = useState(null);
  const accent = accentPreset.value;
  const resetInMemoryState = () => {
    setEntries([]);
    setName("");
    setAccentPreset(ACCENTS.find((a) => a.cosmic) || ACCENTS[0]);
    setSoundOn(true);
    setWeeklyGoal(5);
    setMeasureMode("R");
    setCurrency("USD");
    setTradingAsset(null);
    setStartingCapital(1e3);
    setCustomInstruments([]);
    setCustomTags([]);
    setLastCalibration(null);
    setMindCoins(0);
    setCoinLedger([]);
    setLastDailyReward(null);
  };
  const handleRegister = async (username, password) => {
    const newUser = await authRegister(username, password);
    const hasLegacy = await checkLegacyDataAvailable();
    if (hasLegacy) setMigrateFor(newUser.id);
  };
  const handleLogin = async (username, password) => {
    await authLogin(username, password);
  };
  const handleGoogleLogin = async () => {
    const newUser = await authLoginWithGoogle();
    const hasLegacy = await checkLegacyDataAvailable();
    if (hasLegacy) setMigrateFor(newUser.id);
  };
  const handleMigrate = async () => {
    if (!migrateFor) return;
    await claimLegacyData(migrateFor);
    setMigrateFor(null);
  };
  const handleSkipMigrate = async () => {
    await skipLegacyData();
    setMigrateFor(null);
  };
  const handleLogout = async () => {
    await authLogout();
    setLoaded(false);
    setIntroResolved(false);
    setShowBootIntro(false);
    resetInMemoryState();
    setTab("home");
  };
  useEffect(() => {
    if (authStatus !== "authenticated" || !loaded || migrateFor || !userId || introResolved) return;
    setShowBootIntro(true);
    setIntroResolved(true);
  }, [authStatus, loaded, migrateFor, userId, introResolved]);
  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 7200);
    const t2 = setTimeout(() => setShowSplash(false), 7700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  useEffect(() => {
    if (authStatus !== "authenticated" || !userId || migrateFor) return;
    let cancelled = false;
    setLoaded(false);
    canPersistRef.current = false;
    resetInMemoryState();
    const tryLoad = async (attempt = 0) => {
      if (cancelled) return;
      if (!window.storage) {
        if (attempt < 20) {
          setTimeout(() => tryLoad(attempt + 1), 100);
          return;
        }
        firstLoadRef.current = false;
        if (!cancelled) setLoaded(true);
        return;
      }
      try {
        const [profile, media] = await Promise.all([loadProfile(userId), loadMedia(userId)]);
        if (cancelled) return;
        if (profile) {
          const { user = {}, journal = {}, settings = {}, progress = {}, wallet = {} } = profile;
          const rawEntries = Array.isArray(journal.entries) ? journal.entries : [];
          const restoredEntries = rawEntries.map((e) => migrateEntry({
            ...e,
            date: new Date(e.date),
            exitDate: e.exitDate ? new Date(e.exitDate) : null,
            screenshots: Array.isArray(media?.[e.id]) ? media[e.id] : Array.isArray(media?.[e.id]?.entry) ? media[e.id].entry : [],
            exitScreenshots: Array.isArray(media?.[e.id]?.exit) ? media[e.id].exit : []
          }));
          setEntries(restoredEntries);
          if (user.name !== void 0) setName(user.name);
          if (typeof settings.accentIndex === "number") setAccentPreset(ACCENTS[settings.accentIndex] || ACCENTS.find((a) => a.cosmic) || ACCENTS[0]);
          if (typeof settings.soundOn === "boolean") setSoundOn(settings.soundOn);
          if (typeof settings.weeklyGoal === "number") setWeeklyGoal(settings.weeklyGoal);
          if (settings.lang === "en" || settings.lang === "ru") setLang(settings.lang);
          if (settings.measureMode) setMeasureMode(settings.measureMode);
          if (settings.currency) setCurrency(settings.currency);
          if (settings.tradingAsset) setTradingAsset(settings.tradingAsset);
          if (typeof settings.startingCapital === "number") setStartingCapital(settings.startingCapital);
          if (Array.isArray(settings.customInstruments)) setCustomInstruments(settings.customInstruments);
          if (Array.isArray(settings.customTags)) setCustomTags(settings.customTags);
          if (progress.lastCalibration) setLastCalibration(progress.lastCalibration);
          if (typeof wallet.mindCoins === "number") setMindCoins(wallet.mindCoins);
          if (Array.isArray(wallet.coinLedger)) setCoinLedger(wallet.coinLedger);
          if (wallet.lastDailyReward) setLastDailyReward(wallet.lastDailyReward);
          if (restoredEntries.length > 0) {
            setTimeout(() => showToast("\u0414\u0430\u043D\u043D\u044B\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B"), firstLoadRef.current ? 7900 : 300);
          }
        }
        // Firestore answered (with or without an existing profile) without throwing \u2014 that's the
        // only condition under which we trust the in-memory state enough to let it overwrite the
        // cloud copy. A thrown error below deliberately does NOT reach this line.
        canPersistRef.current = true;
        firstLoadRef.current = false;
        if (!cancelled) setLoaded(true);
      } catch (err) {
        // A network/permission hiccup here must never be allowed to fall through to the auto-save
        // effect with whatever's currently in memory (freshly reset to empty by resetInMemoryState
        // above) \u2014 that previously overwrote real cloud data with zeros. Retry a couple of times
        // first; only after retries are exhausted do we mark the app "loaded" for the UI, and even
        // then canPersistRef stays false so nothing auto-persists until a load actually succeeds.
        if (attempt < 2 && !cancelled) {
          setTimeout(() => tryLoad(attempt + 1), 800 * (attempt + 1));
          return;
        }
        console.error("mind.exe: failed to load cloud profile after retries \u2014 auto-save disabled for this session until it succeeds", err);
        firstLoadRef.current = false;
        if (!cancelled) {
          setLoaded(true);
          showToast("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435. \u041F\u0435\u0440\u0435\u0437\u0430\u0439\u0434\u0438 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435, \u0447\u0442\u043E\u0431\u044B \u043D\u0435 \u043F\u043E\u0442\u0435\u0440\u044F\u0442\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u043E\u0435.");
        }
      }
    };
    tryLoad();
    return () => {
      cancelled = true;
    };
  }, [authStatus, userId, migrateFor]);
  const buildPayload = (overrides = {}) => {
    const src = { entries, name, accentIndex: ACCENTS.findIndex((a) => a.value === accentPreset.value), soundOn, weeklyGoal, lang, measureMode, currency, tradingAsset, startingCapital, customInstruments, customTags, lastCalibration, mindCoins, coinLedger, lastDailyReward, ...overrides };
    return {
      version: SCHEMA_VERSION,
      user: { name: src.name, anonId },
      journal: {
        entries: src.entries.map(({ screenshots, ...rest }) => ({ ...rest, date: rest.date instanceof Date ? rest.date.toISOString() : rest.date, exitDate: rest.exitDate instanceof Date ? rest.exitDate.toISOString() : rest.exitDate }))
      },
      settings: {
        accentIndex: src.accentIndex,
        soundOn: src.soundOn,
        weeklyGoal: src.weeklyGoal,
        lang: src.lang,
        measureMode: src.measureMode,
        currency: src.currency,
        tradingAsset: src.tradingAsset,
        startingCapital: src.startingCapital,
        customInstruments: src.customInstruments,
        customTags: src.customTags
      },
      progress: { lastCalibration: src.lastCalibration },
      wallet: { mindCoins: src.mindCoins, coinLedger: src.coinLedger, lastDailyReward: src.lastDailyReward }
    };
  };
  const persistNow = async (overrides = {}) => {
    try {
      if (!window.storage || !userId) return;
      await saveProfile(userId, buildPayload(overrides));
      const srcEntries = overrides.entries ?? entries;
      const mediaMap = {};
      for (const e of srcEntries) {
        if ((Array.isArray(e.screenshots) && e.screenshots.length > 0) || (Array.isArray(e.exitScreenshots) && e.exitScreenshots.length > 0)) {
          mediaMap[e.id] = { entry: e.screenshots || [], exit: e.exitScreenshots || [] };
        }
      }
      await saveMedia(userId, mediaMap);
    } catch (_) {
    }
  };
  useEffect(() => {
    if (!loaded || !canPersistRef.current || authStatus !== "authenticated" || !userId) return;
    persistNow();
  }, [entries, name, accentPreset, soundOn, weeklyGoal, lang, measureMode, currency, tradingAsset, startingCapital, customInstruments, customTags, lastCalibration, mindCoins, coinLedger, lastDailyReward, loaded, authStatus, userId]);
  useEffect(() => {
    if (!loaded || !canPersistRef.current || authStatus !== "authenticated" || !userId) return;
    const flush = () => {
      if (document.visibilityState === "hidden") persistNow();
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, [entries, name, accentPreset, soundOn, weeklyGoal, lang, measureMode, currency, tradingAsset, startingCapital, customInstruments, customTags, lastCalibration, mindCoins, coinLedger, lastDailyReward, loaded, authStatus, userId]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const showToast = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  const awardCoins = (amount, reason) => {
    const tx = { id: `mc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, amount, reason, date: (/* @__PURE__ */ new Date()).toISOString() };
    const nextCoins = mindCoins + amount;
    const nextLedger = [...coinLedger, tx];
    setMindCoins(nextCoins);
    setCoinLedger(nextLedger);
    if (canPersistRef.current) persistNow({ mindCoins: nextCoins, coinLedger: nextLedger });
    return tx;
  };
  useEffect(() => {
    if (!loaded || !canPersistRef.current || authStatus !== "authenticated" || !userId) return;
    if (isToday(lastDailyReward)) return;
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const tx = { id: `mc_daily_${Date.now()}`, amount: 10, reason: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u044B\u0439 \u0432\u0445\u043E\u0434", date: nowIso };
    const nextCoins = mindCoins + 10;
    const nextLedger = [...coinLedger, tx];
    setMindCoins(nextCoins);
    setCoinLedger(nextLedger);
    setLastDailyReward(nowIso);
    persistNow({ mindCoins: nextCoins, coinLedger: nextLedger, lastDailyReward: nowIso });
    setTimeout(() => showToast("+10 MindCoin \u2014 \u0432\u0445\u043E\u0434 \u0437\u0430 \u0434\u0435\u043D\u044C"), firstDailyRewardRef.current ? 10300 : 400);
    firstDailyRewardRef.current = false;
  }, [loaded, authStatus, userId]);
  const playPing = () => {
    if (!soundOn) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.setValueAtTime(1e-4, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(1e-4, ctx.currentTime + 0.35);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.35);
    } catch (_) {
    }
  };
  const deleteEntry = (id) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    persistNow({ entries: next });
    showToast("\u0417\u0430\u043F\u0438\u0441\u044C \u0443\u0434\u0430\u043B\u0435\u043D\u0430");
  };
  const exportJournal = () => {
    try {
      const data = entries.map((e) => ({ ...e, date: e.date.toISOString(), exitDate: e.exitDate instanceof Date ? e.exitDate.toISOString() : e.exitDate }));
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mind-exe-journal.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("\u0416\u0443\u0440\u043D\u0430\u043B \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D");
    } catch (_) {
      showToast("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C");
    }
  };
  const importJournal = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result);
        if (!Array.isArray(raw)) throw new Error("not an array");
        const restored = raw.map(sanitizeImportedEntry).filter(Boolean);
        if (restored.length === 0 && raw.length > 0) throw new Error("nothing salvageable");
        setEntries(restored);
        persistNow({ entries: restored });
        showToast(restored.length < raw.length ? `\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E ${restored.length} \u0438\u0437 ${raw.length} \u2014 \u0447\u0430\u0441\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u0435\u0439 \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0430` : `\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0437\u0430\u043F\u0438\u0441\u0435\u0439: ${restored.length}`);
      } catch (_) {
        showToast("\u0424\u0430\u0439\u043B \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0451\u043D \u0438\u043B\u0438 \u043D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0444\u043E\u0440\u043C\u0430\u0442");
      }
    };
    reader.readAsText(file);
  };
  const exportFullBackup = () => {
    try {
      const payload = buildPayload();
      payload.journal.entries = entries.map((e) => ({ ...e, date: e.date instanceof Date ? e.date.toISOString() : e.date, exitDate: e.exitDate instanceof Date ? e.exitDate.toISOString() : e.exitDate }));
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mind-exe-backup.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("\u041F\u043E\u043B\u043D\u044B\u0439 \u0431\u044D\u043A\u0430\u043F \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D");
    } catch (_) {
      showToast("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u044D\u043A\u0441\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0431\u044D\u043A\u0430\u043F");
    }
  };
  const importFullBackup = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const raw = JSON.parse(reader.result);
        const profile = migrateProfile(raw);
        if (!profile) throw new Error("unrecognized backup format");
        const { user = {}, journal = {}, settings = {}, progress = {}, wallet = {} } = profile;
        const restoredEntries = (Array.isArray(journal.entries) ? journal.entries : []).map(sanitizeImportedEntry).filter(Boolean);
        setEntries(restoredEntries);
        if (user.name !== void 0) setName(user.name);
        if (typeof settings.accentIndex === "number") setAccentPreset(ACCENTS[settings.accentIndex] || ACCENTS.find((a) => a.cosmic) || ACCENTS[0]);
        if (typeof settings.soundOn === "boolean") setSoundOn(settings.soundOn);
        if (typeof settings.weeklyGoal === "number") setWeeklyGoal(settings.weeklyGoal);
        if (settings.lang === "en" || settings.lang === "ru") setLang(settings.lang);
        if (settings.measureMode) setMeasureMode(settings.measureMode);
        if (settings.currency) setCurrency(settings.currency);
        if (settings.tradingAsset) setTradingAsset(settings.tradingAsset);
        if (typeof settings.startingCapital === "number") setStartingCapital(settings.startingCapital);
        if (Array.isArray(settings.customInstruments)) setCustomInstruments(settings.customInstruments);
        if (Array.isArray(settings.customTags)) setCustomTags(settings.customTags);
        if (progress.lastCalibration) setLastCalibration(progress.lastCalibration);
        if (typeof wallet.mindCoins === "number") setMindCoins(wallet.mindCoins);
        if (Array.isArray(wallet.coinLedger)) setCoinLedger(wallet.coinLedger);
        if (wallet.lastDailyReward) setLastDailyReward(wallet.lastDailyReward);
        persistNow({
          entries: restoredEntries,
          name: user.name ?? name,
          accentIndex: typeof settings.accentIndex === "number" ? settings.accentIndex : ACCENTS.findIndex((a) => a.value === accentPreset.value),
          soundOn: settings.soundOn ?? soundOn,
          weeklyGoal: settings.weeklyGoal ?? weeklyGoal,
          lang: settings.lang ?? lang,
          measureMode: settings.measureMode ?? measureMode,
          currency: settings.currency ?? currency,
          tradingAsset: settings.tradingAsset ?? tradingAsset,
          startingCapital: settings.startingCapital ?? startingCapital,
          customInstruments: settings.customInstruments ?? customInstruments,
          customTags: settings.customTags ?? customTags,
          lastCalibration: progress.lastCalibration ?? lastCalibration,
          mindCoins: wallet.mindCoins ?? mindCoins,
          coinLedger: wallet.coinLedger ?? coinLedger,
          lastDailyReward: wallet.lastDailyReward ?? lastDailyReward
        });
        showToast("\u0411\u044D\u043A\u0430\u043F \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D");
      } catch (_) {
        showToast("\u0424\u0430\u0439\u043B \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0451\u043D \u0438\u043B\u0438 \u044D\u0442\u043E \u043D\u0435 \u0431\u044D\u043A\u0430\u043F mind.exe");
      }
    };
    reader.readAsText(file);
  };
  const resetJournal = () => {
    setEntries([]);
    persistNow({ entries: [] });
    showToast("\u0416\u0443\u0440\u043D\u0430\u043B \u043E\u0447\u0438\u0449\u0435\u043D");
  };
  const resetEverything = () => {
    const cosmicIndex = ACCENTS.findIndex((a) => a.cosmic);
    const defaults = {
      entries: [],
      name: "",
      accentIndex: cosmicIndex >= 0 ? cosmicIndex : 0,
      soundOn: true,
      weeklyGoal: 5,
      lang: "ru",
      measureMode: "R",
      currency: "USD",
      startingCapital: 1e3,
      customInstruments: [],
      customTags: [],
      lastCalibration: null,
      mindCoins: 0,
      coinLedger: [],
      lastDailyReward: null
    };
    setEntries([]);
    setName("");
    setAccentPreset(ACCENTS.find((a) => a.cosmic) || ACCENTS[0]);
    setSoundOn(true);
    setWeeklyGoal(5);
    setLang("ru");
    setMeasureMode("R");
    setCurrency("USD");
    setTradingAsset(null);
    setStartingCapital(1e3);
    setCustomInstruments([]);
    setCustomTags([]);
    setLastCalibration(null);
    setMindCoins(0);
    setCoinLedger([]);
    setLastDailyReward(null);
    persistNow(defaults);
    showToast("\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u043E");
  };
  const addCustomInstrument = (v) => setCustomInstruments((prev) => prev.some((x) => x.toLowerCase() === v.toLowerCase()) ? prev : [v, ...prev]);
  const addCustomTag = (v) => setCustomTags((prev) => prev.some((x) => x.toLowerCase() === v.toLowerCase()) ? prev : [v, ...prev]);
  const nav = [
    { id: "home", label: t.nav.home, icon: Sparkles },
    { id: "log", label: t.nav.log, icon: NotebookText },
    { id: "patterns", label: t.nav.patterns, icon: LineChartIcon },
    { id: "new", label: t.nav.new, icon: BookOpen, primary: true },
    { id: "challenge", label: t.nav.challenge, icon: Flame },
    { id: "coach", label: t.nav.coach, icon: Bot },
    { id: "settings", label: t.nav.settings, icon: SettingsIcon }
  ];
  const wideTab = ["home", "log", "patterns"].includes(tab);
  const formTab = ["new", "edit", "close"].includes(tab);
  const contentMaxWidth = wideTab ? "md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl" : formTab ? "md:max-w-3xl lg:max-w-4xl xl:max-w-5xl" : "md:max-w-2xl lg:max-w-4xl xl:max-w-5xl";
  return /* @__PURE__ */ jsxs("div", { className: `min-h-screen w-full relative theme-fade${accentPreset.cosmic ? " cosmic-theme" : ""}`, style: { background: accentPreset.cosmic ? "#040405" : BASE.bg, fontFamily: "'Inter', sans-serif" }, children: [
    /* @__PURE__ */ jsx("style", { children: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes logoPulseFade { 0%, 100% { opacity: 0.35; transform: scale(0.94); } 50% { opacity: 1; transform: scale(1.04); } }
        @keyframes softReveal { from { opacity: 0; filter: blur(5px); transform: translateY(3px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -6px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes ripple { from { width: 14px; height: 14px; opacity: 0.6; } to { width: 32px; height: 32px; opacity: 0; } }
        @keyframes drawMark { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes dotIn { from { opacity: 0; transform: scale(0.3); } to { opacity: 1; transform: scale(1); } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes flicker { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }

        /* ---------- Splash v3.1: swapped in the user's own black-hole-with-candlestick-chart photo
           (portrait, full-bleed) in place of the earlier landscape stock photo \u2014 per explicit
           instruction, the photo itself is used directly and unaltered, never redrawn or replaced.
           "Alive" still comes from cheap compositing layers only, same approach as before: a slow Ken
           Burns zoom (extra overscan margin so cover-cropping never shows a hard edge), and \u2014 the
           actual motion \u2014 a shimmer sweep gated by the photo's own brightness (SPLASH_BLACKHOLE_MASK,
           a luminance-derived alpha map computed from this exact image via PIL: grayscale, then a
           gamma/threshold curve that keeps only strongly bright pixels, so it isolates both the
           accretion disk ring AND the candlestick chart baked into the photo \u2014 the shimmer sweeps
           across both together, reinforcing the "chart is part of this living scene" read). Object/
           mask-position (47% 41%) was hand-measured against a 10% grid overlay on the source photo to
           find the event horizon's actual center; the scene is now full-height (was 62%) since this
           photo's own composition already carries the chart-flowing-into-the-hole story the full
           height of a phone screen. Rotating the whole photo is still avoided (perspective/lensing
           reasons carry over unchanged from the original photo). ---------- */
        .splash2-root { background: #000; overflow: hidden; }
        @keyframes splash2RiseFade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes splash2RingExpand { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
        @keyframes splash2KenBurns { from { transform: scale(1.0); } to { transform: scale(1.05); } }
        @keyframes splash2ShimmerPulse { 0%, 100% { opacity: 0.18; } 50% { opacity: 0.6; } }
        @keyframes splash2Glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.85; } }

        .splash2-bh-scene { position: absolute; inset: 0; height: 100%; overflow: hidden; }
        .splash2-bh-img {
          width: 100%; height: 100%; object-fit: cover; object-position: 47% 41%; display: block;
          animation: splash2KenBurns 12s cubic-bezier(0.45,0,0.55,1) infinite alternate;
        }
        /* v2: the moving diagonal light-bar (bg-position sweep) read as a cheap "shine" effect once
           it was sped up to be visible \u2014 a recognizable CSS-shine cliche that clashed with the
           photo's tone. Replaced with a still highlight (no travel) whose OPACITY breathes instead,
           gated by the same brightness mask so it still only lights up the ring/candle pixels; the
           motion now reads as the ring itself glowing brighter and dimmer, not a bar sliding over it.
           Same Ken Burns transform as the photo keeps the mask in registration while zooming. */
        .splash2-bh-shimmer {
          position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen;
          background: radial-gradient(ellipse 60% 60% at 47% 41%, rgba(255,246,224,0.9) 0%, rgba(255,238,208,0.5) 45%, transparent 75%);
          -webkit-mask-image: url(${SPLASH_BLACKHOLE_MASK}); mask-image: url(${SPLASH_BLACKHOLE_MASK});
          -webkit-mask-size: cover; mask-size: cover;
          -webkit-mask-position: 47% 41%; mask-position: 47% 41%;
          -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
          animation: splash2KenBurns 12s cubic-bezier(0.45,0,0.55,1) infinite alternate, splash2ShimmerPulse 4.5s ease-in-out infinite;
        }
        /* A second, slower, offset breathing cycle at the event horizon itself (measured center,
           47%/41%) so the hole's own light doesn't pulse in lockstep with the ring highlight above \u2014
           two overlapping slow cycles read as organic "alive" light rather than one obvious blink. */
        .splash2-bh-glow {
          position: absolute; inset: 0; pointer-events: none; mix-blend-mode: screen;
          background: radial-gradient(circle at 47% 41%, rgba(255,232,190,0.55) 0%, rgba(255,214,150,0.28) 14%, transparent 30%);
          animation: splash2KenBurns 12s cubic-bezier(0.45,0,0.55,1) infinite alternate, splash2Glow 6s ease-in-out infinite -1.5s;
        }
        .splash2-vignette {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 46% at 47% 38%, transparent 20%, rgba(0,0,0,0.5) 62%, rgba(0,0,0,0.82) 100%),
            linear-gradient(to right, rgba(0,0,0,0.7), transparent 16%, transparent 84%, rgba(0,0,0,0.7)),
            linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 14%, transparent 40%, rgba(0,0,0,0.72) 62%, rgba(0,0,0,0.94) 78%, #000 90%);
        }

        .splash2-content { position: absolute; left: 0; right: 0; bottom: 15%; display: flex; flex-direction: column; align-items: center; gap: 16px; }
        .splash2-radar { position: relative; width: 140px; height: 140px; display: flex; align-items: center; justify-content: center; }
        .splash2-ring { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.14); animation: splash2RingExpand 1.1s ease-out both; }
        .splash2-ring.ring-a { inset: 16%; animation-delay: 0.15s; }
        .splash2-ring.ring-b { inset: 0; border-color: rgba(255,255,255,0.07); animation-delay: 0.35s; }
        .splash2-crosshair { position: absolute; background: rgba(255,255,255,0.09); opacity: 0; animation: splash2RiseFade 0.6s ease-out 0.6s forwards; }
        .splash2-crosshair.ch-h { left: -12px; right: -12px; top: 50%; height: 1px; }
        .splash2-crosshair.ch-v { top: -12px; bottom: -12px; left: 50%; width: 1px; }
        .splash2-node { position: absolute; width: 4px; height: 4px; border-radius: 50%; background: rgba(255,255,255,0.5); opacity: 0; animation: splash2RiseFade 0.5s ease-out forwards; }
        .splash2-node.node-1 { top: 8%; left: 20%; animation-delay: 0.75s; }
        .splash2-node.node-2 { top: 28%; right: 2%; animation-delay: 0.9s; }
        .splash2-node.node-3 { bottom: 12%; left: 6%; animation-delay: 1.05s; }
        .splash2-divider { width: 26px; height: 1px; background: rgba(255,255,255,0.25); opacity: 0; animation: splash2RiseFade 0.5s ease-out 2.1s forwards; }
        .splash2-tagline { font-size: 12px; letter-spacing: 0.05em; color: #6B6B70; opacity: 0; animation: splash2RiseFade 0.7s ease-out 2.35s forwards; }
        .splash2-dots { display: flex; align-items: center; gap: 6px; opacity: 0; animation: splash2RiseFade 0.6s ease-out 2.55s forwards; }
        .splash2-dots-line { width: 26px; height: 1px; background: rgba(255,255,255,0.14); }
        .splash2-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.25); }
        .splash2-dot.active { width: 7px; height: 7px; background: #FFFFFF; box-shadow: 0 0 6px rgba(255,255,255,0.55); }

        /* ---------- Cosmic theme: quiet dark atmosphere \u2014 soft ambient light and stars, not a literal black hole ---------- */
        @keyframes horizonBreathe { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.03); } }
        @keyframes cosmicTwinkle { 0%, 100% { opacity: 0.1; } 50% { opacity: 0.4; } }
        .cosmic-core {
          position: absolute; width: 100vw; height: 100vw; right: -40vw; bottom: -46vw; border-radius: 50%;
          background: radial-gradient(circle at 38% 38%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 32%, transparent 55%);
          filter: blur(8px);
          animation: horizonBreathe 12s ease-in-out infinite;
        }
        .cosmic-vignette {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 95% 75% at 0% 0%, rgba(0,0,0,0.5) 0%, transparent 55%);
        }
        .cosmic-stars {
          position: absolute; inset: -15%;
          background-image:
            radial-gradient(1.3px 1.3px at 8% 12%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 22% 38%, rgba(255,255,255,0.55), transparent),
            radial-gradient(1.2px 1.2px at 38% 8%, rgba(255,255,255,0.65), transparent),
            radial-gradient(1px 1px at 52% 52%, rgba(255,255,255,0.45), transparent),
            radial-gradient(1.3px 1.3px at 66% 24%, rgba(255,255,255,0.75), transparent),
            radial-gradient(1px 1px at 78% 62%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.2px 1.2px at 88% 14%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 12% 78%, rgba(255,255,255,0.45), transparent),
            radial-gradient(1.3px 1.3px at 46% 86%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1px 1px at 94% 88%, rgba(255,255,255,0.5), transparent);
          background-repeat: repeat;
          background-size: 420px 420px;
        }
        .cosmic-stars-1 { opacity: 0.35; animation: cosmicTwinkle 6s ease-in-out infinite; }
        .cosmic-stars-2 { background-size: 560px 560px; opacity: 0.22; animation: cosmicTwinkle 9s ease-in-out infinite 1.4s; }
        /* buttons/cards read as a layer floating above the void, not flush with it */
        .cosmic-theme .rounded-2xl { box-shadow: 0 16px 36px -10px rgba(0,0,0,0.7), 0 2px 10px -2px rgba(0,0,0,0.5); }
        .cosmic-theme .rounded-xl { box-shadow: 0 10px 22px -8px rgba(0,0,0,0.6); }
        .cosmic-theme .rounded-full { box-shadow: 0 3px 10px -3px rgba(0,0,0,0.5); }
        .cosmic-theme button:active { transform: translateY(1px); }

        .tab-content { animation: fadeIn 0.25s ease-out; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .toast-in { animation: toastIn 0.2s ease-out; }
        .emotion-ripple { animation: ripple 0.5s ease-out; }
        .flame-flicker { animation: flicker 1.8s ease-in-out infinite; display: inline-block; }
        .theme-fade, .theme-fade * { transition: background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease, color 0.25s ease; }
        .stagger > * { animation: fadeIn 0.45s ease-out both; }
        .stagger > *:nth-child(1) { animation-delay: 0ms; }
        .stagger > *:nth-child(2) { animation-delay: 60ms; }
        .stagger > *:nth-child(3) { animation-delay: 120ms; }
        .stagger > *:nth-child(4) { animation-delay: 180ms; }
        .stagger > *:nth-child(5) { animation-delay: 240ms; }
        .stagger > *:nth-child(6) { animation-delay: 300ms; }
      ` }),
    showSplash && /* @__PURE__ */ jsx(Splash, { accent, fading: splashFading }),
    !showSplash && authStatus === "unauthenticated" && /* @__PURE__ */ jsx(AuthScreen, { accent, onRegister: handleRegister, onLogin: handleLogin, onGoogle: handleGoogleLogin }),
    !showSplash && authStatus === "authenticated" && migrateFor && /* @__PURE__ */ jsx(LegacyMigratePrompt, { accent, onMigrate: handleMigrate, onSkip: handleSkipMigrate }),
    !showSplash && authStatus === "authenticated" && !migrateFor && showBootIntro && /* @__PURE__ */ jsx(BootIntro, { accent, name, lang, onDone: () => setShowBootIntro(false) }),
    !showSplash && authStatus === "authenticated" && !migrateFor && introResolved && !showBootIntro && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none fixed inset-0", style: { background: `radial-gradient(circle at 50% 0%, ${accent}0A 0%, transparent 55%)`, transition: "background 0.4s ease" } }),
      accentPreset.cosmic && /* @__PURE__ */ jsxs("div", { className: "pointer-events-none fixed inset-0 overflow-hidden", "aria-hidden": "true", children: [
        /* @__PURE__ */ jsx("div", { className: "cosmic-core" }),
        /* @__PURE__ */ jsx("div", { className: "cosmic-stars cosmic-stars-1" }),
        /* @__PURE__ */ jsx("div", { className: "cosmic-stars cosmic-stars-2" }),
        /* @__PURE__ */ jsx("div", { className: "cosmic-vignette" })
      ] }),
      /* @__PURE__ */ jsx(Toast, { text: toast }),
      /* @__PURE__ */ jsx(WalletSheet, { open: walletOpen, onClose: () => setWalletOpen(false), balance: mindCoins, ledger: coinLedger, accent }),
      /* @__PURE__ */ jsx(DesktopSidebar, { nav, tab, setTab, accent, mindCoins, onWalletClick: () => setWalletOpen(true) }),
      /* @__PURE__ */ jsx("div", { className: "md:ml-[232px] md:flex md:justify-center", children: /* @__PURE__ */ jsxs("div", { className: `max-w-md ${contentMaxWidth} w-full mx-auto md:mx-0 px-5 md:px-10 pt-0 md:pt-10 pb-32 md:pb-16 relative`, children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "sticky top-0 z-30 -mx-5 px-5 pt-8 pb-8 relative md:hidden",
            style: {
              background: accentPreset.cosmic ? "rgba(4,4,5,0.88)" : `${BASE.bg}E0`,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 items-center", children: [
                /* @__PURE__ */ jsx("div", {}),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
                  /* @__PURE__ */ jsx(LogoMark, { size: 24, accent }),
                  /* @__PURE__ */ jsx(Wordmark, { accent })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(WalletBadge, { balance: mindCoins, accent, onClick: () => setWalletOpen(true) }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mx-auto mt-3", style: { width: "44px", height: "2px", background: `linear-gradient(90deg, transparent, ${accent}90, transparent)` } }),
              /* @__PURE__ */ jsx("div", { className: "absolute left-0 right-0 bottom-0 h-5 pointer-events-none translate-y-full", style: { background: `linear-gradient(to bottom, ${accentPreset.cosmic ? "rgba(4,4,5,0.35)" : `${BASE.bg}59`}, transparent)` } })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "tab-content", children: [
          tab === "home" && /* @__PURE__ */ jsx(Home, { entries, goTo: setTab, accent, name, measureMode, currency, startingCapital, lastCalibration, analytics, t, lang, tradingAsset, notify: showToast }),
          tab === "new" && /* @__PURE__ */ jsx(
            NewEntry,
            {
              accent,
              measureMode,
              currency,
              customInstruments,
              customTags,
              onAddCustomInstrument: addCustomInstrument,
              onAddCustomTag: addCustomTag,
              notify: showToast,
              t,
              onSave: (e) => {
                const next = [...entries, e];
                setEntries(next);
                persistNow({ entries: next });
                showToast("\u0417\u0430\u043F\u0438\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0430");
                playPing();
                setTab("log");
              }
            }
          ),
          tab === "log" && /* @__PURE__ */ jsx(Log, { entries, accent, onDelete: deleteEntry, onCloseTrade: (id) => {
            setClosingId(id);
            setTab("close");
          }, onEditTrade: (id) => {
            setEditingId(id);
            setTab("edit");
          }, measureMode, currency, t }),
          tab === "close" && /* @__PURE__ */ jsx(CloseTrade, {
            entry: entries.find((e) => e.id === closingId) || null,
            accent,
            measureMode,
            currency,
            t,
            notify: showToast,
            onCancel: () => {
              setClosingId(null);
              setTab("log");
            },
            onSave: (patch) => {
              const next = entries.map((e) => e.id === closingId ? { ...e, ...patch } : e);
              setEntries(next);
              persistNow({ entries: next });
              showToast("\u0421\u0434\u0435\u043B\u043A\u0430 \u0437\u0430\u043A\u0440\u044B\u0442\u0430");
              playPing();
              setClosingId(null);
              setTab("log");
            }
          }),
          tab === "edit" && /* @__PURE__ */ jsx(EditTrade, {
            entry: entries.find((e) => e.id === editingId) || null,
            accent,
            measureMode,
            currency,
            customInstruments,
            customTags,
            onAddCustomInstrument: addCustomInstrument,
            onAddCustomTag: addCustomTag,
            notify: showToast,
            t,
            onCancel: () => {
              setEditingId(null);
              setTab("log");
            },
            onSave: (patch) => {
              const next = entries.map((e) => e.id === editingId ? { ...e, ...patch } : e);
              setEntries(next);
              persistNow({ entries: next });
              showToast("\u0421\u0434\u0435\u043B\u043A\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0430");
              setEditingId(null);
              setTab("log");
            }
          }),
          tab === "patterns" && /* @__PURE__ */ jsx(Patterns, { entries, accent, measureMode, currency, analytics, t, lang }),
          tab === "calibration" && /* @__PURE__ */ jsx(Calibration, { accent, onComplete: setLastCalibration, lang, t, entries, analytics, userId }),
          tab === "simulator" && /* @__PURE__ */ jsx(Simulator, { accent, onWin: () => {
            awardCoins(5, lang === "en" ? "Win in the game" : "\u041F\u043E\u0431\u0435\u0434\u0430 \u0432 \u0438\u0433\u0440\u0435");
            showToast(lang === "en" ? "+5 MindCoin \u2014 win in the game" : "+5 MindCoin \u2014 \u043F\u043E\u0431\u0435\u0434\u0430 \u0432 \u0438\u0433\u0440\u0435");
          }, t, lang }),
          tab === "challenge" && /* @__PURE__ */ jsx(Challenge, { entries, accent, weeklyGoal, t, lang }),
          tab === "coach" && /* @__PURE__ */ jsx(Coach, { entries, analytics, accent, userId, lang, t }),
          tab === "settings" && /* @__PURE__ */ jsx(
            Settings,
            {
              accent,
              setAccent: setAccentPreset,
              name,
              setName,
              onThemeChange: (n) => showToast(`\u0422\u0435\u043C\u0430: ${n}`),
              soundOn,
              setSoundOn,
              weeklyGoal,
              setWeeklyGoal,
              onExport: exportJournal,
              onImport: importJournal,
              onExportBackup: exportFullBackup,
              onImportBackup: importFullBackup,
              onReset: resetJournal,
              onFullReset: resetEverything,
              measureMode,
              setMeasureMode,
              currency,
              setCurrency,
              tradingAsset,
              setTradingAsset,
              startingCapital,
              setStartingCapital,
              username: authUser?.username,
              accountProvider: authProviderLabel(),
              onLogout: handleLogout,
              lang,
              setLang,
              t
            }
          )
        ] }, tab)
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-0 right-0 flex justify-center pb-6 px-3 md:hidden", children: /* @__PURE__ */ jsx("div", { className: "max-w-md w-full rounded-[20px]", style: { background: "rgba(19,19,21,0.94)", border: `1px solid ${BASE.line}`, backdropFilter: "blur(10px)" }, children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-7 items-end gap-0.5 m-1", children:
        nav.map((n) => {
          const active = tab === n.id;
          if (n.primary) {
            return /* @__PURE__ */ jsxs("button", { onClick: () => setTab(n.id), className: "relative z-10 flex flex-col items-center gap-1 -mt-2 pb-2 min-w-0 transition-transform duration-150 active:scale-90", children: [
              /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl flex items-center justify-center", style: { background: "#EDEDF0", boxShadow: "0 0 12px 2px rgba(255,255,255,0.18), 0 3px 8px rgba(0,0,0,0.3)" }, children: /* @__PURE__ */ jsx(n.icon, { size: 16, strokeWidth: 2.1, style: { color: "#141416" } }) }),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] leading-none max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-0.5", style: { color: "#fff", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }, children: n.label })
            ] }, n.id);
          }
          return /* @__PURE__ */ jsxs("button", { onClick: () => setTab(n.id), className: "relative z-10 flex flex-col items-center gap-1 py-2 min-w-0 transition-transform duration-150 active:scale-90", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200", style: { background: active ? `${accent}10` : "transparent" }, children: /* @__PURE__ */ jsx(n.icon, { size: 15, strokeWidth: 1.8, style: { color: active ? accent : BASE.inkFaint } }) }),
            /* @__PURE__ */ jsx("span", { className: "text-[8.5px] leading-none max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-0.5", style: { color: active ? accent : BASE.inkFaint, fontFamily: "'Space Grotesk', sans-serif", transition: "color 0.25s ease" }, children: n.label })
          ] }, n.id);
        })
      }) }) })
    ] })
  ] });
}

// entry.jsx
import { jsx as jsx2 } from "react/jsx-runtime";
createRoot(document.getElementById("root")).render(/* @__PURE__ */ jsx2(MindExe, {}));

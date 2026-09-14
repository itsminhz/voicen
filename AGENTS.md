## Design Style Guide (`DESIGN.md`)

`DESIGN.md` at the project root is the app's durable design brief: the aesthetic
direction, color palette, font pairing, spacing/radius conventions, and animation
utilities. `src/client/index.css` (Tailwind configured CSS-first via the `@theme`
directive) is where those decisions live as code. Read `DESIGN.md` before any UI
work, and whenever you make or change a design decision, update it to match so
the brief always reflects the real design.

**If `DESIGN.md` is still the starter placeholder (marked `STATUS: NOT
ESTABLISHED`), the app has no design identity yet.** Before implementing any
functionality, you MUST establish a unique design identity for this app:

1. **Choose a distinctive aesthetic direction** based on the app's purpose and
   audience. Consider the tone: is it playful, professional, editorial,
   minimalist, bold, warm, technical, luxurious? Each app should feel different.
2. **Create a style guide** by updating `src/client/index.css` with:
   - A custom color palette defined as `@theme` tokens (avoid generic blue/gray
     — pick colors that match the app's personality)
   - A distinctive font pairing imported from Google Fonts (one display/heading
     font + one body font — avoid Inter, Roboto, Arial)
   - A spacing and border-radius convention that fits the aesthetic
   - Smooth transitions and animations: define reusable animation keyframes and
     `@theme` `--animate-*` utilities (e.g. fade-in, slide-up, staggered
     reveals) for consistent motion across the app
3. **Rewrite `DESIGN.md`** with the actual design brief, replacing the
   placeholder contents entirely (including the `STATUS: NOT ESTABLISHED`
   block): the aesthetic direction and rationale, the color palette (token
   names + values), the font pairing, spacing/radius conventions, and the
   animation utilities. This marks the design identity as established.
4. **Replace the starter template completely — every starter surface, not just
   the home page.** The default HomePage, the shared `Page` wrapper and its
   header/nav, and the Login and Signup pages are all generic placeholders.
   Restyle ALL of them to your chosen aesthetic in this first build — a common
   failure is theming only HomePage and leaving the shared wrapper and auth
   pages on the old generic gray/black template, which makes the app feel
   half-finished. Build the UI from scratch; do not inherit styles or layout
   patterns from the template. If a starter surface exists that isn't listed
   here, restyle it too.

Do this as your first step, before writing any feature code. `DESIGN.md` and the
updated `src/client/index.css` must be part of the same turn's changes so they
are committed together. All subsequent UI work must follow this style guide.

## Comprehensive Project Structure Overview

### 1. PROJECT STRUCTURE

```
/user-app/
├── src/
│   ├── client/                      # React frontend (React 19)
│   │   ├── assets/                  # Images/logos (favicon.svg, modelence.svg)
│   │   ├── components/
│   │   │   ├── ui/                  # Reusable UI components (shadcn-style, on Base UI)
│   │   │   │   ├── _shared/         # sizes.ts, variants.ts, buttonGroup.ts (design tokens)
│   │   │   │   ├── Button.tsx        # variant × color × size, render, loading
│   │   │   │   ├── IconButton.tsx    # square icon-only button (same sizes as Button)
│   │   │   │   ├── ButtonGroup.tsx   # segmented Button/IconButton group
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Textarea.tsx
│   │   │   │   ├── Label.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Spinner.tsx       # inline spinner glyph (for controls)
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Switch.tsx
│   │   │   │   ├── RadioGroup.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Dialog.tsx
│   │   │   │   ├── DropdownMenu.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   └── Separator.tsx
│   │   │   ├── LoadingSpinner.tsx    # Page-level loading component (uses ui/Spinner)
│   │   │   ├── Page.tsx              # Page wrapper with header (accepts `seo` prop)
│   │   │   └── Seo.tsx               # Renders <title> via React 19 native metadata
│   │   ├── pages/                    # Route pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── ExamplePage.tsx
│   │   │   ├── PrivateExamplePage.tsx
│   │   │   ├── LogoutPage.tsx
│   │   │   ├── TermsPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── lib/
│   │   │   ├── utils.ts              # Utility functions (cn helper)
│   │   │   └── autoLogin.ts          # Sandbox auto-login hook
│   │   ├── router.tsx                # React Router configuration
│   │   ├── seo.config.ts             # Single source of truth for site name / <title>
│   │   ├── index.tsx                 # App entry point
│   │   ├── types.d.ts
│   │   └── index.css
│   │
│   └── server/                       # Node.js backend
│       ├── app.ts                    # Server entry point
│       ├── example/
│       │   ├── index.ts              # Module definition with queries/mutations
│       │   ├── db.ts                 # Database schemas
│       │   └── cron.ts               # Scheduled jobs
│       └── migrations/
│           └── createDemoUser.ts     # Seeds the sandbox demo user
│
├── DESIGN.md                         # Design style guide (durable design brief)
│
├── Configuration Files
│   ├── tsconfig.json                 # TypeScript 
│   ├── vite.config.ts                # Vite bundler config (loads @tailwindcss/vite)
│   └── modelence.config.ts           # Modelence framework config
│
└── package.json                      # Dependencies & scripts
```

### 2. AVAILABLE UI COMPONENTS (SHADCN-STYLE, ON BASE UI)

Located in `/user-app/src/client/components/ui/`. Interactive primitives wrap
**Base UI** (`@base-ui/react`, unstyled, accessible — keyboard nav, focus
management, Esc/Space/arrow handling come for free). Style is applied via
Tailwind + `data-*` state attributes. Plain controls (Button, Input, etc.) are
styled native elements. **No barrel index** — import each from its own file.

#### Design tokens — single source of truth (`ui/_shared/`)
Edit these to retune the whole library; every control reads from them.
- **`sizes.ts`** — control sizes `sm | md | lg`. `SIZES` (text controls),
  `ICON_SIZES` (square icon controls), `ICON_GLYPH` (inline icon px). Heights
  are shared (`sm=h-8 / md=h-9 / lg=h-10`) so an `sm` Button lines up with an
  `sm` Input/Select/IconButton. **Keep `h-*` in sync between the two maps.**
- **`variants.ts`** — `variant` (style: `solid | outline | ghost | link | soft`)
  × `color` (intent: `neutral | primary | destructive`). `solid`+`neutral` is
  the default black button. `CONTROL_BASE` holds shared base + focus ring +
  `cursor-pointer`.
- **`buttonGroup.ts`** — context for ButtonGroup → child size/variant/color.

#### Buttons
- **`Button.tsx`** — `variant`, `color`, `size`, `loading`, `leftIcon`,
  `rightIcon`, `render` (polymorphism via Base UI `useRender` — replaces the old
  `asChild`). No `size="icon"` (use IconButton). Migration from old API:
  `default`→solid/neutral · `destructive`→solid+destructive ·
  `secondary`→soft+neutral · `outline`/`ghost`/`link`→same `variant`.
- **`IconButton.tsx`** — square icon-only button, same `sm/md/lg` heights and
  `variant`×`color` as Button. **`aria-label` is required** (enforced by types).
- **`ButtonGroup.tsx`** — segmented group that fuses inner radii/borders. Holds
  Button/IconButton **and** form controls (Input, Textarea, Select trigger) as
  siblings, e.g. an Input with attached buttons (matches shadcn's ButtonGroup).
  Props `orientation` (`horizontal`|`vertical`), `size`, `variant`, `color`
  (propagated to child Button/IconButton; a child's own prop wins).

#### Form controls (sizes align with Button)
- **`Input.tsx`** — `size?: ControlSize`. (Native numeric `size` is omitted.)
- **`Textarea.tsx`** — multi-line, `min-h-16`.
- **`Label.tsx`** — shadcn-style: `flex items-center gap-2`, peer/group-disabled.
- **`Checkbox.tsx`** — Base UI; Space toggles; supports `indeterminate`.
- **`Switch.tsx`** — Base UI toggle.
- **`RadioGroup.tsx`** — `RadioGroup` + `RadioGroupItem`; arrow-key roving focus.
- **`Select.tsx`** — single component: `<Select options={[{label,value,disabled}]}
  value onValueChange placeholder size />`. Shows the selected option's label in
  the closed trigger (via Base UI `items`). Optional `renderItem` for custom rows.

#### Overlays & navigation
- **`Dialog.tsx`** — `Dialog`, `DialogTrigger`, `DialogContent` (Esc-closes,
  focus-trapped, built-in close button), `DialogTitle`, `DialogDescription`,
  `DialogHeader`, `DialogFooter`, `DialogClose`.
- **`DropdownMenu.tsx`** — `DropdownMenu`, `DropdownMenuTrigger`,
  `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel` (standalone,
  use anywhere), `DropdownMenuSeparator`, `DropdownMenuGroup` +
  `DropdownMenuGroupLabel` (the label MUST be inside a Group).
- **`Tabs.tsx`** — `Tabs`, `TabsList`, `TabsTab`, `TabsPanel`.
- **`Tooltip.tsx`** — `Tooltip`, `TooltipTrigger`, `TooltipContent`. Requires
  **`TooltipProvider`**, already mounted once at the app root in `index.tsx`.

#### Display
- **`Card.tsx`** — `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
  `CardAction` (top-right header slot), `CardContent`, `CardFooter`.
- **`Badge.tsx`** — `variant` (`solid|soft|outline`) × `color`.
- **`Avatar.tsx`** — `Avatar`, `AvatarImage`, `AvatarFallback`.
- **`Separator.tsx`** — `orientation` (`horizontal`|`vertical`).
- **`Spinner.tsx`** — inline spinner glyph (use inside controls). For page-level
  loading use `components/LoadingSpinner` (which renders a `Spinner`).

All components use the `cn()` utility for class merging. New interactive
primitives are client components (`"use client"`). The app root sets
`isolation: isolate` (in `index.css`) so portalled popups stack correctly.

### 3. UTILITY FUNCTIONS

**File**: `/user-app/src/client/lib/utils.ts`

```typescript
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
- Uses `clsx` for conditional classes
- Uses `tailwind-merge` to prevent class conflicts
- Perfect for merging component classes with custom overrides

### 4. EXISTING FORM PATTERNS

The app already has two working form examples you can reference:

#### LoginForm (`/user-app/src/client/pages/LoginPage.tsx`)
- Email and password fields
- `FormData` API for form submission
- Card-based layout with headers and footers
- Validation and error handling
- Links to signup

#### SignupForm (`/user-app/src/client/pages/SignupPage.tsx`)
- Email, password, confirm password
- Checkbox for terms acceptance
- Success state handling
- Client-side password validation
- Toast error notifications
- `useCallback` hook for form submission
- State management for success state

### 5. APP STRUCTURE & ARCHITECTURE

#### Client Setup (`/user-app/src/client/index.tsx`)
```typescript
- React Query (TanStack) integration
- React Router DOM
- React Hot Toast for notifications
- Suspense boundaries with loading state
- Global error handler
```

#### Router Configuration (`/user-app/src/client/router.tsx`)
- **Public Routes**: Home, Example, Terms, Logout, 404
- **Guest Routes**: Login, Signup (redirects to home if authenticated)
- **Private Routes**: PrivateExamplePage (redirects to login if not authenticated)
- **Route Protection**: 
  - `GuestRoute` component for auth-only pages
  - `PrivateRoute` component for protected pages
  - Redirect with `_redirect` query param to return after login

#### Page Wrapper (`/user-app/src/client/components/Page.tsx`)
- Header with a Home button (left) and either user handle + Logout or a Sign in button (right) — no logo
- Responsive layout with max-width
- Body section with optional loading state
- Accepts a `seo` prop (`{ title?, noindex? }`) that is forwarded to `<Seo />`
  to set the document `<title>` per page (see SEO/TITLE PATTERN below)

### 6. MODULE SYSTEM (Backend)

**File**: `/user-app/src/server/example/index.ts`

Example shows Module pattern with:

```typescript
new Module('example', {
  configSchema: { /* configuration */ },
  stores: [ /* database stores */ ],
  queries: {
    getItem: async (args, { user }) => { /* query logic */ },
    getItems: async (args, { user }) => { /* query logic */ }
  },
  mutations: {
    createItem: async (args, { user }) => { /* mutation logic */ },
    updateItem: async (args, { user }) => { /* mutation logic */ }
  },
  cronJobs: {
    dailyTest: dailyTestCron
  }
})
```

#### Database Pattern (`/user-app/src/server/example/db.ts`)
```typescript
export const dbExampleItems = new Store('exampleItems', {
  schema: {
    title: schema.string(),
    createdAt: schema.date(),
    userId: schema.userId(),
  },
  indexes: []
});
```

### 7. BUILD & DEVELOPMENT

**Scripts** (from package.json):
```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm test             # Run tests (not configured)
```

**Vite Configuration**:
- Root: `src/client`
- Path alias: `@/` → `./src/`
- Dev server: `0.0.0.0:5173` (allows external access)
- React plugin enabled

### 8. STYLING SETUP

- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin. All Tailwind config
  is CSS-first in `src/client/index.css` (`@import "tailwindcss"`, `@theme`,
  `@source`, etc.) — customize the design system there.
- **Color Scheme**: Gray, black, white primary colors; blue, red accents —
  starter defaults only, meant to be replaced when the design identity is
  established (see "Design Style Guide (`DESIGN.md`)" at the top of this file).

### 9. SEO (TITLE, DESCRIPTION, OG TAGS)

- `src/client/seo.config.ts` is the single source of truth for `siteName` and
  the site-wide meta `description`. **You MUST update both fields** as soon as
  the product name is known — they default to the literal string
  `"Empty Project"` and a generic placeholder description, both of which ship
  broken SEO and social previews. Update them on any landing-page task or
  product-rename request.
- `<Seo />` (in `src/client/components/Seo.tsx`) renders `<title>`, the meta
  description, and Open Graph / Twitter card tags from `seoConfig`. It is
  already mounted once at the app root in `src/client/index.tsx`, so every
  page inherits the site-wide defaults automatically.
- Per-page overrides: pass `seo` to `<Page />`, e.g.
  `<Page seo={{ title: 'Sign in' }}>` or
  `<Page seo={{ title: 'Pricing', description: '...' }}>`. Set
  `noindex: true` for auth, terms, and 404 pages.
- Rendered at runtime via React 19 native `<title>` / `<meta>` hoisting; no
  SEO library needed.
- Heading hierarchy: every page must have exactly one `<h1>` and headings
  must descend monotonically (`h1 → h2 → h3`, never skip a level). Skipped
  levels hurt accessibility audits and SEO.

### 10. REUSABLE PATTERNS FOR NEW FEATURES

When adding a new feature, reach for these existing building blocks before
introducing new ones:

1. **Forms**: native `FormData` API, mirroring `LoginPage` / `SignupPage`.
2. **Validation**: Zod on the server (inside module queries/mutations);
   lightweight client-side checks before submit.
3. **UI Components**: the full set in `src/client/components/ui/` (Button,
   IconButton, ButtonGroup, Input, Textarea, Label, Checkbox, Switch,
   RadioGroup, Select, Dialog, DropdownMenu, Tabs, Tooltip, Card, Badge,
   Avatar, Separator, Spinner). See section 2. Interactive primitives are built
   on `@base-ui/react`; reuse these before adding any external UI library.
4. **Page Layout**: wrap routes in `<Page>` (sets header + `<title>` via
   the `seo` prop).
5. **Icons**: `lucide-react`.
6. **Toast Notifications**: `react-hot-toast` for user feedback.
7. **Server State**: `@tanstack/react-query` via `@modelence/react-query`
   helpers (`useQuery`, `useMutation`).
8. **Local State**: standard React hooks (`useState`, `useCallback`,
   `useMemo`, `useRef`). On React 19, prefer ref-as-prop over `forwardRef`
   in any new components.
9. **Styling**: Tailwind classes combined with the `cn()` helper from
   `src/client/lib/utils.ts`.
10. **Backend feature**: add a new `Module` under `src/server/<feature>/`
    following the `example` module shape (`configSchema`, `stores`,
    `queries`, `mutations`, optional `cronJobs`), and register it in
    `src/server/app.ts`.

### 12. VOICENOTE AI — FEATURE ARCHITECTURE

**UI redesign (user-requested):** Theme switched from warm notebook to clean
shadcn-style light (white/zinc, Geist font, black primary buttons). Same token
names in index.css (`paper`, `ink`, `accent`, `line`, ...) — only values were
remapped, so components didn't need class changes. Recording state uses `danger`
(red). Card = rounded-xl border-line.

**Top-level workspace modes (product direction):** 3 modes —
- Student (BUILT): 6-note-mode study flow at /new.
- Meetings (BUILT): /meeting page → record/paste transcript → `voice.generateMeetingNote`
  mutation → GeneratedMeetingNote {title, tags, summary, attendees, keyConcepts(topics),
  actionItems[{text,owner?,due?,done}], decisions, followUps, additionalContext?} →
  saved with mode 'meeting' in voiceNotes. MeetingNoteView.tsx renders/edits it with
  checkable action items (persisted via updateNote autosave in NotePage).
  Server: STUDY_MODES vs NOTE_MODES (=STUDY_MODES+'meeting') split in db.ts and
  client modes.ts; generateNote validates studyModeSchema; save/update accept
  meeting fields (meetingFieldsZod).
- Sticky Notes (BUILT): voice → AI splits speech into multiple Keep-style
  colored checkable lists. Separate `stickyNotes` Store (db.ts: dbStickies,
  STICKY_COLORS = yellow/green/blue/pink/purple/orange/gray; fields: userId,
  title, color, items[{text,done}], pinned, createdAt, updatedAt).
  Server: novita.ts `generateStickiesFromTranscript` (STICKY_SYSTEM_PROMPT:
  1–6 lists, one topic per list, no invention); query `voice.getStickies`
  (pinned desc, updatedAt desc); mutations generateStickies (insertMany),
  createSticky (blank), updateSticky (title/color/items/pinned), deleteSticky.
  Client: /stickies route → StickyBoardPage (record → transcribe →
  generateStickies; "Type instead" textarea flow; "Blank list" button;
  pinned/others 3-col grid; optimistic updates via setQueryData).
  StickyCard.tsx = Keep-style card (editable title, checkable items with
  inline edit/remove, add-item input, pin toggle, 7-color palette popover,
  delete). stickyTypes.ts holds client color→Tailwind pastel class map.
  Dashboard WORKSPACE_MODES sticky card now links to /stickies.

**Dashboard v2 (2026-09-14):**
- HomePage Dashboard redesigned: date + greeting header with "Start recording";
  4 stat cards (total notes / study / meetings / sticky lists); 3 colored mode
  tiles (violet=Student, sky=Meetings, amber=Sticky) with hover arrow; main
  grid = recent-notes list card with All/Study/Meetings tab filter (NoteRow:
  icon chip, title, summary, mode badge, timeAgo, open-action-items pill) +
  right rail with "Open action items" widget (links to meeting notes with
  open items) and "Sticky lists" mini colored previews (top 4, → /stickies).
- Server getNotes now returns `openActionItems` count per note (NoteSummary
  updated accordingly).

**Branding & profile (2026-09-14):**
- App renamed to **Voicen AI** (was VoiceNote AI); user plans to attach domain
  voicen.xyz. Renamed in seo.config.ts, Page.tsx header, HomePage copy, and
  all Novita system prompts.
- Default avatars: `src/client/assets/avatar-male.png` / `avatar-female.png`
  (user-provided cartoon avatars). New `profile` module
  (src/server/profile/index.ts): `userProfiles` Store (userId unique, gender
  enum male/female), query `profile.get`, mutation `profile.setGender`
  (upsertOne). Header shows avatar via `UserMenu.tsx` (dropdown: pick
  male/female avatar with optimistic update + logout link). Default when
  unset: male avatar.
- Profile v2: userProfiles store extended with optional `displayName` (max 60)
  and `bio` (max 300); `profile.update` mutation (partial $set). `/profile`
  route → ProfilePage: identity card (big avatar, avatar picker, handle, bio),
  Account details form (display name + bio with char counter, Save enabled
  only when dirty), 6 MiniStat cards (total/study/meetings/stickies/open
  actions/items checked, computed client-side from voice.getNotes +
  voice.getStickies), recent-notes activity list, logout card. UserMenu
  dropdown shows displayName + "View profile" link; dashboard greeting uses
  displayName first name when set.

**Landing page v2 (Convix-style hero, 2026-09-14):**
- Logged-out HomePage renders `LandingHero` (no Page wrapper, own Seo) in
  `src/client/components/landing/`: LandingHero.tsx (full-viewport rounded
  hero, cloudfront bg video + white/10 overlay, Inter font, badge "Voicen AI",
  headline "Shaping *Notes* of tomorrow" w/ Instrument Serif italic, dark
  #0b0f1a "Get Started" pill → /signup), Navbar.tsx (floating white pill,
  orange #ef4d23 8-petal flower SVG logo, desktop links + mobile hamburger
  dropdown, orange "Get early access" → /signup), DashboardPreview.tsx
  (#f5f2ee tray, 3 cards: Notes gauge 92%, settings form, Voice Minutes gauge
  68%), Gauge.tsx (40-tick 180° SVG arc). Fonts Inter + Instrument Serif
  imported in index.css.
- Landing completed: LandingSections.tsx below the hero — #features (3 mode
  cards w/ orange icon chips + bullet points), #about "How it works" white
  card with 4 steps on #f5f2ee tiles, dark #0b0f1a CTA band (Get early access
  + Log in), footer (voicen.xyz, Features/About/Terms links, copyright).
  Navbar links now real anchors (#top/#features/#about); html has
  scroll-behavior smooth. LogoutPage now redirects to '/' (was /login) so
  logged-out users land on the landing page.
- Landing accent recolored from orange #ef4d23 to sky #0ea5e9 (tint #e0f2fe,
  gradient #38bdf8→#0284c7 = SKY_GRADIENT const). Icons enhanced: navbar logo
  is now a sky-gradient rounded tile with white waveform bars (VoicenLogo SVG);
  cart icon replaced with LogIn icon → /login; feature/step icon chips are
  gradient tiles with white icons (ring-4 ring-sky-100 on features).

**Reliability hardening (verified with live API tests using real keys):**
- AssemblyAI Dictation API confirmed working (200) with exact server FormData pattern; raw `Authorization` header (no Bearer); invalid key → 404.
- Novita kimi-k3 confirmed working BUT intermittently returns 429 `server_overload` → novita.ts retries up to 3x with backoff. kimi-k3 is a reasoning model (`reasoning_content` separate from `content`) → `max_tokens: 8000` set to avoid empty content on `finish_reason: length`.
- Modelence JSON body limit is 16MB → client resamples audio to mono 16kHz (OfflineAudioContext in `src/client/lib/wav.ts`) before WAV encoding; 110s recording ≈ 4.7MB base64.
- Mic errors: useVoiceRecorder detects embedded iframe (`window.self !== window.top`) and tells user to open app in its own tab; handles NotReadableError/SecurityError.
- Server-side `console.error` logging added in assemblyai.ts and novita.ts (visible in dashboard Logs).

This app ("VoiceNote AI") is an AI voice note / study assistant. Design identity
is established (see `DESIGN.md`): warm "calm notebook" palette (cream/ink/amber),
Fraunces (display) + Karla (body).

**Backend (`src/server/voice/`)**
- `db.ts` — `dbNotes` Store (`voiceNotes` collection). `NOTE_MODES` = `lecture |
  quick_summary | exam | flashcards | study_guide | brain_dump` (all 6 built).
  Schema holds full structured note (title, subject, tags, transcript, summary,
  keyConcepts, detailedNotes, definitions, formulas, examples, importantPoints,
  examFocus, questionsToReview, flashcards, additionalContext).
- `assemblyai.ts` — `transcribeAudioWav(buffer, apiKey)` calls the **AssemblyAI
  Dictation API** (`https://dictation.assemblyai.com/v1/transcribe/live`, NOT the
  standard Sync/Streaming API). Multipart body: `config` part (JSON) first, then
  `audio` part. **Only accepts WAV/raw 16-bit PCM** (rejects webm with 415), max
  120s. Auth header is raw `Authorization: <key>` (no `Bearer`). Never replace
  this with browser SpeechRecognition — it must stay the primary STT engine.
- `novita.ts` — `generateNoteFromTranscript(transcript, mode, apiKey, model)`
  calls Novita's OpenAI-compatible endpoint (`https://api.novita.ai/openai/chat/completions`).
  Enforces via system prompt: transcript is source of truth, never invent facts,
  preserve uncertainty, put any added explanation under `additionalContext`.
  `normalizeNote()` sanitizes arbitrary LLM JSON into the strict shape.
- `index.ts` — `voiceModule`. Config: `assemblyaiApiKey` (secret), `novitaApiKey`
  (secret), `novitaModel` (string, default `moonshotai/kimi-k3`,
  user-configurable, never hardcode). Queries: `getNotes`, `getNote`. Mutations:
  `transcribeAudio` (base64 audio → transcript), `generateNote`, `saveNote`,
  `updateNote`, `deleteNote`, `duplicateNote`. Registered in `src/server/app.ts`.
  **Both API keys currently default to empty string placeholders** — user must
  fill them in via the Config dashboard before recording/generation will work.

**Audio pipeline (client)**: `MediaRecorder` records webm → `src/client/lib/wav.ts`
(`blobToWav`) decodes via Web Audio API and re-encodes as 16-bit PCM WAV (required
by AssemblyAI) → `blobToBase64` → sent as a mutation arg (not a raw multipart
route) → server decodes base64 → Buffer → AssemblyAI.

**Client feature folder (`src/client/features/voice/`)**
- `useVoiceRecorder.ts` — recording hook (status/seconds/levels/error, start/stop/
  reset). `MAX_RECORDING_SECONDS = 110` (under AssemblyAI's 120s cap).
- `modes.ts` — `NOTE_MODES` + `MODE_META` (label/description/icon per mode).
- `types.ts` — `GeneratedNote`, `NoteSummary`, `FullNote` client-side types.
- `MicButton.tsx`, `Waveform.tsx` — recording UI (pulse/ring animations, live
  level bars).
- `ModeSelector.tsx` — grid of 6 mode cards, selectable before/after recording.
- `ProcessingStage.tsx` — staged loading UI (Transcribing → Organizing → Saving).
- `NoteView.tsx` — renders a `GeneratedNote`; single component handles both
  read-only preview (post-generation) and editable mode (`onChange` prop) so
  it's reused across `NewNotePage` (preview before save) and `NotePage` (full
  editor with autosave).
- `FlashcardDeck.tsx` — flip-card viewer for the flashcards array (read-only mode).

**Pages**
- `NewNotePage.tsx` (`/new`) — record→transcript review→mode select→generate→
  preview→save flow. Also has a "Write" tab to type/paste text instead of
  recording (skips transcription, same generate/save flow).
- `NotesPage.tsx` (`/notes`) — saved notes list: search, sort (updated/created/
  title), open/delete/duplicate, empty state.
- `NotePage.tsx` (`/notes/:noteId`) — note detail/editor with debounced autosave
  (800ms) and a Saving/Saved indicator.
- `HomePage.tsx` — minimal landing (logo/one-liner/Login/Signup) for guests;
  dashboard (greeting, big mic card, quick actions, recent notes) for logged-in
  users. Quick actions: New Voice Note, Write Note, Quiz Me (disabled placeholder
  — not yet built), Browse Notes.

**Deferred (not yet built, by design — one vertical slice at a time)**: Quiz Me,
Ask My Note, and the Explain/Simplify/Expand/Make Flashcards study actions on
saved notes. `Quiz Me` currently renders as a disabled quick-action card on the
dashboard. Build these as a separate follow-up slice.

### Summary

This is a full-stack Modelence framework application with:
- Clean component structure ready for new features
- All necessary UI building blocks already available
- Form handling patterns established
- Database and backend module patterns ready to follow
- Authentication system in place
- TypeScript support throughout
- A shadcn-style component library built on `@base-ui/react` (accessible
  primitives) is already implemented — reuse it before adding any UI library

### 11. MOBILE APP (Expo, optional)

A project may *optionally* include a mobile app alongside the web app. The
template ships an empty `mobile/` folder, but the studio treats the mobile
app as "not yet created" until the marker file
`mobile/.modelence-mobile-enabled` exists. The Mobile tab in the studio shows
a "Create mobile app" CTA in this state.

**Folder layout**

```
project-root/
├── src/server/        # Modelence backend (unchanged)
├── src/client/        # Web client (unchanged)
├── package.json       # Web dependencies (+ postinstall for mobile)
└── mobile/            # Expo / React Native app (shipped but unhooked)
    ├── .modelence-mobile-enabled  # marker file — present once created
    ├── package.json   # Expo's deps (main: "expo-router/entry")
    ├── app.config.js  # Expo config (includes scheme for deep linking)
    ├── index.ts       # configureClient + auth token persistence (side-effect module)
    ├── app/           # Expo Router file-based routes
    │   ├── _layout.tsx          # root layout — SafeAreaProvider, AppProvider, QueryClientProvider, RouteGuard
    │   ├── (auth)/
    │   │   ├── _layout.tsx      # headerless Stack for unauthenticated screens
    │   │   └── sign-in.tsx      # sign-in screen
    │   └── (app)/
    │       ├── _layout.tsx      # headerless Stack for authenticated screens
    │       └── home.tsx         # home screen (requires auth)
    ├── components/    # React Native UI library (RN equivalents of src/client/components/ui)
    │   ├── LoadingSpinner.tsx   # screen-level loading state
    │   └── ui/                  # Button, Input, Card, Dialog, … + _shared/ design tokens
    ├── babel.config.js
    └── tsconfig.json
```

**Important rules**

- The studio's "Create mobile app" flow (button or matching free-text prompt)
  scaffolds/installs the Expo app and writes `mobile/.modelence-mobile-enabled`.
  Do NOT write that marker without first installing Expo dependencies — the
  studio assumes mobile is fully usable once the marker is present.
- The mobile app uses **Expo Router 4.x** (file-based routing). The entry
  point is `expo-router/entry` (set in `mobile/package.json`'s `"main"` field).
  Route groups: `(auth)` for unauthenticated screens, `(app)` for protected
  screens. The `RouteGuard` component in `app/_layout.tsx` redirects based on
  `useSession()` — unauthenticated → `/(auth)/sign-in`, authenticated →
  `/(app)/home`. Do not revert to a manual `registerRootComponent` + `App.tsx`
  setup.
- `index.ts` is a side-effect module (imported by `app/_layout.tsx`) that runs
  `configureClient` and rehydrates the auth token from AsyncStorage. It does
  NOT call `registerRootComponent`.
- **Mobile UI components** live in `mobile/components/ui/` — React Native
  equivalents of the web set in `src/client/components/ui/`, with a parallel
  prop API so the two platforms read as one design system. The full set:
  Button, IconButton, ButtonGroup, Spinner, Input, Textarea, Label, Checkbox,
  Switch, RadioGroup, Select, Tabs, Card, Badge, Avatar, Separator, Dialog,
  DropdownMenu, Tooltip (import from the `mobile/components/ui` barrel). Reuse
  these before adding any external RN UI library. Key differences from web,
  since RN has no Tailwind/Base UI/DOM:
  - Styling is plain `StyleSheet` (no Tailwind/NativeWind). Shared design tokens
    (palette, sizes, variants) live in `mobile/components/ui/_shared/` and mirror
    the web tokens — edit tokens there, not per-component, to restyle globally.
  - There is no `:hover`/`:active`; variant styles model rest + pressed states.
  - Overlays use native primitives: `Select`, `DropdownMenu` present a Modal
    (bottom sheet / action sheet); `Dialog` is a centered Modal; `Tooltip`
    reveals on tap (and hover on web) rather than hover-only. `TooltipProvider`
    is a no-op passthrough kept for API parity.
  - `DropdownMenuTrigger` / `DialogTrigger` / `DialogClose` clone their single
    child and inject `onPress` — pass exactly one pressable element as the child.
- Keep `mobile/`'s `package.json` and `node_modules` separate from the web
  app's. Metro and Vite cannot share the same dependency tree.
- The Studio sandbox runs `expo start --tunnel` automatically when the user
  opens the Mobile preview tab. **Do not** add a long-running Expo process
  to the root `package.json`'s `dev` script.
- The root `package.json` has a `postinstall` that runs
  `node scripts/postinstall.mjs`. That script re-installs mobile deps whenever
  the marker exists and no-ops otherwise. Do not remove either; do not change
  the script to run unconditionally.
- Optional convenience scripts you may add at the project root:
  `"dev:mobile": "cd mobile && npm run start"`.
- API calls from the mobile app to the Modelence backend should target the
  sandbox URL exposed in the studio preview (set via an env var the user
  configures in `mobile/app.json`'s `extra` field).
- When adding shared logic, prefer plain TypeScript modules under
  `src/shared/` and import them from both the web client and the mobile app's
  `app/` screens. Avoid React-DOM-only or Node-only imports in shared code.

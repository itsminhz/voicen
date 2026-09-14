<p align="center">
  <img src="src/client/public/favicon.svg" width="72" alt="Voicen AI logo" />
</p>

<h1 align="center">Voicen AI</h1>

<p align="center">
  <b>Speak your thoughts. Get organized notes.</b><br />
  An AI voice-note app that turns raw speech into structured study notes, meeting minutes, and sticky-note lists.
</p>

<p align="center">
  <a href="https://voicen.xyz">voicen.xyz</a> ·
  <a href="https://voicen.xyz/demo">Demo video</a>
</p>

---

## 🎬 Tutorial / Demo Video

Click the thumbnail to watch the full walkthrough:

[![Voicen AI demo video](https://img.youtube.com/vi/0tM-TfsSK8g/maxresdefault.jpg)](https://www.youtube.com/watch?v=0tM-TfsSK8g)

> Or just visit **[voicen.xyz/demo](https://voicen.xyz/demo)** — it redirects straight to the video.

## ✨ What it does

Voicen AI records your voice, transcribes it with the **AssemblyAI Dictation API**, and then uses an LLM (Novita, `moonshotai/kimi-k3`) to organize your speech into clean, structured notes — **without ever inventing facts**. Whatever the AI adds on its own is clearly separated into an "Additional Context" section.

### Three modes

| Mode | What you get |
|---|---|
| 🎓 **Student** | Study notes in 6 styles: Lecture Notes, Quick Summary, Exam Notes, Flashcards, Study Guide, Brain Dump |
| 🤝 **Meetings** | Professional minutes: summary, attendees, decisions, checkable action items, follow-ups |
| 📌 **Sticky Notes** | Ramble about your to-dos and get Google Keep-style checkable lists, auto-grouped by topic |

### Key features

- 🎙️ **Long recordings** — up to 3 hours; audio is sliced into chunks client-side to fit AssemblyAI's per-request limit
- ♻️ **Reusable voices** — every recording is saved with its transcript, title, and dates. The **Voices** tab lets you regenerate any recording into a new style (e.g. turn yesterday's lecture into flashcards) without recording again
- ✏️ **Full editor** — every generated note is editable with debounced autosave
- 🃏 **Flashcard deck viewer** — flip-card UI for generated flashcards
- 👤 **Accounts** — password auth, per-user data, plus a one-click shared demo account with a guided tour
- 📝 **Write mode** — paste or type text instead of recording, same generation pipeline

## 🧠 How it works

```
🎙️ Mic (MediaRecorder, webm/opus)
   → Web Audio API: resample to mono 16 kHz, 16-bit PCM WAV
   → sliced into ≤100 s chunks
   → AssemblyAI Dictation API (per chunk, joined into one transcript)
   → Novita LLM (kimi-k3): mode-specific prompt, strict "transcript is the
     source of truth" rules, JSON output
   → saved to MongoDB with title, transcript & dates → editable note
```

## 🛠️ Tech stack

- **Framework**: [Modelence](https://modelence.com) — full-stack TypeScript (queries/mutations, built-in auth, MongoDB Store, config management)
- **Frontend**: React 19, React Router, TanStack Query, Tailwind CSS v4, Lucide icons
- **Speech-to-text**: [AssemblyAI Dictation API](https://www.assemblyai.com/)
- **LLM**: Novita AI (`moonshotai/kimi-k3`)

## 🚀 Running locally

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

### Configuration

Set these in your Modelence dashboard (Config tab) — both are secrets:

| Key | Description |
|---|---|
| `voice.assemblyaiApiKey` | AssemblyAI API key (Dictation API access) |
| `voice.novitaApiKey` | Novita AI API key |
| `voice.novitaModel` | LLM model id (default: `moonshotai/kimi-k3`) |

## 🏆 Hackathon

Built for the **AssemblyAI Hackathon** — the AssemblyAI Dictation API is the core speech engine powering every recording in the app.

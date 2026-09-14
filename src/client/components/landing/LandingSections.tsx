import { Link } from 'react-router';
import {
  ChevronRight,
  GraduationCap,
  Users,
  StickyNote,
  Mic,
  Sparkles,
  PenLine,
  ListChecks,
} from 'lucide-react';

const SKY = '#0ea5e9';

function Serif({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>
      {children}
    </span>
  );
}

const FEATURES = [
  {
    icon: GraduationCap,
    title: 'Student',
    tag: 'Study smarter',
    description:
      'Explain a lecture out loud and get structured study notes, flashcards, exam-focus points, definitions and formulas — in six different note styles.',
    points: ['Lecture notes & summaries', 'Auto-generated flashcards', 'Exam prep & study guides'],
  },
  {
    icon: Users,
    title: 'Meetings',
    tag: 'Never miss a decision',
    description:
      'Record a conversation and get professional minutes: a clean summary, attendees, key decisions, and checkable action items with owners and due dates.',
    points: ['Summary & key decisions', 'Action items with owners', 'Follow-ups & topics'],
  },
  {
    icon: StickyNote,
    title: 'Sticky Notes',
    tag: 'Lists from rambling',
    description:
      'Think out loud about everything on your mind — Voicen splits it into beautiful colored, checkable lists, like Google Keep written for you.',
    points: ['Multiple lists from one recording', 'Check, pin & recolor', 'Groceries, todos, ideas'],
  },
];

const STEPS = [
  {
    icon: Mic,
    step: '01',
    title: 'Speak',
    description: 'Tap the mic and talk naturally — a lecture recap, a meeting, or a brain dump.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'AI organizes',
    description: 'Your speech is transcribed and structured into notes, minutes or lists. Nothing is invented — only what you said.',
  },
  {
    icon: PenLine,
    step: '03',
    title: 'Review & edit',
    description: 'Everything stays editable: fix wording, check off items, add your own points.',
  },
  {
    icon: ListChecks,
    step: '04',
    title: 'Study & act',
    description: 'Flashcards to revise, action items to complete, lists to check off. All saved to your account.',
  },
];

export default function LandingSections() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Features */}
      <section id="features" className="pt-14 sm:pt-20 px-3 sm:px-4 scroll-mt-6">
        <div className="mx-auto max-w-[1080px]">
          <div className="text-center">
            <span
              className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm border border-neutral-200"
              style={{ fontSize: 13 }}
            >
              <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: SKY }} />
              Three modes
            </span>
            <h2
              className="mt-5 text-neutral-900"
              style={{
                fontSize: 'clamp(28px, 5vw, 48px)',
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              One voice. <Serif>Every</Serif> kind of note.
            </h2>
            <p className="mt-3 text-neutral-600 mx-auto max-w-xl" style={{ fontSize: 15 }}>
              Pick a mode, hit record, and Voicen AI turns what you said into exactly the format you need.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white">
                  <f.icon className="h-5 w-5" strokeWidth={1.5} style={{ color: SKY }} />
                </span>
                <p className="mt-4 font-medium" style={{ fontSize: 12, color: SKY }}>
                  {f.tag}
                </p>
                <h3 className="mt-1 text-neutral-900" style={{ fontSize: 20, fontWeight: 600 }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-neutral-600 leading-relaxed" style={{ fontSize: 14 }}>
                  {f.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-neutral-700" style={{ fontSize: 13 }}>
                      <span className="rounded-full shrink-0" style={{ width: 6, height: 6, backgroundColor: SKY }} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / How it works */}
      <section id="about" className="pt-14 sm:pt-20 px-3 sm:px-4 scroll-mt-6">
        <div className="mx-auto max-w-[1080px] bg-white rounded-3xl border border-neutral-200 shadow-sm p-6 sm:p-10">
          <div className="text-center">
            <h2
              className="text-neutral-900"
              style={{
                fontSize: 'clamp(26px, 4.5vw, 42px)',
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              From <Serif>voice</Serif> to organized in seconds
            </h2>
            <p className="mt-3 text-neutral-600 mx-auto max-w-xl" style={{ fontSize: 15 }}>
              Voicen AI listens, transcribes and structures — and it never makes things up.
              If it wasn't in your words, it isn't in your notes.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {STEPS.map((s) => (
              <div key={s.step} className="rounded-2xl bg-[#f5f2ee] p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white border border-neutral-200/70">
                    <s.icon className="h-[18px] w-[18px]" strokeWidth={1.5} style={{ color: SKY }} />
                  </span>
                  <span className="text-neutral-400 font-medium" style={{ fontSize: 12 }}>
                    {s.step}
                  </span>
                </div>
                <h3 className="mt-4 text-neutral-900" style={{ fontSize: 16, fontWeight: 600 }}>
                  {s.title}
                </h3>
                <p className="mt-1.5 text-neutral-600 leading-relaxed" style={{ fontSize: 13 }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pt-14 sm:pt-20 px-3 sm:px-4">
        <div
          className="mx-auto max-w-[1080px] rounded-3xl p-8 sm:p-14 text-center overflow-hidden relative"
          style={{ backgroundColor: '#0b0f1a' }}
        >
          <h2
            className="text-white"
            style={{
              fontSize: 'clamp(28px, 5vw, 48px)',
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            Stop typing. <Serif>Start speaking.</Serif>
          </h2>
          <p className="mt-3 text-neutral-400 mx-auto max-w-md" style={{ fontSize: 15 }}>
            Create your free account and turn your first recording into notes in under a minute.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-3 text-white rounded-full pl-6 pr-2 py-2.5"
              style={{ backgroundColor: SKY, fontSize: 14 }}
            >
              Get early access
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/20">
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full px-6 py-2.5 text-white border border-white/25"
              style={{ fontSize: 14 }}
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-3 sm:px-4 py-8">
        <div className="mx-auto max-w-[1080px] flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500" style={{ fontSize: 13 }}>
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: SKY }} />
            <span className="font-medium text-neutral-800">Voicen AI</span> — voicen.xyz
          </span>
          <div className="flex items-center gap-5">
            <a href="#features" className="hover:text-neutral-800 transition-colors">Features</a>
            <a href="#about" className="hover:text-neutral-800 transition-colors">About</a>
            <Link to="/terms" className="hover:text-neutral-800 transition-colors">Terms</Link>
          </div>
          <span>© {new Date().getFullYear()} Voicen AI. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

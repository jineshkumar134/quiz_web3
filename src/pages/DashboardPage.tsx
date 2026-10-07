import { useEffect, useMemo, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import {
  Plus,
  ArrowRight,
  Trash2,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Flame,
  GraduationCap,
  Target,
  Compass,
  Code2,
  NotebookPen,
  Radio,
  Coins,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { QuizConfig, QuizSession } from '../types';
import {
  Button,
  Card,
  CardHeader,
  CountUp,
  Dot,
  EmptyState,
  Label,
  Page,
  PageHeader,
  SectionHeading,
  Select,
  Skeleton,
  Textarea,
  difficultyTone,
  formatDate,
  gradeFor,
  subjectAccent,
} from '../components/ui';
import { cn } from '../utils/cn';

const SUBJECTS = [
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Computer Science',
  'History',
  'Geography',
  'Literature',
];

const DSA_TRACKS = [
  'Arrays and Strings',
  'Linked Lists',
  'Trees and Graphs',
  'Dynamic Programming',
  'Greedy Algorithms',
  'Sorting and Searching',
];

type TechUpdate = {
  id: string;
  title: string;
  url: string;
  source: string;
  createdAt: string;
};

const FALLBACK_UPDATES: TechUpdate[] = [
  {
    id: 'local-ai-agents',
    title: 'AI agents and coding copilots continue reshaping developer workflows',
    url: 'https://news.ycombinator.com/',
    source: 'Offline feed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'local-vector-db',
    title: 'Vector search and retrieval pipelines remain core to AI app architecture',
    url: 'https://news.ycombinator.com/',
    source: 'Offline feed',
    createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: 'local-web3-proof',
    title: 'Verifiable learning records gain traction in education pilots',
    url: 'https://news.ycombinator.com/',
    source: 'Offline feed',
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
];

export default function DashboardPage() {
  const { user, quizHistory, navigateTo, setConfig, deleteHistoryItem, wallet, sbtList } = useQuizStore();

  const [dsaTrack, setDsaTrack] = useState(DSA_TRACKS[0]);
  const [notes, setNotes] = useState(
    () => localStorage.getItem('quiz_platform_college_notes') || ''
  );
  const [revision, setRevision] = useState('');
  const [isRevising, setIsRevising] = useState(false);
  const [updates, setUpdates] = useState<TechUpdate[]>(FALLBACK_UPDATES);
  const [updatesLoading, setUpdatesLoading] = useState(true);

  const fetchUpdates = async () => {
    setUpdatesLoading(true);
    try {
      const response = await fetch(
        'https://hn.algolia.com/api/v1/search_by_date?query=AI%20OR%20artificial%20intelligence%20OR%20developer%20tools&tags=story&hitsPerPage=5'
      );
      const data = await response.json();
      const mapped: TechUpdate[] = (data.hits || []).slice(0, 5).map(
        (item: any, index: number) => ({
          id: item.objectID || `hn-${index}`,
          title: item.title || item.story_title || 'Untitled update',
          url: item.url || item.story_url || 'https://news.ycombinator.com/',
          source: item.points ? `Hacker News · ${item.points} points` : 'Hacker News',
          createdAt: item.created_at || new Date().toISOString(),
        })
      );
      setUpdates(mapped.length ? mapped : FALLBACK_UPDATES);
    } catch {
      setUpdates(FALLBACK_UPDATES);
    } finally {
      setUpdatesLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
    const interval = window.setInterval(fetchUpdates, 1000 * 60 * 5);
    return () => window.clearInterval(interval);
  }, []);

  // All metrics derive from session history, which is the source of truth.
  // Reading totals off the user profile instead would let the two disagree —
  // a freshly created profile reports 0 quizzes while history still holds them.
  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = quizHistory.filter(
      (session) => new Date(session.completedAt).getTime() >= weekAgo
    ).length;
    const total = quizHistory.length;
    const average = total
      ? Math.round(quizHistory.reduce((sum, s) => sum + s.score, 0) / total)
      : 0;
    const topics = new Set(quizHistory.map((s) => s.subject.toLowerCase()));
    return { thisWeek, total, average, topics: topics.size, latest: quizHistory[0] };
  }, [quizHistory]);

  if (!user) return null;

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const startQuiz = (config: Partial<QuizConfig> & { subject: string }) => {
    setConfig({
      difficulty: 'medium',
      questionCount: 5,
      questionType: 'mixed',
      ...config,
    });
    navigateTo('setup');
  };

  const reviewSession = (session: QuizSession) => {
    useQuizStore.setState({
      currentSession: session,
      studyFlashcards: session.flashcards,
    });
    navigateTo('results');
  };

  const reviseNotes = () => {
    localStorage.setItem('quiz_platform_college_notes', notes);
    setIsRevising(true);
    window.setTimeout(() => {
      const words = notes.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
      const preview = words.slice(0, 34).join(' ');
      setRevision(
        [
          `Summary — ${preview}${words.length > 34 ? '…' : ''}`,
          'Plan — turn each heading into a flashcard, recall the definitions without looking, then solve one applied question per topic.',
          'Likely exam focus — definitions, compare-and-contrast points, implementation steps, edge cases.',
        ].join('\n\n')
      );
      setIsRevising(false);
    }, 700);
  };

  const dsaAccent = subjectAccent('Data Structures');

  return (
    <Page>
      <PageHeader
        title="Overview"
        description={`${greeting}, ${user.displayName.split(' ')[0]}. ${new Date().toLocaleDateString(
          'en-US',
          { weekday: 'long', month: 'long', day: 'numeric' }
        )}.`}
        action={
          <Button variant="primary" size="lg" onClick={() => startQuiz({ subject: '' })}>
            <Plus className="h-4 w-4" />
            New quiz
          </Button>
        }
      />

      {/* Metrics */}
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          index={0}
          icon={<Flame className="h-4 w-4" />}
          label="Study streak"
          value={user.studyStreak}
          unit={user.studyStreak === 1 ? 'day' : 'days'}
          hint={user.lastActiveDate ? `Last active ${user.lastActiveDate}` : 'Not started'}
          text="text-amber-300"
          bg="bg-amber-500/10"
          line="border-amber-500/25"
          bar="bg-amber-400"
        />
        <Stat
          index={1}
          icon={<GraduationCap className="h-4 w-4" />}
          label="Quizzes taken"
          value={stats.total}
          hint={stats.total ? `${stats.thisWeek} in the last 7 days` : 'No sessions yet'}
          text="text-indigo-300"
          bg="bg-indigo-500/10"
          line="border-indigo-500/25"
          bar="bg-indigo-400"
        />
        <Stat
          index={2}
          icon={<Target className="h-4 w-4" />}
          label="Average score"
          value={stats.average}
          unit="%"
          hint={stats.latest ? `Most recent ${stats.latest.score}%` : 'No sessions yet'}
          text="text-emerald-300"
          bg="bg-emerald-500/10"
          line="border-emerald-500/25"
          bar="bg-emerald-400"
        />
        <Stat
          index={3}
          icon={<Compass className="h-4 w-4" />}
          label="Topics explored"
          value={stats.topics}
          hint={stats.latest ? `Latest: ${stats.latest.subject}` : 'No sessions yet'}
          text="text-cyan-300"
          bg="bg-cyan-500/10"
          line="border-cyan-500/25"
          bar="bg-cyan-400"
        />
      </div>
 
      {/* Web3 Learn-to-Earn & Soulbound Credentials Highlight */}
      <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-xl border border-cyan-500/25 bg-gradient-to-r from-cyan-950/20 via-raised to-accent/5 p-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-fg">Web3 Learn-to-Earn Activated</span>
              <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">ERC-5192</span>
            </div>
            <p className="text-[12px] text-fg-muted">
              Pass quizzes with 70%+ to mint non-transferable Soulbound NFTs and earn <strong className="text-cyan-300 font-medium">$QUIZ</strong> tokens.
            </p>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
          <div className="hidden sm:block text-right">
            <div className="text-[11px] text-fg-subtle">Earned Rewards</div>
            <div className="font-semibold text-cyan-400 text-[13px]">{wallet.quizTokenBalance || '50.00 QUIZ'}</div>
          </div>
          <Button variant="secondary" onClick={() => navigateTo('credentials')}>
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Credentials ({sbtList.length}) →
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent sessions */}
          <Card>
            <CardHeader
              title="Recent sessions"
              action={
                <span data-numeric className="text-[12px] text-fg-muted">
                  {quizHistory.length} total
                </span>
              }
            />
            {quizHistory.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={<GraduationCap className="h-5 w-5" />}
                  title="No sessions yet"
                  description="Generate your first quiz and it will show up here with a score and full review."
                  action={
                    <Button variant="primary" onClick={() => startQuiz({ subject: '' })}>
                      Create a quiz
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="stagger divide-y divide-line">
                {quizHistory.slice(0, 8).map((session, index) => {
                  const grade = gradeFor(session.score);
                  const accent = subjectAccent(session.subject);
                  return (
                    <li
                      key={session.id}
                      style={{ ['--i' as string]: index }}
                      className="group relative flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-raised"
                    >
                      {/* Subject colour rail, revealed on hover */}
                      <span
                        className={cn(
                          'absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 transition-transform duration-200 group-hover:scale-y-100',
                          accent.bar
                        )}
                      />

                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-[11px] font-semibold',
                          accent.bg,
                          accent.line,
                          accent.text
                        )}
                      >
                        {session.subject.slice(0, 2).toUpperCase()}
                      </span>

                      <button
                        onClick={() => reviewSession(session)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block truncate text-[13px] font-medium text-fg">
                          {session.subject}
                        </span>
                        <span className="flex items-center gap-1.5 text-[12px] text-fg-muted">
                          <Dot tone={difficultyTone(session.difficulty)} />
                          <span className="capitalize">{session.difficulty}</span>
                          <span className="text-fg-subtle">·</span>
                          {session.totalQuestions} questions
                          <span className="text-fg-subtle">·</span>
                          {formatDate(session.completedAt)}
                        </span>
                      </button>

                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <span
                            data-numeric
                            className="block text-[13px] font-medium text-fg"
                          >
                            {session.score}%
                          </span>
                          <span className={cn('block text-[11px]', grade.text)}>
                            Grade {grade.letter}
                          </span>
                        </div>

                        <button
                          onClick={() => deleteHistoryItem(session.id)}
                          title="Delete session"
                          className="rounded p-1 text-fg-subtle opacity-0 transition-all hover:text-bad group-hover:opacity-100 focus-visible:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => reviewSession(session)}
                          className="rounded p-1 text-fg-subtle transition-all hover:text-fg group-hover:translate-x-0.5"
                          title="Review session"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Start a new session */}
          <section className="space-y-3">
            <SectionHeading>Start a new session</SectionHeading>
            <div className="stagger grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SUBJECTS.map((subject, index) => {
                const accent = subjectAccent(subject);
                return (
                  <button
                    key={subject}
                    onClick={() => startQuiz({ subject })}
                    style={{ ['--i' as string]: index }}
                    className={cn(
                      'group relative overflow-hidden rounded-md border border-line bg-surface px-3 py-3 text-left',
                      'transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.99]',
                      accent.hoverLine
                    )}
                  >
                    {/* Colour wash that grows on hover */}
                    <span
                      className={cn(
                        'absolute -right-6 -top-6 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100',
                        accent.glow
                      )}
                    />
                    <span className="relative flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className={cn('mb-1.5 block h-0.5 w-5 rounded-full', accent.bar)} />
                        <span className="block truncate text-[13px] text-fg">{subject}</span>
                      </span>
                      <ArrowRight
                        className={cn(
                          'h-3.5 w-3.5 shrink-0 text-fg-subtle transition-all duration-200 group-hover:translate-x-0.5',
                          accent.groupHoverText
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[12px] text-fg-muted">
              Or pick <span className="text-fg">New quiz</span> to enter any topic — from
              &ldquo;Photosynthesis Grade 10&rdquo; to &ldquo;Ancient Egyptian dynasties&rdquo;.
            </p>
          </section>

          {/* DSA track */}
          <Card>
            <CardHeader
              accent={dsaAccent.bar}
              title="Interview prep track"
              description="Ten mixed questions on a single data-structures topic."
              action={<Code2 className={cn('h-4 w-4', dsaAccent.text)} />}
            />
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label>Topic</Label>
                <Select value={dsaTrack} onChange={(e) => setDsaTrack(e.target.value)}>
                  {DSA_TRACKS.map((track) => (
                    <option key={track} value={track}>
                      {track}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                variant="secondary"
                onClick={() =>
                  startQuiz({
                    subject: `Data Structures and Algorithms — ${dsaTrack}`,
                    difficulty:
                      dsaTrack === 'Dynamic Programming' || dsaTrack === 'Trees and Graphs'
                        ? 'hard'
                        : 'medium',
                    questionCount: 10,
                  })
                }
              >
                Start track
              </Button>
            </div>
          </Card>
        </div>

        {/* ---------------------------------------------------------------- */}
        <div className="space-y-6">
          {/* Notes */}
          <Card>
            <CardHeader
              accent="bg-emerald-400"
              title="Notes"
              description="Paste lecture notes and get a revision plan."
              action={<NotebookPen className="h-4 w-4 text-emerald-300" />}
            />
            <div className="space-y-3 p-4">
              <Textarea
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste notes from DBMS, operating systems, networks, DSA…"
              />
              {revision && (
                <div className="animate-rise-in whitespace-pre-line rounded-md border border-emerald-500/25 bg-emerald-500/[0.07] p-3 text-[12px] leading-relaxed text-fg-muted">
                  {revision}
                </div>
              )}
              <Button
                variant="secondary"
                className="w-full"
                onClick={reviseNotes}
                disabled={isRevising || notes.trim().length < 10}
              >
                {isRevising ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  'Generate revision plan'
                )}
              </Button>
            </div>
          </Card>

          {/* Feed */}
          <Card>
            <CardHeader
              accent="bg-violet-400"
              title="Tech feed"
              description="Latest AI and developer stories."
              action={
                <div className="flex items-center gap-2">
                  {!updatesLoading && (
                    <span className="flex items-center gap-1.5 text-[11px] text-emerald-300">
                      <Dot tone="ok" pulse />
                      Live
                    </span>
                  )}
                  <button
                    onClick={fetchUpdates}
                    title="Refresh"
                    className="rounded p-1 text-fg-subtle transition-colors hover:text-fg"
                  >
                    <RefreshCw
                      className={cn('h-3.5 w-3.5', updatesLoading && 'animate-spin text-violet-300')}
                    />
                  </button>
                </div>
              }
            />
            {updatesLoading ? (
              <div className="space-y-3 p-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <ul className="stagger divide-y divide-line">
                {updates.map((update, index) => (
                  <li key={update.id} style={{ ['--i' as string]: index }}>
                    <a
                      href={update.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group block px-4 py-2.5 transition-colors hover:bg-raised"
                    >
                      <span className="flex items-start gap-2">
                        <span className="min-w-0 flex-1 text-[13px] leading-snug text-fg transition-colors group-hover:text-violet-200">
                          {update.title}
                        </span>
                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-fg-subtle transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-300" />
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-[12px] text-fg-subtle">
                        <Radio className="h-3 w-3" />
                        {update.source}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </Page>
  );
}

function Stat({
  index,
  icon,
  label,
  value,
  unit,
  hint,
  text,
  bg,
  line,
  bar,
}: {
  index: number;
  icon: React.ReactNode;
  label: string;
  value: number;
  unit?: string;
  hint: string;
  text: string;
  bg: string;
  line: string;
  bar: string;
}) {
  return (
    <div
      style={{ ['--i' as string]: index }}
      className="group relative overflow-hidden rounded-lg border border-line bg-surface px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong"
    >
      {/* Top accent rule that widens on hover */}
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-px w-8 transition-all duration-300 group-hover:w-full',
          bar
        )}
      />

      <div className="flex items-start justify-between gap-2">
        <Label>{label}</Label>
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md border transition-transform duration-200 group-hover:scale-110',
            bg,
            line,
            text
          )}
        >
          {icon}
        </span>
      </div>

      <p className="mt-1.5 flex items-baseline gap-1">
        <CountUp
          value={value}
          className="text-2xl font-semibold tracking-[-0.03em] text-fg"
        />
        {unit && <span className="text-[13px] text-fg-muted">{unit}</span>}
      </p>
      <p className="mt-0.5 truncate text-[12px] text-fg-subtle">{hint}</p>
    </div>
  );
}

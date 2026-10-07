import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import {
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  LayoutGrid,
  Layers,
  Trophy,
  Wallet,
  ShieldCheck,
  Loader2,
  Coins,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { QuizConfig } from '../types';
import confetti from 'canvas-confetti';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CountUp,
  DataRow,
  EmptyState,
  Label,
  Page,
  PageHeader,
  Progress,
  formatDate,
  gradeFor,
  subjectAccent,
} from '../components/ui';
import { cn } from '../utils/cn';

/** Circular score meter that sweeps to its value on mount. */
function ScoreRing({ score, color }: { score: number; color: string }) {
  const [progress, setProgress] = useState(0);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setProgress(score);
      return;
    }
    const timeout = window.setTimeout(() => setProgress(score), 60);
    return () => window.clearTimeout(timeout);
  }, [score]);

  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          stroke="var(--color-line)"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="6"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * progress) / 100}
          style={{ transition: 'stroke-dashoffset 1s var(--ease-out-quart)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <CountUp value={score} className="text-xl font-semibold tracking-[-0.03em] text-fg" />
        <span className="text-[10px] text-fg-subtle">percent</span>
      </div>
    </div>
  );
}

type MintStatus = 'idle' | 'checking' | 'signing' | 'broadcasting' | 'confirmed' | 'error';

const MINT_COPY: Record<Exclude<MintStatus, 'idle' | 'confirmed' | 'error'>, string> = {
  checking: 'Verifying score',
  signing: 'Waiting for signature',
  broadcasting: 'Broadcasting transaction',
};

export default function ResultsPage() {
  const {
    currentSession,
    navigateTo,
    setConfig,
    wallet,
    connectRealWallet,
    connectMockWallet,
    claimQuizReward,
    mintSBTForActiveQuiz,
    sbtList,
  } = useQuizStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<MintStatus>('idle');
  const [claimStatus, setClaimStatus] = useState<'idle' | 'claiming' | 'claimed'>('idle');

  const score = currentSession?.score ?? 0;

  useEffect(() => {
    if (!currentSession || score < 80) return;
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.25 },
      colors: ['#6366f1', '#3fb950', '#22d3ee', '#f59e0b'],
      disableForReducedMotion: true,
    });
  }, [currentSession, score]);

  if (!currentSession) {
    return (
      <Page width="narrow">
        <EmptyState
          className="mt-16"
          icon={<Trophy className="h-6 w-6" />}
          title="No completed session"
          description="Finish a quiz to see your score, review, and summary here."
          action={
            <Button variant="primary" onClick={() => navigateTo('dashboard')}>
              Back to overview
            </Button>
          }
        />
      </Page>
    );
  }

  const { questions, answers, subject, difficulty, flashNote } = currentSession;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const grade = gradeFor(score);
  const minted = sbtList.find((s) => s.subject === subject && s.score === score);

  const retake = () => {
    const config: QuizConfig = {
      subject,
      difficulty,
      questionCount: questions.length as QuizConfig['questionCount'],
      questionType: 'mixed',
    };
    setConfig(config);
    navigateTo('setup');
  };

  const mint = () => {
    if (!wallet.connected) return;
    setMintStatus('checking');
    window.setTimeout(() => {
      setMintStatus('signing');
      window.setTimeout(async () => {
        setMintStatus('broadcasting');
        try {
          await mintSBTForActiveQuiz();
          setMintStatus('confirmed');
          confetti({
            particleCount: 50,
            spread: 55,
            origin: { y: 0.7 },
            colors: ['#5e6ad2', '#3fb950'],
            disableForReducedMotion: true,
          });
        } catch {
          setMintStatus('error');
        }
      }, 1400);
    }, 1000);
  };

  const claimReward = async () => {
    if (!wallet.connected) return;
    setClaimStatus('claiming');
    try {
      await claimQuizReward();
      setClaimStatus('claimed');
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b'],
        disableForReducedMotion: true,
      });
    } catch {
      setClaimStatus('idle');
    }
  };

  const accent = subjectAccent(subject);
  const scoreTone = score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'bad';
  const ringColor =
    score >= 80 ? 'var(--color-ok)' : score >= 50 ? 'var(--color-warn)' : 'var(--color-bad)';

  return (
    <Page width="narrow">
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <span className={cn('h-6 w-1 rounded-full', accent.bar)} />
            <span className="capitalize">{subject}</span>
          </span>
        }
        description={`Completed ${formatDate(currentSession.completedAt)} · ${difficulty} difficulty`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={retake}>
              <RotateCcw className="h-3.5 w-3.5" />
              Retake
            </Button>
            <Button variant="secondary" onClick={() => navigateTo('flashcards')}>
              <Layers className="h-3.5 w-3.5" />
              Flashcards
            </Button>
            <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
              <LayoutGrid className="h-3.5 w-3.5" />
              Overview
            </Button>
          </div>
        }
      />

      {/* Score */}
      <Card className="animate-rise-in-lg mb-6 overflow-hidden">
        <div className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5">
            <ScoreRing score={score} color={ringColor} />
            <div className="space-y-1">
              <Label>Result</Label>
              <p className={cn('text-2xl font-semibold tracking-[-0.03em]', grade.text)}>
                Grade {grade.letter}
              </p>
              <p className="text-[13px] text-fg-muted">
                <span data-numeric className="text-fg">
                  {correctCount}
                </span>{' '}
                of{' '}
                <span data-numeric className="text-fg">
                  {questions.length}
                </span>{' '}
                correct
              </p>
            </div>
          </div>

          {/* Per-question outcome strip */}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-baseline justify-between">
              <Label>Breakdown</Label>
              <span className="text-[12px] text-fg-muted">
                {score >= 50 ? 'Passed' : 'Below pass mark'}
              </span>
            </div>
            <div className="stagger flex gap-1">
              {questions.map((question, index) => {
                const record = answers.find((a) => a.questionId === question.id);
                return (
                  <span
                    key={question.id}
                    title={`Question ${index + 1}: ${record?.isCorrect ? 'correct' : 'incorrect'}`}
                    style={{ ['--i' as string]: index }}
                    className={cn(
                      'h-1.5 flex-1 rounded-full',
                      record?.isCorrect ? 'bg-ok' : 'bg-bad'
                    )}
                  />
                );
              })}
            </div>
            <Progress value={score} tone={scoreTone} />
            <div className="flex justify-between text-[12px] text-fg-subtle">
              <span>0%</span>
              <span>Pass 50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Single column on purpose: a results page is a document, and a
          two-column split leaves a large void whenever one side runs short. */}
      <div className="space-y-6">
        {/* Review */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Review"
              action={
                <span data-numeric className="text-[12px] text-fg-muted">
                  {correctCount}/{questions.length}
                </span>
              }
            />
            <ul className="stagger divide-y divide-line">
              {questions.map((question, index) => {
                const record = answers.find((a) => a.questionId === question.id);
                const correct = record?.isCorrect ?? false;
                const open = expanded === question.id;
                return (
                  <li key={question.id} style={{ ['--i' as string]: index }}>
                    <button
                      onClick={() => setExpanded(open ? null : question.id)}
                      aria-expanded={open}
                      className={cn(
                        'flex w-full items-start gap-3 border-l-2 px-4 py-3 text-left transition-colors hover:bg-raised',
                        correct ? 'border-l-ok/40' : 'border-l-bad/40'
                      )}
                    >
                      {correct ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12px] text-fg-subtle">
                          Question {index + 1}
                        </span>
                        <span
                          className={cn(
                            'block text-[13px] text-fg',
                            !open && 'truncate'
                          )}
                        >
                          {question.question}
                        </span>
                      </span>
                      {open ? (
                        <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
                      ) : (
                        <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle" />
                      )}
                    </button>

                    {open && (
                      <div className="animate-rise-in space-y-3 border-t border-line bg-canvas px-4 py-3">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label>Your answer</Label>
                            <p
                              className={cn(
                                'text-[13px]',
                                correct ? 'text-ok' : 'text-bad'
                              )}
                            >
                              {record?.userAnswer || (
                                <span className="text-fg-subtle">No answer given</span>
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <Label>Correct answer</Label>
                            <p className="text-[13px] text-fg">{question.correctAnswer}</p>
                          </div>
                        </div>
                        <div className="space-y-1 border-t border-line pt-2">
                          <Label>Explanation</Label>
                          <p className="text-[13px] leading-relaxed text-fg-muted">
                            {question.explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        {/* Summary + credential */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Summary" />
            <div className="space-y-4 p-4">
              <p className="text-[13px] leading-relaxed text-fg-muted">
                {flashNote.summary ||
                  `An overview of the core principles and terminology of ${subject}.`}
              </p>

              {flashNote.keyPoints?.length > 0 && (
                <div className="space-y-2 border-t border-line pt-3">
                  <Label>Key points</Label>
                  <ul className="space-y-1.5">
                    {flashNote.keyPoints.map((point, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[13px] leading-relaxed text-fg-muted"
                      >
                        <span className="text-fg-subtle">·</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {flashNote.keyTerms?.length > 0 && (
                <div className="space-y-2 border-t border-line pt-3">
                  <Label>Glossary</Label>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {flashNote.keyTerms.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-md border border-line bg-canvas px-3 py-2"
                      >
                        <dt className="text-[13px] font-medium text-fg">{item.term}</dt>
                        <dd className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">
                          {item.meaning}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </Card>

          {/* Learn-to-Earn Rewards ($QUIZ Token) */}
          {score >= 50 && (
            <Card className="border-cyan-500/30 bg-cyan-950/10">
              <CardHeader
                title={
                  <span className="flex items-center gap-2 text-cyan-400">
                    <Coins className="h-4 w-4" />
                    Learn-to-Earn Rewards
                  </span>
                }
                description="Earn $QUIZ ERC-20 tokens directly to your wallet for passing scores."
                action={
                  <Badge tone="ok">
                    +{score === 100 ? '50' : score >= 90 ? '25' : '10'} $QUIZ
                  </Badge>
                }
              />
              <div className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-[13px] text-fg">
                      Academic Mastery Bounty:{' '}
                      <strong className="text-cyan-300 font-semibold">
                        {score === 100 ? '50' : score >= 90 ? '25' : '10'} QUIZ
                      </strong>
                    </p>
                    <p className="text-[12px] text-fg-muted">
                      {wallet.connected
                        ? `Recipient: ${wallet.address}`
                        : 'Connect wallet to claim your reward'}
                    </p>
                  </div>

                  <div>
                    {!wallet.connected ? (
                      <Button
                        variant="secondary"
                        onClick={() => connectRealWallet().catch(() => connectMockWallet('sepolia'))}
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Connect to Claim
                      </Button>
                    ) : claimStatus === 'claimed' ? (
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-ok">
                        <Check className="h-3.5 w-3.5" />
                        Tokens Deposited!
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={claimReward}
                        disabled={claimStatus === 'claiming'}
                      >
                        {claimStatus === 'claiming' ? (
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Transferring...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Claim {score === 100 ? '50' : score >= 90 ? '25' : '10'} $QUIZ
                          </span>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Credential */}
          {score >= 50 && (
            <Card>
              <CardHeader
                title="Soulbound Credential (ERC-5192)"
                description="Mint an on-chain, non-transferable proof-of-knowledge NFT."
              />
              <div className="p-4">
                {minted ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-ok" />
                      <span className="text-[13px] font-medium text-ok">Successfully Minted On-Chain</span>
                    </div>
                    <div className="divide-y divide-line rounded-md border border-line bg-canvas px-3 py-1">
                      <DataRow label="Token ID" value={minted.tokenId} mono />
                      <DataRow label="Network" value={minted.network} />
                      <DataRow label="Block" value={`#${minted.blockNumber}`} mono />
                      <DataRow label="Contract" value={minted.contractAddress} mono />
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => navigateTo('credentials')}
                    >
                      View in Credentials Gallery →
                    </Button>
                  </div>
                ) : !wallet.connected ? (
                  <div className="space-y-3">
                    <p className="text-[13px] leading-relaxed text-fg-muted">
                      Connect your Web3 wallet (MetaMask) or simulated testnet wallet to issue an on-chain{' '}
                      <strong className="font-medium text-fg">Soulbound NFT Certificate</strong> for
                      this result.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={() => connectRealWallet().catch(() => connectMockWallet('sepolia'))}
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Connect Wallet
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => connectMockWallet('sepolia')}
                      >
                        Demo Wallet
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="divide-y divide-line rounded-md border border-line bg-canvas px-3 py-1">
                      <DataRow label="Address" value={wallet.address ?? '—'} mono />
                      <DataRow label="Network" value={wallet.network} />
                      <DataRow label="Score" value={`${score}%`} />
                    </div>

                    {mintStatus === 'idle' && (
                      <Button variant="primary" className="w-full" onClick={mint}>
                        Mint On-Chain Credential
                      </Button>
                    )}

                    {(mintStatus === 'checking' ||
                      mintStatus === 'signing' ||
                      mintStatus === 'broadcasting') && (
                      <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-fg-muted">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {MINT_COPY[mintStatus]}…
                      </div>
                    )}

                    {mintStatus === 'confirmed' && (
                      <div className="flex items-center justify-center gap-2 py-2 text-[13px] text-ok">
                        <Check className="h-3.5 w-3.5" />
                        Credential minted on-chain!
                      </div>
                    )}

                    {mintStatus === 'error' && (
                      <div className="space-y-2">
                        <p className="text-[13px] text-bad">
                          The transaction failed. Please try again.
                        </p>
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => setMintStatus('idle')}
                        >
                          Retry
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {score < 50 && (
            <Card>
              <div className="space-y-3 p-4">
                <Badge tone="warn">Below pass mark</Badge>
                <p className="text-[13px] leading-relaxed text-fg-muted">
                  Credentials are issued at 50% and above. Work through the flashcards and
                  retake this quiz.
                </p>
                <Button variant="secondary" className="w-full" onClick={retake}>
                  Retake quiz
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Page>
  );
}

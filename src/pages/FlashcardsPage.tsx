import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Shuffle,
  Layers,
  Undo2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Button,
  Card,
  CountUp,
  EmptyState,
  Label,
  Page,
  PageHeader,
  Progress,
  subjectAccent,
} from '../components/ui';
import { cn } from '../utils/cn';

export default function FlashcardsPage() {
  const {
    currentSession,
    studyFlashcards,
    toggleFlashcardMastery,
    shuffleFlashcards,
    resetFlashcardMastery,
    navigateTo,
  } = useQuizStore();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = studyFlashcards.length;
  const mastered = studyFlashcards.filter((c) => c.mastered).length;
  const allMastered = total > 0 && mastered === total;

  useEffect(() => {
    if (!allMastered) return;
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.3 },
      colors: ['#6366f1', '#3fb950', '#22d3ee'],
      disableForReducedMotion: true,
    });
  }, [allMastered]);

  // Keep the index in range if the deck is shuffled or shortened.
  useEffect(() => {
    if (index > total - 1) setIndex(0);
  }, [total, index]);

  if (total === 0) {
    return (
      <Page width="narrow">
        <EmptyState
          className="mt-16"
          icon={<Layers className="h-6 w-6" />}
          title="No flashcards loaded"
          description="Generate a quiz and its flashcard deck will appear here."
          action={
            <Button variant="primary" onClick={() => navigateTo('dashboard')}>
              Back to overview
            </Button>
          }
        />
      </Page>
    );
  }

  const card = studyFlashcards[index];
  const accent = subjectAccent(currentSession?.subject || 'Custom deck');

  const go = (delta: number) => {
    setFlipped(false);
    setIndex((prev) => (prev + delta + total) % total);
  };

  const markMastered = () => {
    if (!card.mastered) toggleFlashcardMastery(card.id);
    if (index < total - 1) window.setTimeout(() => go(1), 180);
  };

  const markLearning = () => {
    if (card.mastered) toggleFlashcardMastery(card.id);
  };

  return (
    <Page width="narrow">
      <PageHeader
        title="Flashcards"
        description={currentSession?.subject || 'Custom deck'}
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={shuffleFlashcards}>
              <Shuffle className="h-3.5 w-3.5" />
              Shuffle
            </Button>
            <Button variant="ghost" onClick={resetFlashcardMastery}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>
        }
      />

      {/* Progress */}
      <div className="mb-6 space-y-2">
        <div className="flex items-baseline justify-between">
          <Label>Mastered</Label>
          <span data-numeric className="text-[13px] text-fg-muted">
            <CountUp value={mastered} className="text-emerald-300" /> of {total}
          </span>
        </div>
        <Progress value={(mastered / total) * 100} tone="ok" />
      </div>

      {/* Card */}
      <div className="perspective mb-4">
        <button
          onClick={() => setFlipped((f) => !f)}
          aria-label={flipped ? 'Show term' : 'Show definition'}
          className="preserve-3d relative block h-72 w-full text-left transition-transform duration-500"
          style={{ transform: flipped ? 'rotateY(180deg)' : undefined }}
        >
          {/* Front */}
          <span
            className={cn(
              'backface-hidden absolute inset-0 flex flex-col justify-between overflow-hidden rounded-lg border bg-surface p-6 transition-colors',
              card.mastered ? 'border-emerald-500/30' : 'border-line hover:border-line-strong'
            )}
          >
            <span
              className={cn(
                'absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl',
                accent.glow
              )}
            />
            <span className="relative flex items-center justify-between">
              <Label className={accent.text}>
                Card {index + 1} of {total}
              </Label>
              {card.mastered && (
                <span className="flex items-center gap-1 text-[12px] text-ok">
                  <Check className="h-3.5 w-3.5" />
                  Mastered
                </span>
              )}
            </span>
            <span className="relative text-center text-xl font-medium tracking-[-0.02em] text-fg">
              {card.term}
            </span>
            <span className="relative text-center text-[12px] text-fg-subtle">
              Click to reveal the definition
            </span>
          </span>

          {/* Back */}
          <span
            className={cn(
              'backface-hidden flip-y absolute inset-0 flex flex-col justify-between overflow-hidden rounded-lg border bg-surface p-6',
              accent.line
            )}
          >
            <span
              className={cn(
                'absolute -bottom-10 -left-10 h-28 w-28 rounded-full blur-3xl',
                accent.glow
              )}
            />
            <Label className={cn('relative', accent.text)}>Definition</Label>
            <span className="relative text-center text-[15px] leading-relaxed text-fg">
              {card.definition}
            </span>
            <span className="relative text-center text-[12px] text-fg-subtle">
              Click to flip back
            </span>
          </span>
        </button>
      </div>

      {/* Controls */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => go(-1)}>
          <ArrowLeft className="h-3.5 w-3.5" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={markLearning} disabled={!card.mastered}>
            <Undo2 className="h-3.5 w-3.5" />
            Still learning
          </Button>
          <Button
            variant={card.mastered ? 'secondary' : 'primary'}
            onClick={markMastered}
            disabled={card.mastered}
          >
            <Check className="h-3.5 w-3.5" />
            {card.mastered ? 'Mastered' : 'Got it'}
          </Button>
        </div>

        <Button variant="secondary" onClick={() => go(1)}>
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {allMastered && (
        <Card className="animate-rise-in mb-6">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-[13px] font-medium text-fg">Deck complete</p>
              <p className="text-[12px] text-fg-muted">
                You marked every term in this deck as mastered.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigateTo('dashboard')}>
              Back to overview
            </Button>
          </div>
        </Card>
      )}

      {/* Deck index */}
      <section className="space-y-2">
        <Label>All terms</Label>
        <div className="stagger grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {studyFlashcards.map((item, i) => (
            <button
              key={item.id}
              onClick={() => {
                setFlipped(false);
                setIndex(i);
              }}
              style={{ ['--i' as string]: i }}
              className={cn(
                'flex items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px] transition-all duration-150 hover:-translate-y-px',
                i === index
                  ? 'border-accent bg-accent/10 text-accent-fg'
                  : item.mastered
                    ? 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-200/80'
                    : 'border-line bg-surface text-fg-muted hover:border-line-strong hover:text-fg'
              )}
            >
              <span className="truncate">{item.term}</span>
              {item.mastered && <Check className="h-3.5 w-3.5 shrink-0 text-ok" />}
            </button>
          ))}
        </div>
      </section>
    </Page>
  );
}

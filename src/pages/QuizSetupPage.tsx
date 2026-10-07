import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { QuizConfig } from '../types';
import {
  Button,
  Card,
  DataRow,
  Input,
  Label,
  OptionTile,
  Page,
  PageHeader,
  Segmented,
} from '../components/ui';
import { cn } from '../utils/cn';

const PRESETS = [
  'Photosynthesis',
  'Quantum Mechanics',
  'Periodic Table',
  'World War II',
  'Linear Equations',
  'Data Structures',
];

const STEPS = ['Topic', 'Format', 'Review'];

const LOADING_MESSAGES = [
  'Analysing the topic',
  'Drafting questions',
  'Writing explanations',
  'Building the flashcard deck',
  'Finishing up',
];

export default function QuizSetupPage() {
  const { currentConfig, setConfig, generateNewQuiz, navigateTo, useGemini } =
    useQuizStore();

  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState(currentConfig?.subject || '');
  const [difficulty, setDifficulty] = useState<QuizConfig['difficulty']>(
    currentConfig?.difficulty || 'medium'
  );
  const [questionCount, setQuestionCount] = useState<QuizConfig['questionCount']>(
    currentConfig?.questionCount || 5
  );
  const [questionType, setQuestionType] = useState<QuizConfig['questionType']>(
    currentConfig?.questionType || 'mixed'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      setLoadingIndex(0);
      return;
    }
    const interval = window.setInterval(
      () => setLoadingIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      1400
    );
    return () => window.clearInterval(interval);
  }, [isLoading]);

  const generate = async () => {
    setError('');
    setConfig({ subject: subject.trim(), difficulty, questionCount, questionType });
    setIsLoading(true);
    try {
      await generateNewQuiz();
    } catch {
      setIsLoading(false);
      setError(
        useGemini
          ? 'Could not reach Google Gemini. Check your API key in Settings, or switch to the local engine.'
          : 'Could not generate this quiz. Please try again.'
      );
    }
  };

  return (
    <Page width="narrow">
      <PageHeader
        title="New quiz"
        description="Pick a topic and format. You get questions with explanations, a flashcard deck, and a summary."
        action={
          <Button variant="ghost" onClick={() => navigateTo('dashboard')}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Cancel
          </Button>
        }
      />

      {/* Stepper */}
      <ol className="mb-6 flex items-center gap-2">
        {STEPS.map((name, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={name} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-medium transition-colors',
                    done
                      ? 'border-accent bg-accent text-white'
                      : active
                        ? 'border-accent text-accent-fg'
                        : 'border-line text-fg-subtle'
                  )}
                >
                  {done ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'text-[13px] font-medium',
                    active ? 'text-fg' : 'text-fg-muted'
                  )}
                >
                  {name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <span className="h-px flex-1 bg-line" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>

      <Card>
        <div className="min-h-[300px] p-5">
          {step === 0 && (
            <div className="animate-fade-in space-y-5">
              <div className="space-y-1.5">
                <Label>What do you want to study?</Label>
                <Input
                  autoFocus
                  value={subject}
                  maxLength={60}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && subject.trim()) setStep(1);
                  }}
                  placeholder="e.g. Photosynthesis, World War II, Python decorators"
                  className="h-10 text-sm"
                />
                <div className="flex justify-between text-[12px] text-fg-subtle">
                  <span>Be specific for sharper questions.</span>
                  <span data-numeric>{subject.length}/60</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Popular topics</Label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSubject(preset)}
                      className={cn(
                        'rounded-md border px-2.5 py-1 text-[13px] transition-colors',
                        subject === preset
                          ? 'border-accent bg-accent/10 text-accent-fg'
                          : 'border-line bg-canvas text-fg-muted hover:border-line-strong hover:text-fg'
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <div role="radiogroup" className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'easy', title: 'Easy', description: 'Core terms and recall' },
                      { id: 'medium', title: 'Medium', description: 'Detail and reasoning' },
                      { id: 'hard', title: 'Hard', description: 'Applied and edge cases' },
                    ] as const
                  ).map((option) => (
                    <OptionTile
                      key={option.id}
                      selected={difficulty === option.id}
                      title={option.title}
                      description={option.description}
                      onClick={() => setDifficulty(option.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of questions</Label>
                <Segmented
                  className="w-full"
                  value={questionCount}
                  onChange={(value) => setQuestionCount(value)}
                  options={[
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                    { value: 20, label: '20' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label>Question types</Label>
                <div role="radiogroup" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(
                    [
                      { id: 'mcq', label: 'Multiple choice' },
                      { id: 'true-false', label: 'True / false' },
                      { id: 'short-answer', label: 'Short answer' },
                      { id: 'mixed', label: 'Mixed' },
                    ] as const
                  ).map((option) => (
                    <OptionTile
                      key={option.id}
                      selected={questionType === option.id}
                      title={option.label}
                      onClick={() => setQuestionType(option.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <div className="divide-y divide-line rounded-md border border-line bg-canvas px-3 py-1">
                <DataRow label="Topic" value={subject} />
                <DataRow
                  label="Difficulty"
                  value={<span className="capitalize">{difficulty}</span>}
                />
                <DataRow label="Questions" value={questionCount} />
                <DataRow
                  label="Format"
                  value={questionType === 'mixed' ? 'Mixed' : questionType.replace('-', ' / ')}
                />
                <DataRow
                  label="Time limit"
                  value={`30s per question · about ${Math.ceil((questionCount * 30) / 60)} min`}
                />
              </div>

              <ul className="space-y-1.5 text-[13px] text-fg-muted">
                {[
                  'Questions with an explanation revealed after each answer',
                  'A flashcard deck of the key terms',
                  'A written summary saved to your history',
                  'Eligible for On-Chain Soulbound Credential (ERC-5192) & $QUIZ tokens',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ok" />
                    {item}
                  </li>
                ))}
              </ul>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-bad-line bg-bad/10 px-3 py-2 text-[13px] text-bad">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-3">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            className={step === 0 ? 'invisible' : ''}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Button>

          {step < 2 ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && !subject.trim()}
            >
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="primary" onClick={generate} disabled={isLoading}>
              {isLoading ? 'Generating…' : 'Generate quiz'}
            </Button>
          )}
        </div>
      </Card>

      {/* Generation overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-6 backdrop-blur-sm">
          <div className="animate-pop-in w-full max-w-sm space-y-4 rounded-lg border border-line bg-surface p-5">
            <div className="space-y-1">
              <h2 className="text-[13px] font-medium text-fg">Building your quiz</h2>
              <p className="text-[12px] text-fg-muted">
                {questionCount} questions on {subject}.
              </p>
            </div>

            <div className="h-1 w-full overflow-hidden rounded-full bg-line">
              <div className="animate-indeterminate h-full w-1/4 rounded-full bg-accent" />
            </div>

            <p className="text-[12px] text-fg-subtle" aria-live="polite">
              {LOADING_MESSAGES[loadingIndex]}…
            </p>
          </div>
        </div>
      )}
    </Page>
  );
}

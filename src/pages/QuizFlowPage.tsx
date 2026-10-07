import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import {
  ArrowRight,
  Check,
  X,
  MessageSquare,
  Pause,
  Play,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import {
  Button,
  Card,
  EmptyState,
  Label,
  Page,
  Progress,
  Textarea,
  subjectAccent,
} from '../components/ui';
import { cn } from '../utils/cn';

const SECONDS_PER_QUESTION = 30;

const TYPE_LABEL: Record<string, string> = {
  mcq: 'Multiple choice',
  'true-false': 'True / false',
  'short-answer': 'Short answer',
};

export default function QuizFlowPage() {
  const {
    currentSession,
    currentQuestionIndex,
    userAnswers,
    selectAnswer,
    nextQuestion,
    submitQuizSession,
    toggleChat,
    navigateTo,
  } = useQuizStore();

  const [shortAnswer, setShortAnswer] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(SECONDS_PER_QUESTION);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const question = currentSession?.questions[currentQuestionIndex];
  const answer = question ? userAnswers[question.id] : undefined;
  const isAnswered = answer !== undefined;

  // Reset the input whenever the question changes.
  useEffect(() => {
    setShortAnswer('');
  }, [currentQuestionIndex]);

  // Countdown. Restarts on each new question; freezes once answered.
  useEffect(() => {
    if (!question || !timerEnabled || isAnswered) return;

    setSecondsLeft(SECONDS_PER_QUESTION);
    const questionId = question.id;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          // Record the miss so scoring stays consistent with answered questions.
          selectAnswer(questionId, '');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, timerEnabled, isAnswered]);

  if (!currentSession || !question) {
    return (
      <Page width="narrow">
        <EmptyState
          className="mt-16"
          icon={<AlertTriangle className="h-6 w-6" />}
          title="No quiz in progress"
          description="Your session ended or the page was reloaded. Start a new quiz to continue."
          action={
            <Button variant="primary" onClick={() => navigateTo('dashboard')}>
              Back to overview
            </Button>
          }
        />
      </Page>
    );
  }

  const questions = currentSession.questions;
  const isLast = currentQuestionIndex === questions.length - 1;
  const timedOut = isAnswered && answer === '';
  const answeredCount = isAnswered ? currentQuestionIndex + 1 : currentQuestionIndex;

  const isShortAnswerCorrect = () => {
    if (!isAnswered || timedOut) return false;
    const user = (answer || '').toLowerCase().trim();
    const correct = question.correctAnswer.toLowerCase().trim();
    return user.includes(correct) || correct.includes(user);
  };

  const accent = subjectAccent(currentSession.subject);

  const optionState = (option: string) => {
    if (!isAnswered) {
      return cn(
        'border-line bg-canvas text-fg hover:-translate-y-px hover:bg-raised active:scale-[0.995]',
        accent.hoverLine
      );
    }
    if (option === question.correctAnswer) {
      return 'animate-nudge border-ok bg-ok/10 text-fg ring-2 ring-ok/20';
    }
    if (option === answer) {
      return 'animate-nudge border-bad bg-bad/10 text-fg ring-2 ring-bad/20';
    }
    return 'border-line bg-canvas text-fg-subtle opacity-60';
  };

  const askCoach = () => {
    useQuizStore.setState({
      chatContext: {
        subject: currentSession.subject,
        currentQuestion: question.question,
        currentQuestionId: question.id,
      },
    });
    toggleChat(true);
  };

  const urgent = timerEnabled && !isAnswered && secondsLeft <= 8;

  return (
    <Page width="narrow">
      {/* Context bar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn('h-8 w-0.5 shrink-0 rounded-full', accent.bar)} />
          <div className="min-w-0">
            <p className={cn('truncate text-[12px]', accent.text)}>
              {currentSession.subject}
            </p>
            <h1 className="text-[15px] font-medium text-fg">
              Question <span data-numeric>{currentQuestionIndex + 1}</span> of{' '}
              <span data-numeric>{questions.length}</span>
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setTimerEnabled((on) => !on)}
            title={timerEnabled ? 'Turn off timer' : 'Turn on timer'}
            className="rounded p-1 text-fg-subtle transition-colors hover:text-fg"
          >
            {timerEnabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          {timerEnabled && (
            <span
              data-numeric
              className={cn(
                'w-10 text-right text-[13px] tabular-nums',
                urgent ? 'text-bad' : 'text-fg-muted'
              )}
            >
              {secondsLeft}s
            </span>
          )}
        </div>
      </div>

      <Progress
        value={(answeredCount / questions.length) * 100}
        className="mb-6"
        barClassName={accent.bar}
      />

      <Card key={question.id} className="animate-rise-in-lg">
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <Label className={accent.text}>{TYPE_LABEL[question.type]}</Label>
            <h2 className="text-base font-medium leading-relaxed text-fg">
              {question.question}
            </h2>
          </div>

          {/* Choices */}
          {(question.type === 'mcq' || question.type === 'true-false') && (
            <div
              role="radiogroup"
              className={cn(
                'grid gap-2',
                question.type === 'true-false' ? 'grid-cols-2' : 'grid-cols-1'
              )}
            >
              {(question.type === 'true-false'
                ? ['True', 'False']
                : question.options || []
              ).map((option, index) => {
                const chosen = answer === option;
                const correct = isAnswered && option === question.correctAnswer;
                const wrong = isAnswered && chosen && !correct;
                return (
                  <button
                    key={option}
                    role="radio"
                    aria-checked={chosen}
                    disabled={isAnswered}
                    onClick={() => selectAnswer(question.id, option)}
                    style={{ ['--i' as string]: index }}
                    className={cn(
                      'flex items-center gap-3 rounded-md border px-3 py-2.5 text-left text-[13px] transition-all duration-200 disabled:cursor-default',
                      optionState(option)
                    )}
                  >
                    {question.type === 'mcq' && (
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px]',
                          correct
                            ? 'border-ok text-ok'
                            : wrong
                              ? 'border-bad text-bad'
                              : 'border-line text-fg-subtle'
                        )}
                      >
                        {['A', 'B', 'C', 'D'][index]}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">{option}</span>
                    {correct && <Check className="h-4 w-4 shrink-0 text-ok" />}
                    {wrong && <X className="h-4 w-4 shrink-0 text-bad" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short answer */}
          {question.type === 'short-answer' && (
            <div className="space-y-3">
              {!isAnswered ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (shortAnswer.trim()) selectAnswer(question.id, shortAnswer.trim());
                  }}
                  className="space-y-2"
                >
                  <Textarea
                    autoFocus
                    rows={3}
                    value={shortAnswer}
                    onChange={(e) => setShortAnswer(e.target.value)}
                    placeholder="Type your answer — the key term is what matters"
                  />
                  <Button variant="primary" type="submit" disabled={!shortAnswer.trim()}>
                    Submit answer
                  </Button>
                </form>
              ) : (
                <div
                  className={cn(
                    'space-y-2 rounded-md border p-3',
                    isShortAnswerCorrect() ? 'border-ok-line bg-ok/10' : 'border-bad-line bg-bad/10'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Label>Your answer</Label>
                    <span
                      className={cn(
                        'flex items-center gap-1 text-[12px]',
                        isShortAnswerCorrect() ? 'text-ok' : 'text-bad'
                      )}
                    >
                      {isShortAnswerCorrect() ? (
                        <>
                          <Check className="h-3.5 w-3.5" /> Correct
                        </>
                      ) : (
                        <>
                          <X className="h-3.5 w-3.5" /> Incorrect
                        </>
                      )}
                    </span>
                  </div>
                  <p className="text-[13px] text-fg">
                    {timedOut ? <span className="text-fg-subtle">No answer given</span> : answer}
                  </p>
                  <div className="border-t border-line pt-2">
                    <Label>Expected</Label>
                    <p className="mt-0.5 text-[13px] text-fg">{question.correctAnswer}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timed-out notice for choice questions */}
          {timedOut && question.type !== 'short-answer' && (
            <div className="flex items-center gap-2 rounded-md border border-warn-line bg-warn/10 px-3 py-2 text-[13px] text-warn">
              <Flag className="h-3.5 w-3.5 shrink-0" />
              Time ran out — this one is marked incorrect.
            </div>
          )}

          {/* Explanation */}
          {isAnswered && (
            <div className="animate-rise-in relative space-y-1.5 overflow-hidden rounded-md border border-line bg-canvas p-3 pl-4">
              <span className={cn('absolute inset-y-0 left-0 w-0.5', accent.bar)} />
              <Label className={accent.text}>Explanation</Label>
              <p className="text-[13px] leading-relaxed text-fg-muted">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3">
          <Button variant="ghost" onClick={askCoach}>
            <MessageSquare className="h-3.5 w-3.5" />
            Ask the coach
          </Button>

          {isAnswered && (
            <Button
              variant="primary"
              onClick={isLast ? submitQuizSession : nextQuestion}
              autoFocus
            >
              {isLast ? 'Finish and submit' : 'Next question'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </Card>

      {/* Question rail */}
      <div className="mt-4 flex items-center gap-1.5">
        {questions.map((q, index) => {
          const done = userAnswers[q.id] !== undefined;
          return (
            <span
              key={q.id}
              title={`Question ${index + 1}`}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                index === currentQuestionIndex
                  ? cn(accent.bar, 'scale-y-150')
                  : done
                    ? 'bg-line-strong'
                    : 'bg-line'
              )}
            />
          );
        })}
      </div>
    </Page>
  );
}

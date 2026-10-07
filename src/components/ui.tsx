import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils/cn';

/* ---------------------------------------------------------------------------
   Primitives. Every screen composes these so spacing, radii, borders, colour
   and focus states stay identical across the app.
   --------------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap ' +
  'transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-sm shadow-accent/25 hover:bg-accent-hover hover:shadow-md hover:shadow-accent/30',
  secondary:
    'bg-raised text-fg border border-line hover:bg-overlay hover:border-line-strong',
  ghost: 'text-fg-muted hover:text-fg hover:bg-raised',
  danger: 'text-bad hover:bg-bad/10',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'h-7 px-2.5 text-[13px]',
  md: 'h-8 px-3 text-[13px]',
  lg: 'h-9 px-4 text-sm',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <button
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...props}
    />
  );
}

export function IconButton({
  size = 'md',
  variant = 'ghost',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const box = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-9 w-9' : 'h-8 w-8';
  return (
    <button
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], box, 'px-0', className)}
      {...props}
    />
  );
}

/** Flat panel. Elevation is reserved for overlays; `interactive` adds lift. */
export function Card({
  className,
  interactive,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface transition-all duration-200',
        interactive &&
          'hover:-translate-y-px hover:border-line-strong hover:shadow-lg hover:shadow-black/20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  accent,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  /** Optional coloured leading bar to tie the panel to a category. */
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-line px-4 py-3',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {accent && (
          <span className={cn('mt-0.5 h-4 w-0.5 shrink-0 rounded-full', accent)} />
        )}
        <div className="min-w-0">
          <h2 className="text-[13px] font-medium text-fg">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionHeading({
  children,
  action,
  className,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', className)}>
      <h2 className="text-[13px] font-medium text-fg">{children}</h2>
      {action}
    </div>
  );
}

export function Label({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'text-[11px] font-medium uppercase tracking-[0.06em] text-fg-subtle',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'bad';

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-raised text-fg-muted',
  accent: 'border-accent-line bg-accent/10 text-accent-fg',
  ok: 'border-ok-line bg-ok/10 text-ok',
  warn: 'border-warn-line bg-warn/10 text-warn',
  bad: 'border-bad-line bg-bad/10 text-bad',
};

export const TONE_TEXT: Record<Tone, string> = {
  neutral: 'text-fg-muted',
  accent: 'text-accent-fg',
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-bad',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium',
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Dot({
  tone = 'neutral',
  className,
  pulse,
}: {
  tone?: Tone;
  className?: string;
  pulse?: boolean;
}) {
  const fill = {
    neutral: 'bg-fg-subtle',
    accent: 'bg-accent',
    ok: 'bg-ok',
    warn: 'bg-warn',
    bad: 'bg-bad',
  }[tone];
  return (
    <span className={cn('relative flex h-1.5 w-1.5 shrink-0', className)}>
      {pulse && (
        <span className={cn('animate-halo absolute inset-0 rounded-full', fill)} />
      )}
      <span className={cn('relative h-1.5 w-1.5 rounded-full', fill)} />
    </span>
  );
}

/* ---------------------------------------------------------------------------
   Subject identity colours

   A subject keeps the same hue everywhere it appears — history rows, quick
   start tiles, results, credentials — so colour becomes a recognisable label
   rather than decoration.
   --------------------------------------------------------------------------- */

export type Accent = {
  key: string;
  text: string;
  dot: string;
  bg: string;
  line: string;
  hoverLine: string;
  /** Literal `group-hover:` variant — Tailwind cannot scan interpolated names. */
  groupHoverText: string;
  bar: string;
  glow: string;
};

const ACCENTS: Accent[] = [
  {
    key: 'emerald',
    text: 'text-emerald-300',
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10',
    line: 'border-emerald-500/25',
    hoverLine: 'hover:border-emerald-500/50',
    groupHoverText: 'group-hover:text-emerald-300',
    bar: 'bg-emerald-400',
    glow: 'bg-emerald-500/20',
  },
  {
    key: 'cyan',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400',
    bg: 'bg-cyan-500/10',
    line: 'border-cyan-500/25',
    hoverLine: 'hover:border-cyan-500/50',
    groupHoverText: 'group-hover:text-cyan-300',
    bar: 'bg-cyan-400',
    glow: 'bg-cyan-500/20',
  },
  {
    key: 'blue',
    text: 'text-blue-300',
    dot: 'bg-blue-400',
    bg: 'bg-blue-500/10',
    line: 'border-blue-500/25',
    hoverLine: 'hover:border-blue-500/50',
    groupHoverText: 'group-hover:text-blue-300',
    bar: 'bg-blue-400',
    glow: 'bg-blue-500/20',
  },
  {
    key: 'violet',
    text: 'text-violet-300',
    dot: 'bg-violet-400',
    bg: 'bg-violet-500/10',
    line: 'border-violet-500/25',
    hoverLine: 'hover:border-violet-500/50',
    groupHoverText: 'group-hover:text-violet-300',
    bar: 'bg-violet-400',
    glow: 'bg-violet-500/20',
  },
  {
    key: 'indigo',
    text: 'text-indigo-300',
    dot: 'bg-indigo-400',
    bg: 'bg-indigo-500/10',
    line: 'border-indigo-500/25',
    hoverLine: 'hover:border-indigo-500/50',
    groupHoverText: 'group-hover:text-indigo-300',
    bar: 'bg-indigo-400',
    glow: 'bg-indigo-500/20',
  },
  {
    key: 'amber',
    text: 'text-amber-300',
    dot: 'bg-amber-400',
    bg: 'bg-amber-500/10',
    line: 'border-amber-500/25',
    hoverLine: 'hover:border-amber-500/50',
    groupHoverText: 'group-hover:text-amber-300',
    bar: 'bg-amber-400',
    glow: 'bg-amber-500/20',
  },
  {
    key: 'teal',
    text: 'text-teal-300',
    dot: 'bg-teal-400',
    bg: 'bg-teal-500/10',
    line: 'border-teal-500/25',
    hoverLine: 'hover:border-teal-500/50',
    groupHoverText: 'group-hover:text-teal-300',
    bar: 'bg-teal-400',
    glow: 'bg-teal-500/20',
  },
  {
    key: 'rose',
    text: 'text-rose-300',
    dot: 'bg-rose-400',
    bg: 'bg-rose-500/10',
    line: 'border-rose-500/25',
    hoverLine: 'hover:border-rose-500/50',
    groupHoverText: 'group-hover:text-rose-300',
    bar: 'bg-rose-400',
    glow: 'bg-rose-500/20',
  },
];

const SUBJECT_KEYWORDS: { match: string; key: string }[] = [
  { match: 'biolog', key: 'emerald' },
  { match: 'chem', key: 'cyan' },
  { match: 'physic', key: 'blue' },
  { match: 'math', key: 'violet' },
  { match: 'algebra', key: 'violet' },
  { match: 'comput', key: 'indigo' },
  { match: 'data structure', key: 'indigo' },
  { match: 'algorithm', key: 'indigo' },
  { match: 'program', key: 'indigo' },
  { match: 'histor', key: 'amber' },
  { match: 'war', key: 'amber' },
  { match: 'geograph', key: 'teal' },
  { match: 'literat', key: 'rose' },
];

/** Stable hue for any subject — known topics are mapped, others hashed. */
export function subjectAccent(subject: string): Accent {
  const key = subject.toLowerCase();
  const keyword = SUBJECT_KEYWORDS.find((entry) => key.includes(entry.match));
  if (keyword) {
    return ACCENTS.find((a) => a.key === keyword.key) ?? ACCENTS[0];
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

/* --------------------------------------------------------------------------- */

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-8 w-full rounded-md border border-line bg-canvas px-2.5 text-[13px] text-fg',
        'transition-all duration-150 placeholder:text-fg-subtle',
        'hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full resize-none rounded-md border border-line bg-canvas px-2.5 py-2 text-[13px] leading-relaxed text-fg',
        'transition-all duration-150 placeholder:text-fg-subtle',
        'hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-8 w-full appearance-none rounded-md border border-line bg-canvas px-2.5 text-[13px] text-fg',
        'transition-all duration-150 hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn('inline-flex rounded-md border border-line bg-canvas p-0.5', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 rounded px-3 py-1 text-[13px] font-medium transition-all duration-150',
              selected
                ? 'bg-accent/15 text-accent-fg shadow-[inset_0_0_0_1px_var(--color-accent-line)]'
                : 'text-fg-muted hover:text-fg'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function OptionTile({
  selected,
  title,
  description,
  onClick,
  className,
}: {
  selected: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'rounded-md border px-3 py-2.5 text-left transition-all duration-150 active:scale-[0.99]',
        selected
          ? 'border-accent bg-accent/10 ring-2 ring-accent/20'
          : 'border-line bg-canvas hover:border-line-strong hover:bg-raised',
        className
      )}
    >
      <span
        className={cn(
          'block text-[13px] font-medium',
          selected ? 'text-accent-fg' : 'text-fg'
        )}
      >
        {title}
      </span>
      {description && (
        <span className="mt-0.5 block text-[12px] leading-snug text-fg-muted">
          {description}
        </span>
      )}
    </button>
  );
}

export function Progress({
  value,
  className,
  tone = 'accent',
  barClassName,
}: {
  value: number;
  className?: string;
  tone?: 'accent' | 'ok' | 'warn' | 'bad';
  barClassName?: string;
}) {
  const fill = { accent: 'bg-accent', ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad' }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-1 w-full overflow-hidden rounded-full bg-line', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          barClassName || fill
        )}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'animate-rise-in flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line px-6 py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-raised text-fg-subtle">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-[13px] font-medium text-fg">{title}</h3>
        {description && (
          <p className="mx-auto max-w-xs text-[12px] leading-relaxed text-fg-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function DataRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="shrink-0 text-[12px] text-fg-subtle">{label}</span>
      <span
        className={cn(
          'min-w-0 truncate text-right text-[12px] text-fg',
          mono && 'font-mono text-[11px]'
        )}
      >
        {value}
      </span>
    </div>
  );
}

/** Shimmering placeholder for content that is still loading. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded', className)} />;
}

/** Counts up to `value` on mount. Respects reduced-motion. */
export function CountUp({
  value,
  duration = 700,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const frame = useRef<number>(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || value === 0) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutQuart, matching the CSS motion curve
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return (
    <span data-numeric className={className}>
      {display}
    </span>
  );
}

export function Page({
  children,
  className,
  width = 'wide',
}: {
  children: React.ReactNode;
  className?: string;
  width?: 'wide' | 'narrow' | 'reading';
}) {
  const max = {
    wide: 'max-w-[1200px]',
    narrow: 'max-w-[880px]',
    reading: 'max-w-[680px]',
  }[width];
  return <div className={cn('mx-auto w-full px-6 py-8', max, className)}>{children}</div>;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        'animate-rise-in flex flex-wrap items-start justify-between gap-4 pb-6',
        className
      )}
    >
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-[-0.02em] text-fg">{title}</h1>
        {description && (
          <p className="text-[13px] leading-relaxed text-fg-muted">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

/** Score → letter grade + tone, shared by history, results and credentials. */
export function gradeFor(score: number): { letter: string; tone: Tone; text: string } {
  if (score >= 90) return { letter: 'A', tone: 'ok', text: TONE_TEXT.ok };
  if (score >= 80) return { letter: 'B', tone: 'ok', text: TONE_TEXT.ok };
  if (score >= 70) return { letter: 'C', tone: 'accent', text: TONE_TEXT.accent };
  if (score >= 50) return { letter: 'D', tone: 'warn', text: TONE_TEXT.warn };
  return { letter: 'F', tone: 'bad', text: TONE_TEXT.bad };
}

export function difficultyTone(difficulty: 'easy' | 'medium' | 'hard'): Tone {
  return difficulty === 'easy' ? 'ok' : difficulty === 'medium' ? 'warn' : 'bad';
}

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}

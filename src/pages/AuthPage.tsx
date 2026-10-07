import { useEffect, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { BrainCircuit, Wallet, X, Loader2, Check, ShieldCheck } from 'lucide-react';
import { Button, Input, Label } from '../components/ui';

const MOCK_ACCOUNTS = [
  { name: 'Skyler Vance', email: 'skyler.vance@gmail.com' },
  { name: 'Taylor Reese', email: 'taylor.reese@gmail.com' },
  { name: 'Morgan Weaver', email: 'morgan.weaver@gmail.com' },
];

export default function AuthPage() {
  const { login, loginWithGoogle, isGooglePopupOpen, setGooglePopup, connectMockWallet, wallet } =
    useQuizStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'choose' | 'loading' | 'success'>('choose');
  const [selected, setSelected] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    if (!isGooglePopupOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setGooglePopup(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isGooglePopupOpen, setGooglePopup]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Enter your email and password.');
    if (isSignUp && !name) return setError('Enter your name.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    login(email, isSignUp ? name : email.split('@')[0]);
  };

  const chooseAccount = (account: { name: string; email: string }) => {
    setSelected(account);
    setStep('loading');
    window.setTimeout(() => {
      setStep('success');
      window.setTimeout(() => {
        setGooglePopup(false);
        login(account.email, account.name);
        setStep('choose');
      }, 700);
    }, 1300);
  };

  const walletSignIn = () => {
    if (!wallet.connected) connectMockWallet('ethereum');
    const address = wallet.address || '0x9E52A43DF';
    login(`${address.toLowerCase()}@web3.local`, `Wallet ${address.slice(0, 8)}`);
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel */}
      <aside className="hidden w-1/2 flex-col justify-between border-r border-line p-12 lg:flex">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-[18px] w-[18px] text-accent" />
          <span className="text-[13px] font-semibold tracking-[-0.01em] text-fg">QuizAI</span>
        </div>

        <div className="animate-rise-in-lg max-w-md space-y-6">
          <h1 className="text-3xl font-semibold leading-[1.15] tracking-[-0.03em] text-fg">
            Turn any topic into a quiz, a flashcard deck, and a summary.
          </h1>
          <p className="text-[15px] leading-relaxed text-fg-muted">
            Type a subject and get questions with explanations, terms worth memorising, and a
            record of everything you have studied.
          </p>

          {/* Slow colour sweep — the one purely expressive moment in the app */}
          <div
            className="animate-sweep h-px w-full rounded-full"
            style={{
              backgroundImage:
                'linear-gradient(90deg, transparent, #6366f1, #22d3ee, #34d399, #f59e0b, transparent)',
            }}
          />

          <dl className="stagger grid grid-cols-2 gap-x-6 gap-y-5">
            {[
              ['Instant generation', 'Questions, explanations and glossary in one pass.', 'bg-indigo-400'],
              ['Spaced review', 'Flashcards track what you have mastered.', 'bg-emerald-400'],
              ['Session history', 'Every score and review kept for later.', 'bg-cyan-400'],
              ['Verifiable records', 'Simulated on-chain credentials for passing scores.', 'bg-amber-400'],
            ].map(([title, description, bar], index) => (
              <div key={title} style={{ ['--i' as string]: index }}>
                <span className={`mb-2 block h-0.5 w-5 rounded-full ${bar}`} />
                <dt className="text-[13px] font-medium text-fg">{title}</dt>
                <dd className="mt-0.5 text-[12px] leading-relaxed text-fg-muted">
                  {description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-[12px] text-fg-subtle">
          A demonstration project. Sign-in and blockchain features are simulated.
        </p>
      </aside>

      {/* Form */}
      <main className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            <BrainCircuit className="h-[18px] w-[18px] text-accent" />
            <span className="text-[13px] font-semibold text-fg">QuizAI</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-fg">
              {isSignUp ? 'Create an account' : 'Sign in'}
            </h2>
            <p className="text-[13px] text-fg-muted">
              {isSignUp
                ? 'Set up your study workspace.'
                : 'Continue to your study workspace.'}
            </p>
          </div>

          <div className="space-y-2">
            <Button variant="secondary" className="h-9 w-full" onClick={loginWithGoogle}>
              <GoogleMark />
              Continue with Google
            </Button>
            <Button variant="secondary" className="h-9 w-full" onClick={walletSignIn}>
              <Wallet className="h-3.5 w-3.5" />
              Continue with a wallet
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[12px] text-fg-subtle">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submit} className="space-y-3">
            {error && (
              <p className="rounded-md border border-bad-line bg-bad/10 px-3 py-2 text-[13px] text-bad">
                {error}
              </p>
            )}

            {isSignUp && (
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
            </div>

            <Button variant="primary" type="submit" className="h-9 w-full">
              {isSignUp ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-[13px] text-fg-muted">
            {isSignUp ? 'Already have an account?' : 'No account yet?'}{' '}
            <button
              onClick={() => setIsSignUp((v) => !v)}
              className="text-fg underline underline-offset-2 transition-colors hover:text-accent-fg"
            >
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </main>

      {/* Simulated account chooser */}
      {isGooglePopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="animate-fade-in absolute inset-0 bg-black/60"
            onClick={() => setGooglePopup(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Choose an account"
            className="animate-sheet-in relative z-10 w-full max-w-sm overflow-hidden rounded-lg border border-line-strong bg-overlay"
          >
            <div className="flex items-start justify-between border-b border-line px-4 py-3">
              <div>
                <p className="text-[13px] font-medium text-fg">Choose an account</p>
                <p className="text-[12px] text-fg-muted">
                  Simulated sign-in — no real credentials are used.
                </p>
              </div>
              <button
                onClick={() => setGooglePopup(false)}
                aria-label="Close"
                className="rounded p-1 text-fg-subtle transition-colors hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {step === 'choose' && (
              <ul className="divide-y divide-line">
                {MOCK_ACCOUNTS.map((account) => (
                  <li key={account.email}>
                    <button
                      onClick={() => chooseAccount(account)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-raised text-[11px] text-fg-muted">
                        {account.name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-fg">
                          {account.name}
                        </span>
                        <span className="block truncate text-[12px] text-fg-muted">
                          {account.email}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() =>
                      chooseAccount({ name: 'Guest Scholar', email: 'guest@quizai.local' })
                    }
                    className="w-full px-4 py-3 text-left text-[13px] text-fg-muted transition-colors hover:bg-raised hover:text-fg"
                  >
                    Use a different account
                  </button>
                </li>
              </ul>
            )}

            {step === 'loading' && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <p className="text-[13px] text-fg">
                  Signing in as {selected?.name ?? 'your account'}…
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Check className="h-5 w-5 text-ok" />
                <p className="text-[13px] text-fg">
                  Signed in as <strong className="font-medium">{selected?.name}</strong>
                </p>
              </div>
            )}

            <div className="flex items-start gap-2 border-t border-line px-4 py-3 text-[12px] leading-relaxed text-fg-subtle">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This is a local demo. Nothing is sent to Google and no password is collected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

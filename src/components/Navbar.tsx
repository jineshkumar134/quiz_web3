import { useEffect, useRef, useState } from 'react';
import { useQuizStore, type TabType } from '../store/quizStore';
import { 
  BrainCircuit, 
  Settings, 
  LogOut, 
  LayoutGrid, 
  Check, 
  Flame, 
  Wallet, 
  Coins, 
  ExternalLink, 
  ChevronDown,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../utils/cn';
import { shortenAddress, SUPPORTED_CHAINS, hasInjectedProvider } from '../services/web3';

/** Primary destinations. `matches` maps sub-routes onto their parent tab. */
const TABS: { label: string; tab: TabType; matches: TabType[] }[] = [
  { label: 'Overview', tab: 'dashboard', matches: ['dashboard'] },
  { label: 'Study', tab: 'setup', matches: ['setup', 'quiz', 'results'] },
  { label: 'Flashcards', tab: 'flashcards', matches: ['flashcards'] },
  { label: 'Credentials', tab: 'credentials', matches: ['credentials'] },
];

export default function Navbar() {
  const { 
    user, 
    logout, 
    activeTab, 
    navigateTo, 
    toggleSettingsModal,
    wallet,
    connectRealWallet,
    connectMockWallet,
    disconnectMockWallet
  } = useQuizStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setWalletDropdownOpen(false);
        setConnectModalOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (walletRef.current && !walletRef.current.contains(e.target as Node)) {
        setWalletDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  if (!user) return null;

  const initials = user.displayName
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleConnectReal = async () => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      await connectRealWallet();
      setConnectModalOpen(false);
    } catch (err: any) {
      setConnectError(err.message || 'Failed to connect MetaMask');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectMock = () => {
    connectMockWallet('sepolia');
    setConnectModalOpen(false);
  };

  const chainConfig = SUPPORTED_CHAINS[wallet.network] || SUPPORTED_CHAINS['sepolia'];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center justify-between gap-6 px-6">
        {/* Brand + primary tabs */}
        <div className="flex min-w-0 items-center gap-6">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex shrink-0 items-center gap-2 text-[13px] font-semibold tracking-[-0.01em] text-fg"
          >
            <BrainCircuit className="h-[18px] w-[18px] text-accent" />
            QuizAI
            <span className="hidden rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent sm:inline-block">
              Web3
            </span>
          </button>

          <nav className="hidden items-center gap-0.5 sm:flex">
            {TABS.map(({ label, tab, matches }) => {
              const active = matches.includes(activeTab);
              return (
                <button
                  key={label}
                  onClick={() => navigateTo(tab)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors',
                    active ? 'text-fg' : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {label}
                  {/* Underline slides in on the active tab */}
                  <span
                    className={cn(
                      'absolute inset-x-1.5 -bottom-[11px] h-0.5 origin-left rounded-full bg-accent transition-transform duration-200',
                      active ? 'scale-x-100' : 'scale-x-0'
                    )}
                  />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right side: Streak + Web3 Wallet + Account */}
        <div className="flex items-center gap-2.5">
          {/* Study streak */}
          <span
            className="hidden items-center gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[12px] text-amber-300 md:inline-flex"
            title="Consecutive days studied"
          >
            <Flame className="h-3 w-3" />
            <span data-numeric className="font-medium">
              {user.studyStreak}
            </span>
            streak
          </span>

          {/* Web3 Wallet Section */}
          <div className="relative" ref={walletRef}>
            {wallet.connected && wallet.address ? (
              <div className="flex items-center gap-1.5">
                {/* $QUIZ Balance Chip */}
                <div 
                  onClick={() => navigateTo('credentials')}
                  title="Your Learn-to-Earn $QUIZ token balance"
                  className="hidden sm:flex cursor-pointer items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20"
                >
                  <Coins className="h-3 w-3 text-cyan-400" />
                  <span>{wallet.quizTokenBalance || '50 QUIZ'}</span>
                </div>

                {/* Wallet Address Button */}
                <button
                  onClick={() => setWalletDropdownOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-md border border-line bg-raised px-2.5 py-1 text-[12px] font-medium text-fg transition-colors hover:border-line-strong hover:bg-overlay"
                >
                  <span 
                    className={cn(
                      'h-2 w-2 rounded-full',
                      wallet.isRealWallet ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    )} 
                  />
                  <span className="font-mono text-[11px]">
                    {shortenAddress(wallet.address)}
                  </span>
                  <ChevronDown className="h-3 w-3 text-fg-muted" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConnectModalOpen(true)}
                className="flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1 text-[12px] font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}

            {/* Wallet Dropdown when Connected */}
            {walletDropdownOpen && wallet.connected && (
              <div className="animate-rise-in absolute right-0 z-50 mt-1.5 w-64 overflow-hidden rounded-lg border border-line-strong bg-overlay shadow-xl shadow-black/40">
                <div className="border-b border-line px-3.5 py-2.5">
                  <div className="flex items-center justify-between text-[11px] text-fg-subtle">
                    <span>Network</span>
                    <span className="font-semibold text-accent capitalize">
                      {chainConfig.name}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-fg break-all">
                    {wallet.address}
                  </p>
                  <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-2 text-[12px]">
                    <span className="text-fg-muted">Balance:</span>
                    <span className="font-medium text-fg">{wallet.balance}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[12px]">
                    <span className="text-fg-muted">Earned:</span>
                    <span className="font-semibold text-cyan-400">{wallet.quizTokenBalance || '50 QUIZ'}</span>
                  </div>
                </div>

                <div className="p-1">
                  <MenuItem
                    icon={<ShieldCheck className="h-3.5 w-3.5 text-accent" />}
                    onClick={() => {
                      navigateTo('credentials');
                      setWalletDropdownOpen(false);
                    }}
                  >
                    View On-Chain Credentials
                  </MenuItem>
                  {chainConfig.explorerUrl && (
                    <a
                      href={`${chainConfig.explorerUrl}/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-[13px] text-fg-muted hover:bg-raised hover:text-fg transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-fg-subtle" />
                      View on Explorer
                    </a>
                  )}
                  <MenuItem
                    icon={<LogOut className="h-3.5 w-3.5" />}
                    tone="danger"
                    onClick={() => {
                      disconnectMockWallet();
                      setWalletDropdownOpen(false);
                    }}
                  >
                    Disconnect Wallet
                  </MenuItem>
                </div>
              </div>
            )}
          </div>

          {/* Account Profile Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium transition-all duration-150 hover:scale-105',
                menuOpen
                  ? 'border-accent bg-accent/15 text-accent-fg'
                  : 'border-line bg-raised text-fg-muted hover:border-accent-line hover:text-fg'
              )}
            >
              {initials || 'U'}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="animate-rise-in absolute right-0 z-50 mt-1.5 w-60 overflow-hidden rounded-lg border border-line-strong bg-overlay shadow-xl shadow-black/40"
              >
                <div className="border-b border-line px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium text-fg">
                    {user.displayName}
                  </p>
                  <p className="truncate text-[12px] text-fg-muted">{user.email}</p>
                </div>

                <div className="p-1">
                  <MenuItem
                    icon={<LayoutGrid className="h-3.5 w-3.5" />}
                    onClick={() => {
                      navigateTo('dashboard');
                      setMenuOpen(false);
                    }}
                  >
                    Overview
                  </MenuItem>
                  <MenuItem
                    icon={<Check className="h-3.5 w-3.5" />}
                    onClick={() => {
                      navigateTo('credentials');
                      setMenuOpen(false);
                    }}
                  >
                    Credentials & SBTs
                  </MenuItem>
                  <MenuItem
                    icon={<Settings className="h-3.5 w-3.5" />}
                    onClick={() => {
                      toggleSettingsModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    Settings
                  </MenuItem>
                  <div className="my-1 border-t border-line" />
                  <MenuItem
                    icon={<LogOut className="h-3.5 w-3.5" />}
                    tone="danger"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  >
                    Sign out
                  </MenuItem>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connect Wallet Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-line-strong bg-overlay p-6 shadow-2xl animate-rise-in">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" />
                <h3 className="text-[14px] font-semibold text-fg">Connect Web3 Wallet</h3>
              </div>
              <button
                onClick={() => setConnectModalOpen(false)}
                className="text-fg-muted hover:text-fg text-[18px] leading-none"
              >
                &times;
              </button>
            </div>

            <p className="mt-3 text-[12px] text-fg-muted">
              Connect your Ethereum wallet to mint verifiable on-chain Soulbound Certificates (ERC-5192) and earn $QUIZ tokens.
            </p>

            {connectError && (
              <div className="mt-3 rounded-md bg-bad/10 border border-bad/30 p-2.5 text-[12px] text-bad">
                {connectError}
              </div>
            )}

            <div className="mt-4 space-y-2.5">
              <button
                onClick={handleConnectReal}
                disabled={isConnecting}
                className="flex w-full items-center justify-between rounded-lg border border-line-strong bg-raised p-3 text-left transition-all hover:border-accent hover:bg-overlay disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                    🦊
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-fg">
                      MetaMask / Injected Wallet
                    </div>
                    <div className="text-[11px] text-fg-muted">
                      {hasInjectedProvider() ? 'Detected in browser' : 'Browser extension'}
                    </div>
                  </div>
                </div>
                {isConnecting ? (
                  <span className="text-[11px] text-accent animate-pulse">Connecting...</span>
                ) : (
                  <span className="text-[11px] font-medium text-accent">Connect →</span>
                )}
              </button>

              <button
                onClick={handleConnectMock}
                className="flex w-full items-center justify-between rounded-lg border border-line-strong bg-raised p-3 text-left transition-all hover:border-accent hover:bg-overlay"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-fg">
                      Simulated Testnet Wallet
                    </div>
                    <div className="text-[11px] text-fg-muted">
                      Instant testing without gas fees
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-fg-subtle">Demo →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  tone = 'default',
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-left text-[13px] transition-colors',
        tone === 'danger'
          ? 'text-bad hover:bg-bad/10'
          : 'text-fg-muted hover:bg-raised hover:text-fg'
      )}
    >
      <span className="text-fg-subtle">{icon}</span>
      {children}
    </button>
  );
}

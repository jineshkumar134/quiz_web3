import { useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { 
  Wallet, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Coins, 
  Sparkles,
  Lock,
  Download
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataRow,
  Dot,
  EmptyState,
  Label,
  Page,
  PageHeader,
  Select,
  formatDate,
  gradeFor,
  subjectAccent,
} from '../components/ui';
import { cn } from '../utils/cn';
import { SUPPORTED_CHAINS, generateCertificateSVG, hasInjectedProvider } from '../services/web3';

/**
 * Soulbound credentials & Web3 Learn-to-Earn showcase.
 * Displays on-chain ERC-5192 non-transferable certificates and $QUIZ rewards.
 */
export default function CredentialsPage() {
  const { 
    sbtList, 
    wallet, 
    connectRealWallet,
    connectMockWallet, 
    disconnectMockWallet, 
    switchNetwork 
  } = useQuizStore();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<string | null>(null);

  const currentChainConfig = SUPPORTED_CHAINS[wallet.network] || SUPPORTED_CHAINS['sepolia'];

  return (
    <Page>
      <PageHeader
        title="Verifiable Credentials & Web3"
        description="Permanent, non-transferable Soulbound Tokens (ERC-5192) issued on-chain to verify academic proficiency and earn $QUIZ rewards."
      />

      {/* Wallet Status Card */}
      <Card className="mb-6">
        <CardHeader
          title="Web3 Wallet & Assets"
          description={
            wallet.connected
              ? wallet.isRealWallet
                ? 'Connected to MetaMask / Browser Injected Wallet.'
                : 'Connected to simulated Web3 testnet environment.'
              : 'Connect your wallet to sign transactions, claim tokens, and view verifiable credentials.'
          }
          action={
            wallet.connected ? (
              <Button variant="ghost" onClick={disconnectMockWallet}>
                Disconnect
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => connectRealWallet().catch(() => connectMockWallet('sepolia'))}
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Connect MetaMask
                </Button>
                <Button variant="secondary" onClick={() => connectMockWallet('sepolia')}>
                  Demo Wallet
                </Button>
              </div>
            )
          }
        />
        {wallet.connected && (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label>Wallet Address</Label>
              <p className="flex items-center gap-1.5 truncate font-mono text-[12px] text-fg">
                <Dot tone={wallet.isRealWallet ? "ok" : "warn"} pulse />
                {wallet.address}
              </p>
              <span className="text-[10px] text-fg-subtle">
                {wallet.isRealWallet ? 'Live Web3 Wallet' : 'Simulated Sandbox'}
              </span>
            </div>
            
            <div className="space-y-1">
              <Label>Gas Balance</Label>
              <p data-numeric className="text-[13px] font-medium text-fg">
                {wallet.balance}
              </p>
              <span className="text-[10px] text-fg-subtle">Native currency</span>
            </div>

            <div className="space-y-1">
              <Label>Learn-to-Earn Rewards</Label>
              <div className="flex items-center gap-1 text-[13px] font-semibold text-cyan-400">
                <Coins className="h-3.5 w-3.5 text-cyan-400" />
                <span>{wallet.quizTokenBalance || '50.00 QUIZ'}</span>
              </div>
              <span className="text-[10px] text-fg-subtle">$QUIZ Utility Token</span>
            </div>

            <div className="space-y-1">
              <Label>Active Blockchain</Label>
              <Select
                value={wallet.network}
                onChange={(e) => switchNetwork(e.target.value)}
              >
                <option value="sepolia">Ethereum Sepolia</option>
                <option value="amoy">Polygon Amoy</option>
                <option value="baseSepolia">Base Sepolia</option>
                <option value="arbitrumSepolia">Arbitrum Sepolia</option>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Ledger */}
      <Card>
        <CardHeader
          title="Soulbound Credentials Ledger"
          description="EVM Smart Contract: 0x49AcC1527e0258B9fF8C62c64f7831f49Ec8B67B (ERC-5192)"
          action={
            <div className="flex items-center gap-2">
              <Badge tone="ok" className="hidden sm:inline-flex">
                <Lock className="h-2.5 w-2.5 mr-1" />
                Soulbound / Non-Transferable
              </Badge>
              <span data-numeric className="text-[12px] text-fg-muted">
                {sbtList.length} credentials
              </span>
            </div>
          }
        />

        {sbtList.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<ShieldCheck className="h-6 w-6" />}
              title="No credentials issued yet"
              description="Score 70% or higher on any quiz, then mint your verifiable on-chain credential."
            />
          </div>
        ) : (
          <ul className="stagger divide-y divide-line">
            {sbtList.map((sbt, index) => {
              const open = expanded === sbt.tokenId;
              const accent = subjectAccent(sbt.subject);

              // Use stored SVG data URI or generate one
              const svgDataUri = sbt.svgDataUri || `data:image/svg+xml;utf8,${encodeURIComponent(
                generateCertificateSVG({
                  subject: sbt.subject,
                  difficulty: sbt.difficulty,
                  score: sbt.score,
                  recipient: wallet.address || '0x0000000000000000000000000000000000000000',
                  tokenId: sbt.tokenId,
                  date: formatDate(sbt.mintedAt)
                })
              )}`;

              return (
                <li key={sbt.tokenId} style={{ ['--i' as string]: index }}>
                  <button
                    onClick={() => setExpanded(open ? null : sbt.tokenId)}
                    aria-expanded={open}
                    className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised"
                  >
                    <span
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-transform duration-200 group-hover:scale-105',
                        accent.bg,
                        accent.line,
                        accent.text
                      )}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="block truncate text-[13px] font-medium capitalize text-fg">
                          {sbt.subject} Certificate
                        </span>
                        <span className="hidden rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-400 sm:inline-block">
                          Verified
                        </span>
                      </div>
                      <span className="block text-[12px] text-fg-muted">
                        {sbt.network} · Issued {formatDate(sbt.mintedAt)}
                      </span>
                    </div>

                    <Badge tone="neutral" className="hidden font-mono sm:inline-flex">
                      {sbt.tokenId}
                    </Badge>

                    <span
                      data-numeric
                      className={cn('text-[13px] font-semibold', gradeFor(sbt.score).text)}
                    >
                      {sbt.score}%
                    </span>

                    {open ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-fg-subtle" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-fg-subtle" />
                    )}
                  </button>

                  {open && (
                    <div className="animate-rise-in border-t border-line bg-canvas/60 px-4 py-4">
                      {/* Dynamic SVG Visual Certificate Preview */}
                      <div className="mb-4 overflow-hidden rounded-lg border border-line-strong bg-black/40 p-2 shadow-inner">
                        <div className="relative mx-auto aspect-[8/5] max-w-xl overflow-hidden rounded-md">
                          <img 
                            src={svgDataUri} 
                            alt={`${sbt.subject} Certificate`} 
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-3.5 w-3.5 text-ok" />
                          <span className="text-[12px] font-medium text-ok">
                            EVM On-Chain Record (Locked SBT)
                          </span>
                        </div>
                        {currentChainConfig.explorerUrl && (
                          <a
                            href={`${currentChainConfig.explorerUrl}/tx/${sbt.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[12px] text-accent hover:underline"
                          >
                            <span>Etherscan Explorer</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>

                      <div className="divide-y divide-line rounded-lg border border-line bg-raised/40 px-3">
                        <DataRow label="Token ID" value={sbt.tokenId} mono />
                        <DataRow label="Transaction Hash" value={sbt.txHash} mono />
                        <DataRow label="Smart Contract" value={sbt.contractAddress} mono />
                        <DataRow label="Metadata URI" value={sbt.metadataUri} mono />
                        <DataRow label="Block Number" value={`#${sbt.blockNumber}`} mono />
                        <DataRow label="Gas Fee" value={sbt.gasPaid} />
                        <DataRow
                          label="Difficulty"
                          value={<span className="capitalize">{sbt.difficulty}</span>}
                        />
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Page>
  );
}

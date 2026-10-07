import { 
  createWalletClient, 
  createPublicClient, 
  custom, 
  http, 
  formatEther, 
  parseEther,
  type Address,
  type Chain
} from 'viem';
import { sepolia, polygonAmoy, baseSepolia, arbitrumSepolia } from 'viem/chains';

export interface ChainConfig {
  id: number;
  name: string;
  chain: Chain;
  currency: string;
  explorerUrl: string;
  contractAddress: string;
  tokenAddress: string;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  sepolia: {
    id: sepolia.id,
    name: 'Ethereum Sepolia',
    chain: sepolia,
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    contractAddress: '0x49AcC1527e0258B9fF8C62c64f7831f49Ec8B67B',
    tokenAddress: '0x811b714C83e390c23F1f50B739Ce228CeD36C81a',
  },
  amoy: {
    id: polygonAmoy.id,
    name: 'Polygon Amoy',
    chain: polygonAmoy,
    currency: 'MATIC',
    explorerUrl: 'https://amoy.polygonscan.com',
    contractAddress: '0x7E2234EfDda74E63994a69daeb433F98',
    tokenAddress: '0x51E2b43d328F27b5F148De75b637Ac619d0eE641',
  },
  baseSepolia: {
    id: baseSepolia.id,
    name: 'Base Sepolia',
    chain: baseSepolia,
    currency: 'ETH',
    explorerUrl: 'https://sepolia.basescan.org',
    contractAddress: '0x992482EfDda74E63994a69daeb433F11',
    tokenAddress: '0x334462EfDda74E63994a69daeb433F22',
  },
  arbitrumSepolia: {
    id: arbitrumSepolia.id,
    name: 'Arbitrum Sepolia',
    chain: arbitrumSepolia,
    currency: 'ETH',
    explorerUrl: 'https://sepolia.arbiscan.io',
    contractAddress: '0x8D1924EfDda74E63994a69daeb433F21',
    tokenAddress: '0x442211EfDda74E63994a69daeb433F99',
  },
};

export const DEFAULT_CHAIN_KEY = 'sepolia';

// Minimal ABI for Soulbound Certificate NFT
export const SOULBOUND_ABI = [
  {
    name: 'mintCertificate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'subject', type: 'string' },
      { name: 'difficulty', type: 'string' },
      { name: 'score', type: 'uint8' },
      { name: 'metadataUri', type: 'string' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'locked',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Minimal ABI for QuizToken ($QUIZ)
export const QUIZ_TOKEN_ABI = [
  {
    name: 'rewardQuizStudent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'student', type: 'address' },
      { name: 'score', type: 'uint8' },
    ],
    outputs: [],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

export function hasInjectedProvider(): boolean {
  return typeof window !== 'undefined' && Boolean((window as any).ethereum);
}

export function getEthereumProvider() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return (window as any).ethereum;
  }
  return null;
}

/**
 * Generate an on-chain SVG Certificate graphic
 */
export function generateCertificateSVG(params: {
  subject: string;
  difficulty: string;
  score: number;
  recipient: string;
  tokenId: string;
  date: string;
}): string {
  const { subject, difficulty, score, recipient, tokenId, date } = params;
  const shortAddr = recipient.length > 10 ? `${recipient.slice(0, 6)}...${recipient.slice(-4)}` : recipient;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090D16"/>
        <stop offset="50%" stop-color="#0E1626"/>
        <stop offset="100%" stop-color="#070A10"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B"/>
        <stop offset="50%" stop-color="#FBBF24"/>
        <stop offset="100%" stop-color="#F59E0B"/>
      </linearGradient>
      <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#06B6D4"/>
        <stop offset="100%" stop-color="#3B82F6"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>
    
    <!-- Outer Card & Border -->
    <rect x="10" y="10" width="780" height="480" rx="16" fill="url(#bgGrad)" stroke="#1E293B" stroke-width="2"/>
    <rect x="22" y="22" width="756" height="456" rx="12" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.6"/>

    <!-- Decorative Corner Accents -->
    <path d="M 30 50 L 50 30" stroke="#F59E0B" stroke-width="2"/>
    <path d="M 770 50 L 750 30" stroke="#F59E0B" stroke-width="2"/>
    <path d="M 30 450 L 50 470" stroke="#F59E0B" stroke-width="2"/>
    <path d="M 770 450 L 750 470" stroke="#F59E0B" stroke-width="2"/>

    <!-- Header Badge -->
    <text x="400" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#06B6D4" text-anchor="middle" letter-spacing="3">VERIFIABLE SOULBOUND CREDENTIAL • ERC-5192</text>
    <text x="400" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#F8FAFC" text-anchor="middle" letter-spacing="-0.5">QUIZFLOW ACADEMIC MASTERY</text>
    
    <!-- Divider -->
    <line x1="250" y1="125" x2="550" y2="125" stroke="url(#cyanGrad)" stroke-width="2"/>

    <!-- Body -->
    <text x="400" y="165" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">This certifies that holder of wallet address</text>
    <rect x="220" y="180" width="360" height="32" rx="6" fill="#1E293B" opacity="0.6"/>
    <text x="400" y="202" font-family="monospace" font-size="14" font-weight="600" fill="#38BDF8" text-anchor="middle">${shortAddr}</text>
    <text x="400" y="238" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">has successfully demonstrated proficiency in</text>

    <!-- Subject Banner -->
    <text x="400" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="26" font-weight="800" fill="url(#goldGrad)" text-anchor="middle">${subject.toUpperCase()}</text>

    <!-- Stats Matrix -->
    <rect x="140" y="315" width="520" height="60" rx="8" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    
    <text x="220" y="338" font-family="system-ui, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">SCORE</text>
    <text x="220" y="362" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#10B981" text-anchor="middle">${score}%</text>

    <text x="400" y="338" font-family="system-ui, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">DIFFICULTY</text>
    <text x="400" y="362" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="#F8FAFC" text-anchor="middle">${difficulty.toUpperCase()}</text>

    <text x="580" y="338" font-family="system-ui, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">STATUS</text>
    <text x="580" y="362" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#F59E0B" text-anchor="middle">LOCKED / SBT</text>

    <!-- Footer Details -->
    <text x="50" y="440" font-family="monospace" font-size="10" fill="#64748B">ID: ${tokenId}</text>
    <text x="50" y="456" font-family="monospace" font-size="10" fill="#64748B">ISSUED: ${date}</text>

    <text x="750" y="440" font-family="system-ui, sans-serif" font-size="10" fill="#64748B" text-anchor="end">NON-TRANSFERABLE TOKEN</text>
    <text x="750" y="456" font-family="monospace" font-size="10" fill="#38BDF8" text-anchor="end">SECURED BY EVM BLOCKCHAIN</text>
  </svg>`;
}

/**
 * Format wallet address for compact UI
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'mcq' | 'true-false' | 'short-answer';
  options?: string[];           // for MCQ
  correctAnswer: string;
  explanation: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  subject: string;
  mastered: boolean;
  lastReviewed?: string;
}

export interface FlashNote {
  subject: string;
  summary: string;           // 3-5 sentence overview
  keyPoints: string[];       // bullet points
  keyTerms: { term: string; meaning: string }[];
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizSession {
  id: string;
  userId: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  answers: QuizAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: string;
  createdAt: string;
  flashcards: Flashcard[];
  flashNote: FlashNote;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  subjectsTried: string[];
  totalQuizzes: number;
  averageScore: number;
  studyStreak: number;
  lastActiveDate?: string;
  createdAt: string;
}

export type QuizConfig = {
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: 5 | 10 | 20;
  questionType: 'mcq' | 'true-false' | 'short-answer' | 'mixed';
};

// Web3 Blockchain Study tech stack types
export interface SBTToken {
  tokenId: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  mintedAt: string;
  txHash: string;
  network: string;
  contractAddress: string;
  blockNumber: number;
  gasPaid: string;
  metadataUri: string;
  svgDataUri?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
  balance: string; // in native token (e.g. ETH, MATIC)
  quizTokenBalance?: string; // $QUIZ token balance
  isRealWallet?: boolean; // true if connected via real MetaMask/injected provider
  chainId?: number;
}

export interface BlockchainTx {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber: number;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  gasUsed: number;
  gasPrice: string;
  method: string;
}

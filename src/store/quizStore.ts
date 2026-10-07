import { create } from 'zustand';
import { QuizConfig, Flashcard, QuizSession, ChatMessage, UserProfile, SBTToken, WalletState, BlockchainTx } from '../types';
import { generateQuiz, sendChatMessage } from '../services/ai';
import { 
  SUPPORTED_CHAINS, 
  generateCertificateSVG, 
  getEthereumProvider, 
  hasInjectedProvider 
} from '../services/web3';
import { createWalletClient, createPublicClient, custom, formatEther, type Address } from 'viem';

// Initial values for guest/mock user
const DEFAULT_USER: UserProfile = {
  uid: 'user_guest',
  email: 'student@academy.edu',
  displayName: 'Alex Scholar',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  subjectsTried: ['Biology', 'History'],
  totalQuizzes: 4,
  averageScore: 85,
  studyStreak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
};

// Simulated SBT token preset for the student
const MOCK_SBT_LIST = (): SBTToken[] => [
  {
    tokenId: "SBT-0x1F982d",
    subject: "Biology",
    difficulty: "easy",
    score: 100,
    mintedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    txHash: "0x1c9d2e5a8b9c3a4d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
    network: "Arbitrum One",
    contractAddress: "0x8D1924EfDda74E63994a69daeb433F21",
    blockNumber: 18492051,
    gasPaid: "0.00021 ETH ($0.74)",
    metadataUri: "ipfs://QmXoypizjW3WknFiJQNwAQF7tZ2kuWyCa5CgEf2n"
  },
  {
    tokenId: "SBT-0x4A2e11",
    subject: "History",
    difficulty: "medium",
    score: 80,
    mintedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    txHash: "0x8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a",
    network: "Polygon PoS",
    contractAddress: "0x7E2234EfDda74E63994a69daeb433F98",
    blockNumber: 49502911,
    gasPaid: "0.052 MATIC ($0.04)",
    metadataUri: "ipfs://QmZqpizjW3WknFiJQNwAQF7tZ2kuWyCa5CgEf98"
  }
];

// Initial Quiz Sessions to populate history for realistic dashboard
const INITIAL_HISTORY = (): QuizSession[] => {
  return [
    {
      id: 'sess_mock_1',
      userId: 'user_guest',
      subject: 'Biology',
      difficulty: 'easy',
      questions: [],
      answers: [],
      score: 100,
      totalQuestions: 5,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      flashcards: [],
      flashNote: { subject: 'Biology', summary: '', keyPoints: [], keyTerms: [] }
    },
    {
      id: 'sess_mock_2',
      userId: 'user_guest',
      subject: 'History',
      difficulty: 'medium',
      questions: [],
      answers: [],
      score: 80,
      totalQuestions: 5,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      flashcards: [],
      flashNote: { subject: 'History', summary: '', keyPoints: [], keyTerms: [] }
    },
    {
      id: 'sess_mock_3',
      userId: 'user_guest',
      subject: 'Chemistry',
      difficulty: 'hard',
      questions: [],
      answers: [],
      score: 60,
      totalQuestions: 5,
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      flashcards: [],
      flashNote: { subject: 'Chemistry', summary: '', keyPoints: [], keyTerms: [] }
    }
  ];
};

export type TabType =
  | 'auth'
  | 'dashboard'
  | 'setup'
  | 'quiz'
  | 'results'
  | 'flashcards'
  | 'credentials';

interface AppState {
  // Navigation Route
  activeTab: TabType;
  navigateTo: (tab: TabType) => void;

  // Auth State
  user: UserProfile | null;
  isAuthLoading: boolean;
  isGooglePopupOpen: boolean;
  setGooglePopup: (isOpen: boolean) => void;
  login: (email: string, name: string) => void;
  loginWithGoogle: () => void;
  logout: () => void;

  // Settings State
  apiKey: string;
  useGemini: boolean;
  showSettingsModal: boolean;
  setSettings: (apiKey: string, useGemini: boolean) => void;
  toggleSettingsModal: (show?: boolean) => void;

  // Quiz State
  currentConfig: QuizConfig | null;
  currentSession: QuizSession | null;
  currentQuestionIndex: number;
  userAnswers: Record<string, string>; // questionId -> userAnswer
  isQuizLoading: boolean;
  quizHistory: QuizSession[];
  
  setConfig: (config: QuizConfig) => void;
  generateNewQuiz: () => Promise<void>;
  selectAnswer: (questionId: string, answer: string) => void;
  nextQuestion: () => void;
  submitQuizSession: () => void;
  resetQuiz: () => void;
  deleteHistoryItem: (id: string) => void;

  // Study Mode Flashcards State
  studyFlashcards: Flashcard[];
  toggleFlashcardMastery: (cardId: string) => void;
  shuffleFlashcards: () => void;
  resetFlashcardMastery: () => void;

  // Chatbot State
  chatMessages: ChatMessage[];
  isChatOpen: boolean;
  isChatTyping: boolean;
  chatContext: { subject?: string; currentQuestion?: string; currentQuestionId?: string };
  toggleChat: (isOpen?: boolean) => void;
  clearChat: () => void;
  sendChatMessage: (text: string) => Promise<void>;
  setChatContext: (context: { subject?: string; currentQuestion?: string; currentQuestionId?: string }) => void;

  // Web3 Tech Stack State (Soulbound Tokens, Explorer, Wallet)
  wallet: WalletState;
  sbtList: SBTToken[];
  txList: BlockchainTx[];
  connectRealWallet: () => Promise<void>;
  connectMockWallet: (network?: string) => void;
  disconnectMockWallet: () => void;
  switchNetwork: (network: string) => Promise<void>;
  claimQuizReward: () => Promise<string>;
  mintSBTForActiveQuiz: () => Promise<string>; // returns tx hash
}

export const useQuizStore = create<AppState>((set, get) => {
  // Load saved items on initialization
  const loadSavedUser = (): UserProfile | null => {
    const saved = localStorage.getItem('quiz_platform_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_USER; }
    }
    // No stored session: show the sign-in screen. (Returning DEFAULT_USER here
    // would auto-authenticate every first-time visitor and make AuthPage
    // unreachable except via an explicit sign-out.)
    return null;
  };

  const loadSavedHistory = (): QuizSession[] => {
    const saved = localStorage.getItem('quiz_platform_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_HISTORY(); }
    }
    const initial = INITIAL_HISTORY();
    localStorage.setItem('quiz_platform_history', JSON.stringify(initial));
    return initial;
  };

  const loadSavedSBTs = (): SBTToken[] => {
    const saved = localStorage.getItem('quiz_platform_sbts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return MOCK_SBT_LIST(); }
    }
    const initial = MOCK_SBT_LIST();
    localStorage.setItem('quiz_platform_sbts', JSON.stringify(initial));
    return initial;
  };

  const loadSavedWallet = (): WalletState => {
    const saved = localStorage.getItem('quiz_platform_wallet');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      connected: false,
      address: null,
      network: 'ethereum',
      balance: '0.00'
    };
  };

  const loadSavedTxs = (): BlockchainTx[] => {
    const saved = localStorage.getItem('quiz_platform_txs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return [];
  };

  const loadApiKey = () => localStorage.getItem('quiz_platform_apikey') || '';
  const loadUseGemini = () => localStorage.getItem('quiz_platform_use_gemini') === 'true';

  const initialUser = loadSavedUser();
  const initialHistory = loadSavedHistory();
  const initialSBTs = loadSavedSBTs();
  const initialWallet = loadSavedWallet();
  const initialTxs = loadSavedTxs();

  return {
    // Navigation
    activeTab: initialUser ? 'dashboard' : 'auth',
    navigateTo: (tab) => {
      set({ activeTab: tab });
      // Scroll restoration is handled centrally in App.tsx so that it also
      // covers the paths that set `activeTab` directly (quiz generation and
      // quiz submission), not just explicit navigation.

      // Sync chatbot context depending on tab
      const { currentSession, currentQuestionIndex } = get();
      if (tab === 'dashboard') {
        set({ chatContext: { subject: undefined, currentQuestion: undefined } });
      } else if (tab === 'quiz' && currentSession) {
        const activeQ = currentSession.questions[currentQuestionIndex];
        set({
          chatContext: {
            subject: currentSession.subject,
            currentQuestion: activeQ ? activeQ.question : undefined,
            currentQuestionId: activeQ ? activeQ.id : undefined
          }
        });
      } else if (tab === 'flashcards' && currentSession) {
        set({ chatContext: { subject: currentSession.subject, currentQuestion: 'Reviewing flashcards glossary' } });
      }
    },

    // Auth
    user: initialUser,
    isAuthLoading: false,
    isGooglePopupOpen: false,
    setGooglePopup: (isOpen) => set({ isGooglePopupOpen: isOpen }),
    login: (email, name) => {
      const newUser: UserProfile = {
        uid: `user_${Math.random().toString(36).slice(2, 9)}`,
        email: email || 'student@academy.edu',
        displayName: name || 'Ambitious Student',
        photoURL: `https://images.unsplash.com/photo-${['1534528741775-53994a69daeb', '1507003211169-0a1dd7228f2d', '1500648767791-00dcc994a43e', '1494790108377-be9c29b29330'][Math.floor(Math.random() * 4)]}?w=150&auto=format&fit=crop&q=80`,
        subjectsTried: [],
        totalQuizzes: 0,
        averageScore: 0,
        studyStreak: 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('quiz_platform_user', JSON.stringify(newUser));
      set({ user: newUser, activeTab: 'dashboard' });
    },
    loginWithGoogle: () => {
      set({ isGooglePopupOpen: true });
    },
    logout: () => {
      localStorage.removeItem('quiz_platform_user');
      set({ user: null, activeTab: 'auth' });
    },

    // Settings
    apiKey: loadApiKey(),
    useGemini: loadUseGemini(),
    showSettingsModal: false,
    setSettings: (apiKey, useGemini) => {
      localStorage.setItem('quiz_platform_apikey', apiKey);
      localStorage.setItem('quiz_platform_use_gemini', String(useGemini));
      set({ apiKey, useGemini });
    },
    toggleSettingsModal: (show) => {
      set((state) => ({ showSettingsModal: show !== undefined ? show : !state.showSettingsModal }));
    },

    // Quiz Config & Session
    currentConfig: null,
    currentSession: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    isQuizLoading: false,
    quizHistory: initialHistory,

    setConfig: (config) => set({ currentConfig: config }),
    
    generateNewQuiz: async () => {
      const { currentConfig, apiKey, useGemini, user } = get();
      if (!currentConfig) return;

      set({ isQuizLoading: true, userAnswers: {}, currentQuestionIndex: 0 });

      try {
        const session = await generateQuiz(currentConfig, apiKey, useGemini);
        
        // Associate user ID
        session.userId = user?.uid || 'user_guest';

        set({ 
          currentSession: session, 
          studyFlashcards: session.flashcards,
          isQuizLoading: false, 
          activeTab: 'quiz',
          chatContext: {
            subject: session.subject,
            currentQuestion: session.questions[0]?.question,
            currentQuestionId: session.questions[0]?.id
          }
        });

        // Add welcoming assistant prompt
        set({
          chatMessages: [
            {
              role: 'assistant',
              content: `Welcome to your quiz on "${session.subject}"! 🎓 I am here in the background to help. If any question seems tricky, click the "💬 Ask AI" button or type in the chat. I can explain terms, give you clues, or outline key concepts!`,
              timestamp: new Date().toISOString()
            }
          ]
        });
      } catch (error) {
        console.error("Failed generating quiz:", error);
        set({ isQuizLoading: false });
        throw error;
      }
    },

    selectAnswer: (questionId, answer) => {
      set((state) => ({
        userAnswers: { ...state.userAnswers, [questionId]: answer }
      }));
    },

    nextQuestion: () => {
      set((state) => {
        const nextIndex = state.currentQuestionIndex + 1;
        const session = state.currentSession;
        
        if (session && nextIndex < session.questions.length) {
          const nextQ = session.questions[nextIndex];
          return {
            currentQuestionIndex: nextIndex,
            chatContext: {
              subject: session.subject,
              currentQuestion: nextQ.question,
              currentQuestionId: nextQ.id
            }
          };
        }
        return {};
      });
    },

    submitQuizSession: () => {
      const { currentSession, userAnswers, user, quizHistory } = get();
      if (!currentSession) return;

      // Calculate score
      let correctCount = 0;
      const answersMapped = currentSession.questions.map((q) => {
        const userAnswer = userAnswers[q.id] || '';
        
        let isCorrect = false;
        const cleanUser = userAnswer.toLowerCase().trim();

        if (!cleanUser) {
          // Unanswered or timed out. Guarded explicitly because the substring
          // match below treats an empty string as contained in every answer,
          // which would otherwise score blanks as correct.
          isCorrect = false;
        } else if (q.type === 'short-answer') {
          const cleanCorrect = q.correctAnswer.toLowerCase().trim();
          isCorrect = cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser);
        } else {
          isCorrect = userAnswer === q.correctAnswer;
        }

        if (isCorrect) correctCount++;

        return {
          questionId: q.id,
          userAnswer,
          isCorrect
        };
      });

      const scorePercent = Math.round((correctCount / currentSession.questions.length) * 100);
      
      const completedSession: QuizSession = {
        ...currentSession,
        answers: answersMapped,
        score: scorePercent,
        completedAt: new Date().toISOString()
      };

      // Save to history
      const updatedHistory = [completedSession, ...quizHistory];
      localStorage.setItem('quiz_platform_history', JSON.stringify(updatedHistory));

      // Recalculate user stats & streak
      if (user) {
        const todayStr = new Date().toISOString().split('T')[0];
        let newStreak = user.studyStreak;
        
        if (user.lastActiveDate) {
          const lastActive = new Date(user.lastActiveDate);
          const today = new Date(todayStr);
          const diffTime = Math.abs(today.getTime() - lastActive.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const subjects = new Set([...user.subjectsTried, completedSession.subject]);
        const newTotal = user.totalQuizzes + 1;
        const newAvg = Math.round(((user.averageScore * user.totalQuizzes) + scorePercent) / newTotal);

        const updatedUser: UserProfile = {
          ...user,
          totalQuizzes: newTotal,
          averageScore: newAvg,
          subjectsTried: Array.from(subjects),
          studyStreak: newStreak,
          lastActiveDate: todayStr
        };

        localStorage.setItem('quiz_platform_user', JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }

      set({
        currentSession: completedSession,
        quizHistory: updatedHistory,
        activeTab: 'results',
        chatContext: {
          subject: completedSession.subject,
          currentQuestion: 'Reviewing quiz results summary.'
        }
      });
    },

    resetQuiz: () => {
      set({
        currentSession: null,
        currentConfig: null,
        currentQuestionIndex: 0,
        userAnswers: {},
        activeTab: 'setup'
      });
    },

    deleteHistoryItem: (id) => {
      const { quizHistory } = get();
      const updated = quizHistory.filter(h => h.id !== id);
      localStorage.setItem('quiz_platform_history', JSON.stringify(updated));
      set({ quizHistory: updated });
    },

    // Flashcards
    studyFlashcards: [],
    toggleFlashcardMastery: (cardId) => {
      set((state) => {
        const updated = state.studyFlashcards.map((c) => {
          if (c.id === cardId) {
            return { ...c, mastered: !c.mastered, lastReviewed: new Date().toISOString() };
          }
          return c;
        });
        const sessionUpdated = state.currentSession ? {
          ...state.currentSession,
          flashcards: updated
        } : null;
        
        return {
          studyFlashcards: updated,
          currentSession: sessionUpdated
        };
      });
    },

    shuffleFlashcards: () => {
      set((state) => {
        const shuffled = [...state.studyFlashcards].sort(() => Math.random() - 0.5);
        return { studyFlashcards: shuffled };
      });
    },

    resetFlashcardMastery: () => {
      set((state) => {
        const resetCards = state.studyFlashcards.map((c) => ({ ...c, mastered: false }));
        return { studyFlashcards: resetCards };
      });
    },

    // Chatbot
    chatMessages: [
      {
        role: 'assistant',
        content: "Hi there! I'm your QuizAI Coach. 🧠 Type a message to chat, ask me to explain a subject, or ask for a hint on your active questions!",
        timestamp: new Date().toISOString()
      }
    ],
    isChatOpen: false,
    isChatTyping: false,
    chatContext: {},
    
    toggleChat: (isOpen) => {
      set((state) => ({ isChatOpen: isOpen !== undefined ? isOpen : !state.isChatOpen }));
    },
    
    clearChat: () => {
      set({
        chatMessages: [
          {
            role: 'assistant',
            content: "Conversation history cleared! How can I help you learn today? 📚",
            timestamp: new Date().toISOString()
          }
        ]
      });
    },

    setChatContext: (context) => {
      set((state) => ({ chatContext: { ...state.chatContext, ...context } }));
    },

    sendChatMessage: async (text) => {
      if (!text.trim()) return;
      
      const { chatMessages, chatContext, apiKey, useGemini } = get();
      
      const userMsg: ChatMessage = {
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      };
      
      set({
        chatMessages: [...chatMessages, userMsg],
        isChatTyping: true
      });

      try {
        const result = await sendChatMessage(text, chatMessages, chatContext, apiKey, useGemini);
        set({
          chatMessages: result.updatedHistory,
          isChatTyping: false
        });
      } catch (error) {
        console.error("Chat failed:", error);
        set({
          chatMessages: [
            ...chatMessages,
            userMsg,
            {
              role: 'assistant',
              content: "Sorry, I hit a glitch while thinking. Let's try that again!",
              timestamp: new Date().toISOString()
            }
          ],
          isChatTyping: false
        });
      }
    },

    // Web3 Blockchain Technology Stack Implementation
    wallet: initialWallet,
    sbtList: initialSBTs,
    txList: initialTxs,

    connectRealWallet: async () => {
      const provider = getEthereumProvider();
      if (!provider) {
        throw new Error("No Web3 wallet detected. Please install MetaMask, Coinbase Wallet, or use the simulated wallet.");
      }

      try {
        const walletClient = createWalletClient({
          transport: custom(provider)
        });

        const [address] = await walletClient.requestAddresses();
        const chainIdHex = await provider.request({ method: 'eth_chainId' });
        const numericChainId = parseInt(chainIdHex, 16);

        const matchingKey = Object.keys(SUPPORTED_CHAINS).find(
          k => SUPPORTED_CHAINS[k].id === numericChainId
        ) || 'sepolia';
        const chainConfig = SUPPORTED_CHAINS[matchingKey];

        let formattedBal = '0.00';
        try {
          const publicClient = createPublicClient({
            chain: chainConfig.chain,
            transport: custom(provider)
          });
          const bal = await publicClient.getBalance({ address: address as Address });
          formattedBal = parseFloat(formatEther(bal)).toFixed(4);
        } catch {
          formattedBal = '0.25';
        }

        const savedTokens = localStorage.getItem(`quiz_tokens_${address}`) || '50.00';

        const updatedWallet: WalletState = {
          connected: true,
          address,
          network: matchingKey,
          balance: `${formattedBal} ${chainConfig.currency}`,
          quizTokenBalance: `${savedTokens} QUIZ`,
          isRealWallet: true,
          chainId: numericChainId
        };

        localStorage.setItem('quiz_platform_wallet', JSON.stringify(updatedWallet));
        set({ wallet: updatedWallet });

        // Event listeners
        if (provider.on) {
          provider.on('accountsChanged', (accounts: string[]) => {
            if (!accounts || accounts.length === 0) {
              get().disconnectMockWallet();
            } else {
              get().connectRealWallet().catch(() => {});
            }
          });
          provider.on('chainChanged', () => {
            get().connectRealWallet().catch(() => {});
          });
        }
      } catch (err: any) {
        console.error("Wallet connection failed:", err);
        throw new Error(err.message || "Failed to connect Web3 wallet");
      }
    },

    connectMockWallet: (targetNetwork) => {
      const network = targetNetwork || 'sepolia';
      const config = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS['sepolia'];

      const networkToken = {
        sepolia: { token: 'ETH', bal: '1.45' },
        amoy: { token: 'MATIC', bal: '245.80' },
        baseSepolia: { token: 'ETH', bal: '0.85' },
        arbitrumSepolia: { token: 'ETH', bal: '0.74' },
      }[network] || { token: config.currency, bal: '1.20' };

      const updatedWallet: WalletState = {
        connected: true,
        address: `0x71C${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`.toUpperCase(),
        network,
        balance: `${networkToken.bal} ${networkToken.token}`,
        quizTokenBalance: '50.00 QUIZ',
        isRealWallet: false,
        chainId: config.id
      };

      localStorage.setItem('quiz_platform_wallet', JSON.stringify(updatedWallet));
      set({ wallet: updatedWallet });
    },

    disconnectMockWallet: () => {
      const reset: WalletState = {
        connected: false,
        address: null,
        network: 'sepolia',
        balance: '0.00 ETH',
        quizTokenBalance: '0.00 QUIZ',
        isRealWallet: false
      };
      localStorage.setItem('quiz_platform_wallet', JSON.stringify(reset));
      set({ wallet: reset });
    },

    switchNetwork: async (network) => {
      const { wallet } = get();
      if (!wallet.connected) return;

      const config = SUPPORTED_CHAINS[network] || SUPPORTED_CHAINS['sepolia'];

      if (wallet.isRealWallet && hasInjectedProvider()) {
        const provider = getEthereumProvider();
        if (provider) {
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${config.id.toString(16)}` }],
            });
          } catch (switchError: any) {
            console.warn("Could not switch chain on wallet:", switchError);
          }
        }
      }

      const updated: WalletState = {
        ...wallet,
        network,
        balance: wallet.isRealWallet ? wallet.balance : `1.20 ${config.currency}`,
        chainId: config.id
      };
      localStorage.setItem('quiz_platform_wallet', JSON.stringify(updated));
      set({ wallet: updated });
    },

    claimQuizReward: async () => {
      const { currentSession, wallet, txList } = get();
      if (!currentSession) throw new Error("No active session to claim rewards for");
      if (!wallet.connected || !wallet.address) throw new Error("Wallet not connected");

      const rewardAmount = currentSession.score === 100 ? 50 : currentSession.score >= 90 ? 25 : 10;
      const currentVal = parseFloat(wallet.quizTokenBalance?.replace(/[^\d.]/g, '') || '0');
      const newVal = (currentVal + rewardAmount).toFixed(2);
      const newBalString = `${newVal} QUIZ`;

      const updatedWallet: WalletState = {
        ...wallet,
        quizTokenBalance: newBalString
      };

      const chainConfig = SUPPORTED_CHAINS[wallet.network] || SUPPORTED_CHAINS['sepolia'];
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const newTx: BlockchainTx = {
        hash: txHash,
        status: 'confirmed',
        blockNumber: Math.floor(Math.random() * 500000) + 6500000,
        timestamp: new Date().toISOString(),
        from: chainConfig.tokenAddress,
        to: wallet.address,
        value: `${rewardAmount} $QUIZ`,
        gasUsed: 45000,
        gasPrice: '1.2 Gwei',
        method: 'rewardQuizStudent(address,uint8)'
      };

      localStorage.setItem(`quiz_tokens_${wallet.address}`, newVal);
      localStorage.setItem('quiz_platform_wallet', JSON.stringify(updatedWallet));
      localStorage.setItem('quiz_platform_txs', JSON.stringify([newTx, ...txList]));

      set({
        wallet: updatedWallet,
        txList: [newTx, ...txList]
      });

      return txHash;
    },

    mintSBTForActiveQuiz: async () => {
      const { currentSession, wallet, sbtList, txList } = get();
      if (!currentSession) throw new Error("No active session to mint for");
      if (!wallet.connected || !wallet.address) throw new Error("Wallet not connected");

      // If real wallet, request user signature for verification
      if (wallet.isRealWallet && hasInjectedProvider()) {
        const provider = getEthereumProvider();
        if (provider) {
          try {
            const message = `QuizFlow Soulbound Credential Authorization\nStudent: ${wallet.address}\nTopic: ${currentSession.subject}\nScore: ${currentSession.score}%\nDate: ${new Date().toISOString()}`;
            await provider.request({
              method: 'personal_sign',
              params: [message, wallet.address],
            });
          } catch (err: any) {
            console.warn("Signature skipped or rejected, proceeding with simulated confirmation:", err);
          }
        }
      } else {
        // Simulated network broadcast delay
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const tokenId = `SBT-0x${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
      const txHash = `0x${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      const blockNumber = Math.floor(Math.random() * 500000) + 18000000;
      
      const chainConfig = SUPPORTED_CHAINS[wallet.network] || SUPPORTED_CHAINS['sepolia'];

      // Generate dynamic SVG for on-chain credential
      const svgContent = generateCertificateSVG({
        subject: currentSession.subject,
        difficulty: currentSession.difficulty,
        score: currentSession.score,
        recipient: wallet.address,
        tokenId,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      });
      const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;

      // Create new Soulbound token
      const newToken: SBTToken = {
        tokenId,
        subject: currentSession.subject,
        difficulty: currentSession.difficulty,
        score: currentSession.score,
        mintedAt: new Date().toISOString(),
        txHash,
        network: chainConfig.name,
        contractAddress: chainConfig.contractAddress,
        blockNumber,
        gasPaid: `0.00018 ${chainConfig.currency} ($0.45)`,
        metadataUri: `ipfs://Qm${Math.random().toString(36).slice(2, 15)}KQNwAQF7tZ2kuWyCa5CgEf`,
        svgDataUri
      };

      // Create corresponding block explorer transaction log
      const newTx: BlockchainTx = {
        hash: txHash,
        status: 'confirmed',
        blockNumber,
        timestamp: new Date().toISOString(),
        from: wallet.address,
        to: chainConfig.contractAddress,
        value: `0.00 ${chainConfig.currency} (SBT Mint)`,
        gasUsed: 132045,
        gasPrice: '2.4 Gwei',
        method: 'mintCertificate(address,string,string,uint8,string)'
      };

      const updatedSBTs = [newToken, ...sbtList];
      const updatedTxs = [newTx, ...txList];

      localStorage.setItem('quiz_platform_sbts', JSON.stringify(updatedSBTs));
      localStorage.setItem('quiz_platform_txs', JSON.stringify(updatedTxs));

      set({
        sbtList: updatedSBTs,
        txList: updatedTxs
      });

      return txHash;
    }
  };
});

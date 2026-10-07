import { useEffect } from 'react';
import { useQuizStore } from './store/quizStore';
import Navbar from './components/Navbar';
import SettingsModal from './components/SettingsModal';
import ChatBot from './components/ChatBot/ChatBot';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import QuizSetupPage from './pages/QuizSetupPage';
import QuizFlowPage from './pages/QuizFlowPage';
import ResultsPage from './pages/ResultsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import CredentialsPage from './pages/CredentialsPage';

export default function App() {
  const activeTab = useQuizStore((s) => s.activeTab);
  const user = useQuizStore((s) => s.user);

  // Every route change starts at the top of the new view. This lives here
  // rather than in navigateTo so it also covers transitions triggered by
  // quiz generation and submission, which set activeTab directly.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'setup':
        return <QuizSetupPage />;
      case 'quiz':
        return <QuizFlowPage />;
      case 'results':
        return <ResultsPage />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'credentials':
        return <CredentialsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-fg">
      <Navbar />

      <main key={activeTab} className="flex-1 animate-fade-in">
        {renderPage()}
      </main>

      <footer className="border-t border-line px-6 py-4">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 text-[12px] text-fg-subtle">
          <span>QuizAI — built by Himanshu Jaiswal</span>
          <span>Quiz generation runs locally or on Google Gemini</span>
        </div>
      </footer>

      <ChatBot />
      <SettingsModal />
    </div>
  );
}

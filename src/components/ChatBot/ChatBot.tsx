import React, { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '../../store/quizStore';
import { MessageSquare, X, ArrowUp, Eraser } from 'lucide-react';
import { Label } from '../ui';
import { cn } from '../../utils/cn';

export default function ChatBot() {
  const {
    user,
    chatMessages,
    isChatOpen,
    isChatTyping,
    chatContext,
    toggleChat,
    clearChat,
    sendChatMessage,
  } = useQuizStore();

  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isChatOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatOpen, isChatTyping]);

  useEffect(() => {
    if (!isChatOpen) return;
    const timeout = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && toggleChat(false);
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('keydown', onKey);
    };
  }, [isChatOpen, toggleChat]);

  if (!user) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isChatTyping) return;
    setInput('');
    await sendChatMessage(text);
  };

  const suggestions = (() => {
    const list: string[] = [];
    if (chatContext.currentQuestion) {
      list.push('Give me a hint');
      list.push('Explain the underlying concept');
    }
    if (chatContext.subject) {
      list.push(`Summarise ${chatContext.subject} simply`);
    } else {
      list.push('How do I start a new quiz?');
      list.push('Give me a study tip');
    }
    return list.slice(0, 3);
  })();

  return (
    <>
      {isChatOpen && (
        <div
          role="dialog"
          aria-label="Study coach"
          className="animate-sheet-in fixed bottom-20 right-4 z-50 flex h-[440px] w-[calc(100vw-2rem)] max-w-[360px] flex-col overflow-hidden rounded-lg border border-line-strong bg-overlay shadow-2xl shadow-black/50 sm:right-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-fg">Study coach</p>
              <p className="truncate text-[12px] text-fg-muted">
                {chatContext.subject ? chatContext.subject : 'Ask about any topic'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="rounded p-1.5 text-fg-subtle transition-colors hover:text-fg"
              >
                <Eraser className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleChat(false)}
                aria-label="Close"
                className="rounded p-1.5 text-fg-subtle transition-colors hover:text-fg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {chatMessages.map((message, index) => {
              const isAssistant = message.role === 'assistant';
              return (
                <div
                  key={index}
                  className={cn('flex', isAssistant ? 'justify-start' : 'justify-end')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed',
                      isAssistant
                        ? 'border border-line bg-surface text-fg'
                        : 'bg-accent text-white'
                    )}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              );
            })}

            {isChatTyping && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-lg border border-line bg-surface px-3 py-2.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-pulse rounded-full bg-fg-subtle"
                      style={{ animationDelay: `${i * 140}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-line p-2.5">
            {chatMessages.length <= 2 && suggestions.length > 0 && (
              <div className="mb-2 space-y-1">
                <Label className="px-0.5">Suggestions</Label>
                <div className="flex flex-wrap gap-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => !isChatTyping && sendChatMessage(suggestion)}
                      className="rounded border border-line bg-surface px-2 py-1 text-[12px] text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={submit} className="flex items-center gap-1.5">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isChatTyping}
                placeholder={isChatTyping ? 'Thinking…' : 'Ask a question'}
                className="h-8 min-w-0 flex-1 rounded-md border border-line bg-canvas px-2.5 text-[13px] text-fg transition-colors placeholder:text-fg-subtle hover:border-line-strong focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isChatTyping}
                aria-label="Send"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-white transition-colors hover:bg-accent-hover disabled:bg-raised disabled:text-fg-subtle"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Launcher */}
      <button
        onClick={() => toggleChat()}
        aria-label={isChatOpen ? 'Close study coach' : 'Open study coach'}
        className={cn(
          'fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border transition-colors sm:right-6',
          isChatOpen
            ? 'border-line-strong bg-overlay text-fg'
            : 'border-accent bg-accent text-white hover:bg-accent-hover'
        )}
      >
        {isChatOpen ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
      </button>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useQuizStore } from '../store/quizStore';
import { X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { Button, Input, Label, OptionTile } from './ui';

export default function SettingsModal() {
  const { showSettingsModal, toggleSettingsModal, apiKey, useGemini, setSettings } =
    useQuizStore();

  const [keyInput, setKeyInput] = useState(apiKey);
  const [gemini, setGemini] = useState(useGemini);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Re-sync whenever the dialog reopens so it never shows stale values.
  useEffect(() => {
    if (showSettingsModal) {
      setKeyInput(apiKey);
      setGemini(useGemini);
      setSaved(false);
    }
  }, [showSettingsModal, apiKey, useGemini]);

  // Escape to dismiss, and lock background scroll while open.
  useEffect(() => {
    if (!showSettingsModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleSettingsModal(false);
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [showSettingsModal, toggleSettingsModal]);

  if (!showSettingsModal) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(keyInput, gemini);
    setSaved(true);
    window.setTimeout(() => toggleSettingsModal(false), 550);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-fade-in absolute inset-0 bg-black/60"
        onClick={() => toggleSettingsModal(false)}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
        className="animate-sheet-in relative z-10 w-full max-w-md overflow-hidden rounded-lg border border-line-strong bg-overlay shadow-2xl shadow-black/50 focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="settings-title" className="text-[13px] font-medium text-fg">
            Settings
          </h2>
          <button
            onClick={() => toggleSettingsModal(false)}
            aria-label="Close settings"
            className="rounded p-1 text-fg-subtle transition-colors hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-5 p-4">
          <div className="space-y-2">
            <Label>Question engine</Label>
            <div role="radiogroup" className="grid grid-cols-2 gap-2">
              <OptionTile
                selected={!gemini}
                title="Local engine"
                description="Built-in generator. Works offline, no key needed."
                onClick={() => setGemini(false)}
              />
              <OptionTile
                selected={gemini}
                title="Google Gemini"
                description="Live generation. Requires an API key."
                onClick={() => setGemini(true)}
              />
            </div>
          </div>

          {gemini && (
            <div className="animate-rise-in space-y-2">
              <div className="flex items-center justify-between">
                <Label>API key</Label>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[12px] text-fg-muted transition-colors hover:text-fg"
                >
                  Get a key
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIza…"
                  autoComplete="off"
                  spellCheck={false}
                  required
                  className="pr-9 font-mono text-[12px]"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((s) => !s)}
                  aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-fg-subtle transition-colors hover:text-fg"
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>

              <p className="text-[12px] leading-relaxed text-fg-muted">
                Stored in this browser only. If the request is blocked, the app falls back
                to the local engine automatically.
              </p>
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
          <Button variant="ghost" onClick={() => toggleSettingsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={gemini && !keyInput.trim()}>
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}

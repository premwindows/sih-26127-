import { useState } from 'react';
import { Send, Sparkles, RotateCcw, Plus, X } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'Search MH12AB1234', cmd: 'Search MH12AB1234' },
  { label: 'Show Camera Footage', cmd: 'Show camera footage' },
  { label: "Yesterday's Route", cmd: "Show yesterday's route" },
  { label: 'Compare with DL3CAQ5678', cmd: 'Compare with DL3CAQ5678' },
  { label: 'Watch Feeds Together', cmd: 'Show all cameras' },
  { label: 'Reset Workspace', cmd: 'Reset Dashboard', icon: RotateCcw }
];

export default function CommandBar({ onCommand, isProcessing }) {
  const [inputValue, setInputValue] = useState('');
  const [showChips, setShowChips] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputValue.trim()) {
      onCommand(inputValue);
      setInputValue('');
    }
  };

  const handleSuggestionClick = (cmd) => {
    onCommand(cmd);
    setShowChips(false);
  };

  return (
    <div className="command-bar-container">
      {/* Chips Popover — shown above when + is clicked */}
      {showChips && (
        <div className="chips-popover">
          {SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                className={`chip ${item.icon ? 'chip-reset' : ''}`}
                onClick={() => handleSuggestionClick(item.cmd)}
                disabled={isProcessing}
              >
                {Icon
                  ? <Icon size={11} className="chip-icon" />
                  : <Sparkles size={10} className="chip-icon text-accent" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Single-row Input Form */}
      <form onSubmit={handleSubmit} className="command-input-form">

        {/* + / X toggle button */}
        <button
          type="button"
          className={`plus-btn ${showChips ? 'plus-btn-active' : ''}`}
          onClick={() => setShowChips(v => !v)}
          title="Quick commands"
          disabled={isProcessing}
        >
          {showChips ? <X size={15} /> : <Plus size={15} />}
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask Central AI…"
          disabled={isProcessing}
          className="command-text-input"
        />

        <button
          type="submit"
          disabled={isProcessing || !inputValue.trim()}
          className="submit-btn"
        >
          {isProcessing
            ? <div className="spinner" />
            : <Send size={14} />}
        </button>
      </form>
    </div>
  );
}

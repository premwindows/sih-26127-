import { useState } from 'react';
import { ShieldAlert, Sparkles } from 'lucide-react';
import CommandBar from './components/CommandBar';
import WorkspaceGrid from './components/WorkspaceGrid';
import { initialContext, parseCommand, generateLayout } from './services/centralAI';
import './App.css';

function App() {
  const [context, setContext] = useState(initialContext);
  const [layoutJSON, setLayoutJSON] = useState(() => generateLayout('dashboard', initialContext));
  const [isProcessing, setIsProcessing] = useState(false);

  const executeCommandText = (commandText) => {
    setIsProcessing(true);

    // Simulate AI parsing / backend roundtrip delay for interactive "thinking" feel
    setTimeout(() => {
      const { intent, context: nextContext } = parseCommand(commandText, context);
      const nextLayout = generateLayout(intent, nextContext);

      setContext(nextContext);
      setLayoutJSON(nextLayout);
      setIsProcessing(false);
    }, 600);
  };

  // Handles interactive callbacks inside workspace components (e.g. clicking a camera node on map zooms into footage)
  const handleComponentInteraction = (compId, action, payload) => {
    if (action === 'show_footage') {
      executeCommandText(`show camera footage for ${payload.plate}`);
    } else if (action === 'show_route') {
      executeCommandText(`show yesterday's route for ${payload.plate}`);
    } else if (action === 'promote_camera' || action === 'zoom_camera' || action === 'inspect_log') {
      const camId = payload.cameraId || payload.eventId?.split('-')[0] || 'CAM01';
      executeCommandText(`show camera footage for ${camId}`);
    }
  };

  return (
    <div className="app-container">
      {/* Outer Shell Header */}
      <header className="app-header">
        <div className="logo-section">
          <ShieldAlert size={20} className="logo-icon" />
          <span className="logo-text">SIH-26127 Dynamic Intelligence Shell</span>
        </div>
        <div className="header-status">
          <span className="pulse-dot"></span>
          <span>SYSTEM STAT: ACTIVE</span>
        </div>
      </header>

      {/* Main Grid Viewport */}
      <main className="workspace-canvas scrollbar-custom">
        {layoutJSON.intent === 'dashboard' && !context.activeEntity && (
          <div className="welcome-splash-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'inline-block', backgroundColor: 'var(--accent-glow)', padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--accent-border)', marginBottom: '8px' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px', color: 'var(--accent)' }} />
              <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Central AI Workspace</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>City-Wide ANPR Traffic Analytics Dashboard</h1>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Use the bottom command bar to target a flagged plate or watch synchronous camera feeds.</p>
          </div>
        )}

        <WorkspaceGrid
          components={layoutJSON.components}
          onComponentInteraction={handleComponentInteraction}
        />
      </main>

      {/* Persistent Bottom Chat Command Bar */}
      <CommandBar
        onCommand={executeCommandText}
        isProcessing={isProcessing}
      />
    </div>
  );
}

export default App;

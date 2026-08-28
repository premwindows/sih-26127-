import { useState, useEffect, useRef } from 'react';
import { Grid, Play, Pause, Sliders } from 'lucide-react';

export default function MultiFeedView({ data }) {
  const { feeds = [], layout = '2x2' } = data;
  const [isPlaying, setIsPlaying] = useState(true);
  const [scrubValue, setScrubValue] = useState(50); // percentage value
  const canvasRefs = useRef({});
  const isPlayingRef = useRef(isPlaying);
  const scrubValueRef = useRef(scrubValue);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    scrubValueRef.current = scrubValue;
  }, [scrubValue]);

  // Unified animation and scrub loop
  useEffect(() => {
    let animationId;
    let localOffset = scrubValueRef.current * 5;

    const renderAll = () => {
      feeds.forEach(feed => {
        const canvas = canvasRefs.current[feed.id];
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        // Black canvas background
        ctx.fillStyle = '#0f1115';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines overlay
        ctx.strokeStyle = 'rgba(170, 59, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let i = 0; i < canvas.width; i += 20) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for (let i = 0; i < canvas.height; i += 20) {
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); strokeBorder(ctx, canvas);
        }

        // Draw road lanes
        ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.fillRect(0, 30, canvas.width, 60);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(canvas.width, 60); ctx.stroke();

        // Calculate offset based on camera ID to differentiate feeds slightly
        const shift = feed.id === 'CAM01' ? 0 : feed.id === 'CAM02' ? 120 : feed.id === 'CAM03' ? 240 : 80;
        const totalOffset = (localOffset + shift) % (canvas.width + 40);

        // Draw a vehicle in the lane
        ctx.fillStyle = feed.id === 'CAM01' ? '#8b5cf6' : '#3b82f6';
        ctx.fillRect(totalOffset - 20, 42, 35, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(totalOffset + 5, 45, 8, 9); // windows

        // Overlay text
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px monospace';
        ctx.fillText(feed.label, 8, 16);
        ctx.fillText(`CAM SECURE // SYNCED`, 8, canvas.height - 8);

        // Red indicator
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(canvas.width - 15, 12, 3, 0, 2 * Math.PI);
        ctx.fill();
      });

      if (isPlayingRef.current) {
        localOffset += 1;
        // Keep React slider sync
        setScrubValue(prev => (prev >= 100 ? 0 : prev + 0.2));
      }

      animationId = requestAnimationFrame(renderAll);
    };

    // Helper for grid line stroke
    function strokeBorder(c, canvas) {
      c.beginPath(); c.moveTo(0, canvas.height); c.lineTo(canvas.width, canvas.height); c.stroke();
    }

    renderAll();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [feeds]);

  const handleScrubChange = (e) => {
    const val = parseFloat(e.target.value);
    setScrubValue(val);
    if (isPlaying) setIsPlaying(false); // Pause on manual scrub
  };

  const getLayoutClass = () => {
    if (layout === '1x2' || feeds.length <= 2) return 'layout-1x2';
    return 'layout-2x2';
  };

  return (
    <div className="card-container multi-feed-card">
      <div className="card-header">
        <div className="header-left">
          <Grid size={16} className="text-accent" />
          <span className="card-title">Multi-Feed Synchronized Watch</span>
        </div>
        <span className="badge badge-danger animate-pulse">SYNC ACTIVE</span>
      </div>

      <div className="multi-feed-body">
        <div className={`multi-feed-grids ${getLayoutClass()}`}>
          {feeds.map(feed => (
            <div key={feed.id} className="multi-feed-cell">
              <canvas
                ref={el => { canvasRefs.current[feed.id] = el; }}
                width={300}
                height={150}
                className="multi-feed-canvas"
              />
              <div className="cell-overlay-tag">{feed.id}</div>
            </div>
          ))}
        </div>

        {/* Sync Controls / Shared Scrub Bar */}
        <div className="sync-scrub-controls">
          <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          
          <div className="sync-slider-wrapper">
            <Sliders size={12} className="slider-icon icon-muted" />
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={scrubValue}
              onChange={handleScrubChange}
              className="sync-scrub-slider"
            />
            <span className="sync-time-stamp">
              T-00:{(60 - (scrubValue * 0.6)).toFixed(0).padStart(2, '0')}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

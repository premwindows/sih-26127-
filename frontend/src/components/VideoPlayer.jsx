import { useEffect, useRef, useState } from 'react';
import { Video, Play, Pause, Layers } from 'lucide-react';

export default function VideoPlayer({ data }) {
  const { cameraId = 'CAM01', cameraName = 'Active Camera' } = data;
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOverlays, setShowOverlays] = useState(true);
  const [detectedPlate, setDetectedPlate] = useState('MH12AB1234');
  const [ocrConfidence, setOcrConfidence] = useState('98%');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let frame = 0;
    
    // Simple state variables for simulation inside canvas
    let cars = [
      { id: 1, x: 0, lane: 1, speed: 45, type: 'car', color: '#8b5cf6', plate: 'MH12AB1234', detected: false },
      { id: 2, x: -300, lane: 2, speed: 52, type: 'suv', color: '#3b82f6', plate: 'DL3CAQ5678', detected: false },
      { id: 3, x: -150, lane: 3, speed: 30, type: 'truck', color: '#10b981', plate: 'KA03MS4421', detected: false }
    ];

    const drawGridLines = () => {
      // Draw grid overlays
      ctx.strokeStyle = 'rgba(170, 59, 255, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Draw detection zone line
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.6, 0);
      ctx.lineTo(canvas.width * 0.6, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
      ctx.fillRect(canvas.width * 0.58, 0, 15, canvas.height);
      
      ctx.fillStyle = '#ef4444';
      ctx.font = '9px monospace';
      ctx.fillText('ANPR DETECT ZONE', canvas.width * 0.58 - 90, 15);
    };

    const render = () => {
      if (!isPlaying) {
        animationId = requestAnimationFrame(render);
        return;
      }

      // Base black feed
      ctx.fillStyle = '#0f1115';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (showOverlays) {
        drawGridLines();
      }

      // Road background representation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fillRect(0, 80, canvas.width, 240);

      // Draw lanes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      
      // Lane 1 divider
      ctx.beginPath();
      ctx.moveTo(0, 160);
      ctx.lineTo(canvas.width, 160);
      ctx.stroke();

      // Lane 2 divider
      ctx.beginPath();
      ctx.moveTo(0, 240);
      ctx.lineTo(canvas.width, 240);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw cars
      cars.forEach(car => {
        // Update car x position based on speed
        car.x += car.speed * 0.05;
        if (car.x > canvas.width + 100) {
          car.x = -200;
          car.detected = false;
        }

        const yPos = 80 + car.lane * 80 - 50;

        // Draw car shape (box representation)
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, yPos, 80, 40);
        
        // Windows
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(car.x + 55, yPos + 5, 20, 30);
        ctx.fillRect(car.x + 20, yPos + 5, 25, 30);

        // Wheels
        ctx.fillStyle = '#000000';
        ctx.fillRect(car.x + 10, yPos + 38, 12, 5);
        ctx.fillRect(car.x + 58, yPos + 38, 12, 5);

        // License Plate on the back/front
        ctx.fillStyle = '#facc15';
        ctx.fillRect(car.x + 72, yPos + 25, 7, 10);

        // Check if car crosses detector line
        const centerLine = canvas.width * 0.6;
        if (car.x + 40 >= centerLine && car.x <= centerLine + 10) {
          car.detected = true;
          // Trigger HUD updates on React state
          setDetectedPlate(car.plate);
          setOcrConfidence(car.id === 1 ? '98%' : car.id === 2 ? '96%' : '92%');
        }

        // Draw bounding box if overlays are on
        if (showOverlays) {
          ctx.strokeStyle = car.detected ? '#ef4444' : '#aa3bff';
          ctx.lineWidth = 2;
          ctx.strokeRect(car.x - 5, yPos - 5, 90, 50);

          // Bounding Box Label
          ctx.fillStyle = car.detected ? '#ef4444' : '#aa3bff';
          ctx.font = '10px monospace';
          ctx.fillRect(car.x - 5, yPos - 20, 110, 15);
          ctx.fillStyle = '#ffffff';
          ctx.fillText(`${car.type.toUpperCase()} [${car.plate}] ${car.speed}km/h`, car.x - 1, yPos - 9);
        }
      });

      // HUD & metadata overlay
      ctx.fillStyle = 'rgba(15, 17, 21, 0.8)';
      ctx.fillRect(10, 10, 220, 50);
      ctx.strokeStyle = '#2e303a';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 220, 50);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '9px monospace';
      ctx.fillText(`CAM ID: ${cameraId}`, 18, 25);
      ctx.fillText(`LOC: ${cameraName}`, 18, 38);
      ctx.fillText(`FPS: 30 | BITRATE: 4.2 Mbps`, 18, 51);

      // Flashing Live indicator
      ctx.fillStyle = '#ef4444';
      if (Math.floor(frame / 15) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(canvas.width - 25, 25, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '10px monospace';
      ctx.fillText('LIVE FEED', canvas.width - 90, 28);

      frame++;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cameraId, isPlaying, showOverlays, cameraName]);

  return (
    <div className="card-container video-player-card">
      <div className="card-header">
        <div className="header-left">
          <Video size={16} className="text-accent" />
          <span className="card-title">Focused Feed: {cameraName}</span>
        </div>
        <div className="header-actions">
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`btn-icon ${showOverlays ? 'active' : ''}`}
            title="Toggle ANPR Overlay"
          >
            <Layers size={14} />
          </button>
        </div>
      </div>

      <div className="video-player-body">
        <div className="video-viewport">
          <canvas ref={canvasRef} width={640} height={360} className="video-canvas" />

          {/* ANPR HUD Overlay */}
          {showOverlays && (
            <div className="anpr-hud-overlay">
              <div className="hud-title">ANPR DETECTOR ENGINE</div>
              <div className="hud-row">
                <span className="hud-label">OCR TARGET:</span>
                <span className="hud-value plate-badge">{detectedPlate}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">CONFIDENCE:</span>
                <span className="hud-value text-accent">{ocrConfidence}</span>
              </div>
              <div className="hud-row">
                <span className="hud-label">MATCH STATUS:</span>
                <span className={`hud-value ${detectedPlate === 'MH12AB1234' ? 'text-danger animate-pulse font-bold' : 'text-success'}`}>
                  {detectedPlate === 'MH12AB1234' ? 'BLACKLIST MATCH' : 'CLEAN'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="video-controls-bar">
          <button onClick={() => setIsPlaying(!isPlaying)} className="control-btn">
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <div className="control-timeline-mock">
            <div className="timeline-progress" style={{ width: isPlaying ? '100%' : '50%' }}></div>
          </div>
          <span className="control-time">LIVE</span>
        </div>
      </div>
    </div>
  );
}

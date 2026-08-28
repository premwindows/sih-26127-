import { useEffect, useRef } from 'react';
import { LayoutGrid, Play } from 'lucide-react';

export default function FeedGrid({ data, onInteraction }) {
  const { cameras = [] } = data;

  return (
    <div className="card-container feed-grid-card">
      <div className="card-header">
        <div className="header-left">
          <LayoutGrid size={16} className="text-accent" />
          <span className="card-title">CCTV Feeds Grid</span>
        </div>
        <span className="badge badge-info">
          {cameras.length} Feeds
        </span>
      </div>

      <div className="feed-grid-content">
        {cameras.map(cam => (
          <div
            key={cam.id}
            className="feed-thumbnail-box"
            onClick={() => onInteraction('promote_camera', { cameraId: cam.id })}
          >
            <div className="feed-canvas-placeholder">
              <CanvasFeedPreview name={cam.id} />
              <div className="feed-overlay-play">
                <Play size={20} className="play-icon" />
              </div>
            </div>
            <div className="feed-thumbnail-label">
              <span className="feed-name">{cam.name}</span>
              <span className="feed-status-dot online"></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcomponent to animate a canvas loop for traffic simulation
function CanvasFeedPreview({ name }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = '#16171d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road lines
      ctx.strokeStyle = '#2e303a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw dashed lane markings
      ctx.strokeStyle = '#9ca3af';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.lineDashOffset = -offset * 2;
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Draw a few "cars" (moving colored blocks)
      const cars = [
        { x: (offset * 1.5) % (canvas.width + 40) - 20, y: canvas.height / 2 - 10, color: '#aa3bff', size: 14 },
        { x: canvas.width - ((offset * 2) % (canvas.width + 40)), y: canvas.height / 2 + 3, color: '#3b82f6', size: 16 }
      ];

      cars.forEach(car => {
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, car.y, car.size, 8);
        ctx.fillStyle = '#ffffff';
        // Wheels/details
        ctx.fillRect(car.x + 2, car.y - 1, 2, 1);
        ctx.fillRect(car.x + car.size - 4, car.y - 1, 2, 1);
      });

      // Scanline overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 1);
      }

      // Camera ID & REC text
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '10px monospace';
      ctx.fillText(name, 6, 14);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(canvas.width - 12, 10, 3, 0, 2 * Math.PI);
      ctx.fill();

      offset += 0.5;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [name]);

  return <canvas ref={canvasRef} width={140} height={85} className="feed-canvas" />;
}

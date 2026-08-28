import { BarChart3, TrendingUp } from 'lucide-react';

export default function ChartPanel({ data }) {
  const { title = 'Traffic Analytics Chart', type = 'line', series = [] } = data;

  const maxVal = series.length > 0 ? Math.max(...series.map(s => s.value)) * 1.15 : 100;
  
  // Dimensions for SVG
  const width = 450;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for Line Chart
  const getLineCoordinates = () => {
    if (series.length === 0) return '';
    return series.map((s, idx) => {
      const x = paddingLeft + (idx / (series.length - 1)) * chartWidth;
      const y = height - paddingBottom - (s.value / maxVal) * chartHeight;
      return { x, y };
    });
  };

  const linePoints = getLineCoordinates();
  const linePathString = linePoints.length > 0
    ? linePoints.map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(' ')
    : '';

  // Area path for gradient fill under the line
  const areaPathString = linePoints.length > 0
    ? `${linePathString} L ${linePoints[linePoints.length - 1].x} ${height - paddingBottom} L ${linePoints[0].x} ${height - paddingBottom} Z`
    : '';

  return (
    <div className="card-container chart-card">
      <div className="card-header">
        <div className="header-left">
          {type === 'bar' ? <BarChart3 size={16} className="text-accent" /> : <TrendingUp size={16} className="text-accent" />}
          <span className="card-title">{title}</span>
        </div>
      </div>

      <div className="chart-body">
        {series.length > 0 ? (
          <div className="chart-svg-container">
            <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" width="100%" height="100%">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(170, 59, 255, 0.4)" />
                  <stop offset="100%" stopColor="rgba(170, 59, 255, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingTop + ratio * chartHeight;
                const valueLabel = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={idx} className="chart-grid-line">
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeWidth="1"
                    />
                    <text
                      x={paddingLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#9ca3af"
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {valueLabel}
                    </text>
                  </g>
                );
              })}

              {/* Render Line Chart */}
              {type === 'line' && (
                <>
                  {/* Area fill */}
                  {areaPathString && (
                    <path d={areaPathString} fill="url(#chartGlow)" />
                  )}
                  {/* Glowing Line */}
                  {linePathString && (
                    <path
                      d={linePathString}
                      fill="none"
                      stroke="#aa3bff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Points */}
                  {linePoints.map((pt, idx) => (
                    <g key={idx} className="chart-point-group">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4"
                        fill="#ffffff"
                        stroke="#aa3bff"
                        strokeWidth="2"
                      />
                      {/* Tooltip-style value labels on hover */}
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontFamily="monospace"
                        className="chart-point-value"
                      >
                        {series[idx].value}
                      </text>
                      <text
                        x={pt.x}
                        y={height - paddingBottom + 15}
                        textAnchor="middle"
                        fill="#9ca3af"
                        fontSize="8"
                        fontFamily="monospace"
                      >
                        {series[idx].label}
                      </text>
                    </g>
                  ))}
                </>
              )}

              {/* Render Bar Chart */}
              {type === 'bar' && (
                <g className="chart-bars">
                  {series.map((item, idx) => {
                    const barWidth = Math.min(30, chartWidth / (series.length * 2));
                    const spacing = chartWidth / series.length;
                    const x = paddingLeft + idx * spacing + (spacing - barWidth) / 2;
                    const valRatio = item.value / maxVal;
                    const barHeight = valRatio * chartHeight;
                    const y = height - paddingBottom - barHeight;

                    return (
                      <g key={idx} className="chart-bar-group">
                        {/* Shadow background bar */}
                        <rect
                          x={x}
                          y={paddingTop}
                          width={barWidth}
                          height={chartHeight}
                          fill="rgba(255, 255, 255, 0.02)"
                          rx="3"
                        />
                        {/* Data bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={idx % 2 === 0 ? '#aa3bff' : '#3b82f6'}
                          rx="3"
                          className="chart-bar-rect"
                        />
                        {/* Value label */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {item.value}
                        </text>
                        {/* Category label */}
                        <text
                          x={x + barWidth / 2}
                          y={height - paddingBottom + 15}
                          textAnchor="middle"
                          fill="#9ca3af"
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {item.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}
            </svg>
          </div>
        ) : (
          <div className="chart-empty text-center text-muted">
            No chart data available.
          </div>
        )}
      </div>
    </div>
  );
}

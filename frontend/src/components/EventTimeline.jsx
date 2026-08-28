import { Clock, AlertTriangle, Info, BellRing } from 'lucide-react';

export default function EventTimeline({ data, onInteraction }) {
  const { title = 'Intelligence Logs & Detections', events = [], vehiclePlate = '' } = data;

  const getSeverityClass = (sev) => {
    switch (sev) {
      case 'high': return 'timeline-high';
      case 'medium': return 'timeline-medium';
      case 'low':
      default:
        return 'timeline-low';
    }
  };

  const getIcon = (sev) => {
    switch (sev) {
      case 'high': return <AlertTriangle size={14} className="text-danger animate-pulse" />;
      case 'medium': return <BellRing size={14} className="text-warning" />;
      default:
        return <Info size={14} className="text-info" />;
    }
  };

  const formatTime = (timeString) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return timeString;
    }
  };

  return (
    <div className="card-container timeline-card">
      <div className="card-header">
        <div className="header-left">
          <Clock size={16} className="text-accent" />
          <span className="card-title">{title}</span>
        </div>
        {vehiclePlate && <span className="badge badge-purple">{vehiclePlate}</span>}
      </div>

      <div className="timeline-body scrollbar-custom">
        {events.length > 0 ? (
          <div className="timeline-items-container">
            {events.map((event) => (
              <div
                key={event.id}
                className={`timeline-item ${getSeverityClass(event.severity)}`}
                onClick={() => onInteraction('inspect_log', { eventId: event.id })}
              >
                <div className="timeline-item-left">
                  <div className="timeline-bullet">
                    {getIcon(event.severity)}
                  </div>
                  <span className="timeline-time">{formatTime(event.time)}</span>
                </div>
                
                <div className="timeline-item-content">
                  <div className="timeline-label">{event.label}</div>
                  <div className="timeline-details">{event.details}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="timeline-empty">
            <span className="text-muted">No timeline events detected.</span>
          </div>
        )}
      </div>
    </div>
  );
}

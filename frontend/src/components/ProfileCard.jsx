import { User, Car, AlertTriangle, Eye, Navigation } from 'lucide-react';

export default function ProfileCard({ data, size, onInteraction }) {
  const isFlagged = data.status === 'flagged';

  return (
    <div className="card-container profile-card">
      <div className="card-header">
        <div className="header-left">
          <Car size={16} className="text-accent" />
          <span className="card-title">Vehicle Profile</span>
        </div>
        <span className={`badge ${isFlagged ? 'badge-danger animate-pulse' : 'badge-success'}`}>
          {data.status ? data.status.toUpperCase() : 'UNKNOWN'}
        </span>
      </div>

      <div className="profile-content">
        <div className="profile-top">
          {data.photo && (
            <div className="profile-image-container">
              <img src={data.photo} alt="Vehicle Thumbnail" className="profile-image" />
              <div className="license-plate-badge">
                <span className="plate-ind">IND</span>
                <span className="plate-text">{data.plate}</span>
              </div>
            </div>
          )}

          <div className="profile-summary">
            <h3 className="vehicle-model">{data.model}</h3>
            <div className="owner-info">
              <User size={14} className="icon-muted" />
              <span>Owner: <strong>{data.owner}</strong></span>
            </div>
          </div>
        </div>

        {isFlagged && data.reason && (
          <div className="alert-box alert-box-danger">
            <AlertTriangle size={16} className="alert-icon" />
            <div className="alert-text">
              <strong>Alert Flagged:</strong> {data.reason}
            </div>
          </div>
        )}

        {size === 'large' && (
          <div className="profile-actions">
            <button
              onClick={() => onInteraction('show_footage', { plate: data.plate })}
              className="btn btn-secondary btn-sm"
            >
              <Eye size={12} />
              <span>Watch Feed</span>
            </button>
            <button
              onClick={() => onInteraction('show_route', { plate: data.plate })}
              className="btn btn-primary btn-sm"
            >
              <Navigation size={12} />
              <span>Trace Route</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

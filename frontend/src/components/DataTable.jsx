import { Database } from 'lucide-react';

export default function DataTable({ data }) {
  const { title = 'Structured Records', columns = [], rows = [] } = data;

  return (
    <div className="card-container data-table-card">
      <div className="card-header">
        <div className="header-left">
          <Database size={16} className="text-accent" />
          <span className="card-title">{title}</span>
        </div>
      </div>

      <div className="table-responsive-container">
        <table className="custom-data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx}>
                      {typeof cell === 'string' && cell.startsWith('simulated://') ? (
                        <code className="text-accent">Live Stream Link</code>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length || 1} className="text-center text-muted">
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

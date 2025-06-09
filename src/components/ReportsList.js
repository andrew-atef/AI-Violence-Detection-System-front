import { Link } from "react-router-dom";
import '../cssFolder/ReportsList.css'
function ReportsList({ reports, markAsRead, recentFirst, setRecentFirst }) {
  return (
    <div className="reports-container">
      <h2 style={{textAlign:"center"}}>📋 Reports List</h2>

      <div className="sort-toggle">
        <label>
          <input 
            type="checkbox"
            checked={recentFirst}
            onChange={() => setRecentFirst(!recentFirst)}
          />
          Show most recent first
        </label>
      </div>

      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User ID</th>
              <th>Timestamp</th>
              <th>Camera</th>
              <th>Note</th>
              <th>Prediction</th>
              <th>Confidence</th>
              {/* Change header back to indicate details view */}
              <th>Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {/* Check if reports array is empty */}
            {reports.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center' }}>No reports found.</td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr
                  key={report.id} // Use the correct 'id' field for the key
                  className={report.isRead ? "read" : ""}
                >
                  <td>{index + 1}</td>
                  {/* Use correct field names from the report object */}
                  <td>{report.user_id}</td> {/* Display user_id */}
                  <td>{new Date(report.created_at).toLocaleString()}</td> {/* Use created_at */}
                  <td>{report.camera_num}</td> {/* Use camera_num */}
                  <td>{report.note || 'N/A'}</td> {/* Display note or 'N/A' if null */}
                  <td>{report.prediction}</td> {/* Display prediction */}
                  <td>{report.confidence !== undefined ? report.confidence.toFixed(4) : 'N/A'}</td> {/* Display confidence */}
                  <td>
                    {/* Change back to Link component to navigate to ReportDetails */}
                    <Link to={`/report/${report.id}`}>
                      <button>View Details</button>
                    </Link>
                  </td>
                  <td>
                    {!report.isRead && (
                      // Use the correct 'id' field for markAsRead
                      <button onClick={() => markAsRead(report.id)}>
                        Mark as Read
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReportsList;

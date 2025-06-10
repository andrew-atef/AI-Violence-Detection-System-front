import { Link } from "react-router-dom";
import '../cssFolder/ReportsList.css'
import { useState } from 'react';
function ReportsList({ reports, markAsRead, recentFirst, setRecentFirst }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  // Calculate current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="reports-container" style={{ }}>
      <h2 style={{textAlign:"center",TextAlign: "center",
    position: "relative",
    color: "black",
    top: "-13px",}}>📋 Reports List</h2>

      <div className="reports-table-wrapper">
        <table className="reports-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Camera</th>
              <th>Timestamp</th>
              <th>Prediction</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No reports found.</td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr key={report.id} className={report.isRead ? "read" : ""}>
                  <td>{index + 1}</td>
                  <td>{report.camera_num}</td>
                  <td>{new Date(report.created_at).toLocaleString()}</td>
                  <td>{report.prediction}</td>
                  <td>
                    <button className="action-btn accept">Accept</button>
                    <button className="action-btn delete">Delete</button>
                    <Link to={`/report/${report.id}`} className="action-btn view">View</Link>
                    {!report.isRead && (
                      <button onClick={() => markAsRead(report.id)}>
                        Mark Read
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination" style ={{position:"absolute",bottom:"20px",left:"50%"}}>
        {Array.from({ length: Math.ceil(reports.length / itemsPerPage) }).map((_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ReportsList;

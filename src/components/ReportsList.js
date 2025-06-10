import { Link } from "react-router-dom";
import '../cssFolder/ReportsList.css'
import { useState } from 'react';

// The component now takes handleDeleteReport as a prop instead of markAsRead
function ReportsList({ reports, handleDeleteReport }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="reports-container">
      <h2 style={{textAlign:"center", color: "black", top: "-13px"}}>📋 Reports List</h2>
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
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No reports found.</td>
              </tr>
            ) : (
              currentItems.map((report, index) => (
                // The 'read' className is no longer needed
                <tr key={report.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{report.camera_num}</td>
                  <td>{new Date(report.created_at).toLocaleString()}</td>
                  <td>{report.prediction}</td>
                  <td>
                    <Link to={`/report/${report.id}`} className="action-btn view">View</Link>
                    {/* The "Mark as Read" button is replaced with a functional Delete button */}
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination" style={{position:"absolute",bottom:"20px",left:"50%", transform: "translateX(-50%)"}}>
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
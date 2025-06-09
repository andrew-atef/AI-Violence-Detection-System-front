import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Footer";
import AdminTaskbar from "../components/AdminTaskbar";
// Import CSS if you have specific styles for this page
// import '../cssFolder/ReportDetails.css';

function ReportDetails() {
  const { id } = useParams(); // Get id from URL
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token'); // Get token for authorization

    if (!token) {
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
    }

    // Fetch the specific report by ID from the API
    // Assuming the endpoint structure is /api/violence-notifications/{id}
    fetch(`/api/violence-notifications/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
        }
    })
      .then((res) => {
          if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
      })
      .then((data) => {
        // Assuming the API returns the report object directly,
        // or possibly nested like { data: reportObject } or { violence_notification: reportObject }
        // Adjust data access if necessary, e.g., setReport(data.data)
        const reportData = data.violence_notification || data.data || data; // Adjust based on actual API response structure
        if (!reportData || typeof reportData !== 'object') {
            throw new Error("Invalid data format received from API.");
        }
        setReport(reportData);
      })
      .catch((err) => {
          console.error("Failed to load report details:", err);
          setError(`Failed to load report: ${err.message}`);
      })
      .finally(() => {
          setLoading(false);
      });
  }, [id]); // Re-run effect if id changes

  if (loading) {
    return <div>Loading report details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!report) {
    // This case might happen if the fetch succeeds but returns no data for the ID
    return <div>Report not found.</div>;
  }

  // --- Render Report Details ---
  return (
    <div>
      <AdminTaskbar/>
      {/* Use a container for better styling */}
      <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
        <h2>Report Details</h2>
        {/* Display details using correct field names */}
        <p><strong>Report ID:</strong> {report.id}</p>
        <p><strong>User ID:</strong> {report.user_id}</p>
        <p><strong>Timestamp:</strong> {new Date(report.created_at).toLocaleString()}</p>
        <p><strong>Camera Number:</strong> {report.camera_num}</p>
        <p><strong>Prediction:</strong> {report.prediction}</p>
        <p><strong>Confidence:</strong> {report.confidence !== undefined ? report.confidence.toFixed(4) : 'N/A'}</p>
        <p><strong>Note:</strong> {report.note || 'N/A'}</p>

        {/* Display the video if video_path exists */}
        {report.video_path ? (
          <div>
            <h3>Recorded Video:</h3>
            <video
              src={report.video_path}
              controls // Add video controls (play, pause, volume)
              style={{ width: "100%", maxHeight: "500px", backgroundColor: "#000" }} // Style as needed
              onError={(e) => console.error("Error loading video:", e)} // Optional: handle video load errors
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <p><strong>Video:</strong> No video available for this report.</p>
        )}

        <br />
        <Link to="/admin-dashboard">
          <button style={{ marginTop: '20px' }}>Back to Reports List</button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}

export default ReportDetails;

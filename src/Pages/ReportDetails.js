import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";
import '../cssFolder/ReportDetails.css';
import Spinner from "../components/Spinner";
import api from '../api';

function ReportDetails() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReportDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api(`/violence-notifications/${id}`);
        setReport(data.violence_notification);
      } catch (err) {
        setError(err.message);
        if (err.message.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReportDetails();
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!report) return <div>Report not found.</div>;

  return (
    <div>
      <AnimatedBackground/>
      <div className="cont">
        <h2 style={{color:'#4CAF50'}}>Report Details</h2>
        <p><strong>Report ID:</strong> {report.id}</p>
        <p><strong>User ID:</strong> {report.user_id}</p>
        <p><strong>Timestamp:</strong> {new Date(report.created_at).toLocaleString()}</p>
        <p><strong>Camera Number:</strong> {report.camera_num}</p>
        <p><strong>Prediction:</strong> {report.prediction}</p>
        <p><strong>Confidence:</strong> {report.confidence?.toFixed(4) ?? 'N/A'}</p>
        <p><strong>Note:</strong> {report.note || 'No notes available.'}</p>
        {report.video_path && (
          <div style={{marginTop: 20}}>
            <h3>Recorded Video:</h3>
            <video src={report.video_path} controls style={{ width: "100%", maxHeight: "400px" }}>
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <div style={{textAlign:'center', marginTop: 30}}>
          <Link to="/admin-dashboard">
            <button className="back-button">Back to Reports</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ReportDetails;
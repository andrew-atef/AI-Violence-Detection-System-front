import { Link } from 'react-router-dom';
import '../cssFolder/NavBar.css';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="nav-links">
                <Link to="/" className="nav-item">Home</Link>
                <Link to="/about" className="nav-item">About Us</Link>
                <Link to="/technology" className="nav-item">Technology Used</Link>
                <Link to="/workflow" className="nav-item">System Workflow</Link>
                <Link to="/contact" className="nav-item">Contact Us</Link>
            </div>
            <div className="auth-buttons">
                <Link to="/login" className="signin-btn">Sign In</Link>
                <Link to="/register" className="register-btn">Register</Link>
            </div>
        </nav>
    );
}

export default NavBar;
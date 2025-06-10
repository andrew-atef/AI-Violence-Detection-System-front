import { Link } from 'react-router-dom';
import '../cssFolder/NavBar.css';

function NavBar() {
    return (
        <nav className="navbar">
            <div className="nav-links">
               
            </div>
            <div className="auth-buttons">
                <Link to="/login" className="signin-btn">Sign In</Link>
                <Link to="/register" className="register-btn">Register</Link>
            </div>
        </nav>
    );
}

export default NavBar;
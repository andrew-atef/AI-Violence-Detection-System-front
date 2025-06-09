import '../cssFolder/footer.css'
function Footer() {
    return (
        <footer className="footer">
            <p>© {new Date().getFullYear()} Surveillance System - Graduation Project</p>
        </footer>
    );
}

export default Footer;
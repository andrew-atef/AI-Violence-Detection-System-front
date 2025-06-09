import React from 'react';

function SideBar({ username, onSelectOption }) {
    return (
        <div style={styles.sidebar}>
            <h2>Surveillance System</h2>
            <p>Welcome, {username}</p>

            <div style={styles.options}>
                <button onClick={() => onSelectOption('camera1')}>View Camera 1</button>
                <button onClick={() => onSelectOption('camera2')}>View Camera 2</button>
                <button onClick={() => onSelectOption('all')}>View All Cameras</button>
            </div>

            <button style={styles.logout} onClick={() => alert('Logging out...')}>
                Logout
            </button>
        </div>
    );
}

const styles = {
    sidebar: {
        width: '250px',
        height: '100vh',
        backgroundColor: '#007bff',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        boxSizing: 'border-box',
    },
    options: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    logout: {
        marginTop: 'auto',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '10px',
        cursor: 'pointer',
    }
};

export default SideBar;

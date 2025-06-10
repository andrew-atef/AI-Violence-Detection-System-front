import { FaVideo } from 'react-icons/fa';
import "../cssFolder/AnimatedBackground.css"
function AnimatedBackground() {
    return (
        <div className="background-wrapper">
            <div className="background-color"></div>
            <div className="background-cameras">
                <FaVideo className="floating-camera camera1" />
                <FaVideo className="floating-camera camera2" />
                <FaVideo className="floating-camera camera3" />
                <FaVideo className="floating-camera camera4" />
            </div>
        </div>
    );
}

export default AnimatedBackground;
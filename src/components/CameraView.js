import React, { useEffect, useRef, useState } from "react";
import '../cssFolder/cameraview.css';
import api from "../api"; 

const CameraView = ({ cameraNumber, viewMode }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamInstanceRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const stopTimeoutRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  
  const [prediction, setPrediction] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);

  useEffect(() => {
    const ENDPOINT_PATH = '/send-video';
    let isMounted = true; 

    // --- We will ONLY attempt to use MP4 MIME types ---
    const MP4_MIME_TYPES = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
        'video/mp4',
    ];
    
    // Find the first supported MP4 mimeType
    const supportedMimeType = MP4_MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type));

    // ... (startRecordingCycle and restartRecordingAfterDelay functions are unchanged) ...
    const startRecordingCycle = (recorder) => {
        if (!isMounted || !recorder || recorder.state === 'recording') return;
        try {
            recordedChunksRef.current = [];
            recorder.start();
            stopTimeoutRef.current = setTimeout(() => {
            if (isMounted && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
            }
            }, 5000); 
        } catch (startError) {
            console.error(`Camera ${cameraNumber}: Failed to start recording:`, startError);
            setErrorState(`Recorder Error: ${startError.name}`);
            if (streamInstanceRef.current) {
                streamInstanceRef.current.getTracks().forEach(track => track.stop());
            }
        }
    };

    const restartRecordingAfterDelay = (recorder) => {
        if (!isMounted) return;
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
            if (isMounted) startRecordingCycle(recorder);
        }, 1000);
    };

    const setupWebcam = async () => {
      // If no MP4 recording format is supported, stop immediately.
      if (!supportedMimeType) {
          console.error("This browser does not support recording in MP4 format, which is required by the server.");
          setErrorState("Browser cannot record in required MP4 format.");
          setIsRecordingSupported(false);
          return;
      }
      
      console.log(`Using supported MP4 MIME type: ${supportedMimeType}`);
      setErrorState(null);
      setPrediction(null);

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamInstanceRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorState(`Webcam Error: ${err.name}`);
        return;
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        if (!isMounted) return;
        setErrorState(`Recorder error: ${event.error.name || 'Unknown'}`);
      };

      mediaRecorder.onstop = async () => {
        if (!isMounted || recordedChunksRef.current.length === 0) {
            if (isMounted) restartRecordingAfterDelay(mediaRecorderRef.current);
            return;
        }
        
        // Create the blob with the correct, supported MP4 MIME type
        const blob = new Blob(recordedChunksRef.current, { type: supportedMimeType });
        recordedChunksRef.current = [];

        const formData = new FormData();
        const filename = `camera_${cameraNumber}_${Date.now()}.mp4`;
        
        formData.append('video', blob, filename);
        
        try {
          const result = await api(ENDPOINT_PATH, {
            method: 'POST',
            body: formData,
          });
          if (isMounted) {
            setPrediction(result.prediction || "N/A");
            setErrorState(null);
          }
        } catch (error) {
          if (isMounted) {
            setErrorState(`Upload failed: ${error.message}`);
            if (error.message.includes('401')) {
                return;
            }
          }
        } finally {
          if (isMounted) {
            restartRecordingAfterDelay(mediaRecorderRef.current);
          }
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      startRecordingCycle(mediaRecorder);
    };

    setupWebcam();
    
    // ... (cleanup function is unchanged) ...
    return () => {
        isMounted = false;
        clearTimeout(stopTimeoutRef.current);
        clearTimeout(restartTimeoutRef.current);
        const recorder = mediaRecorderRef.current;
        if (recorder && (recorder.state === 'recording' || recorder.state === 'paused')) {
            recorder.stop();
        }
        const stream = streamInstanceRef.current;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };
  }, [cameraNumber]);

  return (
    <div className={`camera-container ${viewMode === "all" ? "all-view" : "single-view"}`}>
      <h3 className="camera-title">Camera {cameraNumber}</h3>
       { (prediction || errorState) &&
        <div className={`status-label ${errorState ? 'error' : (prediction === 'Violence' ? 'violence' : 'non-violence')}`}>
            {errorState ? `${errorState}` : `Status: ${prediction}`}
        </div>
       }
      <div className="video-wrapper">
        <video ref={videoRef} muted autoPlay playsInline className="camera-video" />
        {(!isRecordingSupported || (errorState && !videoRef.current?.srcObject)) && 
          <div className="video-overlay error-overlay">
            <p>Failed to load video.</p>
            <p><strong>Reason:</strong> {errorState}</p>
          </div>
        }
      </div>
    </div>
  );
};

export default CameraView;
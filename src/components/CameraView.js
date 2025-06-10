import React, { useEffect, useRef, useState } from "react";
import '../cssFolder/cameraview.css'; // Ensure this CSS file exists and is styled

const CameraView = ({ cameraNumber, viewMode }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [prediction, setPrediction] = useState(null); // State for prediction label
  const [errorState, setErrorState] = useState(null); // State for errors
  const stopTimeoutRef = useRef(null); // Ref to hold the timeout ID for stopping the recorder
  const restartTimeoutRef = useRef(null); // Ref to hold the timeout ID for restarting the recorder
  const streamInstanceRef = useRef(null); // Ref to hold the stream instance for cleanup

  useEffect(() => {
    const ENDPOINT_URL = 'http://141.147.83.47:8083/api/send-video';

    const setupWebcam = async () => {
        console.log(`Camera ${cameraNumber}: Starting setup...`);
        setErrorState(null); // Clear previous errors
        setPrediction(null); // Clear previous prediction

        // --- Get User Media ---
        let stream = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamInstanceRef.current = stream; // Store the stream in the ref

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Use a promise to wait for metadata, avoids potential race conditions
                await new Promise((resolve) => {
                    videoRef.current.onloadedmetadata = () => {
                        resolve();
                    };
                });
                // Play only after metadata is loaded
                 if (videoRef.current) { // Double check ref still exists
                    await videoRef.current.play();
                    console.log(`Camera ${cameraNumber}: Video playing.`);
                 } else {
                     console.warn(`Camera ${cameraNumber}: videoRef became null before playing.`);
                     stream.getTracks().forEach(track => track.stop());
                     return;
                 }
            } else {
                console.warn(`Camera ${cameraNumber}: videoRef not available on setup.`);
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            // --- Media Recorder Setup ---
            // Define potential MIME types, preferring MP4
            const mimeTypes = [
                'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // Common H.264/AAC MP4
                'video/mp4;codecs=h264',                 // Another way to specify H.264 MP4
                'video/mp4',                             // Generic MP4
                'video/webm;codecs=vp8',                 // VP8 WebM (your previous setting)
                'video/webm',                            // Generic WebM
            ];

            let mediaRecorder;
            let chosenMimeType = '';

            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    try {
                        const options = { mimeType: mimeType };
                        mediaRecorder = new MediaRecorder(stream, options);
                        chosenMimeType = mimeType;
                        console.log(`Camera ${cameraNumber}: MediaRecorder created with options:`, chosenMimeType);
                        break; // Found a supported type, exit loop
                    } catch (e) {
                        console.warn(`Camera ${cameraNumber}: Failed to create MediaRecorder with ${mimeType}:`, e);
                        // Continue to the next type
                    }
                } else {
                     console.log(`Camera ${cameraNumber}: MIME type not supported: ${mimeType}`);
                }
            }

            // If no specific MIME type worked, try default
            if (!mediaRecorder) {
                try {
                    mediaRecorder = new MediaRecorder(stream); // Fallback to browser default
                    chosenMimeType = mediaRecorder.mimeType || 'video/webm'; // Get default or assume webm
                    console.log(`Camera ${cameraNumber}: MediaRecorder created with default options. MimeType: ${chosenMimeType}`);
                } catch (fallbackError) {
                    console.error(`Camera ${cameraNumber}: Failed to create MediaRecorder even with default options:`, fallbackError);
                    setErrorState("MediaRecorder setup failed.");
                    stream.getTracks().forEach(track => track.stop());
                    return; // Cannot proceed
                }
            }

            // Store the chosen mime type for later use in blob and filename
            const finalMimeType = chosenMimeType;
            const fileExtension = finalMimeType.includes('mp4') ? 'mp4' : 'webm'; // Determine extension

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    // console.log(`Camera ${cameraNumber}: Data available, size: ${event.data.size}`);
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error(`Camera ${cameraNumber} MediaRecorder Error:`, event.error);
                setErrorState(`Recorder error: ${event.error.name || 'Unknown'}`);
                // Optionally try to restart or stop cleanly
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    try { mediaRecorderRef.current.stop(); } catch(e) {/* ignore */}
                }
            };

            // --- ON STOP: PROCESS AND UPLOAD ---
            mediaRecorder.onstop = async () => {
                console.log(`Camera ${cameraNumber}: Recording stopped. Processing ${recordedChunksRef.current.length} chunks.`);
                if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
                stopTimeoutRef.current = null; // Clear timeout ref after use

                if (recordedChunksRef.current.length === 0) {
                    console.warn(`Camera ${cameraNumber}: No data recorded, skipping upload.`);
                    // Ensure recorder is available before trying to restart
                    if (mediaRecorderRef.current) {
                         restartRecordingAfterDelay(mediaRecorderRef.current);
                    }
                    return;
                }

                // Use the determined mimeType and extension
                const blob = new Blob(recordedChunksRef.current, { type: finalMimeType });
                recordedChunksRef.current = []; // Clear chunks immediately

                // --- Get Token ---
                const token = localStorage.getItem('token');

                if (!token) {
                    console.error(`Camera ${cameraNumber}: No authentication token found. Cannot upload.`);
                    setErrorState("Authentication error");
                    // Don't restart if auth fails, user needs to log in
                    return;
                }

                // --- Prepare FormData ---
                const formData = new FormData();
                // Use the correct file extension based on the actual recording format
                formData.append('video', blob, `camera_${cameraNumber}_${Date.now()}.${fileExtension}`);
                formData.append('cameraNumber', String(cameraNumber));

                // --- Upload with Authentication Header ---
                try {
                    console.log(`Camera ${cameraNumber}: Uploading video (size: ${blob.size} bytes) via POST.`);
                    const response = await fetch(ENDPOINT_URL, {
                        method: 'POST', // Use POST to send data
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            // Do NOT set 'Content-Type': 'multipart/form-data'.
                            // The browser will set it automatically with the correct boundary for FormData.
                        },
                        body: formData, // Send the populated FormData object
                    });

                    if (!response.ok) {
                         let errorBody = `Server error: ${response.status} ${response.statusText}`;
                         if (response.status === 401) {
                            errorBody = "Authentication failed (401). Please log in again.";
                         } else {
                             // Try to get more specific error from server response body
                             try {
                                 const errorJson = await response.json(); // Attempt to parse as JSON
                                 errorBody += ` - ${errorJson.error || errorJson.message || JSON.stringify(errorJson)}`;
                             } catch (jsonError) {
                                 try {
                                     const text = await response.text(); // Fallback to plain text
                                     if (text) errorBody += ` - ${text}`;
                                 } catch (textError) { /* Ignore parsing error if body is empty */ }
                             }
                         }
                         throw new Error(errorBody);
                    }

                    const result = await response.json();
                    console.log(`Camera ${cameraNumber} Prediction:`, result.prediction);
                    setPrediction(result.prediction || "N/A"); // Handle case where prediction might be missing
                    setErrorState(null); // Clear error on success

                } catch (error) {
                    // Network errors or errors thrown from !response.ok block
                    console.error(`Upload failed for camera ${cameraNumber}:`, error);
                    setErrorState(`Upload failed: ${error.message}`);
                    setPrediction(null); // Clear prediction on error
                } finally {
                    // Always attempt to restart recording after upload attempt (unless auth failed)
                     if (mediaRecorderRef.current) { // Check if component might have unmounted
                        restartRecordingAfterDelay(mediaRecorderRef.current);
                     }
                }
            }; // End of onstop

            mediaRecorderRef.current = mediaRecorder;

            // --- Start Recording ---
            startRecordingCycle(mediaRecorder);

        } catch (err) {
            // Handle getUserMedia errors
            console.error(`Error accessing webcam for camera ${cameraNumber}:`, err);
            let message = "Webcam access error.";
            if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                message = "Webcam not found.";
            } else if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                message = "Permission denied.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                message = "Webcam already in use or hardware error.";
            } else if (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError") {
                message = "Webcam doesn't support requested constraints.";
            }
            setErrorState(message);
             if (stream) { // Use the local stream variable here
                stream.getTracks().forEach(track => track.stop());
                streamInstanceRef.current = null;
             }
        }
    }; // End of setupWebcam

    // --- Helper Functions ---

    const startRecordingCycle = (recorder) => {
        if (!recorder || recorder.state === 'recording' || !videoRef.current || !streamInstanceRef.current) {
            console.warn(`Camera ${cameraNumber}: Cannot start recording. State: ${recorder?.state}, videoRef: ${!!videoRef.current}, stream: ${!!streamInstanceRef.current}`);
            return;
        }
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current); // Clear any pending stop
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current); // Clear any pending restart

        try {
            recordedChunksRef.current = []; // Clear previous chunks
            recorder.start();
            console.log(`Camera ${cameraNumber}: Recording started (State: ${recorder.state}). MimeType: ${recorder.mimeType}`);

            // Set timeout to stop recording
            stopTimeoutRef.current = setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    console.log(`Camera ${cameraNumber}: Stopping recording after 5s.`);
                    try {
                        mediaRecorderRef.current.stop(); // This will trigger the 'onstop' handler
                    } catch (stopError) {
                         console.error(`Camera ${cameraNumber}: Error calling stop()`, stopError);
                         setErrorState("Error stopping recorder.");
                    }
                } else {
                     console.log(`Camera ${cameraNumber}: Recorder not in recording state when stop timeout fired.`);
                }
                stopTimeoutRef.current = null; // Clear timeout ref
            }, 5000); // 5 seconds recording duration

        } catch (startError) {
            console.error(`Camera ${cameraNumber}: Failed to start recording:`, startError);
            setErrorState("Failed to start recorder.");
            // Attempt cleanup if start fails
             if (recorder.state !== 'inactive') {
                 try { recorder.stop(); } catch(e) {/* ignore */}
             }
        }
    };

    const restartRecordingAfterDelay = (recorder) => {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current); // Clear previous restart timeout

        // Check if component is still mounted and stream is active
        if (!videoRef.current || !streamInstanceRef.current || !recorder) {
             console.log(`Camera ${cameraNumber}: Not restarting recording (component unmounted or prerequisites missing).`);
             return;
        }

        console.log(`Camera ${cameraNumber}: Scheduling restart in 1 second.`);
        restartTimeoutRef.current = setTimeout(() => {
            console.log(`Camera ${cameraNumber}: Attempting to restart recording.`);
            startRecordingCycle(recorder); // recorder should be mediaRecorderRef.current passed in
            restartTimeoutRef.current = null; // Clear timeout ref
        }, 1000); // 1 second delay before restarting
    };

    // --- Run Setup ---
    setupWebcam();

    // --- Cleanup Function ---
    return () => {
        console.log(`Cleaning up Camera ${cameraNumber}...`);

        // Clear timeouts
        if (stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current);
            console.log(`Camera ${cameraNumber}: Cleared stop timeout.`);
            stopTimeoutRef.current = null;
        }
        if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
            console.log(`Camera ${cameraNumber}: Cleared restart timeout.`);
            restartTimeoutRef.current = null;
        }

        // Stop MediaRecorder
        const recorder = mediaRecorderRef.current;
        if (recorder) {
            console.log(`Camera ${cameraNumber}: Cleaning up MediaRecorder (state: ${recorder.state}).`);
            recorder.ondataavailable = null;
            recorder.onerror = null;
            recorder.onstop = null; // Important: Prevent onstop from running after unmount

            if (recorder.state === 'recording' || recorder.state === 'paused') {
                try {
                    recorder.stop();
                    console.log(`Camera ${cameraNumber}: MediaRecorder stopped on cleanup.`);
                } catch (e) {
                    console.error(`Camera ${cameraNumber}: Error stopping recorder during cleanup:`, e);
                }
            }
        }
        mediaRecorderRef.current = null; // Nullify the ref

        // Stop MediaStream tracks
        const stream = streamInstanceRef.current;
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            console.log(`Camera ${cameraNumber}: MediaStream tracks stopped.`);
        }
        streamInstanceRef.current = null; // Nullify the ref

        // Detach stream from video element
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject = null;
            console.log(`Camera ${cameraNumber}: srcObject set to null.`);
        } else {
            // console.log(`Camera ${cameraNumber}: videoRef or srcObject already null on cleanup.`);
        }

        // Clear recorded data just in case
        recordedChunksRef.current = [];

        console.log(`Camera ${cameraNumber}: Cleanup complete.`);
    };
  }, [cameraNumber]); // Re-run useEffect if cameraNumber changes

  // --- Rendering Logic ---
  const viewClass = viewMode === "all" ? "all-view" : "single-view";

  const getLabelStyle = () => ({
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '5px 10px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 10,
    backgroundColor: errorState
      ? 'rgba(255, 100, 0, 0.8)' // Orange/Red for errors
      : prediction === 'Violence'
      ? 'rgba(255, 0, 0, 0.8)' // Red
      : prediction === 'NonViolence'
      ? 'rgba(0, 128, 0, 0.8)' // Green
      : prediction // Display other predictions with neutral background
      ? 'rgba(50, 50, 50, 0.7)'
      : 'rgba(0, 0, 0, 0.5)', // Default/neutral (or hide if no prediction/error)
    transition: 'background-color 0.3s ease',
    maxWidth: 'calc(100% - 20px)', // Prevent overflow
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  });

  // Determine if the label should be shown
  const showLabel = !!errorState || !!prediction;

  return (
    <div className={`${viewClass} camera-container`} style={{ position: 'relative', border: '1px solid #ccc', background: '#333', overflow: 'hidden' }}>
      <h3 className="camera-title">Camera {cameraNumber}</h3>
      {showLabel && (
        <div style={getLabelStyle()} title={errorState || prediction}> {/* Add title for full text on hover */}
          {errorState ? `Error: ${errorState}` : `Status: ${prediction}`}
        </div>
      )}
      <div className="video-wrapper">
        {/* Video element */}
        <video
          ref={videoRef}
          muted // Muted is essential for autoplay in most browsers
          autoPlay // Attempt to autoplay
          playsInline // Required for autoplay on iOS
          className="camera-video"
          style={{ display: errorState ? 'none' : 'block' }} // Hide video if there's a setup error
        />
        {/* Error message overlay */}
        {errorState && (
             <div className="video-overlay error-overlay">
                <p>Failed to load video.</p>
                <p><strong>Reason:</strong> {errorState}</p>
                <p><small>(Check permissions and device connection)</small></p>
             </div>
         )}
         {/* Optional: Loading indicator */}
         {!errorState && !videoRef.current?.srcObject && (
              <div
                className="video-overlay loading-overlay"
                // Add inline styles for centering and text color
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white', // Set text color to white
                    textAlign: 'center', // Ensure text itself is centered if it wraps
                    // Inherit other styles from video-overlay class (like position, background)
                }}
              >
                Loading Camera...
              </div>
         )}
      </div>
    </div>
  );
};

export default CameraView;
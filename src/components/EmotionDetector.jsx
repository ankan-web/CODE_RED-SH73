import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';         // ⬅️ Import TensorFlow.js
import '@tensorflow/tfjs-backend-webgl';        // ⬅️ Enable WebGL backend
import '@tensorflow/tfjs-backend-cpu';          // ⬅️ Enable CPU fallback


// --- SVG Icons for the component ---
const StopIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v6H9z" /></svg>);
const LoadingSpinner = () => (<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>);

export default function EmotionDetector({ onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState({ models: true, camera: true });
  const [detectedEmotion, setDetectedEmotion] = useState('...');
  const intervalRef = useRef(null);

  // --- Load AI Models ---
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; // From the public folder
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        setLoading(prev => ({ ...prev, models: false }));
      } catch (error) {
        console.error("Failed to load models:", error);
        alert("Could not load the AI models. Please check the console for details.");
      }
    };
    loadModels();
  }, []);

  // --- Start Webcam ---
  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: {} })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setLoading(prev => ({ ...prev, camera: false }));
        }
      })
      .catch(err => {
        console.error("Error accessing webcam:", err);
        alert("Could not access the webcam. Please ensure you have given permission.");
        onClose();
      });
  };

  // --- Handle Detection on Video Play ---
  const handleVideoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      // Safety check to ensure the faceapi backend is ready. This prevents console errors.
      if (videoRef.current && !videoRef.current.paused && faceapi.tf.getBackend()) {

        const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })).withFaceLandmarks().withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          const primaryEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
          setDetectedEmotion(primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1));

          if (canvasRef.current) {
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            // We will not draw the boxes in the final version for a cleaner look
            // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            // faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
          }
        } else {
          setDetectedEmotion('Looking for face...');
        }
      }
    }, 400); // Interval for detection
  };

  // Start video once models are loaded
  useEffect(() => {
    if (!loading.models) {
      startVideo();
    }
  }, [loading.models]);

  // Cleanup function to stop video stream and clear interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const isLoading = loading.models || loading.camera;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-gray-800">Real-Time Mood Check-in</h2>
        <p className="text-sm text-gray-500 mt-1 mb-4">Position your face in the camera frame.</p>

        <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden mx-auto">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-50 text-white">
              <LoadingSpinner />
              <p className="mt-4">{loading.models ? "Loading AI models..." : "Starting camera..."}</p>
            </div>
          )}
          {/* The onLoadedMetadata event is more reliable for starting the detection */}
          <video ref={videoRef} autoPlay muted onLoadedMetadata={handleVideoPlay} className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute top-0 left-0" />
        </div>

        <div className="mt-4 p-4 bg-teal-50 rounded-lg">
          <p className="text-sm text-gray-600">Detected Emotion:</p>
          <p className="text-3xl font-bold text-teal-600 transition-all">{detectedEmotion}</p>
        </div>

        <p className="text-xs text-gray-400 mt-4 italic">Disclaimer: This feature is for self-awareness and is not a medical diagnostic tool.</p>

        <button onClick={onClose} className="mt-4 flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-red-500 text-white font-bold py-3 px-4 rounded-full hover:bg-red-600 transition-colors">
          <StopIcon />
          <span>End Session</span>
        </button>
      </div>
    </div>
  );
}


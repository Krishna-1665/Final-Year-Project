import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";

export default function CandidatePage() {
  const webcamRef = useRef(null);
  const intervalRef = useRef(null);
 
  const [status, setStatus] = useState("Monitoring...");

  const email = "test@gmail.com"; // replace with logged-in user

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      captureFrame();
   // ✅ UPDATE LIVE USER STATUS
fetch(`http://${window.location.hostname}:5000/api/live`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: email,
    name: "Candidate",
    currentQuestion: 1,
    isCompleted: false
  })
});
    }, 3000); // every 3 sec

    return () => clearInterval(intervalRef.current);
  }, []);

const captureFrame = () => {
  const imageSrc = webcamRef.current.getScreenshot();

  if (!imageSrc) return;

  // ✅ 1. SEND FRAME TO BACKEND (SAVE IMAGE)
  fetch(`http://${window.location.hostname}:5000/api/upload-frame`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      image: imageSrc,
      email: email,
      name: "Candidate"
    })
  });

  // ✅ 2. ANALYZE FRAME (CHEATING DETECTION)
  
};

  
 

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Live Proctoring</h2>

      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400}
      />

      <h3>Status: {status}</h3>
      
    </div>
  );
}
import React, { useEffect, useRef } from "react";

const WebcamPreview = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: false })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Webcam error:", err);
        alert("Please allow camera access.");
      });

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      style={{
        width: "100%",
        borderRadius: "10px",
        border: "1px solid #ccc",
        transform: "scaleX(-1)", // ✅ Fix mirror
      }}
    />
  );
};

export default WebcamPreview;

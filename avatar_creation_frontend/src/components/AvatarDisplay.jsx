import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WebcamPreview from "./webcamPreview";

import avatarImage from "../assets/avatar_interviewer.png";

const API_BASE_URL = "http://localhost:5000";

const AvatarDisplay = () => {
  const navigate = useNavigate();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200);
  const [skippedQuestions, setSkippedQuestions] = useState([]);

  useEffect(() => {
    if (interviewStarted) fetchQuestions();
  }, [interviewStarted]);

  useEffect(() => {
    if (!interviewStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [interviewStarted]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      const data = await response.json();
      if (response.ok) setQuestions(data);
    } catch {
      alert("Backend not running on port 5000");
    }
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          question_id: questions[currentIndex]?.question_id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        const score = Number(data.predicted_score || 0);
        setTotalScore((prev) => prev + score);
        setAnsweredCount((prev) => prev + 1);
        setAnswer("");
        goToNextQuestion();
      } else {
        alert(data.message || "Submission failed");
      }
    } catch {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (loading) return;
    const qid = questions[currentIndex]?.question_id;
    setSkippedQuestions((prev) => [...prev, qid]);
    goToNextQuestion();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!interviewStarted) {
    return (
      <div style={styles.startContainer}>
        <h1>Welcome to HireVision Interview</h1>
        <p style={{ marginTop: "15px" }}>Your AI interviewer is ready.</p>
        <h3 style={{ marginTop: "20px", color: "#4CAF50" }}>Best of Luck 👍</h3>
        <button style={styles.startButton} onClick={() => setInterviewStarted(true)}>
          Start Interview
        </button>
      </div>
    );
  }

  if (interviewStarted && questions.length === 0) {
    return <h2 style={{ textAlign: "center", marginTop: "100px" }}>Loading Questions...</h2>;
  }

  if (showResult) {
    const isSelected = totalScore >= 10;
    return (
      <div style={styles.resultContainer}>
        <h2>Final Result</h2>
        <p>Total Questions: {questions.length}</p>
        <p>Answered Questions: {answeredCount}</p>
        <p>Skipped Questions: {skippedQuestions.length}</p>
        <h3>Total Marks: {totalScore}</h3>
        <h2 style={{ color: isSelected ? "green" : "red" }}>
          {isSelected ? "You are Selected ✅" : "You are Rejected ❌"}
        </h2>
        <button style={styles.homeButton} onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  // ================= INTERVIEW SCREEN =================
  return (
    <div style={styles.container}>

      {/* ✅ ADDED TOP BAR (ONLY ADDITION) */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ textAlign: "center" }}>
          <img
            src={avatarImage}
            alt="Avatar"
            style={{ width: "80px", borderRadius: "50%", border: "2px solid #1e90ff" }}
          />
          <p style={{ fontSize: "12px" }}>AI Interviewer</p>
        </div>
        <div style={{ width: "150px" }}>
          <WebcamPreview />
        </div>
      </div>
      {/* ✅ END ADDITION */}

      <h2>Virtual Interview Assistant</h2>

      <h3 style={{ color: timeLeft < 60 ? "red" : "black" }}>
        Time Remaining: {formatTime(timeLeft)}
      </h3>

      <h4>Question {currentIndex + 1}</h4>
      <p>{questions[currentIndex]?.question}</p>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows="4"
          style={styles.textarea}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: 12 }}>
          <button type="submit" disabled={loading} style={{ ...styles.button, backgroundColor: "#1e90ff", color: "#fff" }}>
            {loading ? "Submitting..." : "Submit Answer"}
          </button>

          <button type="button" onClick={handleSkip} disabled={loading} style={{ ...styles.button, backgroundColor: "#888", color: "#fff" }}>
            Skip Question
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  startContainer: { maxWidth: "500px", margin: "100px auto", padding: "40px", textAlign: "center", border: "1px solid #ddd", borderRadius: "12px", backgroundColor: "#ffffff" },
  startButton: { marginTop: "25px", padding: "12px 25px", fontSize: "16px", cursor: "pointer", backgroundColor: "#1e90ff", color: "white", border: "none", borderRadius: "6px" },
  container: { maxWidth: "600px", margin: "50px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" },
  textarea: { width: "100%", padding: "10px", marginTop: "10px" },
  button: { marginTop: "10px", padding: "8px 16px", cursor: "pointer", borderRadius: 6, border: "none" },
  resultContainer: { maxWidth: "500px", margin: "80px auto", padding: "30px", border: "1px solid #ccc", borderRadius: "12px", textAlign: "center" },
  homeButton: { marginTop: "20px", padding: "10px 20px", cursor: "pointer" },
};

export default AvatarDisplay;





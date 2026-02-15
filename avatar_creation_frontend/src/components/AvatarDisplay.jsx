import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes

  // optionally keep track of skipped questions if you want to review later
  const [skippedQuestions, setSkippedQuestions] = useState([]);

  useEffect(() => {
    if (interviewStarted) {
      fetchQuestions();
    }
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
      if (response.ok) {
        setQuestions(data);
      }
    } catch (error) {
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
          answer: answer,
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
        // show server message if available
        alert(data.message || "Submission failed");
      }
    } catch (error) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // NEW: handle skip
  const handleSkip = async () => {
    // prevent skipping while submit is in progress
    if (loading) return;

    // optional: record skipped question client-side for review
    const qid = questions[currentIndex]?.question_id;
    setSkippedQuestions((prev) => [...prev, qid]);

    // Optionally notify backend that question was skipped (uncomment if you add endpoint)
    // try {
    //   await fetch(`${API_BASE_URL}/api/skip-question`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ question_id: qid }),
    //   });
    // } catch (err) {
    //   console.warn("Failed to record skip on backend:", err);
    // }

    // Move to next question
    goToNextQuestion();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ================= START SCREEN =================
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

  // ================= LOADING SCREEN =================
  if (interviewStarted && questions.length === 0) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Loading Questions...</h2>
      </div>
    );
  }

  // ================= RESULT SCREEN =================
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
          {isSelected
            ? "Thank you for your response — you will receive a phone call within a few hours ✅"
            : "We will let you know"}
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
          required={false} // allow empty if user wants to skip
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: 12 }}>
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.button, backgroundColor: "#1e90ff", color: "#fff" }}
          >
            {loading ? "Submitting..." : "Submit Answer"}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            style={{ ...styles.button, backgroundColor: "#888", color: "#fff" }}
            title="Skip this question and move to the next"
          >
            Skip Question
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  startContainer: {
    maxWidth: "500px",
    margin: "100px auto",
    padding: "40px",
    textAlign: "center",
    border: "1px solid #ddd",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },
  startButton: {
    marginTop: "25px",
    padding: "12px 25px",
    fontSize: "16px",
    cursor: "pointer",
    backgroundColor: "#1e90ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
  },
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    textAlign: "center",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    marginTop: "10px",
  },
  button: {
    marginTop: "10px",
    padding: "8px 16px",
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
  },
  resultContainer: {
    maxWidth: "500px",
    margin: "80px auto",
    padding: "30px",
    border: "1px solid #ccc",
    borderRadius: "12px",
    textAlign: "center",
  },
  homeButton: {
    marginTop: "20px",
    padding: "10px 20px",
    cursor: "pointer",
  },
};

export default AvatarDisplay;

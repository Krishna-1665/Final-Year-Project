import React, { useState } from "react";
import AvatarDisplay from "./components/AvatarDisplay";
import "./App.css";

function App() {
  const PASS_MARKS = 12;

  const [stage, setStage] = useState("home"); // home | interview | result
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Start interview: fetch 10 unique questions
  const startInterview = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/questions");
      const data = await res.json();

      setQuestions(data);
      setCurrentIndex(0);
      setTotalMarks(0);
      setAnsweredCount(0);
      setAnswer("");
      setStage("interview");
    } catch (err) {
      console.error(err);
      alert("Backend not reachable!");
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please write an answer first.");
      return;
    }

    const currentQuestion = questions[currentIndex];

    const res = await fetch("http://127.0.0.1:5000/api/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_id: currentQuestion.question_id,
        answer: answer,
      }),
    });

    const data = await res.json();

    // Update score
    setTotalMarks((prev) => prev + data.predicted_score);
    setAnsweredCount((prev) => prev + 1);
    setAnswer("");

    // Next or finish
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setStage("result");
    }
  };

  const isPassed = totalMarks >= PASS_MARKS;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4">
      {stage === "home" && <AvatarDisplay onStartInterview={startInterview} />}

      {stage === "interview" && questions.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">
            Question {currentIndex + 1} of {questions.length}
          </h2>

          <p className="mb-4">{questions[currentIndex].question}</p>

          <textarea
            className="w-full border p-2 rounded mb-4"
            rows="4"
            placeholder="Type your answer here..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />

          <button
            onClick={submitAnswer}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {currentIndex + 1 === questions.length
              ? "Finish Interview"
              : "Next"}
          </button>
        </div>
      )}

      {stage === "result" && (
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Final Result</h2>

          <p className="text-lg">Total Questions: {questions.length}</p>
          <p className="text-lg">Answered Questions: {answeredCount}</p>
          <p className="text-lg font-semibold mt-2">
            Total Marks: {totalMarks}
          </p>

          <p
            className={`text-xl font-bold mt-4 ${
              isPassed ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPassed ? "You are Selected ✅" : "You are Rejected ❌"}
          </p>

          <button
            onClick={() => setStage("home")}
            className="mt-6 bg-slate-600 text-white py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

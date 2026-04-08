import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Timer, CheckCircle2, ArrowRight, Home, BrainCircuit, MessageSquare, AlertCircle, FastForward, Send, ShieldCheck } from 'lucide-react';
import avatarInterviewer from "../assets/avatars/avatar_interviewer.png";
import TechAvatar from "../assets/avatars/Sweta.png";
import DatasetAvatar from "../assets/avatars/Krishna.png";
import AiMLAvatar from "../assets/avatars/Rahul.png";
import ProgrammingAvatar from "../assets/avatars/Arpita.png";
import Careerguide from "../assets/avatars/Prakash.png";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";

const API_BASE_URL = "http://localhost:5000";

const AvatarDisplay = () => {
  const navigate = useNavigate();

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [totalScore, setTotalScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const isLowTime = timeLeft < 60;
  const interviewPanel = [
    {
      name: "Rashita",
      role: "HR Interviewer",
      image: avatarInterviewer
    },
    {
      name: "Sweta",
      role: "Technical Interviewer",
      image: TechAvatar
    },
    {
      name: "Krishna",
      role: "Database Interviewer",
      image: DatasetAvatar
    },
    {
      name: "Rahul",
      role: "AI/ML Interviewer",
      image: AiMLAvatar
    },
    {
      name: "Arpita",
      role: "Programming Interviewer",
      image: ProgrammingAvatar
    }
  ];
  const [activeAvatar, setActiveAvatar] = useState(0);
  const currentAvatar = interviewPanel[activeAvatar] || interviewPanel[0];


  console.log("INDEX:", activeAvatar);
  console.log("CATEGORY:", questions[currentIndex]?.category || "Loading...");
  console.log("NAME:", currentAvatar.name);
  // Map category → avatar index
  const categoryAvatarMap = {
    HR: 0,
    Technical: 1,
    Database: 2,
    "AI/ML": 3,
    Programming: 4
  };
  // ✅ FETCH QUESTIONS ONLY AFTER INTERVIEW STARTS
  useEffect(() => {
    if (interviewStarted) fetchQuestions();
  }, [interviewStarted]);

  useEffect(() => {
    if (!interviewStarted || showResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true); // End interview automatically
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [interviewStarted, showResult]);
  useEffect(() => {
    if (questions.length > 0) {
      const category = questions[currentIndex]?.category;

      if (category in categoryAvatarMap) {
        setActiveAvatar(categoryAvatarMap[category]);
      }
    }
  }, [currentIndex, questions]);
  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
        setSessionId(data.session_id);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!answer.trim() || !sessionId) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/submit-answer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answer: answer,
            question_id: questions[currentIndex]?.question_id,
            session_id: sessionId
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const score = Number(data.predicted_score || 0);
        setTotalScore((prev) => prev + score);
        setAnsweredCount((prev) => prev + 1);
        setAnswer("");

        if (currentIndex < questions.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setShowResult(true);
        }
      }
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setAnswer("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };


  // ================= START SCREEN / PORTAL =================
  if (!interviewStarted) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#0f172a] text-white">
        {/* Left Branding Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-[25%] bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] p-12 flex flex-col justify-between border-r border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px]"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BrainCircuit className="text-white w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">HireVision</span>
            </div>

            <div className="max-w-md">
              <h1 className="text-5xl font-black text-white leading-tight mb-8">
                Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Portal</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-10">
                Experience our professional AI-driven interview assessment. Your path to excellence starts here.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-6 h-6 rounded-full border border-blue-500/50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-semibold">Real-time AI Feedback</span>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <div className="w-6 h-6 rounded-full border border-blue-500/50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="font-semibold">Behavioral Analysis</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/10">
            <p className="text-slate-500 text-sm">
              &copy; 2026 HireVision AI. Professional Suite.
            </p>
          </div>
        </motion.div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white flex items-center justify-center p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-[-20%] right-[-20%] w-full h-full bg-blue-500 rounded-full blur-[120px]"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-4xl text-center relative z-10"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-2">Welcome to your Session</h2>
            <p className="text-slate-500 mb-12 text-lg">Your AI interviewers is ready to begin.</p>



            {/* Interview Panel */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col items-center gap-8 min-h-[420px]">

              {/* 🔼 AVATAR PANEL (TOP) */}
              <div className="w-full flex flex-col items-center">

                <h3 className="text-lg font-bold text-slate-900 mb-6">
                  Interview Panel
                </h3>

                <div className="flex justify-center gap-7 flex-wrap">
                  {interviewPanel.map((member, index) => (
                    <div key={index} className="flex flex-col items-center">

                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400 shadow-md">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <p className="text-sm font-bold mt-2 text-slate-700">
                        {member.name}
                      </p>

                      <p className="text-[13px] text-slate-500 text-center">
                        {member.role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 🔽 START INTERVIEW SECTION (BOTTOM) */}
              <div className="w-full max-w-md flex flex-col items-center gap-5">

                <div className="flex items-center gap-2 text-slate-600">
                  <Timer className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-lg">20 Minutes Session</span>
                </div>

                <p className="text-slate-400 text-center">
                  Please ensure you are in a quiet environment and have a stable connection.
                </p>

                <button
                  onClick={() => setInterviewStarted(true)}
                  className="w-full h-14 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition"
                >
                  Start My Interview
                </button>

                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  Secured by HireVision
                </p>
              </div>

            </div>







          </motion.div>
        </div>
      </div>
    );
  }

  if (interviewStarted && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans bg-[#020617] text-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold">Preparing Your Interview Environment...</h2>
        </div>
      </div>
    );
  }

  if (showResult) {
    const isSelected = totalScore >= 10;
    return (
      <div className="min-h-screen flex items-center justify-center p-6 font-sans bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg p-10 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative z-10 text-center"
        >
          <h2 className="text-3xl font-black text-white mb-8 font-display">Interview Complete</h2>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-bold">Answered</p>
              <p className="text-2xl font-black text-white">{answeredCount}/{questions.length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-slate-500 text-sm mb-1 uppercase tracking-wider font-bold">Total Score</p>
              <p className="text-2xl font-black text-blue-400">{totalScore}</p>
            </div>
          </div>

          <div className={`p-8 rounded-3xl mb-10 ${isSelected ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border`}>
            {isSelected ? (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-white w-10 h-10" />
                </div>
                <h2 className="text-3xl font-black text-green-400">We will let know</h2>
                <p className="text-green-200/70 mt-2 font-medium">Congratulations! You've passed the assessment.</p>
              </>
            ) : (
              <>

                <h2 className="text-3xl font-black text-white">We will let you know</h2>

              </>
            )}
          </div>


          <div className="space-y-4">
            {/* Career Guidance Question */}
            <p className="text-slate-300 font-semibold">
              Would you like Career Guidance?
            </p>

            <div className="flex gap-4">
              {/* YES BUTTON */}
              <button
                onClick={() => navigate(`/career-guidance?session_id=${sessionId}`)}
                className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition"
              >
                Yes
              </button>

              {/* NO BUTTON */}
              <button
                onClick={() => navigate("/login")}
                className="flex-1 h-12 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-bold transition"
              >
                No
              </button>
            </div>

            {/* Back Home (optional) */}
            <button
              onClick={() => navigate("/login")}
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold mt-2"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ================= INTERVIEW SESSION VIEW =================
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#0f172a] text-white">
      {/* Left Branding Sidebar (Same as Start screen) */}
      <div className="absolute top-55 right-15 z-20 w-48 h-36 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-black">
        <Webcam
          audio={false}
          mirrored={false}
          className="w-full h-full object-cover"
          videoConstraints={{
            width: 400,
            height: 300,
            facingMode: "user"
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex md:w-[22%] bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] p-10 flex-col justify-between border-r border-white/5 relative overflow-hidden"
      >
        <div className="absolute top-10 right-20 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-1 mb-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BrainCircuit className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">HireVision</span>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white leading-tight">Session <span className="text-blue-400">Live</span></h2>
              <p className="text-slate-400 leading-relaxed italic uppercase font-bold tracking-widest text-[10px]">
                Please maintain professional conduct throughout the session.
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-2 backdrop-blur-sm">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Live Progress</h3>
              <div className="space-y-4">
                {questions.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-colors ${idx === currentIndex ? 'bg-blue-600 text-white ring-4 ring-blue-600/20 shadow-lg shadow-blue-500/20' : idx < currentIndex ? 'bg-green-600/20 text-green-500 border border-green-600/30' : 'bg-white/5 text-slate-500 border border-white/5'}`}>
                      {idx < currentIndex ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold tracking-tight ${idx === currentIndex ? 'text-white' : 'text-slate-500'}`}>Question {idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


      </motion.div>

      {/* Main Content Area (White background style) */}
      <div className="flex-1 bg-slate-50 flex items-center justify-left p-2 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl top-0 relative z-10 flex flex-col items-center"
        >

          <div className="w-full bg-white rounded-[2.5rem] p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col md:flex-row overflow-hidden min-h-[500px]">

            <div className="flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="relative mb-4">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={currentAvatar.image}
                    alt={currentAvatar.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Online Dot */}
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              {/* Name */}
              <h3 className="text-2xl font-bold text-slate-900 text-center">
                {currentAvatar.name}
              </h3>

              {/* Role (single line) */}
              <p className="text-sm text-slate-600 whitespace-nowrap">
                {currentAvatar.role}
              </p>

              {/* Divider Line */}
              <div className="w-40 h-[1px] bg-slate-300 mt-4"></div>

              {/* Verified */}
              <div className="mt-3 flex items-center gap-2 text-slate-400 text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>VERIFIED EXPERT</span>
              </div>

            </div>
            {/* Conversation/Input Area */}
            <div className="flex-1 p-8 md:p-12 flex flex-col gap-8 bg-white relative">
              {/* Question Bubble */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Inquiry</span>
                </div>
                <div className="p-8 rounded-[2rem] rounded-tl-none bg-blue-50/50 border border-blue-100/50 text-slate-800 text-xl font-medium leading-relaxed shadow-sm">
                  {questions[currentIndex]?.question || "Loading question..."}
                </div>
              </div>

              {/* Answer Input */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1 text-slate-400">
                  <Send className="w-6 h-4 rotate-45" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Your Response</span>
                </div>
                <textarea
                  placeholder="Type your response here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  className="w-full h-full min-h-[150px] p-8 rounded-[2rem] bg-slate-50/50 border border-slate-200 text-slate-800 text-base placeholder:text-slate-400 placeholder:italic focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 transition-all duration-300 resize-none leading-relaxed shadow-inner"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !answer.trim()}
                  className="flex-1 h-14 flex items-center justify-center rounded-2xl text-base font-black tracking-tight text-white bg-[#e11d48] hover:bg-[#be123c] shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <button
                  onClick={handleSkip}
                  disabled={loading}
                  className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 disabled:opacity-50"
                  title="Skip Question"
                >
                  <FastForward className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-8 text-slate-400 font-bold tracking-widest uppercase text-[9px]">
            Professional Assessment Interface &bull; Powered by HireVision AI
          </p>

        </motion.div>
      </div>
      <div className="absolute top-97 right-32 z-20 flex items-center gap-5 bg-white border border-slate-200 px-5 py-2 rounded-full shadow-md">
        <Timer className="w-10 h-10 text-red-500 animate-pulse" />
        <span className={`font-mono font-bold ${isLowTime ? "text-red-500" : "text-slate-900"}`}>
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  );
};

export default AvatarDisplay;





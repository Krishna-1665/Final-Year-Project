import React, { useState } from 'react';
import { ArrowRight, Settings, MessageSquare, Send, Sparkles, RefreshCw } from 'lucide-react';
import avatarImage from '../assets/avatar_interviewer.png';

const AvatarDisplay = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [aiGreeting, setAiGreeting] = useState("Hello! I'm Shweta. I'll be guiding you through your interview today. We'll focus on your technical skills and project experiences.");

  const handleStart = () => {
    setIsStarted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedback(data);
        if (data.ai_response) {
          setAiGreeting(data.ai_response);
        }
      } else {
        console.error('Prediction failed:', data.error);
        alert(data.error || 'Failed to get feedback from AI.');
      }
    } catch (err) {
      console.error('Error connecting to backend:', err);
      alert('Could not connect to the interview backend. Please ensure it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setIsStarted(false);
    setAnswer('');
    setFeedback(null);
    setAiGreeting("Hello! I'm Shweta. I'll be guiding you through your interview today. We'll focus on your technical skills and project experiences.");
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Left Side - Avatar Image Section */}
        <div className="md:w-2/5 bg-slate-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Decorative background effects */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[20%] right-[-10%] w-[200px] h-[200px] bg-pink-600 rounded-full blur-[60px]"></div>
            <div className="absolute top-[-10%] left-[-10%] w-[150px] h-[150px] bg-indigo-600 rounded-full blur-[50px]"></div>
          </div>

          <div className="relative z-10 group">
            <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full opacity-75 group-hover:opacity-100 transition duration-500 blur-sm"></div>
            <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl transform transition-transform duration-500 group-hover:scale-105">
              <img
                src={avatarImage}
                alt="Professional Interview Host Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-lg animate-pulse"></div>
          </div>

          <div className="mt-6 text-center z-10">
            <h2 className="text-xl font-black text-slate-900 font-display">Shweta</h2>
            <p className="text-xs font-bold text-pink-600 uppercase tracking-widest mt-1">Senior HR Interviewer</p>
          </div>
        </div>

        {/* Right Side - Content Section */}
        <div className="md:w-3/5 p-8 flex flex-col bg-white">
          {!isStarted ? (
            <div className="flex flex-col h-full justify-center">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                  Live Simulation Ready
                </div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 font-display">
                  Ready to showcase your <span className="text-pink-600">potential?</span>
                </h3>
                <p className="text-slate-500 text-lg leading-relaxed italic">
                  "{aiGreeting}"
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={handleStart}
                  className="flex-1 h-[54px] flex items-center justify-center gap-2 rounded-2xl text-base font-bold text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-500/20 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-pink-600/20"
                >
                  Start Interview
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  className="px-6 h-[54px] flex items-center justify-center rounded-2xl text-base font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
              <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {aiGreeting}
                  </p>
                </div>
              </div>

              {/* Feedback section removed as per request */}

              <form onSubmit={handleSubmit} className="mt-auto space-y-4">
                <div className="relative">
                  <textarea
                    rows="3"
                    className="block w-full p-4 border border-slate-200 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition-all duration-200 resize-none text-sm"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={loading}
                  ></textarea>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading || !answer.trim()}
                    className="flex-1 h-[50px] flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 disabled:opacity-50 transition-all duration-200 shadow-lg shadow-pink-600/10"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Submit Answer</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetSession}
                    className="w-12 h-[50px] flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarDisplay;

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import AvatarDisplay from './components/AvatarDisplay';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import './App.css';
import WebcamPreview from "./components/webcamPreview";


const AvatarPage = () => (
  <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans">
    {/* Left Section - Hero/Branding (Consistent with Auth) */}
    <div className="hidden md:flex md:w-1/3 bg-[#0F172A] relative overflow-hidden flex-col justify-between p-10">
      <div className="absolute top-0 right-0 w-full h-full opacity-25 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-pink-600 rounded-full blur-[100px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-indigo-600 rounded-full blur-[80px]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Lock className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight font-display">HireVision</span>
        </div>

        <div className="max-w-xs">
          <h1 className="text-4xl font-black text-white leading-[1.1] mb-6 font-display">
            Interview <span className="text-pink-400">Portal</span>
          </h1>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Experience our professional AI-driven interview assessment. Your path to excellence starts here.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-pink-500" />
              <span className="font-medium text-sm">Real-time AI Feedback</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-pink-500" />
              <span className="font-medium text-sm">Behavioral Analysis</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 pt-8 border-t border-white/10">
        <p className="text-slate-500 text-xs">
          &copy; 2026 HireVision AI. Professional Suite.
        </p>
      </div>
    </div>

    {/* Right Section - Interview Panel */}
    <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
      <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-2 font-display">Welcome to your Session</h2>
          <p className="text-slate-500">Your AI interviewer is ready to begin.</p>
        </div>

        <AvatarDisplay />

        <div className="mt-12 flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 grayscale">
          {/* Logo cloud or trust signals could go here */}
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Secured by HireVision AI Guard</span>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/avatar" element={<AvatarPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

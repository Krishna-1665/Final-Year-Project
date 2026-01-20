import React from 'react';
import avatarImage from '../assets/avatar_interviewer.png';

const AvatarDisplay = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl shadow-lg max-w-md mx-auto border border-slate-100">
      <div className="relative mb-4 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
        <img 
          src={avatarImage} 
          alt="Professional Interview Host Avatar" 
          className="relative w-48 h-48 rounded-full object-cover border-4 border-white shadow-md transform transition duration-500 hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" title="Active"></div>
      </div>
      
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Shweta Sinha </h2>
        <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Senior HR Interviewer</p>
        <div className="h-1 w-16 bg-indigo-100 mx-auto rounded-full my-3"></div>
        <p className="text-slate-600 text-sm leading-relaxed px-4">
          "Hello! I'm here to conduct your interview today. I'm looking forward to learning more about your skills and experiences."
        </p>
      </div>

      <div className="mt-6 flex space-x-3 w-full">
        <button className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Start Interview
        </button>
        <button className="py-2 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2">
           Settings
        </button>
      </div>
    </div>
  );
};

export default AvatarDisplay;

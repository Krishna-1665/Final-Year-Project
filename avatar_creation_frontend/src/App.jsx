import React from 'react';
import AvatarDisplay from './components/AvatarDisplay';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
            Virtual Interview Platform
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Professional AI-driven interview assessment
          </p>
        </div>
        <AvatarDisplay />
      </div>
    </div>
  );
}

export default App;

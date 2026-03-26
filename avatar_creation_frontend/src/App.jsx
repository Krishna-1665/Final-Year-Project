import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/Auth/SignUp";
import Login from "./components/Auth/Login";
import AvatarDisplay from "./components/AvatarDisplay";
import CareerGuidance from "./components/CareerGuidance";

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/avatar" element={<AvatarDisplay />} />
        <Route path="/career-guidance" element={<CareerGuidance />} />
      </Routes>
    </Router>
  );
}

export default App;

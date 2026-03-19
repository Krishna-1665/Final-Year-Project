import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./components/Auth/SignUp";
import Login from "./components/Auth/Login";
import AvatarDisplay from "./components/AvatarDisplay";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/avatar" element={<AvatarDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;

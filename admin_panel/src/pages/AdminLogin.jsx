import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const AdminLogin = () => {
  const navigate = useNavigate();

  const emailRef = useRef();
  const passwordRef = useRef();

  const handleLogin = () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    // 👉 You can connect backend later
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Admin Login</h2>

        {/* EMAIL */}
        <input
          ref={emailRef}
          type="email"
          placeholder="Enter Email"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              passwordRef.current.focus(); // 🔥 move to password
            }
          }}
        />

        {/* PASSWORD */}
        <input
          ref={passwordRef}
          type="password"
          placeholder="Enter Password"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin(); // 🔥 press enter → login
            }
          }}
        />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default AdminLogin;
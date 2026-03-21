import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TechAvatar from "../assets/avatars/Sweta.png";
import DatasetAvatar from "../assets/avatars/Krishna.png";
import AiMLAvatar from "../assets/avatars/Rahul.png";
import managerAvatar from "../assets/avatars/Arpita.png";

const CareerGuidance = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const score = location.state?.score || 0;

    // 🎯 Decide feedback based on score
    let feedback = "";
    let avatar = TechAvatar;
    let role = "";

    if (score >= 15) {
        feedback = "Excellent performance! You are ready for advanced roles like AI/ML Engineer.";
        avatar = AiMLAvatar;
        role = "AI/ML Expert";
    } else if (score >= 10) {
        feedback = "Good job! You can target Software Development or Data Analyst roles.";
        avatar = DatasetAvatar;
        role = "Data Analyst";
    } else if (score >= 5) {
        feedback = "You need improvement. Focus on basics and practice more.";
        avatar = TechAvatar;
        role = "Technical Mentor";
    } else {
        feedback = "You should start from fundamentals and build strong concepts.";
        avatar = managerAvatar;
        role = "Career Mentor";
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white p-6">
            <div className="max-w-xl w-full bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 text-center">

                <h2 className="text-3xl font-black mb-6">Career Guidance</h2>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={avatar}
                        alt="avatar"
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    />
                    <h3 className="mt-4 text-xl font-bold">{role}</h3>
                </div>

                {/* Feedback */}
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    {feedback}
                </p>

                {/* Score */}
                <p className="text-blue-400 font-bold mb-6">
                    Your Score: {score}
                </p>

                {/* Button */}
                <button
                    onClick={() => navigate("/")}
                    className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default CareerGuidance;
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TechAvatar from "../assets/avatars/Sweta.png";
import DatasetAvatar from "../assets/avatars/Krishna.png";
import AiMLAvatar from "../assets/avatars/Rahul.png";
import managerAvatar from "../assets/avatars/Arpita.png";
import Careerguide from "../assets/avatars/Prakash.png";



const CareerGuidance = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const sessionId = searchParams.get("session_id");

    const [scores, setScores] = React.useState({});
    const [bestCategory, setBestCategory] = React.useState("");
    const [guidance, setGuidance] = React.useState("");
    const totalScore = location.state?.totalScore || 0;

    React.useEffect(() => {
        const fetchGuidance = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/career-guidance?session_id=${sessionId}`);
                const data = await res.json();

                setScores(data.category_scores);
                setBestCategory(data.best_category);
                setGuidance(data.career_guidance);

            } catch (err) {
                console.error("Error fetching guidance:", err);
            }
        };

        fetchGuidance();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] text-white p-6">
            <div className="max-w-xl w-full bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 text-center">

                <h2 className="text-3xl font-black mb-6">Career Guidance</h2>

                <div className="flex flex-col items-center mb-6">
                    <img
                        src={Careerguide}
                        alt="avatar"
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                    />
                    <h3 className="mt-4 text-xl font-bold">Hii I am  your career guide</h3>
                </div>

                <div className="mb-6 text-left">
                    <h3 className="text-lg font-bold mb-2">Your Performance:</h3>

                    <p>HR: {scores?.HR || 0}</p>
                    <p>Technical: {scores?.Technical || 0}</p>
                    <p>Programming: {scores?.Programming || 0}</p>
                    <p>Database: {scores?.Database || 0}</p>
                    <p>AI/ML: {scores?.["AI/ML"] || 0}</p>
                </div>
                {totalScore > 0 && bestCategory && (
                    <p className="text-green-400 font-semibold mt-2">
                        Strongest Area: {bestCategory}
                    </p>
                )}

                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                    {guidance}
                </p>

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
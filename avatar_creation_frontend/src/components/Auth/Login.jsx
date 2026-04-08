import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, Github, ArrowRight, Eye, EyeOff, BrainCircuit, CheckCircle2 } from "lucide-react"; // Kept CheckCircle2 as it's used in JSX
import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://127.0.0.1:5000/google-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });

            const data = await response.json();

           if (response.ok) {
    console.log('Google Login successful:', data);

    // 🔥 ADD THIS (VERY IMPORTANT)
    localStorage.setItem("user", JSON.stringify({
        name: data.user.name,
        email: data.user.email
    }));

    navigate('/avatar');
} else {
                setError(data.error || 'Google login failed.');
            }
        } catch (err) {
            console.error('Error during Google login:', err);
            setError('Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google Login was unsuccessful. Try again.');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

           if (response.ok) {
    console.log('Login successful:', data);

    // 🔥 ADD THIS (VERY IMPORTANT)
    localStorage.setItem("user", JSON.stringify({
        name: data.user.name,
        email: data.user.email
    }));

    navigate('/avatar');
} else {
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setError('Could not connect to the server. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans bg-[#0f172a] text-white overflow-hidden">
            {/* Left Decoration Sidebar */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden md:flex md:w-[40%] bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e1b4b] p-12 flex-col justify-between border-r border-white/5 relative overflow-hidden"
            >
                {/* Decorative background effects */}
                <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-16">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Lock className="text-white w-5 h-5" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tight font-display">HireVision</span>
                    </div>

                    <div className="max-w-md">
                        <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-8 font-display">
                            Ace Your Next <span className="text-blue-400">Interview</span> with AI Precision.
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-10">
                            A machine learning–based virtual interview assistant that analyzes responses, predicts performance scores, and helps candidates enhance their confidence through structured mock interviews.
                        </p>

                        <div className="space-y-4">
                            {[
                                "AI-powered answer evaluationn",
                                " Real-time scoring & feedback",
                                " Smart interview simulations"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                    <span className="font-medium text-slate-200">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 pt-10 border-t border-white/10">
                    <p className="text-slate-500 text-sm">
                        &copy; 2026 HireVision AI. All rights reserved.
                    </p>
                </div>
            </motion.div>

            {/* Right Login Sidebar */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                {/* Animated background blobs */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px] animate-pulse delay-700"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-md p-8 sm:p-12 rounded-[2.5rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-2xl relative z-10"
                >
                    <div className="md:hidden flex items-center gap-2 mb-10 justify-center">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Lock className="text-white w-4 h-4" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tight font-display">HireVision</span>
                    </div>

                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-3xl font-black text-white mb-3 font-display">Welcome Back</h2>
                        <p className="text-slate-400">Please enter your details to sign in.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-200 text-sm rounded-r-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="mt-0.5">✕</div>
                            <p className="font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 block ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-slate-300">Password</label>
                                <a href="#" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-400 text-slate-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl bg-white/5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 flex items-center justify-center rounded-2xl text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-blue-600/20 mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign in to Account</span>
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-slate-500 font-medium italic">or</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <div className="w-full bg-white/5 rounded-2xl p-1">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleError}
                                    theme="filled_black"
                                    size="large"
                                    text="signin_with"
                                    shape="circle"
                                    width="100%"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-slate-400 font-medium">
                            Don't have an account?{' '}
                            <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold transition-all hover:underline">
                                Create one for free
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  LockClosedIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.withCredentials = true;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Load email from localStorage if "Remember Me" was previously checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("Login response:", response.data);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      navigate("/otp-verify", { state: { email } });
    } catch (err) {
      console.error("Login error:", err.response);
      setError(
        typeof err.response?.data === "string"
          ? err.response?.data
          : err.response?.data?.error || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      await axios.post("http://localhost:5000/api/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      setError("OTP resent successfully");
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const googleAuthUrl = "http://localhost:5000/oauth2/authorization/google"; // Spring Security OAuth2 endpoint
      const width = 600;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      const authWindow = window.open(
        googleAuthUrl,
        "GoogleLogin",
        `width=${width},height=${height},top=${top},left=${left}`
      );

      // Poll to check if the window is closed and session is set
      const checkWindowClosed = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(checkWindowClosed);
          try {
            const response = await axios.get("http://localhost:5000/api/auth/check-session", {
              withCredentials: true,
            });
            console.log("Check session response:", response.data);
            if (response.data.id) {
              // Redirect to user profile page after successful Google login
              navigate(`/profile/${response.data.id}`);
            } else {
              setError("Google login failed: No user ID found.");
            }
          } catch (err) {
            console.error("Session check error:", err.response?.data || err.message);
            setError("Google login failed. Please try again.");
          } finally {
            setLoading(false);
          }
        }
      }, 500);
    } catch (error) {
      setError("Failed to initiate Google login");
      console.error("Google login error:", error);
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "backOut" },
    },
  };

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="w-full max-w-xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="p-8 border border-white shadow-2xl bg-white/50 backdrop-blur-lg rounded-3xl sm:p-10">
          <div className="mb-10 text-center">
            <motion.h2
              variants={itemVariants}
              className="mb-2 text-4xl font-bold text-transparent text-gray-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text"
            >
              Welcome Back
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="mt-2 font-medium text-gray-500"
            >
              Continue your learning journey
            </motion.p>
          </div>

          {error && (
            <motion.div
              variants={itemVariants}
              className={`mb-6 text-sm text-center ${error.includes("success") ? "text-green-600" : "text-red-600"}`}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="group w-full flex items-center justify-center gap-3 py-3.5 px-4 mb-8 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 hover:ring-indigo-200 transition-all duration-200"
          >
            <FcGoogle className="w-6 h-6" />
            <span className="font-medium text-gray-700 transition-colors group-hover:text-indigo-600">
              Continue with Google
            </span>
          </motion.button>

          <motion.div
            variants={itemVariants}
            className="flex items-center my-8"
          >
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm font-medium text-gray-400">
              or sign in with email
            </span>
            <div className="flex-1 border-t border-gray-200"></div>
          </motion.div>

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <motion.div variants={itemVariants}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute top-3.5 left-3 peer-focus:text-indigo-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 text-gray-900 placeholder-gray-400 bg-white/70 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all peer"
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-3.5 left-3 peer-focus:text-indigo-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-3.5 text-gray-900 placeholder-gray-400 bg-white/70 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all peer"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3.5 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  disabled={loading}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || !email || !password}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
              >
                Resend OTP
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full py-3.5 px-4 inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-indigo-100 transition-all duration-200"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            variants={itemVariants}
            className="mt-8 text-sm text-center text-gray-500"
          >
            Not a member?{" "}
            <a
              href="/signup"
              className="font-medium text-indigo-600 underline hover:text-indigo-500 underline-offset-4"
            >
              Start your free trial
            </a>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
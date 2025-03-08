import React from "react";
import { Navigate } from "react-router-dom";
import ExamCodeEntry from "../components/ExamCodeEntry";
import LoginButton from "../components/LoginButton";
import Navbar from "../components/Navbar";
import AnimatedBackground from "../components/AnimatedBackground";
import HexagonGrid from "../components/HexagonGrid";
import { useAuth } from "../services/auth";

const Index: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (isAuthenticated && !loading) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <div className="absolute inset-0 z-0">
        <AnimatedBackground />
      </div>
      <div className="absolute inset-0 z-[1]">
        <HexagonGrid />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 animate-slide-down">
              <h1 className="text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-400 to-blue-500">
                AbsoluteExamAI
              </h1>
              <div className="flex items-center justify-center gap-3 text-3xl font-light text-white/80 mb-8">
                <span>Fast.</span>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Safe.</span>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Simple.</span>
              </div>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Absolute Security, User-Enabled: Because Trust Starts
                with Control.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 animate-fade-in shadow-[0_8px_32px_rgba(76,29,149,0.1)]">
              <ExamCodeEntry />
              <LoginButton />
            </div>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
              {[
                {
                  title: "AI-Powered",
                  description:
                    "Advanced machine learning algorithms for automated assessment and question generation",
                  gradient: "from-purple-500/20 to-violet-500/20",
                  delay: "0s",
                },
                {
                  title: "Secure",
                  description:
                    "Enterprise-grade security with blockchain verification for exam integrity",
                  gradient: "from-blue-500/20 to-violet-500/20",
                  delay: "0.1s",
                },
                {
                  title: "Efficient",
                  description:
                    "Streamlined workflow for educators with real-time analytics and insights",
                  gradient: "from-violet-500/20 to-purple-500/20",
                  delay: "0.2s",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`backdrop-blur-xl bg-gradient-to-br ${feature.gradient} border border-white/10 rounded-2xl p-8 transition-all duration-500 hover:scale-105 hover:bg-white/5`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-600 rounded-lg transform rotate-45"></div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-0 left-0 right-0 z-10 backdrop-blur-xl bg-black/20 border-t border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-6">
              <span>© 2025 AbsoluteExamAI</span>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs">Powered by Absolute Tech</span>
              <div className="h-4 w-px bg-white/10"></div>
              <span className="text-xs italic">
                Your Rules, Your Exam: Unbreakable Security, Unmatched Accuracy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

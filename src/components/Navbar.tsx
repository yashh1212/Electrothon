import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../services/auth";
import { Button } from "./ui/button";
import { LogOut, User, FileText, LogIn, ShieldCheck } from "lucide-react";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout, login } = useAuth();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/10 animate-fade-in">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
              EM
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              ExamMaster
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/exams"
                  className={`text-sm font-medium ${
                    location.pathname === "/exams"
                      ? "text-white"
                      : "text-gray-200 hover:text-white"
                  } transition-colors`}
                >
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Exams</span>
                  </div>
                </Link>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium ${
                    location.pathname === "/dashboard"
                      ? "text-white"
                      : "text-gray-200 hover:text-white"
                  } transition-colors`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin"
                  className={`text-sm font-medium ${
                    location.pathname === "/admin"
                      ? "text-white"
                      : "text-gray-200 hover:text-white"
                  } transition-colors`}
                >
                  <div className="flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span>Admin</span>
                  </div>
                </Link>
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium flex items-center text-gray-200">
                    <User className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">
                      {user?.name || user?.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => logout()}
                    className="text-sm flex items-center text-gray-200 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden md:inline">Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="text-sm font-medium text-gray-200 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => login()}
                  className="text-sm flex items-center text-gray-200 hover:text-white hover:bg-white/10 border border-white/20 bg-white/5"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  <span>Login</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

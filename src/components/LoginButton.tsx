
import React from 'react';
import { useAuth } from '../services/auth';
import { Button } from './ui/button';
import { LogIn, Shield } from 'lucide-react';

const LoginButton: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div className="text-center mt-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <div className="mb-6">
        <div className="w-full border-t border-white/10 my-6"></div>
        <p className="text-gray-300 text-sm">Are you an exam administrator?</p>
      </div>
      
      <Button
        onClick={() => login()}
        disabled={loading}
        variant="outline"
        size="lg"
        className="h-14 px-8 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm text-white group"
      >
        <div className="mr-3 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Shield className="w-4 h-4 text-white" />
        </div>
        
        <span className="flex items-center">
          {loading ? 'Please wait...' : 'Sign in to Dashboard'}
          {!loading && <LogIn className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
        </span>
      </Button>
    </div>
  );
};

export default LoginButton;

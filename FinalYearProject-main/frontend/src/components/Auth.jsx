import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldAlert, ArrowRight, UserPlus, Fingerprint, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    const formEmail = email || e.target.querySelector('input[type="email"]')?.value || '';
    const formPassword = password || e.target.querySelector('input[type="password"]')?.value || '';

    if (!formEmail || !formPassword) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const res = await axios.post(endpoint, { email: formEmail, password: formPassword });
      
      if (isLogin) {
         onLogin();
      } else {
         setSuccessMsg(res.data.message || 'Registration successful! Please sign in.');
         setIsLogin(true);
         setPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication error.');
    } finally {
        setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md relative"
    >
      {/* Decorative Background Elements */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyber-blue/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyber-green/10 rounded-full blur-3xl" />
      
      <div className="backdrop-blur-xl bg-gray-900/60 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="inline-flex items-center justify-center p-4 bg-cyber-blue/10 border border-cyber-blue/20 rounded-2xl mb-4"
          >
            {isLogin ? <Fingerprint className="w-8 h-8 text-cyber-blue" /> : <UserPlus className="w-8 h-8 text-cyber-blue" />}
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-blue to-cyber-green">
             {isLogin ? 'Secure Access' : 'Initialize Identity'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
             {isLogin ? 'Authenticate to access SISA dashboard' : 'Create a new encrypted clearance profile'}
          </p>
        </div>

        {/* Alerts */}
        <AnimatePresence mode="wait">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-200">{error}</p>
                </motion.div>
            )}
            {successMsg && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-3 bg-cyber-green/10 border border-cyber-green/20 rounded-lg flex items-start space-x-3"
                >
                    <CheckCircle2 className="w-5 h-5 text-cyber-green mt-0.5 shrink-0" />
                    <p className="text-sm text-green-200">{successMsg}</p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Form elements */}
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyber-blue transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 focus:border-cyber-blue rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyber-blue transition-all"
                        placeholder="agent@sisa.gov"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Passphrase</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-cyber-blue transition-colors">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/40 border border-gray-700 focus:border-cyber-blue rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-cyber-blue transition-all tracking-widest font-mono"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(56,189,248,0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`w-full py-3 mt-4 flex items-center justify-center space-x-2 rounded-xl text-black font-semibold transition-all ${
                    loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyber-blue to-cyber-green hover:to-cyber-blue'
                }`}
            >
                <span>{loading ? 'Processing...' : (isLogin ? 'Authenticate' : 'Establish Profile')}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={toggleMode}
                disabled={loading}
                className="text-gray-400 hover:text-white text-sm transition-colors border-b border-transparent hover:border-white pb-0.5"
            >
                {isLogin ? "Don't have clearance? Request access." : "Already have clearance? Authenticate."}
            </button>
        </div>
      </div>
    </motion.div>
  );
};

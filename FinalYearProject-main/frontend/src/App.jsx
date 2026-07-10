import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dashboard } from './components/Dashboard';
import { DataInput } from './components/DataInput';
import { UnlearnPanel } from './components/UnlearnPanel';
import { ModelPrediction } from './components/ModelPrediction';
import { UserQuery } from './components/UserQuery';
import { ActivityLogs } from './components/ActivityLogs';
import { Auth } from './components/Auth';
import { PrivacyRegistry } from './components/PrivacyRegistry';
import { ShieldAlert, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock axios base URL for development against Flask (if not using Vite proxy purely)
axios.defaults.baseURL = 'http://localhost:5000';

function App() {
  const [data, setData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get('/api/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      // Poll for updates every 5 seconds to show active unlearning
      const interval = setInterval(fetchDashboardData, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cyber-dark text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background Ambient Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <Auth onLogin={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark text-white p-6 md:p-10">
      <header className="mb-10 flex items-center justify-between border-b border-gray-800 pb-6">
        <div className="flex items-center space-x-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="p-3 bg-cyber-blue/10 rounded-xl border border-cyber-blue/30"
          >
            <ShieldAlert className="w-8 h-8 text-cyber-blue" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-blue to-cyber-green">
              SISA Unlearning Engine
            </h1>
            <p className="text-gray-400 text-sm mt-1">Privacy-Preserving Machine Unlearning System</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-green"></span>
            </span>
            <span className="text-sm text-gray-400">System Online</span>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/30 rounded-lg text-sm text-gray-400 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        <Dashboard data={data} />
        
        {/* Full-width Persistent Privacy View */}
        <PrivacyRegistry records={data?.records || []} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <DataInput onUpdate={fetchDashboardData} />
            <UserQuery />
            <ModelPrediction />
          </div>
          <div className="space-y-6">
            <UnlearnPanel onUpdate={fetchDashboardData} />
            <ActivityLogs logs={data?.recent_logs || []} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import axios from 'axios';
import { Search, User } from 'lucide-react';

export const UserQuery = () => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;

    setLoading(true);
    setError('');
    setUserData(null);

    try {
      const res = await axios.get(`/api/user/${userId.trim()}`);
      setUserData(res.data);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setError('User not found');
      } else {
        setError('Error fetching user data');
      }
    }
    setLoading(false);
  };

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-cyber-green" />
        <h3 className="text-lg font-semibold">User Lookup</h3>
      </div>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1 text-left">Search by User ID</label>
          <div className="flex space-x-2">
            <input 
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-green transition-colors"
              placeholder="Enter User ID..."
              required
            />
            <Button type="submit" disabled={loading} className="px-6">
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {userData && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 flex items-center space-x-4">
              <div className="p-3 bg-cyber-green/10 rounded-lg">
                <User className="w-6 h-6 text-cyber-green" />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500 font-mono truncate mr-2" title={userData.user_id}>
                    ID: {userData.user_id}
                  </p>
                  <span className="px-2 py-0.5 bg-cyber-green/20 text-cyber-green text-[10px] uppercase tracking-wider rounded font-bold">
                    Profile Found
                  </span>
                </div>
                <div className="mt-1">
                  <span className="text-gray-400 text-sm">Associated Age: </span>
                  <span className="text-xl font-bold text-white">{userData.age}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </Card>
  );
};

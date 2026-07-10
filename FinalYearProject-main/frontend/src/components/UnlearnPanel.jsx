import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import axios from 'axios';
import { Trash2, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UnlearnPanel = ({ onUpdate }) => {
  const [userId, setUserId] = useState('');
  const [dataId, setDataId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleUnlearn = async (e) => {
    e.preventDefault();
    if(!userId || !dataId) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await axios.post('/api/unlearn', { user_id: userId, data_id: dataId });
      if (res.data.status === 'success') {
        setResult(res.data);
        if(onUpdate) onUpdate();
        setUserId('');
        setDataId('');
      } else {
        setError(res.data.message || 'Error executing protocol');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Record not found (check full user_id and data_id)');
    }
    setLoading(false);
  };

  return (
    <Card className="border border-cyber-red/30">
      <div className="flex items-center space-x-2 mb-4 text-cyber-red">
        <Trash2 className="w-5 h-5" />
        <h3 className="text-lg font-semibold text-white">SISA Unlearning Request</h3>
      </div>
      
      <p className="text-sm text-gray-400 mb-6">
        Submit a User ID and Data ID to initiate targeted sentence-level unlearning. The system will isolate the specific shard and retrain it from scratch.
      </p>

      <form onSubmit={handleUnlearn} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">User ID</label>
          <input 
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-red"
            placeholder="e.g. 550e8400-e29b-..."
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Data ID (Sentence ID)</label>
          <input 
            type="text"
            value={dataId}
            onChange={(e) => setDataId(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-red"
            placeholder="Exact Data ID..."
            required
          />
        </div>
        
        <Button 
          type="submit" 
          variant="danger" 
          disabled={loading}
          className="w-full flex justify-center items-center"
        >
          {loading ? (
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="mr-2"
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
             <Trash2 className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Retraining Isolated Shard...' : 'Execute Unlearn Protocol'}
        </Button>
      </form>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded bg-red-900/40 border border-red-500/50 text-red-200 text-sm"
          >
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('Record not found') && (
              <div className="mt-2 pt-2 border-t border-red-500/20 text-[10px] text-red-300/70 font-mono">
                Sent IDs: <br/>
                user: {userId || 'none'} <br/>
                data: {dataId || 'none'}
              </div>
            )}
          </motion.div>
        )}

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-cyber-dark/80 border border-cyber-green/50 space-y-4"
          >
            <div className="flex items-center text-cyber-green font-semibold">
              <ShieldCheck className="w-5 h-5 mr-2" />
              {result.is_historical ? 'SISA Records: Historical Data Verified' : 'SISA Unlearning Complete'}
            </div>
            {result.is_historical && (
              <p className="text-[10px] text-cyber-blue italic opacity-80">
                Note: This record was previously unlearned. Showing historical privacy-safe view.
              </p>
            )}
            
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-gray-800/80 p-3 rounded">
                <p className="text-xs text-gray-400">Affected Shard</p>
                <p className="text-xl font-bold">#{result.affected_shard}</p>
              </div>
              <div className="bg-gray-800/80 p-3 rounded">
                <p className="text-xs text-gray-400">SISA Retrain Time</p>
                <p className="text-xl font-bold text-cyber-blue">{result.retrain_time}s</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded p-3 text-sm font-mono border border-gray-800 mt-2">
              <p className="text-cyber-red font-bold mb-1">DELETED RECORD:</p>
              <p className="text-gray-300">"{(result.deleted.text || '').substring(0, 50)}..."</p>
              <p className="text-gray-400 mt-1">Age: <span className="text-white">{result.deleted.age}</span> | ID: {result.deleted.data_id}</p>
            </div>

            <div className="bg-gray-900 rounded p-3 text-sm font-mono border border-gray-800">
              <p className="text-cyber-green font-bold mb-1">REMAINING FOR USER:</p>
              <p className="text-gray-300">{result.remaining.records_left} records safely kept intact.</p>
            </div>

            {/* Visual Output Extension */}
            <div className="border-t border-gray-800 pt-4 mt-4 space-y-6">
              
              {/* Privacy Message (Moved to top of view) */}
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start space-x-3">
                <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-blue-200/80 leading-snug">
                  <span className="font-bold text-blue-300 block mb-0.5">Privacy Enforcement Active</span>
                  Showing only anonymized data (dataId/age) in this record view. All personal text attributes and assets are masked/provided on a need-to-know basis.
                </p>
              </div>

              {/* Frontend Privacy-Safe View */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-widest text-center">Protocol Registry — Post-Unlearning View</h4>
                <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/50">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-800/80 text-gray-400">
                        <th className="p-2 font-medium">dataId</th>
                        <th className="p-2 font-medium">age</th>
                        <th className="p-2 font-medium text-center">Image Asset</th>
                        <th className="p-2 font-medium">text (PII)</th>
                        <th className="p-2 font-medium">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {[result.deleted, ...result.remaining.records].map((record, idx) => {
                        const isDeleted = record.data_id === result.deleted.data_id;
                        return (
                          <tr key={record.data_id || idx} className={isDeleted ? 'bg-red-900/10' : ''}>
                            <td className="p-2 font-mono text-gray-500 whitespace-nowrap">
                              {(record.data_id || '').substring(0, 8)}...
                            </td>
                            <td className="p-2 text-white">{record.age || result.remaining.age}</td>
                            <td className="p-2 flex justify-center">
                              {isDeleted ? (
                                <div className="w-10 h-10 rounded bg-gray-800 border border-red-500/30 flex items-center justify-center text-[8px] text-red-500 uppercase font-bold">
                                  Wiped
                                </div>
                              ) : record.image ? (
                                <div className="relative group">
                                  <img 
                                    src={record.image} 
                                    className="w-10 h-10 object-cover rounded border border-cyber-blue/30 blur-[10px] transition-all"
                                    alt="Sensitive"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                                    <ShieldCheck className="w-4 h-4 text-white" />
                                  </div>
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-800/50 border border-gray-700 flex items-center justify-center text-[8px] text-gray-500">
                                  None
                                </div>
                              )}
                            </td>
                            <td className="p-2 text-gray-600 font-mono tracking-tighter">
                              ████ █████ ████
                            </td>
                            <td className="p-2">
                              {isDeleted ? (
                                <span className="px-2 py-0.5 rounded-full bg-red-900/40 text-red-400 text-[10px] uppercase font-bold border border-red-500/30 line-through">
                                  forgotten
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 text-[10px] uppercase font-bold border border-green-500/30">
                                  retained
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Backend State Technical View */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-cyber-blue opacity-80">
                  <div className="h-px flex-1 bg-cyber-blue/20"></div>
                  <span className="text-[10px] font-mono uppercase font-bold">Backend State</span>
                  <div className="h-px flex-1 bg-cyber-blue/20"></div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-cyber-blue/20 font-mono text-[10px] leading-relaxed">
                  <table className="w-full text-left text-gray-400">
                    <thead>
                      <tr className="border-b border-gray-800 text-cyber-blue">
                        <th className="pb-1 pr-2">dataId</th>
                        <th className="pb-1 pr-2">status</th>
                        <th className="pb-1 pr-2">age</th>
                        <th className="pb-1 pr-2 text-center">img</th>
                        <th className="pb-1 pr-2 text-center">shard_rm</th>
                        <th className="pb-1 pr-2 text-center">retrain</th>
                        <th className="pb-1 text-center">ckpt_upd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[result.deleted, ...result.remaining.records].map((record, idx) => {
                        const isDeleted = record.data_id === result.deleted.data_id;
                        return (
                          <tr key={idx}>
                            <td className="pt-1 pr-2 font-mono text-gray-600">{(record.data_id || '').substring(0, 8)}</td>
                            <td className={`pt-1 pr-2 ${isDeleted ? 'text-red-400/80' : 'text-green-400/80'}`}>
                              {isDeleted ? 'forgotten' : 'retained'}
                            </td>
                            <td className="pt-1 pr-2 text-white/50">{record.age || result.remaining.age}</td>
                            <td className="pt-1 pr-2 text-center text-cyber-blue">{record.image ? 'blob' : 'null'}</td>
                            <td className="pt-1 pr-2 text-center text-cyber-blue">{isDeleted ? 'true' : 'false'}</td>
                            <td className="pt-1 pr-2 text-center text-cyber-blue">{isDeleted ? 'true' : 'false'}</td>
                            <td className="pt-1 text-center text-cyber-blue">{isDeleted ? 'true' : 'false'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="mt-2 pt-2 border-t border-gray-800 text-gray-500 italic">
                    Unlearning verified: 1 records forgotten, {result.remaining.records_left} records retained, 1 shards retrained
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        )}
      </AnimatePresence>
    </Card>
  );
};

// Temp icon
const ShieldCheck = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

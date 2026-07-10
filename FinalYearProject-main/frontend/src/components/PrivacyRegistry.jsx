import React from 'react';
import { Card } from './ui/Card';
import { Database, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PrivacyRegistry = ({ records = [] }) => {
  return (
    <Card className="col-span-full border border-cyber-blue/20 bg-black/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-cyber-blue">
          <Database className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">Live Data Registry (Privacy View)</h3>
        </div>
        <div className="flex items-center space-x-2 text-[11px] text-gray-400 font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
          </span>
          SYNCING DATABASE
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-6 w-full md:w-2/3">
        This is a real-time view of ingested data. Notice that text and images are obfuscated by default according to SISA data minimization and zero-trust principles.
      </p>

      {records.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-gray-500 border border-dashed border-gray-700 rounded-lg">
          No active records found in the database.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/50 max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse relative">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-800 text-gray-400 shadow-sm">
                <th className="p-3 font-medium">dataId</th>
                <th className="p-3 font-medium">user</th>
                <th className="p-3 font-medium">shard</th>
                <th className="p-3 font-medium">age</th>
                <th className="p-3 font-medium text-center">Asset (Blurred)</th>
                <th className="p-3 font-medium">Text (Redacted)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <AnimatePresence>
                {records.map((record) => (
                  <motion.tr 
                    key={record.data_id} 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                    className="hover:bg-gray-800/30 transition-colors group"
                  >
                    <td className="p-3 font-mono text-gray-500 whitespace-nowrap">
                      {(record.data_id || '').substring(0, 12)}...
                    </td>
                    <td className="p-3 font-mono text-gray-400 text-[10px]">
                      {(record.user_id || '').length > 8 ? record.user_id.substring(0,8) + '...' : (record.user_id || 'anonymous')}
                    </td>
                    <td className="p-3">
                       <span className="px-2 py-0.5 rounded-full bg-cyber-blue/10 text-cyber-blue text-[10px] uppercase font-bold border border-cyber-blue/30">
                          #{record.shard_id}
                        </span>
                    </td>
                    <td className="p-3 text-white">{record.age || 'Unknown'}</td>
                    <td className="p-3 flex justify-center">
                      {record.image ? (
                        <div className="relative group">
                          <img 
                            src={record.image} 
                            className="w-10 h-10 object-cover rounded border border-gray-700 blur-[8px] group-hover:border-cyber-blue/50 transition-all opacity-80"
                            alt="Sensitive"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                            <Shield className="w-4 h-4 text-cyber-blue" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center text-[10px] text-gray-600">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-gray-600 font-mono tracking-tighter">
                      ████ █████ ████
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

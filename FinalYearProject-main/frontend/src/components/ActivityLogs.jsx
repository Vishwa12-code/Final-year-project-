import React from 'react';
import { Card } from './ui/Card';
import { Terminal } from 'lucide-react';

export const ActivityLogs = ({ logs }) => {
  return (
    <Card className="flex flex-col h-[400px]">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-800">
        <Terminal className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold">System Activity</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {logs && logs.length > 0 ? logs.map((log, idx) => (
          <div key={idx} className="bg-gray-900/50 p-3 rounded-lg border-l-2" 
            style={{ 
              borderColor: log.type === 'DATA_ADDED' ? '#0088ff' : 
                           log.type === 'DATA_DELETED' ? '#ff3366' : 
                           log.type === 'SHARD_RETRAIN' ? '#00ffcc' : '#666'
            }}
          >
            <div className="flex justify-between items-start mb-1 gap-2">
              <span className="text-xs font-mono text-gray-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-800/80 ml-auto shrink-0">
                {log.type}
              </span>
            </div>
            <p className="text-sm text-white">{log.description}</p>
            {log.metadata && log.type === 'DATA_ADDED' && (
              <p className="text-xs text-gray-500 mt-1 font-mono">user_id: {log.metadata.user_id?.substring(0,8)}... → S{log.metadata.shard_id}</p>
            )}
            {log.metadata && log.type === 'SHARD_RETRAIN' && (
              <p className="text-xs text-cyber-green mt-1 font-mono">S{log.metadata.shard_id} retrained in {log.metadata.time_taken.toFixed(4)}s (Acc: {Math.round(log.metadata.accuracy*100)}%)</p>
            )}
          </div>
        )) : (
          <div className="text-center text-gray-500 text-sm py-10 italic">
            No system activity recorded yet.
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
      `}} />
    </Card>
  );
};

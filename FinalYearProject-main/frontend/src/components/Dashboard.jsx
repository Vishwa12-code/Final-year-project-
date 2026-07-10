import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Activity, Database, Shield, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Dashboard = ({ data }) => {
  if (!data || !data.kpis) return <div className="animate-pulse h-64 glass-panel rounded-xl"></div>;

  const { kpis, shards } = data;

  // Prepare chart data
  const chartData = shards.map(s => ({
    name: `Shard ${s.shard_id}`,
    accuracy: s.accuracy * 100, // percentage
    count: Math.round(s.data_count),
    status: s.status
  }));

  const COLORS = ['#0088ff', '#00ffcc', '#ff3366', '#aaddff', '#ff88aa'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Data Points</p>
              <h3 className="text-2xl font-bold text-white mt-1">{kpis.total_data}</h3>
            </div>
            <div className="p-3 bg-cyber-blue/20 rounded-lg">
              <Database className="w-6 h-6 text-cyber-blue" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Shards</p>
              <h3 className="text-2xl font-bold text-white mt-1">{kpis.shard_count}</h3>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Global Accuracy</p>
              <h3 className="text-2xl font-bold text-cyber-green mt-1">{(kpis.overall_accuracy * 100).toFixed(1)}%</h3>
            </div>
            <div className="p-3 bg-cyber-green/20 rounded-lg">
              <Shield className="w-6 h-6 text-cyber-green" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Time Saved</p>
              <h3 className="text-2xl font-bold text-cyber-red mt-1">{kpis.avg_time_saved_percent.toFixed(1)}%</h3>
            </div>
            <div className="p-3 bg-cyber-red/20 rounded-lg">
              <Clock className="w-6 h-6 text-cyber-red" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold mb-6">Shard Accuracy Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151520', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="accuracy" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold mb-6">Data Volume per Shard</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#151520', border: '1px solid #333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#4B5563" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.status === 'retraining' ? '#ffaa00' : (entry.status === 'unlearning' ? '#ff3366' : '#00ffcc')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-4 space-x-4 text-xs">
            <span className="flex items-center"><span className="w-3 h-3 bg-cyber-green rounded-full mr-2"></span> Ready</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span> Retraining</span>
            <span className="flex items-center"><span className="w-3 h-3 bg-cyber-red rounded-full mr-2"></span> Unlearning</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

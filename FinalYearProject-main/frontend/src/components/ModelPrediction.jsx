import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import axios from 'axios';
import { Brain, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export const ModelPrediction = () => {
  const [text, setText] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if(!text) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/predict', { text });
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold">Live Ensemble Prediction</h3>
      </div>
      
      <div className="flex space-x-3 mb-4">
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePredict()}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
          placeholder="Test standard input..."
        />
        <Button onClick={handlePredict} disabled={loading || !text} className="bg-purple-600 hover:bg-purple-700 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          Predict
        </Button>
      </div>

      {prediction && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="bg-[#151520] border border-gray-800 rounded-xl p-4">
            <h4 className="text-sm text-gray-400 mb-3 flex items-center">
              <Cpu className="w-4 h-4 mr-2" />
              SISA Shard Votes
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(prediction.shard_predictions).map(([shardId, pred]) => (
                <div key={shardId} className={`p-2 rounded text-center text-xs font-bold border ${pred === 1 ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/30' : 'bg-cyber-red/10 text-cyber-red border-cyber-red/30'}`}>
                  S{shardId}<br/>
                  {pred === 1 ? '+' : '-'}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#151520] border border-gray-800 rounded-xl p-4 flex flex-col justify-center items-center">
            <h4 className="text-sm text-gray-400 mb-2">Aggregated Final Result</h4>
            <div className={`text-2xl font-black px-6 py-2 rounded-full border ${prediction.final_prediction === 1 ? 'bg-cyber-green/20 text-cyber-green border-cyber-green' : 'bg-cyber-red/20 text-cyber-red border-cyber-red'}`}>
              {prediction.final_prediction === 1 ? 'POSITIVE' : 'NEGATIVE'}
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  );
};

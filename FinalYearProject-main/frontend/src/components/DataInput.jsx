import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import axios from 'axios';
import { Send } from 'lucide-react';

export const DataInput = ({ onUpdate }) => {
  const [text, setText] = useState('');
  const [label, setLabel] = useState(1);
  const [userId, setUserId] = useState('');
  const [age, setAge] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const payload = { 
        text, 
        label: parseInt(label),
        image: image // Include the Base64 image
      };
      if (userId.trim()) payload.user_id = userId;
      if (age) payload.age = parseInt(age);
      
      const res = await axios.post('/api/data', payload);
      setMessage(`Added! User ID: ${res.data.user_id} | Data ID: ${res.data.data_id} -> Shard ${res.data.shard_id}`);
      setText('');
      setImage(null);
      // Reset file input
      e.target.reset(); 
      if(onUpdate) onUpdate();
    } catch (err) {
      setMessage('Error adding data');
    }
    setLoading(false);
  };

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-4">
        <Send className="w-5 h-5 text-cyber-blue" />
        <h3 className="text-lg font-semibold">Ingest Data</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">User ID (Optional)</label>
            <input 
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
              placeholder="Leave blank for new ID"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Age (Optional Metadata)</label>
            <input 
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
              placeholder="e.g. 29"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Image Asset (Sensitive Data)</label>
            <input 
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyber-blue/10 file:text-cyber-blue hover:file:bg-cyber-blue/20 transition-all cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Text Sequence</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-blue transition-colors"
            placeholder="Enter text to analyze... e.g. 'I love this product'"
            rows={3}
            required
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Sentiment Label</label>
            <select 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyber-blue"
            >
              <option value={1}>Positive (1)</option>
              <option value={0}>Negative (0)</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processing...' : 'Add to Stream'}
            </Button>
          </div>
        </div>
        {message && (
          <div className="mt-3 text-sm text-cyber-green bg-cyber-green/10 p-2 rounded border border-cyber-green/30">
            {message}
          </div>
        )}
      </form>
    </Card>
  );
};

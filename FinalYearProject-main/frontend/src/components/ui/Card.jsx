import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', animate = true }) => {
  const content = (
    <div className={`glass-panel rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
};

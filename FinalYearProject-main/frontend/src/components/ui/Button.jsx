import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-cyber-blue hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(0,136,255,0.4)]",
    danger: "bg-cyber-red hover:bg-red-600 text-white shadow-[0_0_15px_rgba(255,51,102,0.4)]",
    outline: "border border-cyber-green text-cyber-green hover:bg-cyber-green/10"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

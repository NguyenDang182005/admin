import React from 'react';

const StatCard = ({ title, value, icon, color = '#006ce4', subtitle }) => {
  return (
    <div className="admin-card group hover:scale-[1.02] transition-all duration-300 cursor-default">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-black text-[#1a1a1a] tracking-tight">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:rotate-12"
          style={{ backgroundColor: `${color}12`, color: color }}
        >
          {icon}
        </div>
      </div>
      
      {/* Subtle bottom accent line */}
      <div 
        className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};

export default StatCard;

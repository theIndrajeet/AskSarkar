import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, BarChart3, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const UsageDisplay = ({ onSwitch }) => {
  const [usageInfo, setUsageInfo] = useState(null);
  const [usageMessage, setUsageMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    updateUsageInfo();
  }, []);

  const updateUsageInfo = () => {
    const info = geminiService.getUsageInfo();
    const message = geminiService.getUsageMessage();
    
    setUsageInfo(info);
    setUsageMessage(message);
    setIsVisible(message !== null);
  };

  const handleSwitchToManual = () => {
    if (onSwitch) {
      onSwitch();
    }
  };

  if (!isVisible) return null;

  const getProgressBarColor = () => {
    if (usageInfo.percentageUsed >= 80) return 'bg-red-500';
    if (usageInfo.percentageUsed >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getAlertStyle = () => {
    switch (usageMessage?.type) {
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (usageMessage?.type) {
      case 'error':
        return <AlertTriangle size={18} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-orange-600" />;
      case 'info':
        return <Info size={18} className="text-blue-600" />;
      default:
        return <BarChart3 size={18} className="text-gray-600" />;
    }
  };

  return (
    <div className={`mx-3 sm:mx-4 mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg border-2 ${getAlertStyle()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="font-semibold text-sm sm:text-base">
            {usageMessage?.type === 'error' ? 'API Quota Exhausted' : 'API Usage'}
          </h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 text-sm opacity-60 hover:opacity-100 transition-opacity touch-manipulation"
        >
          <X size={16} />
        </button>
      </div>
      
      {usageInfo && (
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
            <span className="font-medium">
              {usageInfo.used} / {usageInfo.limit} requests used
            </span>
            <span className="bg-white/50 px-2 py-1 rounded-full text-xs font-medium">
              {usageInfo.percentageUsed.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
            <div 
              className={`h-2.5 sm:h-3 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(usageInfo.percentageUsed, 100)}%` }}
            />
          </div>
          <div className="text-xs sm:text-sm mt-2 opacity-70 text-center">
            {usageInfo.remaining > 0 
              ? `${usageInfo.remaining} requests remaining` 
              : `Resets in ${usageInfo.hoursUntilReset} hours`
            }
          </div>
        </div>
      )}
      
      <p className="text-sm sm:text-base mb-3 leading-relaxed">{usageMessage?.message}</p>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        {usageMessage?.showFallback && (
          <button
            onClick={handleSwitchToManual}
            className="w-full sm:w-auto bg-red-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors touch-manipulation"
          >
            Switch to Manual Form
          </button>
        )}
        
        {usageMessage?.type === 'warning' && (
          <button
            onClick={handleSwitchToManual}
            className="w-full sm:w-auto bg-orange-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors touch-manipulation"
          >
            Use Manual Form Instead
          </button>
        )}
      </div>
    </div>
  );
};

export default UsageDisplay; 
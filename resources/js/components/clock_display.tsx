import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ClockDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on component unmount
    return () => {
      clearInterval(timerId);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="flex items-center gap-2 text-lg font-medium text-gray-600">
      <Clock className="h-5 w-5" />
      <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
};

export default ClockDisplay;

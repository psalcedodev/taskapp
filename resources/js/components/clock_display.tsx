import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ClockDisplay: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-5 w-5" />
      <span className="font-medium">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  );
};

export default ClockDisplay;

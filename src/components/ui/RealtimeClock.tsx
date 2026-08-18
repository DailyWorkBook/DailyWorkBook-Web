import React, { useEffect, useState } from 'react';

export const RealtimeClock: React.FC = () => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-3xl font-bold tracking-tight text-txt-primary tabular-nums font-sans">
      {timeStr || '08:02:09 AM'}
    </div>
  );
};

'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string | Date;
  className?: string;
}

export default function CountdownTimer({ targetDate, className = '' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setExpired(true);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (expired) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="badge-live">Event Started</span>
      </div>
    );
  }

  const blocks = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {blocks.map((block, i) => (
        <div key={block.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 glass rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-white tabular-nums">
                {String(block.value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1.5 uppercase tracking-wider">
              {block.label}
            </span>
          </div>
          {i < blocks.length - 1 && (
            <span className="text-xl text-primary-400 font-bold mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

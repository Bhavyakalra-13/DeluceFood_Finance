import React, { useEffect, useState, useRef } from "react";

interface CardDataStatsProps {
  title: string;
  total: string;
  rate: string;
  levelUp?: boolean;
  levelDown?: boolean;
  icon?: React.ReactNode;
  color?: "indigo" | "emerald" | "amber" | "rose";
}

// Animated number counter hook
function useCountUp(target: number, duration: number = 1200) {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    startTime.current = null;
    
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      } else {
        setValue(target);
      }
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [target, duration]);

  return value;
}

const colorMap = {
  indigo: {
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    iconText: "text-indigo-600 dark:text-indigo-400",
    accent: "from-indigo-500/5 to-transparent",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
    accent: "from-emerald-500/5 to-transparent",
  },
  amber: {
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconText: "text-amber-600 dark:text-amber-400",
    accent: "from-amber-500/5 to-transparent",
  },
  rose: {
    iconBg: "bg-red-500/10 dark:bg-red-500/20",
    iconText: "text-red-600 dark:text-red-400",
    accent: "from-red-500/5 to-transparent",
  },
};

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  icon,
  color = "indigo",
}) => {
  // Extract numeric value for counter animation
  const numericValue = parseInt(total.replace(/[^0-9]/g, "")) || 0;
  const prefix = total.match(/^[^0-9]*/)?.[0] || "";
  const animatedValue = useCountUp(numericValue);
  const colors = colorMap[color];

  return (
    <div className="glass-card px-6 py-5 relative overflow-hidden group">
      {/* Background accent gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colors.accent} rounded-full -translate-y-1/2 translate-x-1/2 opacity-60`} />
      
      <div className="relative">
        {/* Header: Icon + Rate */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
            {icon || (
              <svg className={`w-5 h-5 ${colors.iconText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
          </div>
          
          {/* Growth Badge */}
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              levelUp
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : levelDown
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-gray-100 text-gray-500 dark:bg-meta-4 dark:text-bodydark"
            }`}
          >
            {levelUp && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
              </svg>
            )}
            {levelDown && (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {rate}
          </span>
        </div>

        {/* Value */}
        <h4 className="text-2xl font-bold text-black dark:text-white tabular-nums tracking-tight">
          {prefix}{animatedValue.toLocaleString()}
        </h4>
        
        {/* Label */}
        <span className="text-sm font-medium text-body dark:text-bodydark mt-1 block">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CardDataStats;
import React, { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../core/motion';

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animates a number up to its target. Under `prefers-reduced-motion` the value
 * appears immediately — the figure is the point, the animation is decoration.
 */
export const CountUp: React.FC<CountUpProps> = ({
  end,
  duration = 800,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  // Starting at the target means the correct number is painted on the very
  // first frame; the animation then rewinds and plays only if motion is allowed.
  const [count, setCount] = useState(end);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (startTimestamp === null) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(end * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [end, duration, shouldReduceMotion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

import { useEffect, useState } from 'react';
import { formatCountdown } from '../lib/format';

/** Ticks once per second until `until` has passed. */
export function useCountdown(until: Date | string | number) {
  const end = new Date(until).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Date.now() >= end) return;
    const timer = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= end) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [end]);

  const msLeft = Math.max(0, end - now);
  return { msLeft, expired: msLeft === 0, label: formatCountdown(msLeft) };
}

import { useState, useEffect, useRef } from "react";

/**
 * Countdown – animated digital clock that counts down to nextDrawTime.
 * Fires onExpire() callback when it reaches zero.
 */
export default function Countdown({ timeUntilDraw, onExpire }) {
  const [time, setTime]     = useState(timeUntilDraw);
  const [flip,  setFlip]    = useState(false);
  const prevTime            = useRef(timeUntilDraw);

  useEffect(() => {
    setTime(timeUntilDraw);
  }, [timeUntilDraw]);

  useEffect(() => {
    if (time <= 0) {
      onExpire?.();
      return;
    }
    const tick = setInterval(() => {
      setTime((t) => {
        const next = t - 1;
        setFlip((f) => !f);
        if (next <= 0) { clearInterval(tick); onExpire?.(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [time > 0]);

  const hours   = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const pad = (n) => String(n).padStart(2, "0");

  const Unit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-xl bg-navy-card border border-gold/20 overflow-hidden">
        {/* Shimmer line */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-gold/10" />
        <span
          key={`${label}-${value}`}
          className="font-display text-3xl sm:text-4xl text-gold animate-countdown"
        >
          {pad(value)}
        </span>
      </div>
      <span className="mt-1 text-xs text-white/40 font-body tracking-widest uppercase">{label}</span>
    </div>
  );

  if (time <= 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-2xl text-gold animate-glow">DRAW IN PROGRESS</span>
        <span className="text-xs text-white/40">Waiting for transaction…</span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <Unit value={hours}   label="HRS" />
      <span className="font-display text-3xl text-gold/60 mt-4">:</span>
      <Unit value={minutes} label="MIN" />
      <span className="font-display text-3xl text-gold/60 mt-4">:</span>
      <Unit value={seconds} label="SEC" />
    </div>
  );
}

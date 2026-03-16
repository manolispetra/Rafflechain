/**
 * WinnerHistory – displays past winners with on-chain explorer links.
 */
export default function WinnerHistory({ winners, explorerUrl }) {
  if (!winners || winners.length === 0) {
    return (
      <div className="text-center py-10 text-white/30">
        <div className="text-5xl mb-3">🏆</div>
        <p className="font-body">No draws yet — be the first winner!</p>
      </div>
    );
  }

  const shortAddr = (addr) =>
    `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const formatDate = (ts) =>
    new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });

  return (
    <div className="space-y-3">
      {winners.slice(0, 10).map((w, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-3 rounded-xl bg-navy-card border border-white/5 hover:border-gold/20 transition-colors"
        >
          {/* Left: round badge + address */}
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono font-bold">
              #{String(w.round)}
            </span>
            <div>
              <a
                href={`${explorerUrl}/address/${w.winner}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-sm text-accent hover:text-gold transition-colors"
              >
                {shortAddr(w.winner)}
              </a>
              <p className="text-xs text-white/30">{formatDate(w.timestamp)}</p>
            </div>
          </div>

          {/* Right: prize + tickets */}
          <div className="text-right">
            <p className="text-gold font-display text-lg leading-none">
              {parseFloat(w.prize) > 0
                ? `${(Number(w.prize) / 1e18).toFixed(4)} BNB`
                : "–"}
            </p>
            <p className="text-xs text-white/30">{String(w.ticketCount)} tickets</p>
          </div>
        </div>
      ))}
    </div>
  );
}

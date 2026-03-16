import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import { Toaster, toast } from "react-hot-toast";
import { useRaffleChain } from "../hooks/useRaffleChain";
import Countdown from "../components/Countdown";
import WinnerHistory from "../components/WinnerHistory";
import ReferralBox from "../components/ReferralBox";

// ── Confetti helper (loaded client-side only) ──────────────────────────────
let confetti;
if (typeof window !== "undefined") {
  import("canvas-confetti").then((m) => { confetti = m.default; });
}

function fireConfetti() {
  if (!confetti) return;
  const gold = "#F5C518";
  const cyan = "#00E5FF";
  [0.25, 0.5, 0.75].forEach((x) => {
    confetti({ particleCount: 80, spread: 70, origin: { x, y: 0.6 }, colors: [gold, cyan, "#fff"] });
  });
}

// ── Address short format ───────────────────────────────────────────────────
const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-2xl p-5 border transition-all ${
      accent
        ? "bg-gold/5 border-gold/30 hover:border-gold/60"
        : "bg-navy-card border-white/5 hover:border-white/10"
    }`}>
      <p className="text-xs uppercase tracking-widest text-white/40 font-body mb-1">{label}</p>
      <p className={`font-display text-2xl sm:text-3xl leading-none ${accent ? "text-gold animate-glow" : "text-white"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-white/30 font-body mt-1">{sub}</p>}
    </div>
  );
}

// ── Logo SVG ────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="17" stroke="#F5C518" strokeWidth="2"/>
      <circle cx="18" cy="18" r="10" fill="#F5C518" fillOpacity="0.15"/>
      {/* Ticket tear line */}
      <line x1="8" y1="18" x2="28" y2="18" stroke="#F5C518" strokeWidth="1.5" strokeDasharray="3 2"/>
      {/* Chain links */}
      <rect x="5" y="14" width="6" height="8" rx="3" stroke="#00E5FF" strokeWidth="1.5"/>
      <rect x="25" y="14" width="6" height="8" rx="3" stroke="#00E5FF" strokeWidth="1.5"/>
      {/* Star */}
      <path d="M18 10 L19.5 14.5 L24 14.5 L20.5 17.5 L22 22 L18 19.5 L14 22 L15.5 17.5 L12 14.5 L16.5 14.5 Z"
        fill="#F5C518"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const {
    account, isConnecting, connectWallet,
    ticketPrice, prizePool, currentRound, totalTickets,
    timeUntilDraw, myTickets, myChance,
    winnerHistory, isOwner, pendingComm,
    buyTicket, drawWinner, withdrawCommission,
    loading, error, setError,
    explorerUrl, contractAddress,
  } = useRaffleChain();

  const [activeTab,   setActiveTab]   = useState("lottery"); // lottery | winners | referral | admin
  const [txHash,      setTxHash]      = useState(null);
  const [drawReady,   setDrawReady]   = useState(false);

  // Read referral from URL query param
  const [referrer, setReferrer] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) setReferrer(ref);
    }
  }, []);

  // Show toast on error
  useEffect(() => {
    if (error) { toast.error(error); setError(null); }
  }, [error, setError]);

  // ── Handle buy ─────────────────────────────────────────────────────────
  const handleBuy = async () => {
    if (!account) { connectWallet(); return; }
    try {
      const hash = await buyTicket(referrer);
      setTxHash(hash);
      toast.success("🎟️ Ticket purchased! Good luck!");
      if (referrer) toast.success("🎉 Referral bonus applied! You and your referrer each got +1 ticket.");
    } catch { /* error already set */ }
  };

  // ── Handle draw ────────────────────────────────────────────────────────
  const handleDraw = async () => {
    try {
      const hash = await drawWinner();
      setTxHash(hash);
      toast.success("🏆 Winner drawn!");
      fireConfetti();
      setTimeout(fireConfetti, 700);
    } catch { /* error already set */ }
  };

  // ── Handle withdraw ────────────────────────────────────────────────────
  const handleWithdraw = async () => {
    try {
      const hash = await withdrawCommission();
      setTxHash(hash);
      toast.success(`💰 Commission withdrawn!`);
    } catch { /* error already set */ }
  };

  const contractOk = contractAddress && contractAddress !== "0xYOUR_CONTRACT_ADDRESS_HERE";

  return (
    <>
      <Head>
        <title>RaffleChain – On-Chain BNB Lottery</title>
        <meta name="description" content="The fairest crypto lottery on BNB Smart Chain. Buy tickets, win BNB. Fully on-chain, transparent, instant payouts." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#141B2D", color: "#fff", border: "1px solid rgba(245,197,24,0.2)" },
          success: { iconTheme: { primary: "#F5C518", secondary: "#0A0E1A" } },
        }}
      />

      <div className="min-h-screen bg-navy text-white font-body" style={{ background: "radial-gradient(ellipse at 20% 20%, #1a2040 0%, #0A0E1A 50%)" }}>

        {/* ── Decorative background blobs ───────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-gold/5 blur-[100px]" />
          <div className="absolute bottom-[-200px] left-[-100px] w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        {/* ── Navbar ────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/5 backdrop-blur-xl bg-navy/80">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="font-display text-2xl tracking-wide text-white">
              RAFFLE<span className="text-gold">CHAIN</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {account ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="font-mono text-xs text-gold">{short(account)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-4 py-2 rounded-full bg-gold-gradient text-navy font-body font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-gold/20"
              >
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </button>
            )}
          </div>
        </nav>

        {/* ── Setup warning ─────────────────────────────────────────────── */}
        {!contractOk && (
          <div className="mx-4 mt-4 p-4 rounded-xl bg-danger/10 border border-danger/30 text-sm text-danger text-center">
            ⚠️ Contract address not configured. Copy <code className="font-mono">.env.example</code> to <code className="font-mono">.env.local</code> and set <code className="font-mono">NEXT_PUBLIC_CONTRACT_ADDRESS</code>.
          </div>
        )}

        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <section className="relative px-4 sm:px-8 pt-12 pb-8 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            Round #{currentRound} • Fully On-Chain • BNB Smart Chain
          </div>
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none mb-4">
            WIN <span className="text-gold animate-glow">BIG</span>
            <br />IN SECONDS
          </h1>
          <p className="text-white/50 font-body max-w-lg mx-auto text-base sm:text-lg mb-8">
            The fairest crypto lottery on BNB Smart Chain. Transparent, instant payouts, verified on-chain. No trust required.
          </p>

          {/* ── Prize Pool Hero ──────────────────────────────────────────── */}
          <div className="inline-block relative mb-10">
            <div className="absolute inset-0 rounded-3xl bg-gold/10 blur-2xl" />
            <div className="relative rounded-3xl border border-gold/30 bg-navy-card px-10 py-6 bg-ticket-pattern">
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Current Prize Pool</p>
              <p className="font-display text-5xl sm:text-6xl text-gold animate-glow">
                {parseFloat(prizePool).toFixed(4)} BNB
              </p>
              <p className="text-xs text-white/30 mt-1">{totalTickets} ticket{totalTickets !== 1 ? "s" : ""} sold this round</p>
            </div>
          </div>

          {/* ── Buy Ticket CTA ───────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleBuy}
              disabled={loading || !contractOk}
              className="relative group w-full sm:w-auto px-10 py-4 rounded-2xl bg-gold-gradient text-navy font-display text-2xl tracking-wide shadow-2xl shadow-gold/30 hover:opacity-95 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-gold"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83"/>
                  </svg>
                  Processing…
                </span>
              ) : (
                <>🎟️ BUY TICKET — {ticketPrice} BNB</>
              )}
            </button>
            {referrer && (
              <div className="text-xs text-accent flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/></svg>
                Referral bonus active! (+1 free ticket)
              </div>
            )}
          </div>

          {/* ── Your stats (if connected & has tickets) ───────────────────── */}
          {account && myTickets > 0 && (
            <div className="mt-6 inline-flex items-center gap-4 px-5 py-3 rounded-2xl bg-navy-card border border-accent/20">
              <div className="text-center">
                <p className="text-xs text-white/40">Your Tickets</p>
                <p className="font-display text-xl text-accent">{myTickets}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-xs text-white/40">Win Chance</p>
                <p className="font-display text-xl text-accent">{myChance.toFixed(2)}%</p>
              </div>
            </div>
          )}
        </section>

        {/* ── Stats Row ─────────────────────────────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-5xl mx-auto mb-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Ticket Price"     value={`${ticketPrice} BNB`}        sub="per ticket"               accent />
            <StatCard label="Prize Pool"       value={`${parseFloat(prizePool).toFixed(4)} BNB`} sub="95% of all tickets" />
            <StatCard label="Total Tickets"    value={totalTickets}                 sub={`round #${currentRound}`} />
            <StatCard label="Past Winners"     value={winnerHistory.length}         sub="on-chain verified"        />
          </div>
        </section>

        {/* ── Countdown Banner ──────────────────────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-5xl mx-auto mb-8">
          <div className="rounded-2xl border border-gold/20 bg-navy-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-ticket-pattern">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Next Draw In</p>
              <Countdown
                timeUntilDraw={timeUntilDraw}
                onExpire={() => setDrawReady(true)}
              />
            </div>
            <div className="text-center sm:text-right">
              <p className="text-white/40 text-sm mb-3">Draw is open to anyone once the timer hits zero</p>
              <button
                onClick={handleDraw}
                disabled={loading || timeUntilDraw > 0 || totalTickets === 0 || !account}
                className="px-6 py-2.5 rounded-xl border border-gold/40 bg-gold/10 text-gold font-body font-semibold text-sm hover:bg-gold/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {timeUntilDraw > 0 ? "⏳ Draw Not Ready" : totalTickets === 0 ? "No Tickets Sold" : "🏆 Draw Winner Now"}
              </button>
            </div>
          </div>
        </section>

        {/* ── Tab Navigation ────────────────────────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-5xl mx-auto mb-4">
          <div className="flex gap-1 p-1 rounded-xl bg-navy-card border border-white/5 w-full sm:w-fit">
            {[
              { id: "winners",  label: "🏆 Winners" },
              { id: "referral", label: "🔗 Refer & Earn" },
              ...(isOwner ? [{ id: "admin", label: "⚙️ Admin" }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-body transition-all ${
                  activeTab === tab.id
                    ? "bg-gold/10 text-gold border border-gold/30"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tab Content ───────────────────────────────────────────────── */}
        <section className="px-4 sm:px-8 max-w-5xl mx-auto pb-20">
          <div className="rounded-2xl border border-white/5 bg-navy-card p-6">

            {/* Winners Tab */}
            {activeTab === "winners" && (
              <div>
                <h2 className="font-display text-2xl text-white mb-4">Previous Winners</h2>
                <p className="text-xs text-white/30 mb-6">All results verified on-chain. Click any address to view on BSCScan.</p>
                <WinnerHistory winners={winnerHistory} explorerUrl={explorerUrl} />
              </div>
            )}

            {/* Referral Tab */}
            {activeTab === "referral" && (
              <div>
                <h2 className="font-display text-2xl text-white mb-2">Refer & Win More</h2>
                <p className="text-xs text-white/30 mb-6">Invite friends. When they buy a ticket using your link, you both receive 1 bonus ticket automatically — no extra cost.</p>
                <ReferralBox account={account} />
              </div>
            )}

            {/* Admin Tab */}
            {activeTab === "admin" && isOwner && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl text-gold">Owner Panel</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-navy border border-gold/20">
                    <p className="text-xs text-white/40 mb-1">Pending Commission</p>
                    <p className="font-display text-2xl text-gold">{parseFloat(pendingComm).toFixed(6)} BNB</p>
                    <button
                      onClick={handleWithdraw}
                      disabled={loading || parseFloat(pendingComm) === 0}
                      className="mt-3 w-full py-2 rounded-lg bg-gold-gradient text-navy font-body font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40"
                    >
                      Withdraw Commission
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-navy border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Contract</p>
                    <a
                      href={`${explorerUrl}/address/${contractAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-accent hover:text-gold transition-colors break-all"
                    >
                      {contractAddress}
                    </a>
                    <p className="text-xs text-white/30 mt-2">Commission: 5% auto-split on every ticket</p>
                  </div>
                </div>
                <p className="text-xs text-white/20">To change ticket price or draw interval, call <code className="font-mono text-white/40">setTicketPrice()</code> / <code className="font-mono text-white/40">setDrawInterval()</code> directly on the contract via BSCScan or a custom admin UI.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Last Tx Hash ──────────────────────────────────────────────── */}
        {txHash && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-navy-card border border-success/30 shadow-2xl text-sm">
            <span className="text-success">✓</span>
            <span className="text-white/70">Tx:</span>
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-accent hover:text-gold text-xs truncate max-w-[200px]"
            >
              {txHash}
            </a>
            <button onClick={() => setTxHash(null)} className="text-white/30 hover:text-white">✕</button>
          </div>
        )}

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <footer className="border-t border-white/5 px-8 py-6 text-center text-xs text-white/20 font-body">
          <p>RaffleChain © {new Date().getFullYear()} • Fully on-chain • BNB Smart Chain</p>
          <p className="mt-1">Smart contract is open source. No trust required. Play responsibly.</p>
        </footer>
      </div>
    </>
  );
}

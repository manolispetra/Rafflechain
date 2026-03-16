import { useState } from "react";
import toast from "react-hot-toast";

/**
 * ReferralBox – generates a referral link and provides share buttons.
 */
export default function ReferralBox({ account }) {
  const [copied, setCopied] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const referralLink = account ? `${siteUrl}?ref=${account}` : "";

  const copyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `🎰 Just entered RaffleChain – the fairest on-chain BNB lottery!\n\nUse my referral link for a BONUS ticket:\n${referralLink}\n\n#RaffleChain #BNB #BSC #Crypto`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareDiscord = () => {
    const text = encodeURIComponent(referralLink);
    navigator.clipboard.writeText(
      `🎰 Join RaffleChain – on-chain BNB lottery! Get a BONUS ticket with my ref link: ${referralLink}`
    ).then(() => toast.success("Discord message copied! Paste it in your server."));
  };

  if (!account) {
    return (
      <div className="text-center py-6 text-white/30">
        <p>Connect your wallet to generate your referral link.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="flex gap-4 text-sm text-white/60">
        <div className="flex items-start gap-2">
          <span className="text-gold text-lg leading-none">→</span>
          <span>Share your link with friends</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gold text-lg leading-none">→</span>
          <span>They buy a ticket</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gold text-lg leading-none">→</span>
          <span>You both get +1 bonus ticket</span>
        </div>
      </div>

      {/* Link display */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-navy border border-gold/20">
        <input
          readOnly
          value={referralLink}
          className="flex-1 bg-transparent text-xs text-white/70 font-mono outline-none truncate"
        />
        <button
          onClick={copyLink}
          className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-xs font-body transition-all"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Social buttons */}
      <div className="flex gap-3">
        <button
          onClick={shareTwitter}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 text-[#1DA1F2] text-sm font-body transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          Share on X
        </button>
        <button
          onClick={shareDiscord}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] text-sm font-body transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.036.048a19.71 19.71 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 12.99 12.99 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
          </svg>
          Copy for Discord
        </button>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { RAFFLECHAIN_ABI } from "../utils/abi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const CHAIN_ID         = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "97");
const RPC_URL          = process.env.NEXT_PUBLIC_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/";
const CHAIN_NAME       = process.env.NEXT_PUBLIC_CHAIN_NAME || "BSC Testnet";
const EXPLORER_URL     = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://testnet.bscscan.com";

/**
 * useRaffleChain – central hook for all contract interactions.
 * Returns wallet state, contract data, and action functions.
 */
export function useRaffleChain() {
  // ── Wallet state ─────────────────────────────────────────────────────────
  const [account,     setAccount]     = useState(null);
  const [provider,    setProvider]    = useState(null);
  const [signer,      setSigner]      = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainOk,     setChainOk]     = useState(false);

  // ── Contract data ─────────────────────────────────────────────────────────
  const [ticketPrice,    setTicketPrice]    = useState("0");
  const [prizePool,      setPrizePool]      = useState("0");
  const [currentRound,   setCurrentRound]   = useState(1);
  const [totalTickets,   setTotalTickets]   = useState(0);
  const [nextDrawTime,   setNextDrawTime]   = useState(0);
  const [timeUntilDraw,  setTimeUntilDraw]  = useState(0);
  const [myTickets,      setMyTickets]      = useState(0);
  const [myChance,       setMyChance]       = useState(0);
  const [winnerHistory,  setWinnerHistory]  = useState([]);
  const [isOwner,        setIsOwner]        = useState(false);
  const [pendingComm,    setPendingComm]    = useState("0");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);

  // ── Read-only provider (no wallet needed for public data) ─────────────────
  const readContract = useCallback(() => {
    if (!CONTRACT_ADDRESS || CONTRACT_ADDRESS === "0xYOUR_CONTRACT_ADDRESS_HERE") return null;
    const rp = new ethers.JsonRpcProvider(RPC_URL);
    return new ethers.Contract(CONTRACT_ADDRESS, RAFFLECHAIN_ABI, rp);
  }, []);

  // ── Fetch all contract data ───────────────────────────────────────────────
  const fetchContractData = useCallback(async (currentAccount = null) => {
    const contract = readContract();
    if (!contract) return;

    try {
      const [
        price, pool, round, tickets, drawTime, untilDraw, history
      ] = await Promise.all([
        contract.ticketPrice(),
        contract.prizePool(),
        contract.currentRound(),
        contract.totalTickets(),
        contract.nextDrawTime(),
        contract.timeUntilDraw(),
        contract.getWinnerHistory(),
      ]);

      setTicketPrice(ethers.formatEther(price));
      setPrizePool(ethers.formatEther(pool));
      setCurrentRound(Number(round));
      setTotalTickets(Number(tickets));
      setNextDrawTime(Number(drawTime));
      setTimeUntilDraw(Number(untilDraw));
      setWinnerHistory([...history].reverse()); // newest first

      // Per-user data
      if (currentAccount) {
        const [myCount, myChanceBps, ownerAddr, commBal] = await Promise.all([
          contract.ticketCount(currentAccount),
          contract.userChance(currentAccount),
          contract.ownerWallet(),
          contract.pendingCommission(),
        ]);
        setMyTickets(Number(myCount));
        setMyChance(Number(myChanceBps) / 100); // convert bps → %
        setIsOwner(ownerAddr.toLowerCase() === currentAccount.toLowerCase());
        setPendingComm(ethers.formatEther(commBal));
      }
    } catch (err) {
      console.error("fetchContractData error:", err);
    }
  }, [readContract]);

  // ── Auto-refresh every 15 s ───────────────────────────────────────────────
  useEffect(() => {
    fetchContractData(account);
    const interval = setInterval(() => fetchContractData(account), 15000);
    return () => clearInterval(interval);
  }, [account, fetchContractData]);

  // ── Listen for MetaMask account / chain changes ───────────────────────────
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setIsOwner(false);
      } else {
        setAccount(accounts[0]);
        fetchContractData(accounts[0]);
      }
    };
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged",    handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged",    handleChainChanged);
    };
  }, [fetchContractData]);

  // ── Connect wallet ────────────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask not detected. Please install it.");
      return;
    }
    setIsConnecting(true);
    setError(null);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      // Check / switch chain
      const chainHex = `0x${CHAIN_ID.toString(16)}`;
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainHex }],
        });
      } catch (switchErr) {
        // Chain not added yet — add it
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId:           chainHex,
              chainName:         CHAIN_NAME,
              nativeCurrency:    { name: "BNB", symbol: "BNB", decimals: 18 },
              rpcUrls:           [RPC_URL],
              blockExplorerUrls: [EXPLORER_URL],
            }],
          });
        } else throw switchErr;
      }

      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer   = await web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainOk(true);
      await fetchContractData(accounts[0]);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [fetchContractData]);

  // ── Get signed contract ───────────────────────────────────────────────────
  const getSignedContract = useCallback(() => {
    if (!signer || !CONTRACT_ADDRESS) throw new Error("Wallet not connected");
    return new ethers.Contract(CONTRACT_ADDRESS, RAFFLECHAIN_ABI, signer);
  }, [signer]);

  // ── buyTicket ─────────────────────────────────────────────────────────────
  const buyTicket = useCallback(async (referrerAddress = null) => {
    setLoading(true);
    setError(null);
    try {
      const contract = getSignedContract();
      const price    = await contract.ticketPrice();
      const referrer = referrerAddress && ethers.isAddress(referrerAddress)
        ? referrerAddress
        : ethers.ZeroAddress;

      const tx = await contract.buyTicket(referrer, { value: price });
      await tx.wait();
      await fetchContractData(account);
      return tx.hash;
    } catch (err) {
      const msg = err?.reason || err?.message || "Transaction failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSignedContract, account, fetchContractData]);

  // ── drawWinner (owner or public after time) ───────────────────────────────
  const drawWinner = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = getSignedContract();
      const tx = await contract.drawWinner();
      await tx.wait();
      await fetchContractData(account);
      return tx.hash;
    } catch (err) {
      const msg = err?.reason || err?.message || "Draw failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSignedContract, account, fetchContractData]);

  // ── withdrawCommission ────────────────────────────────────────────────────
  const withdrawCommission = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = getSignedContract();
      const tx = await contract.withdrawCommission();
      await tx.wait();
      await fetchContractData(account);
      return tx.hash;
    } catch (err) {
      const msg = err?.reason || err?.message || "Withdrawal failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getSignedContract, account, fetchContractData]);

  return {
    // Wallet
    account, isConnecting, chainOk, connectWallet,
    // Contract data
    ticketPrice, prizePool, currentRound, totalTickets,
    nextDrawTime, timeUntilDraw, myTickets, myChance,
    winnerHistory, isOwner, pendingComm,
    // Actions
    buyTicket, drawWinner, withdrawCommission,
    // UI state
    loading, error, setError,
    // Constants
    explorerUrl: EXPLORER_URL,
    contractAddress: CONTRACT_ADDRESS,
    fetchContractData,
  };
}

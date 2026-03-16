// RaffleChain Contract ABI
// Keep in sync with contracts/abi.js after any contract changes

export const RAFFLECHAIN_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: "buyer",    type: "address" },
      { indexed: false, name: "quantity", type: "uint256" },
      { indexed: false, name: "round",    type: "uint256" },
    ],
    name: "TicketPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: "referrer", type: "address" },
      { indexed: true,  name: "referee",  type: "address" },
      { indexed: false, name: "round",    type: "uint256" },
    ],
    name: "ReferralBonus",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  name: "winner",    type: "address" },
      { indexed: false, name: "prize",     type: "uint256" },
      { indexed: false, name: "round",     type: "uint256" },
      { indexed: false, name: "timestamp", type: "uint256" },
    ],
    name: "WinnerDrawn",
    type: "event",
  },
  // Read functions
  { inputs: [], name: "ownerWallet",       outputs: [{ type: "address" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "ticketPrice",       outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "prizePool",         outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "pendingCommission", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "currentRound",      outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "nextDrawTime",      outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "drawInterval",      outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalTickets",      outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "timeUntilDraw",     outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "winnerHistoryLength", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getTickets",        outputs: [{ type: "address[]" }], stateMutability: "view", type: "function" },
  {
    inputs: [],
    name: "getWinnerHistory",
    outputs: [{
      components: [
        { name: "round",       type: "uint256" },
        { name: "winner",      type: "address" },
        { name: "prize",       type: "uint256" },
        { name: "timestamp",   type: "uint256" },
        { name: "ticketCount", type: "uint256" },
      ],
      type: "tuple[]",
    }],
    stateMutability: "view",
    type: "function",
  },
  { inputs: [{ name: "user", type: "address" }], name: "ticketCount", outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "userChance",  outputs: [{ type: "uint256" }], stateMutability: "view", type: "function" },
  // Write functions
  { inputs: [{ name: "referrer", type: "address" }], name: "buyTicket",         outputs: [], stateMutability: "payable",    type: "function" },
  { inputs: [],                                       name: "drawWinner",         outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [],                                       name: "withdrawCommission", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_newPrice",    type: "uint256" }], name: "setTicketPrice",   outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_newInterval", type: "uint256" }], name: "setDrawInterval",  outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "_newOwner",    type: "address" }], name: "transferOwnership", outputs: [], stateMutability: "nonpayable", type: "function" },
];

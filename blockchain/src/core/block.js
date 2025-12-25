import crypto from "node:crypto";

/* 
 block structure. 
 To keep things as simple as possible we include only the most necessary:
  index, timestamp, data, hash and previous hash.
*/

export class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return calculateHash(
      this.index,
      this.previousHash,
      this.timestamp,
      this.data,
      this.nonce
    );
  }
}

/* 
An arrow func that hash a Block uisng all of its data using SHA256 Encryption algorithm 
*/

export const calculateHash = (index, previousHash, timestamp, data, nonce = 0) => {
  const payload =
    index +
    previousHash +
    timestamp +
    JSON.stringify(data) +
    nonce;

  return crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex");
};


const tournamentResult = {
  tournamentId: "t42_001",
  players: [
    { id: "alice", score: 21 },
    { id: "bob", score: 18 }
  ],
  winner: "alice",
  endedAt: Date.now()
};

export const validateTournamentResult = (result) => {
  // Check if result exists and has required fields
  if (!result || typeof result !== 'object') return false;
  
  // For simple score-project data format
  if (result.score !== undefined && result.project !== undefined) {
    return typeof result.score === 'number' && 
           result.score >= 0 && 
           typeof result.project === 'string' && 
           result.project.length > 0;
  }
  
  // For complex tournament result format
  if (!result.tournamentId) return false;
  if (!Array.isArray(result.players)) return false;

  const totalScore = result.players.reduce(
    (sum, p) => sum + p.score, 0
  );

  if (totalScore <= 0) return false;
  if (!result.winner) return false;

  return true;
};



// Tournament result template for reference
export const tournamentResultTemplate = {
  tournamentId: "t42_001",
  players: [
    { id: "alice", score: 21 },
    { id: "bob", score: 18 }
  ],
  winner: "alice",
  endedAt: Date.now()
};
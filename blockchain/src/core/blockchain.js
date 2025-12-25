import { Block, calculateHash, validateTournamentResult } from './block.js';

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block(0, new Date().getTime() / 1000, {
      message: "Genesis Block - Solo Spin Tournament Blockchain",
      type: "genesis"
    }, "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.hash = newBlock.calculateHash();
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockchain() {
    return {
      chain: this.chain,
      length: this.chain.length,
      isValid: this.isChainValid()
    };
  }
}

// Create a single blockchain instance
const soloSpinBlockchain = new Blockchain();

// Generate next block with tournament data
export const generateNextBlock = (blockData) => {
  // Validate tournament result data
  if (!validateTournamentResult(blockData)) {
    throw new Error('Invalid tournament result data');
  }

  const previousBlock = soloSpinBlockchain.getLatestBlock();
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = new Date().getTime() / 1000;
  
  const newBlock = new Block(nextIndex, nextTimestamp, blockData, previousBlock.hash);
  return soloSpinBlockchain.addBlock(newBlock);
};

// Get the entire blockchain
export const getBlockchain = () => {
  return soloSpinBlockchain.getBlockchain();
};

// Get the latest block
export const getLatestBlock = () => {
  return soloSpinBlockchain.getLatestBlock();
};

// Get block by index
export const getBlock = (index) => {
  return soloSpinBlockchain.chain[index] || null;
};

// Export the blockchain instance for direct access if needed
export { soloSpinBlockchain };


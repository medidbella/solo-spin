import Fastify from 'fastify';
import { generateNextBlock, getBlockchain, getLatestBlock, getBlock } from '../core/blockchain.js';
import fs from 'node:fs';
import path from 'node:path';

const fastify = Fastify({ 
  logger: true,
  bodyLimit: 1048576 // 1MB limit
});

// CORS support for cross-origin requests
await fastify.register((await import('@fastify/cors')).default, {
  origin: true
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'OK', service: 'Solo Spin Blockchain', timestamp: Date.now() };
});

// Get all blocks in the blockchain
fastify.get('/blocks', async (request, reply) => {
  try {
    return getBlockchain();
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve blockchain' });
  }
});

// Get latest block
fastify.get('/blocks/latest', async (request, reply) => {
  try {
    return getLatestBlock();
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve latest block' });
  }
});

// Get specific block by index
fastify.get('/blocks/:index', async (request, reply) => {
  try {
    const index = parseInt(request.params.index);
    if (isNaN(index) || index < 0) {
      return reply.code(400).send({ error: 'Invalid block index' });
    }
    
    const block = getBlock(index);
    if (!block) {
      return reply.code(404).send({ error: 'Block not found' });
    }
    
    return block;
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve block' });
  }
});

// Add new block with tournament/game data
const logDir = './logs';
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logPath = path.join(logDir, 'blockchain.log');

fastify.post('/blocks', async (request, reply) => {
  try {
    const { score, project, tournamentId, players, winner } = request.body;
    let blockData = (score !== undefined && project !== undefined) 
      ? { score, project, timestamp: Date.now(), type: 'game_result' }
      : { tournamentId, players, winner, timestamp: Date.now(), type: 'tournament_result' };

      const newBlock = generateNextBlock(blockData);
    
      const logEntry = JSON.stringify({
        "@timestamp": new Date().toISOString(),
        "event_type": "new_block",
        ...newBlock 
      }) + '\n';
      
      if (!fs.existsSync(path.dirname(logPath))) {
          fs.mkdirSync(path.dirname(logPath), { recursive: true });
      }
      fs.appendFileSync(logPath, logEntry);
  
      return newBlock;
  } catch (error) {
    fastify.log.error('Error creating block:', error);
    reply.code(400).send({ error: error.message });
  }
});

// Start the server
const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    fastify.log.info('Solo Spin Blockchain Service started on http://0.0.0.0:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

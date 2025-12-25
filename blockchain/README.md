# Solo Spin Tournament Blockchain

A blockchain service built with Node.js and Fastify to store and track game scores and tournament results for the Solo Spin gaming platform.

## Features

- ✅ **Blockchain Storage**: Secure, tamper-proof storage of game results
- ✅ **RESTful API**: Easy-to-use API endpoints for interacting with the blockchain
- ✅ **Dual Data Formats**: Support for both simple game scores and complex tournament results
- ✅ **Docker Support**: Containerized deployment with Docker Compose
- ✅ **Nginx Proxy**: Reverse proxy with rate limiting and CORS support
- ✅ **ELK Integration**: Built-in logging and monitoring with Elasticsearch, Logstash, and Kibana

## Quick Start

1. **Start the services:**
   ```bash
   docker-compose up --build
   ```

2. **Test the blockchain:**
   ```bash
   ./test-blockchain-api.sh
   ```

## API Endpoints

### Health Check
- **GET** `/health` - Service health status

### Blockchain Operations
- **GET** `/api/blockchain/blocks` - Get the entire blockchain
- **GET** `/api/blockchain/blocks/latest` - Get the latest block
- **GET** `/api/blockchain/blocks/:index` - Get a specific block by index
- **POST** `/api/blockchain/blocks` - Add a new block with game/tournament data

## Data Formats

### Simple Game Result
```json
{
  "score": 1250,
  "project": "space-shooter-v2"
}
```

### Tournament Result
```json
{
  "tournamentId": "solo_tournament_001",
  "players": [
    {"id": "player_1", "score": 2100},
    {"id": "player_2", "score": 1850}
  ],
  "winner": "player_1"
}
```

## Example Usage

### Add a Game Score
```bash
curl -X POST http://localhost/api/blockchain/blocks \\
  -H "Content-Type: application/json" \\
  -d '{"score": 1250, "project": "space-shooter-v2"}'
```

### Get All Blocks
```bash
curl http://localhost/api/blockchain/blocks
```

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │◄──►│    Nginx    │◄──►│ Blockchain  │
│    (Port)   │    │  (Port 80)  │    │ (Port 3000) │
└─────────────┘    └─────────────┘    └─────────────┘
                           │
                           ▼
                   ┌─────────────┐
                   │ ELK Stack   │
                   │ Monitoring  │
                   └─────────────┘
```

## Development

### Local Development
```bash
cd blockchain
npm install
npm run dev
```

### Run Tests
```bash
./test-blockchain-api.sh
```

## Security Features

- **Hash Validation**: Each block's integrity is verified using SHA-256
- **Chain Validation**: The entire blockchain is validated to prevent tampering
- **Rate Limiting**: API endpoints are protected with rate limiting
- **CORS Protection**: Cross-origin requests are properly handled

## Technology Stack

- **Node.js 20+**: Runtime environment
- **Fastify**: High-performance web framework
- **SHA-256**: Cryptographic hashing
- **Docker**: Containerization
- **Nginx**: Reverse proxy and load balancing
- **ELK Stack**: Logging and monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `./test-blockchain-api.sh`
5. Submit a pull request
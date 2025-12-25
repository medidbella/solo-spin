#!/bin/bash

# Test script to verify ELK stack pipeline with blockchain data

echo "🔧 Testing ELK Stack Pipeline..."
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if services are running
echo -e "${YELLOW}1. Checking ELK services...${NC}"
echo "Elasticsearch:"
curl -k -u elastic:iamsuperhero https://localhost:9200/_cluster/health?pretty 2>/dev/null | grep status || echo "❌ Elasticsearch not accessible"

echo -e "\nLogstash:"
curl -s http://localhost:8080 >/dev/null 2>&1 && echo "✅ Logstash HTTP input accessible" || echo "❌ Logstash not accessible"

echo -e "\nKibana:"
curl -s http://localhost:5601/api/status >/dev/null 2>&1 && echo "✅ Kibana accessible" || echo "❌ Kibana not accessible"

# Test 1: Send sample blockchain data to Logstash
echo -e "\n${YELLOW}2. Sending test blockchain data to Logstash...${NC}"
cat << EOF | curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d @-
{
  "type": "blockchain",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "data": {
    "index": 1,
    "timestamp": $(date +%s),
    "data": {
      "score": 1500,
      "project": "test-game",
      "type": "game_result"
    },
    "hash": "test-hash-123",
    "previousHash": "previous-hash-456"
  },
  "source": "test-script"
}
EOF

echo -e "\n✅ Test blockchain data sent"

# Test 2: Send tournament data
echo -e "\n${YELLOW}3. Sending test tournament data to Logstash...${NC}"
cat << EOF | curl -X POST http://localhost:8080 -H "Content-Type: application/json" -d @-
{
  "type": "blockchain",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "data": {
    "index": 2,
    "timestamp": $(date +%s),
    "data": {
      "tournamentId": "test-tournament-001",
      "players": [
        {"id": "player1", "score": 2500},
        {"id": "player2", "score": 2200}
      ],
      "winner": "player1",
      "type": "tournament_result"
    },
    "hash": "tournament-hash-789",
    "previousHash": "test-hash-123"
  },
  "source": "test-script"
}
EOF

echo -e "\n✅ Test tournament data sent"

# Test 3: Check if data reached Elasticsearch
echo -e "\n${YELLOW}4. Checking if data reached Elasticsearch...${NC}"
sleep 5  # Wait for Logstash to process

echo "Checking blockchain-data index:"
curl -k -u elastic:iamsuperhero "https://localhost:9200/blockchain-data-*/_search?pretty&size=10" 2>/dev/null | grep -A5 '"hits"' || echo "❌ No blockchain data found"

# Test 4: List all indices
echo -e "\n${YELLOW}5. Available Elasticsearch indices:${NC}"
curl -k -u elastic:iamsuperhero "https://localhost:9200/_cat/indices?v" 2>/dev/null

echo -e "\n${GREEN}✅ ELK Stack pipeline test completed!${NC}"
echo "================================="
echo "Next steps:"
echo "1. Access Kibana: http://localhost:5601"
echo "2. Login: elastic / iamsuperhero"
echo "3. Create index patterns: blockchain-data-*"
echo "4. Create dashboards for game analytics"
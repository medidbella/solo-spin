#!/bin/bash

# Solo Spin Blockchain API Test Script

BASE_URL="http://localhost"
API_URL="$BASE_URL/api/blockchain"

echo "🚀 Testing Solo Spin Blockchain API..."
echo "=================================="

# Test 1: Health check
echo "1. Health Check"
echo "   GET /health"
curl -s "$BASE_URL/health" | jq '.' 2>/dev/null || curl -s "$BASE_URL/health"
echo -e "\n"

# Test 2: Get initial blockchain
echo "2. Get Blockchain"
echo "   GET $API_URL/blocks"
curl -s "$API_URL/blocks" | jq '.' 2>/dev/null || curl -s "$API_URL/blocks"
echo -e "\n"

# Test 3: Add a game result
echo "3. Add Game Result"
echo "   POST $API_URL/blocks"
curl -X POST "$API_URL/blocks" \
  -H "Content-Type: application/json" \
  -d '{"score": 1250, "project": "space-shooter-v2"}' \
  | jq '.' 2>/dev/null || curl -X POST "$API_URL/blocks" -H "Content-Type: application/json" -d '{"score": 1250, "project": "space-shooter-v2"}'
echo -e "\n"

# Test 4: Add another game result
echo "4. Add Another Game Result"
echo "   POST $API_URL/blocks"
curl -X POST "$API_URL/blocks" \
  -H "Content-Type: application/json" \
  -d '{"score": 890, "project": "platform-adventure"}' \
  | jq '.' 2>/dev/null || curl -X POST "$API_URL/blocks" -H "Content-Type: application/json" -d '{"score": 890, "project": "platform-adventure"}'
echo -e "\n"

# Test 5: Add tournament result
echo "5. Add Tournament Result"
echo "   POST $API_URL/blocks"
curl -X POST "$API_URL/blocks" \
  -H "Content-Type: application/json" \
  -d '{
    "tournamentId": "solo_tournament_001",
    "players": [
      {"id": "player_1", "score": 2100},
      {"id": "player_2", "score": 1850},
      {"id": "player_3", "score": 1600}
    ],
    "winner": "player_1"
  }' \
  | jq '.' 2>/dev/null || curl -X POST "$API_URL/blocks" -H "Content-Type: application/json" -d '{"tournamentId": "solo_tournament_001", "players": [{"id": "player_1", "score": 2100}, {"id": "player_2", "score": 1850}, {"id": "player_3", "score": 1600}], "winner": "player_1"}'
echo -e "\n"

# Test 6: Get latest block
echo "6. Get Latest Block"
echo "   GET $API_URL/blocks/latest"
curl -s "$API_URL/blocks/latest" | jq '.' 2>/dev/null || curl -s "$API_URL/blocks/latest"
echo -e "\n"

# Test 7: Get specific block
echo "7. Get Block by Index"
echo "   GET $API_URL/blocks/1"
curl -s "$API_URL/blocks/1" | jq '.' 2>/dev/null || curl -s "$API_URL/blocks/1"
echo -e "\n"

# Test 8: Get updated blockchain
echo "8. Get Updated Blockchain"
echo "   GET $API_URL/blocks"
curl -s "$API_URL/blocks" | jq '.' 2>/dev/null || curl -s "$API_URL/blocks"
echo -e "\n"

echo "✅ API testing completed!"
echo "=================================="
#!/bin/bash

echo "🚀 Starting Simulation..."

for i in {1..10}
do
  echo "--- Step $i ---"
  
  curl -s -X POST "http://localhost:8080/api/blockchain/blocks" \
    -H "Content-Type: application/json" \
    -d '{
      "tournamentId": "T42_SIM_'$i'",
      "players": [{"id": "player_'$RANDOM'", "score": '$((RANDOM % 100))'}],
      "winner": "player_'$i'"
    }'
    
  curl -s "http://localhost:8080/api/chat/unknown_route" > /dev/null

  sleep 1
done

echo "✅ Simulation Done. Now check Kibana!"
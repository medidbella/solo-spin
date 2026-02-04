#!/bin/sh

sleep 5

MAX_RETRIES=30
COUNT=0

echo "Waiting for Elasticsearch..."
until curl -s -k -u "elastic:${ELASTIC_PASSWORD}" "https://es01:9200/_cluster/health?wait_for_status=yellow" | grep -q '"status":"\(yellow\|green\)"'; do
    COUNT=$((COUNT + 1))
    if [ $COUNT -ge $MAX_RETRIES ]; then
        echo "Timeout: Elasticsearch was not ready in time."
        exit 1
    fi
    echo "Waiting for ES (Attempt $COUNT/$MAX_RETRIES)..."
    sleep 5
done

echo "ES is ready!"

# 1. Set kibana_system password
echo "Setting kibana_system password..."
curl -s -X POST -u "elastic:${ELASTIC_PASSWORD}" -k \
  -H "Content-Type: application/json" \
  "https://es01:9200/_security/user/kibana_system/_password" \
  -d "{\"password\":\"${KIBANA_PASSWORD}\"}"

# 2. Create ILM policy
echo "Creating ILM policy..."

curl -s -X PUT -u "elastic:${ELASTIC_PASSWORD}" -k \
  -H "Content-Type: application/json" \
  "https://es01:9200/_ilm/policy/solo-spin-retention" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "actions": {
            "rollover": {
              "max_age": "7d",
              "max_size": "50gb"
            }
          }
        },
        "delete": {
          "min_age": "1d", 
          "actions": { "delete": {} }
        }
      }
    }
  }'

  # 2.5. Create Index Template (The "Glue")
echo "Creating Index Template..."
curl -s -X PUT -u "elastic:${ELASTIC_PASSWORD}" -k \
  -H "Content-Type: application/json" \
  "https://es01:9200/_index_template/solo-spin-template" \
  -d '{
    "index_patterns": ["solo-spin-app-*"],
    "template": {
      "settings": {
        "index.lifecycle.name": "solo-spin-retention",
        "index.lifecycle.rollover_alias": "solo-spin-app"
      }
    }
  }'

# 3. Bootstrap index + alias
echo "Setting up write alias..."
if ! curl -s -f -o /dev/null -u "elastic:${ELASTIC_PASSWORD}" -k "https://es01:9200/solo-spin-app-000001"; then
    echo "Creating bootstrap index and alias..."
    curl -s -X PUT -u "elastic:${ELASTIC_PASSWORD}" -k \
      -H "Content-Type: application/json" \
      "https://es01:9200/solo-spin-app-000001" \
      -d '{
        "aliases": {
          "solo-spin-app": {
            "is_write_index": true
          }
        }
      }'
    echo "Bootstrap created"
else
    echo "Bootstrap already exists"
fi

echo "ES setup complete!"
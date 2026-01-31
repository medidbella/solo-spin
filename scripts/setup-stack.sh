#!/bin/bash

echo " Waiting for Elasticsearch to be available..."

until curl -s -k -u "elastic:${ELASTIC_PASSWORD}" "https://es01:9200/_cluster/health?wait_for_status=yellow&timeout=50s" > /dev/null; do
    echo "   ... ES is sleeping. Retrying in 5s"
    sleep 5
done
echo " Elasticsearch is UP!"

# ---------------------------------------------------------
# 1. SET KIBANA PASSWORD (The Root Fix)
# ---------------------------------------------------------
echo " Setting Kibana System Password..."
curl -s -k -X POST -u "elastic:${ELASTIC_PASSWORD}" \
    -H "Content-Type: application/json" \
    "https://es01:9200/_security/user/kibana_system/_password" \
    -d "{\"password\":\"${KIBANA_PASSWORD}\"}" > /dev/null
echo " Password set successfully."

# ---------------------------------------------------------
# 2. SETUP ILM (Log Retention - 7 Days)
# ---------------------------------------------------------
echo " Configuring ILM Policy (7 Days Retention)..."

curl -s -k -X PUT "https://es01:9200/_ilm/policy/solo-spin-retention" \
    -u "elastic:${ELASTIC_PASSWORD}" \
    -H "Content-Type: application/json" \
    -d '{
      "policy": {
        "phases": {
          "hot": { "min_age": "0ms", "actions": { "rollover": { "max_age": "1d", "max_size": "50gb" } } },
          "delete": { "min_age": "7d", "actions": { "delete": {} } }
        }
      }
    }'

echo -e "\n🔗 Linking Policy to Index Template..."

curl -s -k -X PUT "https://es01:9200/_index_template/solo-spin-template" \
    -u "elastic:${ELASTIC_PASSWORD}" \
    -H "Content-Type: application/json" \
    -d '{
      "index_patterns": ["solo-spin-app-*"],
      "template": { 
        "settings": { 
            "index.lifecycle.name": "solo-spin-retention",
            "index.lifecycle.rollover_alias": "solo-spin-app"
        } 
      }
    }'
echo -e "\n ILM Policy Enforced."

# ---------------------------------------------------------
# 3. IMPORT DASHBOARDS
# ---------------------------------------------------------
DASHBOARD_FILE="/dashboards/dashboard.ndjson"

KIBANA_API="http://kibana:5601/kibana"

if [ -f "$DASHBOARD_FILE" ]; then
    echo " Waiting for Kibana to be ready..."
    until curl -s -I "${KIBANA_API}/login" | grep -q 'HTTP/1.1'; do
        echo "   ... Kibana is loading."
        sleep 5
    done

    echo " Importing Kibana Dashboards..."
    curl -s -X POST "${KIBANA_API}/api/saved_objects/_import?overwrite=true" \
        -u "elastic:${ELASTIC_PASSWORD}" \
        -H "kbn-xsrf:true" --form file=@$DASHBOARD_FILE > /dev/null
    echo -e "\n Dashboards Imported Successfully."
else
    echo -e "\n⚠️ No dashboard file found at $DASHBOARD_FILE. Skipping import."
fi

echo "🚀 Stack Configuration Complete!"
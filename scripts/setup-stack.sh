#!/bin/bash

retry_curl() {
    local max_attempts=30
    local attempt=1
    local url=$1
    shift
    local curl_args="-s -k $@"

    echo "   Trying: $url"
    
    until curl $curl_args $url | grep -q "^{" || [ $attempt -eq $max_attempts ]; do
        echo "   ... waiting for service ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
}

echo "⏳ Waiting for Elasticsearch to be available..."

until curl -s -k -u "elastic:${ELASTIC_PASSWORD}" "https://es01:9200/_cluster/health?wait_for_status=yellow&timeout=50s" > /dev/null; do
    echo "   ... ES is sleeping. Retrying in 5s"
    sleep 5
done
echo "  Elasticsearch is UP!"

# ---------------------------------------------------------
# 1. SET KIBANA PASSWORD
# ---------------------------------------------------------
echo "🔐 Setting Kibana System Password..."
curl -s -k -X POST -u "elastic:${ELASTIC_PASSWORD}" \
    -H "Content-Type: application/json" \
    https://es01:9200/_security/user/kibana_system/_password \
    -d "{\"password\":\"${KIBANA_PASSWORD}\"}" > /dev/null
echo "  Password set."

# ---------------------------------------------------------
# 2. SETUP ILM (Log Retention - 7 Days)
# ---------------------------------------------------------
echo "📜 Configuring ILM Policy (7 Days Retention)..."

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
      "template": { "settings": { "index.lifecycle.name": "solo-spin-retention" } }
    }'
echo -e "\n  ILM Policy Enforced."

# ---------------------------------------------------------
# 3. IMPORT DASHBOARDS
# ---------------------------------------------------------
DASHBOARD_FILE="/dashboards/dashboard.ndjson"

if [ -f "$DASHBOARD_FILE" ]; then
    echo "⏳ Waiting for Kibana to be ready..."
    until curl -s -I http://kibana:5601 | grep -q 'HTTP/1.1 302 Found'; do
        echo "   ... Kibana is loading."
        sleep 5
    done

    echo "📊 Importing Kibana Dashboards..."
    curl -s -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
        -u "elastic:${ELASTIC_PASSWORD}" \
        -H "kbn-xsrf:true" --form file=@$DASHBOARD_FILE > /dev/null
    echo -e "\n  Dashboards Imported Successfully."
else
    echo -e "\n⚠️ No dashboard file found at $DASHBOARD_FILE. Skipping import."
fi

echo "🚀 Stack Configuration Complete!"
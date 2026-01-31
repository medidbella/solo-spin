#!/bin/sh

retry_curl() {
    max_attempts=30
    attempt=1
    url=$1
    shift
    curl_args="-s -k $@"
    
    until curl $curl_args "$url" | grep -q "^{" || [ $attempt -eq $max_attempts ]; do
        echo "   ... waiting for service at $url ($attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt+1))
    done
}

echo "⏳ Waiting for Elasticsearch to be available..."
retry_curl "https://es01:9200/_cluster/health?wait_for_status=yellow&timeout=50s" -u "elastic:${ELASTIC_PASSWORD}"
echo "✅ Elasticsearch is UP!"

# ---------------------------------------------------------
# 1. SET KIBANA PASSWORD (WITH VERIFICATION)
# ---------------------------------------------------------
echo "🔐 Setting Kibana System Password..."

if [ -z "$KIBANA_PASSWORD" ]; then
  echo "❌ ERROR: KIBANA_PASSWORD is empty!"
  exit 1
fi


RESPONSE=$(curl -s -k -X POST -u "elastic:${ELASTIC_PASSWORD}" \
    -H "Content-Type: application/json" \
    "https://es01:9200/_security/user/kibana_system/_password" \
    -d "{\"password\":\"${KIBANA_PASSWORD}\"}")

if echo "$RESPONSE" | grep -q "{}"; then
    echo "✅ Password set successfully."
else
    echo "❌ FAILED to set password! Response: $RESPONSE"

fi


echo "🔍 Verifying password..."
TEST_LOGIN=$(curl -s -k -o /dev/null -w "%{http_code}" -u "kibana_system:${KIBANA_PASSWORD}" "https://es01:9200/")

if [ "$TEST_LOGIN" = "200" ]; then
    echo "✅ Password verified! kibana_system can login."
else
    echo "❌ Password MISMATCH! ES returned HTTP $TEST_LOGIN"
    echo "♻️ Retrying force reset..."
    curl -s -k -X POST -u "elastic:${ELASTIC_PASSWORD}" \
        -H "Content-Type: application/json" \
        "https://es01:9200/_security/user/kibana_system/_password" \
        -d "{\"password\":\"${KIBANA_PASSWORD}\"}"
    echo "⚠️ Password reset attempted again."
fi

# ---------------------------------------------------------
# 2. SETUP ILM
# ---------------------------------------------------------
echo "📜 Configuring ILM Policy..."
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
    }' > /dev/null

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
    }' > /dev/null

# ---------------------------------------------------------
# 3. IMPORT DASHBOARDS (Non-blocking)
# ---------------------------------------------------------
DASHBOARD_FILE="/dashboards/dashboard.ndjson"
KIBANA_API="http://kibana:5601/kibana"

if [ -f "$DASHBOARD_FILE" ]; then
    echo "⏳ Waiting for Kibana API to be READY..."
    
    MAX_RETRIES=30
    COUNT=0
    until curl -s -k -u "elastic:${ELASTIC_PASSWORD}" -I "${KIBANA_API}/api/status" | grep -q "HTTP/1.1 200" || [ $COUNT -eq $MAX_RETRIES ]; do
        echo "   ... Kibana is initializing ($COUNT/$MAX_RETRIES)"
        sleep 10
        COUNT=$((COUNT+1))
    done

    if [ $COUNT -eq $MAX_RETRIES ]; then
        echo "⚠️ Kibana took too long. Skipping dashboard import for now."
    else
        echo "✅ Kibana is Ready! Importing Dashboards..."
        curl -s -X POST "${KIBANA_API}/api/saved_objects/_import?overwrite=true" \
            -u "elastic:${ELASTIC_PASSWORD}" \
            -H "kbn-xsrf:true" --form file=@$DASHBOARD_FILE > /dev/null
        echo "✅ Dashboards Imported."
    fi
else
    echo "⚠️ No dashboard file found."
fi

echo "🚀 Stack Configuration Complete!"
#!/bin/sh

# Small grace period after healthcheck
sleep 5

echo "Kibana is healthy proceeding with setup"
# 1. Import dashboards

if curl -s -u "elastic:${ELASTIC_PASSWORD}" "${KIBANA_URL}/api/status" | grep -q "available"; then
    echo "Kibana is up. Importing/Updating dashboards from $DASHBOARD_FILE_PATH..."
    
    curl -s -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
      -u "elastic:${ELASTIC_PASSWORD}" \
      -H "kbn-xsrf: true" \
      --form file=@$DASHBOARD_FILE_PATH
      
    echo "Done."
else
    echo "Kibana not ready yet."
fi
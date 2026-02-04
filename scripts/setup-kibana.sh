#!/bin/sh

# Small grace period after healthcheck
sleep 5

echo "Kibana is healthy proceeding with setup"

# 1. Import dashboards

if [ -f "$DASHBOARD_FILE_PATH" ]; then
    echo "Importing dashboards..."
    curl -s -X POST "${KIBANA_URL}/api/saved_objects/_import?overwrite=true" \
      -u "elastic:${ELASTIC_PASSWORD}" \
      -H "kbn-xsrf: true" \
      --form file=@$DASHBOARD_FILE_PATH
    echo "Dashboards imported"
else
    echo "No dashboard file found"
fi

echo "Kibana setup complete!"
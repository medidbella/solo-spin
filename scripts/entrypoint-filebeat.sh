#!/bin/bash

# Fix permissions strictly required by Filebeat
echo "🔒 Securing Filebeat configuration..."
chmod go-w /usr/share/filebeat/filebeat.yml
if [ -f /usr/share/filebeat/modules.d/logstash.yml ]; then
    chmod go-w /usr/share/filebeat/modules.d/logstash.yml
fi

# Hand over control to the standard Filebeat command
echo "🚀 Starting Filebeat..."

exec filebeat -e --strict.perms=false
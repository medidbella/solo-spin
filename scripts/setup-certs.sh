#!/bin/bash

if [ x${ELASTIC_PASSWORD} == x ]; then
  echo "Set the ELASTIC_PASSWORD variable"; exit 1;
fi;

# 1. Generate CA
if [ ! -f config/certs/ca.zip ]; then
  echo "Creating CA";
  bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
  unzip config/certs/ca.zip -d config/certs;
fi;

# 2. Generate Certs
if [ ! -f config/certs/certs.zip ]; then
  echo "Creating certs";
  echo -ne "instances:\n  - name: es01\n    dns:\n      - es01\n      - localhost\n    ip:\n      - 127.0.0.1\n" > config/certs/instances.yml;
  bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in config/certs/instances.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
  unzip config/certs/certs.zip -d config/certs;
fi;

# 3. Set Permissions
echo "Setting file permissions";
chown -R 1000:0 config/certs;
find config/certs -type d -exec chmod 750 \{\} \;;
find config/certs -type f -exec chmod 640 \{\} \;;
echo "✅ Certs ready. Setup Finished.";
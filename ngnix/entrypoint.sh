#!/bin/sh

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/nginx.crt"
KEY_FILE="$CERT_DIR/nginx.key"

mkdir -p $CERT_DIR

if [ ! -f "$CERT_FILE" ]; then
    echo "Certificates not found. Generating self-signed certs..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=MA/ST=Safi/L=BenGuerir/O=SoloSpin/CN=localhost"
    echo "Certificates generated successfully!"
else
    echo "Certificates already exist. Skipping generation."
fi

chmod 644 "$CERT_FILE"
chmod 600 "$KEY_FILE"

exec nginx -g "daemon off;"
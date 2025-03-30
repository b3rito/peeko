#!/bin/bash
mkdir -p certs
if [[ ! -f certs/cert.pem || ! -f certs/key.pem ]]; then
  openssl req -x509 -newkey rsa:2048 -nodes \
    -keyout certs/key.pem -out certs/cert.pem \
    -days 365 -subj "/CN=localhost"
  echo "[✔] cert generated"
else
  echo "[✓] cert already generated"
fi

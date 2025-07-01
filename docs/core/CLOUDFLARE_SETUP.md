# Cloudflare Tunnel Setup Instructions

## Prerequisites
1. Install cloudflared CLI tool
2. Authenticate with Cloudflare: `cloudflared tunnel login`
3. Create a tunnel: `cloudflared tunnel create dev-code-with-morais`
4. Copy the credentials file to cloudflare-credentials.json

## DNS Setup
Add a CNAME record in Cloudflare DNS:
- Name: dev
- Target: [tunnel-id].cfargotunnel.com

## Run Commands
1. Start the Flask app: `python app.py`
2. Start the tunnel: `cloudflared tunnel --config cloudflare-tunnel.yml run`

The site will be accessible at https://dev.codewithmorais.com

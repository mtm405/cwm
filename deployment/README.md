# Deployment Configurations

This directory contains all deployment-related configurations for the Code with Morais platform.

## Directory Structure

- `/docker`: Docker-related configurations
  - `docker-compose.yml`: Defines services, networks and volumes
  - `Dockerfile`: Instructions for building the Docker image

- `/cloud`: Cloud deployment configurations
  - `app.yaml`: Google Cloud App Engine configuration

- `/cloudflare`: Cloudflare configurations
  - `cloudflare-tunnel.yml`: Cloudflare Tunnel configuration for secure access to localhost

## Usage Instructions

### Docker Deployment

To build and run using Docker:

```bash
cd deployment/docker
docker-compose up -d
```

### Google Cloud Deployment

Deploy to Google Cloud App Engine:

```bash
gcloud app deploy deployment/cloud/app.yaml
```

### Cloudflare Tunnel

Start the Cloudflare tunnel to expose your local environment:

```bash
cloudflared tunnel --config deployment/cloudflare/cloudflare-tunnel.yml run
```

Or use the VS Code task "Start Cloudflare Tunnel".

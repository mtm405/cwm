# Environment Configurations

This directory contains environment configuration files for different deployment scenarios.

## Files

- `.env.example`: Template with example environment variables
- `.env.local`: Local development environment variables
- `.env.production`: Production environment variables

## Usage

Copy the appropriate file to the project root as `.env` for your specific environment:

```bash
# For local development
cp environments/.env.local .env

# For production
cp environments/.env.production .env
```

Note: The main `.env` file remains in the root directory as it's actively used by the application.

# Configuration Directory

This directory contains all configuration settings for the Code with Morais application.

## Structure

- `settings.py`: Core backend configuration classes and utilities
- `frontend/`: Frontend configuration files
- `environments/`: Environment-specific configuration files and templates
  - `.env.template`: Template for environment configuration

## Usage

Import configuration settings from this package:

```python
from config import get_config, setup_logging, Config

# Get configuration based on environment
config = get_config()

# Set up logging
setup_logging(config)
logger = logging.getLogger(__name__)
```

## Environment Variables

Configuration is loaded from environment variables. For development, copy 
`.env.template` to the project root as `.env` and customize as needed.

## Migration from Legacy Configuration

If you're updating from the older configuration system, you can use the `config_migration.py`
file in the root directory for a smooth transition. Import from that file during the 
migration period, then update to direct imports from `config` package.

For JavaScript configuration, use the config modules in the frontend directory.

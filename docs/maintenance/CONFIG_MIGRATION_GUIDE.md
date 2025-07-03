# Configuration Migration Guide

This guide explains how to migrate your code from using the old `config.py` file in the root directory to the new modular configuration package at `config/`.

## Why Migrate?

1. **Better Organization**: The new structure separates configuration by functionality
2. **Improved Maintainability**: Easier to find and update configuration settings
3. **Enhanced Security**: Better separation of sensitive configuration data
4. **Future-Proof**: Prepares for potential containerization and environment-specific configurations

## Migration Process

We're taking a gradual approach to migration to minimize disruption:

1. **Track Migration**: Use `migrate_config.py` to track which modules have been migrated
2. **Gradual Updates**: Update imports in one module at a time
3. **Testing**: Test thoroughly after each module is migrated
4. **Completion**: Remove the transition helpers when all modules are migrated

## Step-by-Step Guide

### 1. Check Current Status

Run the migration helper to see which modules still need to be migrated:

```bash
python migrate_config.py status
python migrate_config.py scan
```

### 2. Update a Module

For each module (Python file) that needs to be migrated:

#### a. Change imports from:

```python
from config import get_config, setup_logging, Config
# or
import config
```

#### b. To the new location:

```python
from config import get_config, setup_logging, Config
```

### 3. Mark Module as Migrated

After updating and testing a module, mark it as migrated:

```bash
python migrate_config.py migrate module_name
```

Replace `module_name` with a meaningful identifier for the module (usually the filename without extension).

### 4. Continue Until Complete

Repeat steps 2-3 for all modules. You can check progress with:

```bash
python migrate_config.py status
```

### 5. Clean Up (Future)

Once all modules are migrated, we'll:
- Remove the `config.py` file from the root
- Remove the migration helpers
- Update documentation

## Need Help?

If you encounter any issues during migration, contact the DevOps team for assistance.

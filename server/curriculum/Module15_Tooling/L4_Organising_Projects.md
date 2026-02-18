# 🏗️ Organizing Python Projects

As projects grow beyond a single script, organization becomes critical. Python's module system allows you to split code across multiple files.

## 1. Modules vs. Packages

**Module**: Any `.py` file. The filename (without `.py`) is the module name.

**Package**: A directory containing multiple module files AND a special `__init__.py` file.

## 2. Basic Project Structure

my_project/
├── main.py # Entry point
├── utils/ # Package
│ ├── init.py
│ ├── helpers.py
│ └── validators.py
├── config.py # Module
└── requirements.txt

## 3. Importing Across Files

```python
# From the same directory
import config
from config import API_KEY

# From a subpackage
from utils.helpers import format_date
from utils.validators import validate_email

# Relative imports (within packages)
from .helpers import format_date
```

## 4. The `__init__.py` File

This file marks a directory as a Python package and controls what gets imported:

```python
# utils/__init__.py
from .helpers import format_date
from .validators import validate_email

__all__ = ['format_date', 'validate_email']
```

## 5. Exercise: Restructure a Script

Take the single-file random user fetcher and split it into:

- `main.py` - Entry point
- `api/client.py` - API calls
- `utils/formatters.py` - Name formatting
- `config/settings.py` - Configuration

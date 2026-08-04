# 🏗️ Organizing Python Projects

As projects grow beyond a single script, organization becomes critical. Python's module system allows you to split code across multiple files to keep it manageable, reusable, and professional.

## 1. Splitting a Script

Imagine you have a single file called `app.py` that contains **_all_** of your code. It fetches user data from the web, formats it, and prints it. As this script grows, it becomes a "spaghetti" mess. To clean it up, we restructure it into a professional layout.

### The New Architecture

```text
my_project/
├── main.py              # The Entry Point
├── api/                 # Package for external logic
│   ├── __init__.py
│   └── client.py        # Logic for API calls
├── utils/               # Package for helper logic
│   ├── __init__.py
│   └── formatters.py    # Logic for text formatting
├── config/              # Package for settings
│   ├── __init__.py
│   └── settings.py      # Logic for configuration
└── requirements.txt     # List of dependencies
```

| File                  | Description         | Responsibility                                                            |
| --------------------- | ------------------- | ------------------------------------------------------------------------- |
| `main.py`             | **The Entry Point** | This is the file you actually run. It coordinates the other modules.      |
| `api/client.py`       | **The Logic**       | Contains the functions that talk to the internet (using `requests`).      |
| `utils/formatters.py` | **The Helpers**     | Contains pure logic, like turning `"JOHN DOE"` into `"John Doe"`.         |
| `config/settings.py`  | **The Data**        | Stores things like API URLs or timeout settings so they aren't hardcoded. |

```python
# main.py
from config.settings import API_URL
from api.client import fetch_user
from utils.formatters import clean_name

def run():
    raw_data = fetch_user(API_URL)
    name = clean_name(raw_data['name'])
    print(f"User found: {name}")

if __name__ == "__main__":
    run()
```

### Why bother doing this?

1. **Focus:** If there is a bug in the API connection, you know exactly which file to open (`api/client.py`). You don't have to scroll through name-formatting logic to find it.
2. **Reuse:** You can now use `clean_name` in a completely different project just by copying the `utils` folder.
3. **Collaboration:** Two people can work on the project at the same time—one on the API logic and one on the formatting—without touching the same file.

## 2. Modules vs. Packages

Now that we see the structure, let's define the components we just used:

:::note

- **Module:** Any `.py file`. The filename (without `.py`) is the module name (e.g., `settings.py` is the `settings` module).
- **Package:** A directory (like `utils/` or `api/`) that contains multiple module files and a special `__init__.py` file.
  :::

## 3. Importing Across Files

To connect these files, you use imports. There are two ways to tell Python where to look:

:::note

- **Absolute Imports** Specify the full path from the project root: `from utils.helpers import format_date` (Clear and preferred).
- **Relative Imports** Use "dot" notation to look at neighboring files: `from .helpers import format_date` (The `.` means "look in my current folder").
  :::

```python
# From the same directory
import config
from config import API_KEY

# From a subpackage
from utils.helpers import format_date
from utils.validators import validate_email
import utils.formatters as fmt

# Relative imports (within packages)
from .helpers import format_date
```

## 4. The `__init__.py` File: The Package Gatekeeper

Think of a package like a large office building. The modules are the individual offices. The `__init__.py` file is the **receptionist** at the front desk. It serves three purposes:

1. **Marking the Territory:** It tells Python, _"This directory is a package; you are allowed to import from here."_
2. **Simplifying Imports:** You can "hoist" functions to the top level. Instead of a user typing `from utils.validators import email`, they can just type `from utils import email` if you've set it up in `__init__.py`.
3. **Controlling Exports:** Using the `__all__` list, you can decide exactly which functions are "public" for other people to use.

```python
# utils/__init__.py
from .helpers import format_date
from .validators import validate_email

# Only these will be available if someone uses 'from utils import *'
__all__ = ['format_date', 'validate_email']
```

:::summary

- **Organization:** Good projects are split by responsibility (API, Utils, Config).
- **Modules:** Individual `.py files`.
- **Packages:** Directories containing modules and an `__init__.py` file.
- **Entry Point:** The `main.py` file that ties everything together.
- **Absolute vs. Relative:** Use full paths for clarity, or dots for internal package links.
- `__init__.py`: The gatekeeper that marks packages and simplifies how others import your code.

:::

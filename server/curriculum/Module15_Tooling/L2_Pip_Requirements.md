# 📦 Package Management with `pip` and `requirements.txt`

`pip` (which stands recursively for "Pip Installs Packages" or sometimes "Preferred Installer Program") is the official package installer for Python. It is used to install and manage packages found in the Python Package Index (PyPI).

## 1. Essential `pip` Commands

When your virtual environment is active, `pip` commands target _only_ that environment.

### A. Installing Packages

To install a package, you simply use `pip install`. You can optionally specify a version using comparison operators (`==`, `>=`, etc.).

```bash
# Install the latest stable version of the 'requests' library

(my_env) $ pip install requests

# Install an older, specific version

(my_env) $ pip install numpy==1.22.0
```

### B. Listing Installed Packages

To see everything installed in the current environment, use `pip list`.

```bash
(my_env) $ pip list

Package     Version
---------   --------
certifi     2023.11.17
pip         23.3.1
requests    2.31.0
setuptools  68.2.2
```

## C. Uninstalling Packages

To remove a package from the current environment, use `pip uninstall`.

```bash
(my_env) $ pip uninstall requests
```

## 2. Managing Dependencies with `requirements.txt`

When you share a Python project, you should include a file that lists all necessary external dependencies. By convention, this file is named `requirements.txt`.

### A. Freezing Dependencies (`pip freeze`)

The `pip freeze` command lists all installed packages in a _format suitable for use in a requirements file_. You use shell redirection (`>`) to save this output to a file.

```bash
# Create a requirements.txt file with current packages and versions

(my_env) $ pip freeze > requirements.txt
```

### Example `requirements.txt` content:

```bash
certifi==2023.11.17
charset-normalizer==3.3.2
idna==3.6
requests==2.31.0
urllib3==2.1.0
```

### B. Installing from a Requirements File

If you receive a project that has a `requirements.txt` file, you can recreate the exact environment by passing the file path to `pip install` using the `-r`(requirements) flag.

```bash
# Install all packages listed in the file

(new_env) $ pip install -r requirements.txt
```

This is the standard, reproducible way to manage and share Python dependencies across teams and deployment environments.

:::summary

- **What is `pip`?:** The standard package manager for Python used to download and install libraries from the Python Package Index (PyPI).
- **Installation:** Use `pip install <package_name>` to add new tools to your active environment. You can use `==` to specify an exact version.
- **Inventory:** `pip list` shows you what is installed, while `pip freeze` shows it in a "reproducible" format.
- **Requirements.txt:** This convention file acts as a "shopping list" for your project. It allows other developers to recreate your exact setup.
- **Workflow:** Install packages. → Use `pip freeze > requirements.txt` to save the list. → Share the file so others can run `pip install -r requirements.txt`.
  :::

# 📦 Creating Your Own Packages

Beyond organizing code within a project, you can create reusable packages that can be installed and imported across projects.

## 1. Package Structure Requirements

mypackage/
├── mypackage/ # Main package directory
│ ├── init.py
│ ├── core.py
│ └── utils.py
├── tests/ # Optional: test files
│ └── test_core.py
├── README.md # Documentation
└── setup.py # Installation configuration

## 2. The setup.py File

```python
from setuptools import setup, find_packages

setup(
    name="mypackage",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "requests>=2.0.0",
        "python-dotenv>=1.0.0"
    ],
    author="Your Name",
    description="A brief description",
    python_requires=">=3.8",
)
```

## 3. Installing Your Package

```bash
# Editable install (develop mode) - changes reflect immediately
pip install -e .

# Regular install
pip install .
```

## 4. Importing Your Package Anywhere

```python
# From any Python script on your system
import mypackage
from mypackage.core import my_function
```

## 5. Exercise: Package Your API Client

Convert your random user fetcher into an installable package with:

- Proper package structure
- setup.py configuration
- Editable installation
- Import testing

# 📦 Virtual Environments: `venv`

In professional Python development, you will inevitably work on multiple projects simultaneously. Each project often requires specific versions of third-party libraries (dependencies).

A **Virtual Environment** is a self-contained directory that hosts a specific Python interpreter and its own set of installed packages, completely isolated from other projects and the system-wide Python installation.

## 1. Why Use Virtual Environments?

The isolation provided by virtual environments (`venv`) is essential for two main reasons:

1. **Dependency Conflicts**: If Project A requires `requests==2.20.0` and Project B requires `requests==3.0.0`, installing both globally would break one of the projects. `venv` prevents this conflict by giving each project its own isolated space.

2. **Cleanliness and Reproducibility**: You can keep your system Python clean, containing only standard libraries. When you share a project, you only share the list of dependencies needed for that _specific project_, making it easy for others to reproduce your environment.

## 2. Creating a Virtual Environment

The `venv` module is built into Python (since version 3.3). You create a new virtual environment using the command line.

**Command**: `python3 -m venv <environment_name>`

• `python3 -m venv`: Tells Python to run the `venv` module.

• `<environment_name>`: The name of the directory where the environment files will be stored. By convention, this is often named `.venv` or `venv`.

```python
# Example: Creating an environment named 'my_project_env'

python3 -m venv my_project_env
```

## 3. Activating the Environment

Creating the environment only sets up the files; you must **activate** it to start using its isolated interpreter.

| Operating System         | Activation Command                          |
| ------------------------ | ------------------------------------------- |
| macOS/Linux              | `source <environment_name>/bin/activate`    |
| Windows (Command Prompt) | `.\<environment_name>\Scripts\activate.bat` |
| Windows (PowerShell)     | `.\<environment_name>\Scripts\Activate.ps1` |

Once activated, your command line prompt will typically show the environment name in parentheses (e.g., `(my_project_env) $`). Any Python packages you install now will only reside within this specific environment.

## 4. Deactivating the Environment

When you are finished working on a project, simply run the following command to return to your system's global Python interpreter:

```python
deactivate
```

This command works universally across Linux, macOS, and Windows.

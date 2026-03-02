# 📦 Creating Your Own Packages

In Lesson 4, we learned how to organize a project so _we_ can use it. In this lesson, we learn how to package it so the **_rest of the world_** can use it. This is called **Distribution**.

## 1. The "Package within a Project" Pattern

When you look at a professional _GitHub_ repository, you’ll notice a "double folder" structure. This separates the code you want to share from the "junk" (tests, READMEs, licenses) that helps you manage the project.

```text
my_tool_project/         # The "Project Root" (The outer shell)
├── pyproject.toml       # The ID Card (Installation instructions)
├── README.md            # The Manual
├── LICENSE              # The Rules
├── tests/               # The Quality Check
└── my_tool/             # THE ACTUAL PACKAGE (What gets installed)
    ├── __init__.py
    ├── core.py
    └── utils.py
```

## 2. The Project ID Card: `pyproject.toml`

For your code to be "installable," it needs a configuration file. While older projects used `setup.py`, modern Python uses `pyproject.toml`.

Think of this as the Instruction Manual for `pip`. It tells Python what your package is named and what other libraries it needs to download to work.

```Ini, TOML
[project]
name = "my_cool_tool"
version = "0.1.0"
description = "A package that does amazing things"
dependencies = [
    "requests>=2.25.1",
    "rich"
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"
```

## 3. Installing in "Editable" Mode

When you are writing your own package, you don't want to have to re-install it every time you fix a typo.

Instead, we use **Editable Mode**. This creates a "live link" between your project folder and your Python environment.

The Command:

```bash
# Editable install (develop mode) - changes reflect immediately
pip install -e .

```

- `-e`: Stands for **Editable**.
- `.`: Tells pip to look in the **current folder** for the installation instructions.

:::tip
Once you run this, you can open a terminal anywhere on your computer, type `import my_cool_tool`, and it will work! If you change the code in your folder, those changes are reflected instantly without needing a second install.
:::

## 4. Why Package Your Code?

1. **Professionalism:** It allows you to share your work on **PyPI** (The Python Package Index) for others to use via `pip install your-package`.
2. **Portability:** You can use your custom logic across 10 different projects on your machine without copy-pasting code 10 times.
3. **Dependency Management:** If your code needs `requests`, the package configuration ensures that `requests` is installed automatically when someone installs your package.

:::summary

- **Distribution:** The process of making your code installable as a library.
- **The Structure:** Separating the "Package" folder from the "Project" root.
- `pyproject.toml`: The modern standard for defining package metadata and dependencies.
- **Editable Install:** Using `pip install -e` . to link your source code to your environment for live development.
- **Portability:** Packaged code can be imported from any directory on your system once installed.
  :::

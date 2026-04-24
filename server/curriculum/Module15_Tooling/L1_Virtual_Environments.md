# 📦 Virtual Environments: `venv`

:::tip
If you downloaded **VS Code** or **PyCharm** in Module 0, now is the perfect time to open them! Look for the **Terminal** tab. This is where you will type the commands shown in this lesson. Using an IDE makes managing these environments much easier. However, you can still follow along on the website if you do not wish to use an IDE.
:::

## 1. What is a Virtual Environment?

Up until now, we have been writing "Pure Python" logic. But as you build bigger things, you will start using **Packages** (tools written by other people).

Imagine Python is like a shared kitchen.

- If you bake a cake (Project A) and your roommate makes spicy curry (Project B) at the exact same time on the same stove, things get messy. The flavors might mix, and someone’s meal will be ruined.
- A **Virtual Environment** is like giving each project its own private, miniature kitchen. Everything you do in Project A's kitchen stays there and doesn't smell up Project B.

## 2. Why do we need them?

1. **Avoid Version Wars:** One project might need "Tool Version 1.0," while another needs "Tool Version 2.0." If you install them globally, they will fight. Virtual environments keep them separated.
2. **Keep it Clean:** You don't want to clutter your computer with hundreds of tools you only used for one specific task.

## 3. Creating Your "Private Kitchen"

We use the **Command Line** (Terminal) to create these environments. Think of the terminal as a way to talk directly to your computer's operating system instead of using a mouse.

:::note
When we talk about the **System Terminal** or **Command Line**, it is different from the **Python Terminal** we have included with our code editor at the bottom of each lesson. The Python terminal is for running Python code; the System Terminal is for managing your computer's files and settings. You won't be able to run **bash** commands on this website, but you will use them every day once you move your coding to your own computer!
:::

**The Command**: `python -m venv .venv`

```bash
# 1. Navigate to your project folder
cd my_python_project

# 2. Create the environment
python -m venv .venv

# 3. Activate it (example for Mac/Linux)
source .venv/bin/activate

# 4. (Optional) Check where your Python is running from
which python
# Output should point to your .venv folder!
```

| Part      | What it means                                                                 |
| --------- | ----------------------------------------------------------------------------- |
| `python`  | "Hello Python"                                                                |
| `-m venv` | "Run the **V**irtual **ENV**ironment module."                                 |
| `.venv`   | The name of the folder you want to create. (We usually just call it `.venv`). |

## 4. Activating the Environment

Creating the folder is like buying the kitchen equipment—you still have to "walk inside" to start cooking. This is called **Activating**.

| If you are using... | Type this command:          |
| ------------------- | --------------------------- |
| **Windows**         | `.\.venv\Scripts\activate`  |
| **Mac / Linux**     | `source .venv/bin/activate` |

### How do I know it worked?

Look at your terminal prompt. You should see `(.venv)` appear at the start of the line. This is Python’s way of saying: _"You are now cooking in your private kitchen!"_

_File Directory:_

```bash
my_project/
├── script.py
├── data.csv
└── .venv/         <-- Your "Private Kitchen" lives here!
    ├── bin/ (or Scripts/)
    ├── lib/
    └── pyvenv.cfg
```

## 5. Leaving the Environment

When you're done, you don't need to close the window. Just tell Python you're leaving:

```bash
deactivate
```

This "shuts the door" to that environment and puts you back in your main system kitchen.

:::summary

- **Isolation:** Virtual environments keep project dependencies separate so they don't "pollute" your main computer.
- **Creation:** Use `python -m venv <name>` to build a new environment.
- **Activation:** You must "activate" the environment before Python knows to use that specific "private kitchen."
- **Verification:** If you see the name of your environment in parentheses `(.venv)` in your terminal, it is working!
- **Exit:** Type `deactivate` at any time to return to your normal system settings.
  :::

# Welcome to Python! 🐍

Python is one of the most popular programming languages in the world. It's known for being easy to read and write, making it perfect for beginners. Major companies like Google, NASA, Instagram, and Spotify use Python to build their products.

## Why Python?

Python is a **high-level** programming language, which means it's designed to be easy for humans to understand. Unlike some other languages that use complicated symbols and syntax, Python reads almost like English.

## Your First Python Command: print()

The most fundamental thing you'll do in programming is displaying information on the screen. In Python, we use the `print()` function to do this.

Here is a line of Python code:

```python
print("Hello, Python!")
```

### Breaking It Down

Let's understand each part:

- **print** - This is the function name. It tells Python we want to display something.
- **()** - Parentheses hold the information we want to print. Functions in Python always use parentheses.
- **"Hello, Python!"** - This is a **string** (text). We put strings inside quotation marks so Python knows it's text, not code.

When you run this code, you'll see this output:

```
Hello, Python!
```

## Try Different Messages

You can print any message you want! Here are some examples:

```python
print("My name is Lucy")
print("I love learning Python!")
print("I need your clothes, your boots, and your motorcycle")
```

Each `print()` statement will display its message on a new line.

### Important: Quotation Marks Matter

You can use either double quotes `"` or single quotes `'`, but they must match:

```python
print("This works!")
print('This also works!')
print("This doesn't work!')  # ❌ Mismatched quotes!
```

# 🧩 The Syntax Blueprint: Comments & Indentation

Every language has rules—and Python's rules for structure are simple but strict! Learning them now will prevent many frustrating errors later.

## ✏️ 1. Comments: Notes to Yourself

**Comments** are lines of code that Python ignores. They are used by programmers to leave notes, explain complex logic, or temporarily disable code.

- **How to use them:** Start the line with a hash mark (`#`).

```python
# This is a comment, Python skips this line.
print("I'm running!") # You can also add comments on the same line.
```

For longer explanations, you can use multiple comment lines:

```python
# This function calculates the total price
# It takes the base price and adds tax
# We'll learn about functions in Module 6
```

## 📐 2. Indentation: Python's Structure

This is the most important rule of Python's structure: **Indentation** (the space at the beginning of a line) is used to define blocks of code.

Unlike many other languages that use curly braces `{}` or keywords like `END`, Python uses white space to group statements. We recommend using **4 spaces** for every level of indentation.

For example, when we learn about loops or functions, the lines that belong inside that loop or function must be indented:

```python
# This line is at level 0 (no indentation)

if 5 > 2: # This line is also at level 0
    print("5 is bigger than 2") # This is level 1 (4 spaces indented)
    print("The condition was True!") # Also level 1

# This line is back at level 0
print("This line runs no matter what")
```

If you don't indent correctly, Python will stop and give you an `IndentationError`.

### Be Consistent!

Always use the same indentation style throughout your code. Don't mix tabs and spaces—pick one (we recommend 4 spaces) and stick with it. Most code editors can be set to insert 4 spaces when you press the Tab key.

:::warning
NOTE: This code editor does automatically format an indentation (1 space), but we recommend you get used to inputting your own.
:::

:::summary

- Python is a beginner-friendly programming language used by major companies
- The `print()` function displays text on the screen
- Text (strings) must be wrapped in quotation marks (`"` or `'`)
- Comments `#` let you leave notes that Python ignores
- **Indentation** defines code blocks in Python (use 4 spaces consistently)
- Python is strict about indentation and will give errors if it's incorrect

:::

In the next lesson, you'll learn about how to store and retrieve data in a **variable**.

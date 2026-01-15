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

If you don't indent correctly, Python will stop and give you an **IndentationError**.

### Important: Be Consistent!

Always use the same indentation style throughout your code. Don't mix tabs and spaces—pick one (we recommend 4 spaces) and stick with it. Most code editors can be set to insert 4 spaces when you press the Tab key.

NOTE: This code editor does automatically format an indentation, but we recommend you get used to inputting your own.

## 🛠️ Challenge: Practice Indentation

Instructions: In the coding window, indent the `print()` statement using 4 spaces so that the program runs without an error. If you remove the indentation, you should see an IndentationError.

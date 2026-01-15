# The Code Editor ✨

This is where the magic happens! The code editor is your workspace for writing Python programs. Let's explore its features.

## Editor Layout

┌────────────────────────────────────────┐
│ 1 # Write your Python code here │
│ 2 print("Hello, World!") │
│ 3 x = 10 │
│ 4 y = 20 │
│ 5 print(x + y) │
│ 6 │
└────────────────────────────────────────┘

### Key Components:

1. **Line Numbers** (left side): Help you navigate and reference specific lines
2. **Editing Area** (center): Where you type your Python code
3. **Syntax Highlighting**: Code is color-coded for readability

## Syntax Colors Explained

Different parts of your code appear in different colors:

```python
# Comments are green and start with #
# They help explain your code

print("Text goes here")  # Strings are orange

x = 42                  # Numbers are purple
y = 3.14                # Decimals too!

if x > 10:              # Keywords (if, for, def) are blue
    print("Large!")     # Indentation matters in Python!
```

## Editor Features

**Auto-complete**

As you type, the editor suggests completions:

• Type `pri` and press **Tab** → `print` appears

• Type `for` and press **Tab** → complete `for` loop template appears

## Error Detection

The editor spots common mistakes:

• Missing parentheses or quotes

• Syntax errors (highlighted in red)

• Indentation issues (Python cares about spaces!)

## Code Folding

Click the `[-]` next to line numbers to collapse code blocks:

```python
def calculate_total(items):  # Click [-] to hide function body
    total = 0
    for item in items:
        total += item.price
    return total
```

## Writing Your First Code

Try typing this in the editor (we'll run it in the next lesson):

```python
# This is a comment - it doesn't run
print("Python is awesome!")

# Variables store data
name = "Code Explorer"
age = 25

# Print multiple things
print("Name:", name)
print("Age:", age)
```

## Pro Tips 💡

1. Indent with Tab: Python uses 4 spaces for indentation (Tab key does this)

2. Format Code: Use the Format button to fix indentation automatically (the code editor will automatically indent your code for you but it is good practice to check it yourself)

3. Zoom: `Ctrl+Scroll` to adjust text size

4. Multiple Cursors: `Ctrl+Click` (or `Cmd+Click` on Mac) to edit multiple lines

## Next Up: Running Your Code

In the next lesson, you'll learn how to execute this code and see the results!

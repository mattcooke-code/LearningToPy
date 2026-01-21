# Running Your Code 🚀

Now let's put everything together! You'll learn how to execute Python code and understand what happens behind the scenes.

## The Run Button

Located above the editor, you'll find the most important button:

┌───────────────────────┐
│ ▶ Run Code │
└───────────────────────┘

### What happens when you click it:

1. Your code is sent to our Python interpreter
2. Python executes it line by line
3. Results appear in the terminal
4. Status shows if it succeeded or failed

## Running Your First Program

Try this example in the editor:

```python
# Simple greeting program
name = "Python Learner"
print(f"Hello, {name}!")
print("Welcome to programming!")

# Simple calculation
apples = 5
oranges = 3
total_fruit = apples + oranges
print(f"Total fruit: {total_fruit}")
```

Click Run Code and watch the terminal:

```python
> > > Running your code...
> > > Hello, Python Learner!
> > > Welcome to programming!
> > > Total fruit: 8
> > > Code executed successfully!
```

## Understanding Execution Flow

Python runs your code from top to bottom:

```python
print("Step 1: Starting program")      # Runs first
age = 25                               # Runs second
print(f"Age: {age}")                   # Runs third
print("Step 4: Program complete")      # Runs fourth
```

Order matters! Variables must be created before you use them.

## Code Submission vs Running

There are two ways to execute code:

**1. Run Code (Practice Mode)**

• Tests your code immediately

• Shows output in terminal

• No progress tracking

• Great for experimenting

**2. Submit Code (Lesson Mode)**

• Checks if your solution is correct

• Awards XP points if successful

• Advances your progress

• Used in exercises and projects

## Error Messages Are Your Friends

If your code has errors, don't worry! Python helps you fix them:

```python
print("Hello World"  # Missing closing parenthesis
```

Running this shows:

SyntaxError: unexpected EOF while parsing
File "<string>", line 1
print("Hello World"
^
Hint: You might be missing a closing parenthesis.

Read error messages carefully! They tell you:

• What type of error occurred

• Where it happened (file and line number)

• Often a hint about how to fix it

## Common Running Issues & Solutions

**Problem: Nothing happens when I click Run**

_Solution_: Check if your code has `print()` statements. Python only shows output when you explicitly print.

**Problem: "NameError: name 'x' is not defined"**

_Solution_: You're using a variable before creating it. Define variables before using them.

**Problem: "IndentationError: unexpected indent"**

_Solution_: Python cares about spaces! Make sure your indentation is consistent (use Tab key).

## Practice Exercise

Try running this code and observe what happens:

```python
# Temperature converter
celsius = 25
fahrenheit = (celsius * 9/5) + 32

print(f"{celsius}°C is equal to {fahrenheit}°F")
print("Conversion complete!")
```

## Running Shortcuts

Keyboard: `Ctrl+Enter` (or `Cmd+Enter` on Mac)

• Faster than clicking the button

• Keep your hands on the keyboard

Editor Context Menu: Right-click → "Run Code"

• Alternative method

## What's Next?

Once you're comfortable running code, you'll learn about:

• Submitting code for exercises (with XP rewards!)

• Understanding test cases and requirements

• Debugging techniques when things go wrong

## Pro Tips 💡

1. _Run often_: Test small pieces as you write
2. _Fix one error at a time_: Start with the first error listed
3. _Read output carefully_: Sometimes the answer is in the error message
4. _Use comments_: `# TODO` or `# FIXME` to mark areas needing work

Ready to earn your first XP? In the next lesson, you'll learn how lessons and progress work!

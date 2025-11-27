# 🐛 Basic Debugging with `pdb`

Debugging is the systematic process of finding and fixing bugs in your code. Python comes with a powerful, interactive source code debugger called `pdb` (**Python Debugger**). Using `pdb` allows you to pause execution, step through code line-by-line, and inspect variable values.

## 1. Entering the Debugger

The simplest way to use `pdb` is to insert a breakpoint directly into your code where you suspect a problem might occur.

### How to set a breakpoint:

1. **For Python 3.7+**: Use the built-in function `breakpoint()`.

2. **Older versions or General Use**: `import pdb; pdb.set_trace()`

When Python executes the line containing `breakpoint()` or `pdb.set_trace()`, it pauses and drops you into the (`Pdb`) interactive shell.

## 2. Essential `pdb` Commands

Once inside the (`Pdb`) shell, you use short commands to control the execution flow and inspect the program state.

| Command | Short Form | Function                                                                   |
| ------- | ---------- | -------------------------------------------------------------------------- |
| `n`     | `next`     | Continues execution to the next line in the current function.              |
| `s`     | `step`     | Steps into a function call. Use this to dive deeper into custom functions. |
| `c`     | `continue` | Continues execution until the next breakpoint or the end of the program.   |
| `p`     | `print`    | Prints the value of a variable or expression. (`p my_variable`)            |
| `l`     | `list`     | Lists the code surrounding the current line.                               |
| `q`     | `quit`     | Terminates the debugger and the program immediately.                       |

## 3. The Debugging Workflow

A typical debugging session using `pdb` involves:

1. **Insert Breakpoint**: Place `breakpoint()` where the error is likely happening (e.g., right before a function call that is failing).

2. **Run Code**: Execute the script.

3. **Inspect**: Use `p` to check the values of input variables. Are they what you expect?

4. **Step**: Use `n` (next) or `s` (step) to move through the code slowly.

5. **Identify**: Find the exact line where a variable's value changes unexpectedly or where the program raises an exception.

6. **Fix and Retry**: Quit the debugger (`q`), fix the bug in your source code, and run again.

```python
def calculate_average(numbers):
total = sum(numbers) # The error is here: We accidentally divide by 0 if the list is empty! # Let's set a breakpoint right before the division.
breakpoint() # Try running the code and inspecting 'total' and 'len(numbers)' when the list is empty.

    return total / len(numbers)

data = [10, 20, 30]
print(calculate_average(data)) # Works fine

empty_data = []
print(calculate_average(empty_data)) # Will hit the breakpoint and then fail if continued
```

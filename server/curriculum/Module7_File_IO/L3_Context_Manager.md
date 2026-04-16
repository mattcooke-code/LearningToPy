# 🧤 Safe File Handling: The `with open(...)` Context Manager

In the previous lessons, you learned that you **must** call `.close()` after you are done with a file. Forgetting to do so can lead to resource issues or data corruption.

The **`with` statement** provides a safer, more robust, and Pythonic way to handle file operations.

## 1. Introducing the Context Manager

The `with` statement uses a **context manager** to ensure a _setup step_ (like opening a file) and a _teardown step_ (like closing a file) are automatically executed, even if errors occur.

The syntax looks like this:

```python
with open(file_path, mode) as file_handle:
    # Code block where the file is open and usable
    content = file_handle.read()

# Once the 'with' block exits (no matter how), the file is automatically closed
print("File operation complete. File is closed.")
```

## 2. Automatic Closure and Error Safety

The main advantage of `with open(...)` is that it guarantees the file's `.close()` method is called.

- **Normal Execution**: When the code reaches the end of the `with` block.
- **Exception/Error**: If an error (exception) occurs inside the `with` block, the file is still closed before the program crashes or the exception is handled by a `try/except` block.

## 3. Comparing Approaches

| Method              | Syntax                               | Closure Guarantee                | Safety                             | Recommended Use        |
| ------------------- | ------------------------------------ | -------------------------------- | ---------------------------------- | ---------------------- |
| **Manual**          | `f = open(...); f.read(); f.close()` | ❌ No, depends on developer.     | 🔴 Low (easy to forget `.close()`) | ❌ Avoid this pattern  |
| **Context Manager** | `with open(...) as f:`               | ✅ Yes, automatic and guaranteed | 🟢 High (safer, cleaner code)      | ✅ **Always use this** |

## 4. Example: Using `with` for Reading

Here is the most common way to read a file in Python:

```python
data_lines = []

try:
    with open('log.txt', 'r') as log_file:
        # The file object is assigned to 'log_file'
        for line in log_file:
            data_lines.append(line.strip())
   
    # Outside the 'with' block, 'log_file' is closed.
    # We can now safely process 'data_lines'
    print(f"Lines processed: {len(data_lines)}")

except FileNotFoundError:
    print("The log file could not be found.")
```

Notice that we did not need to explicitly call `log_file.close()`. The `with` statement handled it automatically.

## 5. Handling Multiple Files

You can nest `with` statements or use multiple context managers in one line:

```python
# Method 1: Nested (clear but indented)
with open('source.txt', 'r') as source:
    with open('destination.txt', 'w') as dest:
        for line in source:
            dest.write(line)

# Method 2: Single line (more concise)
with open('source.txt', 'r') as source, open('destination.txt', 'w') as dest:
    for line in source:
        dest.write(line)
```

Both methods ensure both files are properly closed.

## 6. Common Context Manager Patterns

### Reading all lines into a list (without empty lines)

```python
with open('data.txt', 'r') as file:
    lines = [line.strip() for line in file if line.strip()]
```

### Reading entire content

```python
with open('document.txt', 'r') as file:
    content = file.read()
    # Process content
```

### Writing to a file

```python
with open('output.txt', 'w') as file:
    file.write("Hello, World!\\n")
    file.write("Second line\\n")
```

:::summary

- `with` **statement:** Creates a "context" where the file is open; exits automatically.
- **Automatic `.close()`:** You no longer need to manually call `file.close()`.
- **Error Safety:** Files are closed even if an error occurs inside the `with` block.
- **Scope:** The file handle variable is only intended for use inside the indented block.
- **Multiple Files:** You can open multiple files in one `with` statement using a comma.

:::

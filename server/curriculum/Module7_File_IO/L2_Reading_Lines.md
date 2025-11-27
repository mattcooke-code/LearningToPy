# 📏 Reading Line by Line: .readline(), .readlines(), and Iteration

While `.read()` pulls the entire file into a single string, real-world data often requires processing one line at a time. Python offers highly flexible ways to handle this.

## 1. Reading a Single Line: `.readline()`

The **`.readline()`** method reads and returns the **next single line** from the file. After each call, the file pointer (cursor) moves to the start of the next line.

The line returned will include the newline character (`\n`) at the end, if one exists.

### Example

Imagine a file named `tasks.txt`:

Task A: Review
Task B: Code
Task C: Test

```python
file_handle = open('tasks.txt', 'r')

line1 = file_handle.readline()  # Reads 'Task A: Review\n'
line2 = file_handle.readline()  # Reads 'Task B: Code\n'

print(line1.strip()) # Output: Task A: Review (using .strip() to remove the newline)
print(line2)         # Output: Task B: Code\n

file_handle.close()
```

When `.readline()` reaches the end of the file, it returns an empty string (`""`).

## 2. Reading All Lines into a List: `.readlines()`

The `.readlines()` method reads the entire file content, but it returns a list of strings, where each string is one line from the file (including the `\n`).

```python
file_handle = open('tasks.txt', 'r')
lines_list = file_handle.readlines()

print(lines_list)
# Output: ['Task A: Review\n', 'Task B: Code\n', 'Task C: Test']

file_handle.close()

```

## 3. The Pythonic Way: File Iteration

The most common, memory-efficient, and Pythonic way to read a file line by line is to simply **iterate over the file object** itself using a `for` loop.

When you iterate over a file object, Python reads one line at a time on demand. This is much more memory efficient than `.readlines()` for extremely large files, as it avoids loading the entire file into memory at once.

```python
file_handle = open('tasks.txt', 'r')

for line in file_handle:
    print(f"Processing: {line.strip()}")

file_handle.close()

# Output:
# Processing: Task A: Review
# Processing: Task B: Code
# Processing: Task C: Test
```

### Key Takeaway:

For most tasks, **iterating over the file object** with a `for` loop is the preferred method for reading line by line.

// Add this section to L2_Reading_Lines.md:

## 4. Understanding File Pointers

When you read from a file, Python keeps track of your position using a **file pointer**. Each read operation moves this pointer forward.

```python
file_handle = open('example.txt', 'r')

# Pointer starts at beginning
line1 = file_handle.readline()  # Pointer moves to start of line 2
line2 = file_handle.readline()  # Pointer moves to start of line 3

# If we try to read again, we get the next line
line3 = file_handle.readline()  # Gets third line

file_handle.close()
```

**Why reopen the file?** Once you've read through a file, the pointer is at the end. To read from the beginning again, you must either:
• Close and reopen the file, OR

• Use `.seek(0)` to reset the pointer (advanced technique)

// Add to L2_Reading_Lines.md:

## 5. Method Comparison

| Method                                   | Returns            | Memory Use                      | Use Case                              |
| ---------------------------------------- | ------------------ | ------------------------------- | ------------------------------------- |
| **File iteration** (`for line in file:`) | One line at a time | 🟢 Low (best for large files)   | Processing each line sequentially     |
| **`.readlines()`**                       | List of all lines  | 🔴 High (entire file in memory) | When you need all lines as a list     |
| **`.readline()`**                        | Single next line   | 🟢 Low                          | Manual control, specific line reading |

**Recommendation**: Use file iteration (`for` loop) for most cases - it's Pythonic and memory-efficient!

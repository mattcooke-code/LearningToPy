# 📏 Reading Line by Line: .readline(), .readlines(), and Iteration

While `.read()` pulls the entire file into a single string, real-world data often requires processing one line at a time. Python offers highly flexible ways to handle this.

## 1. Reading a Single Line: `.readline()`

The **`.readline()`** method reads and returns the **next single line** from the file. After each call, the file pointer (cursor) moves to the start of the next line.

The line returned will include the newline character `\n` at the end, if one exists.

```python
# FILE: station_records.txt
# Sinclair
# Sheridan
# Lochley

file_handle = open('station_records.txt', 'r')

line1 = file_handle.readline()  # Reads 'Sinclair\n'
line2 = file_handle.readline()  # Reads 'Sheridan\n'

print(line1.strip()) # Output: Sinclair (removes the newline)
print(line2)         # Output: Sheridan\n (keeps the newline)

file_handle.close()
```

:::note
When `.readline()` reaches the end of the file, it returns an empty string (`""`).
:::

## 2. Reading All Lines into a List: `.readlines()`

The `.readlines()` method reads the entire file content, but it returns a **list of strings**, where each string is one line from the file (including the `\n`). This is useful if you need to sort the name or access them bu index.

```python
file_handle = open('station_records.txt', 'r')
commanders = file_handle.readlines()

print(commanders)
# Output: ['Sinclair\n', 'Sheridan\n', 'Lochley']

file_handle.close()

```

## 3. The Pythonic Way: File Iteration

The most common, memory-efficient, and Pythonic way to read a file line by line is to simply **iterate over the file object** itself using a `for` loop.

When you iterate over a file object, Python reads one line at a time on demand. This is much more memory efficient than `.readlines()` for extremely large files, as it avoids loading the entire file into memory at once.

```python
file_handle = open('station_records.txt', 'r')
for officer in file_handle:
    print(f"Station Log: {officer.strip()}")
file_handle.close()

# Output:
# Station Log: Sinclair
# Station Log: Sheridan
# Station Log: Lochley
```

:::tip
For most tasks, **iterating over the file object** with a `for` loop is the preferred method for reading line by line. It is cleaner, faster, and safer for your computer's memory!
:::

## 4. Understanding File Pointers

When you read from a file, Python keeps track of your position using a **file pointer**. Each read operation moves this pointer forward. Think of the file pointer like a physical needle on a record player. Every time you read a line, the needle moves forward.

```python
file_handle = open('example.txt', 'r')

# Pointer starts at beginning
line1 = file_handle.readline()  # Pointer moves to start of line 2
line2 = file_handle.readline()  # Pointer moves to start of line 3

# If we try to read again, we get the next line
line3 = file_handle.readline()  # Gets third line

file_handle.close()
```

### Resetting the Pointer

A common point of confusion occurs when you try to read a file a second time in the same script. Once you've read through a file, the pointer is at the end (EOF). If you call `.readline()` again, you'll get an empty string because there is nothing left to read.

:::note
To read from the beginning again, you must:

- Close and reopen the file: This resets the pointer to the start automatically.
- Use `.seek(0)`: An advanced method to manually move the pointer back to the first character.
  :::

## 5. Method Comparison

| Method                                   | Returns            | Memory Use                      | Use Case                              |
| ---------------------------------------- | ------------------ | ------------------------------- | ------------------------------------- |
| **File iteration** (`for line in file:`) | One line at a time | 🟢 Low (best for large files)   | Processing each line sequentially     |
| **`.readlines()`**                       | List of all lines  | 🔴 High (entire file in memory) | When you need all lines as a list     |
| **`.readline()`**                        | Single next line   | 🟢 Low                          | Manual control, specific line reading |

:::summary

- `.readline()`: Reads the next single line; moves the file pointer forward.
- `.readlines()`: Returns a list of all lines; use with caution on large files.
- **File Iteration:** Use `for line in file_handle:` for the most memory-efficient approach.
- **File Pointer:** Remember that reading "consumes" the file; the pointer stays at the end once finished.
- **Restarting:** To read a file again, you must reopen it or use `.seek(0)`.
- **Cleaning:** Use `.strip()` to remove trailing `\n` characters from lines.

:::

# 📂 Reading from Files: The open() function and .read()

The ability to read and write to files is crucial for any real-world application, allowing you to persist data beyond the life of your program. Python simplifies this process with a set of built-in functions.

## 1. The `open()` Function

To interact with a file, you must first **open** it. The built-in `open()` function returns a **file object** (also known as a file handle), which is your connection to the file on the operating system.

```python
file_object = open(file_path, mode)
```

• `file_path`: A string representing the file's name or its path (e.g., `"data.txt"`).

• `mode`: A string that specifies what you intend to do with the file.

### Common File Modes

| Mode  | Name       | Description                                                              | If File Doesn't Exist           |
| ----- | ---------- | ------------------------------------------------------------------------ | ------------------------------- |
| `'r'` | **Read**   | Default mode. Used only for reading data.                                | ⚠️ Raises a `FileNotFoundError` |
| `'w'` | **Write**  | Used for writing data. **⚠️ CAUTION**: Overwrites the file if it exists! | ✅ Creates a new file           |
| `'a'` | **Append** | Used for adding new data to the end of the file.                         | ✅ Creates a new file           |

:::note
For reading a plain text file, we typically use the `'r'` mode.
:::

## 2. Reading the Entire File: `.read()`

Once you have a file object, you can use its methods to pull the data into your program. The most straightforward is the `.read()` method, which reads the entire file content into a single string.

### Example

Imagine a file named `greetings.txt` contains:

**_Hello, World!_**

**_Welcome to Python._**

```python
# 1. Open the file in read mode ('r')
file_handle = open('greetings.txt', 'r')

# 2. Read the entire content into a string
file_content = file_handle.read()

# 3. Print the content
print(file_content)  # Output: Hello, World!\nWelcome to Python.\n

# 4. CRITICAL: Close the file
file_handle.close()

# NOTE: \n denotes a new line
```

## 3. The Crucial Step: Closing the File

When you're done with a file, you must call the `.close()` method on the file object.

:::note
Why is closing important?

1. **Releases Resources:** It frees up system resources and ensures the file is available for other programs.

2. **Saves Data (for writing):** When writing to a file, the operating system often buffers the data (holds it in temporary memory). The data is only guaranteed to be saved (flushed) to the disk when the file is closed.
   :::

:::warning
Failing to close a file can lead to resource leaks and potential data corruption.
:::

## 4. Looking Ahead: A Better Way

In **Lesson 7.3**, we'll introduce **context managers** (the `with` statement), which automatically handle file closure for you, making your code safer and cleaner. For now, we will practice the manual method to build foundational understanding.

:::warning
While the manual `open()/close()` pattern works and helps you understand the file lifecycle, it's considered outdated practice in modern Python because it's easy to forget the `.close()` step.
:::

**Remember**: Always pair every `open()` with a corresponding `.close()`!

:::summary

- Use `open(path, mode)` to create a file object (handle) that connects your code to the disk.
- The default mode is `'r'` (Read). Use `'w'` (Write) to start fresh, or `'a'` (Append) to add to existing data.
- The `.read()` method pulls the entire content of a file into a single string.
- **CRITICAL:** You must call `.close()` to release system resources and ensure all data is safely saved to the disk.
- While manual closing is foundational, modern Python usually automates this using the `with` statement (coming in L7.3).

:::

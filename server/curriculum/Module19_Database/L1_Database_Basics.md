# 🧱 Database Basics and Connecting with `sqlite3`

Relational databases are essential for persistent, structured data storage that goes beyond simple file I/O. **SQLite** is a C-language library that implements a small, fast, self-contained, SQL database engine. It is the default database used in many applications and is built into Python via the **`sqlite3`** module.

## 1. Relational Database Concepts (RDBMS)

A database stores data in one or more **Tables**. Think of a table like a spreadsheet or a list of specific class instances.

| SQL Term   | Python/Programming Equivalent | Description                                                             |
| :--------- | :---------------------------- | :---------------------------------------------------------------------- |
| **Table**  | List of Objects               | A collection of related data, organized into rows and columns.          |
| **Column** | Class Attribute               | Defines the type of data (e.g., `TEXT`, `INTEGER`) for a field.         |
| **Row**    | Object Instance               | A single entry or instance of data in the table.                        |
| **SQL**    | Method Call                   | **Structured Query Language** is the syntax used to "talk" to the data. |

:::note
Unlike Python variables, which disappear when your program stops, data in an SQLite database is persistent. It is saved to a `.db` file on your hard drive.
:::

## 2. Connecting to an SQLite Database

To interact with a database, we need two things: a **Connection** and a **Cursor**.

```python
import sqlite3

# Connect to the database file. If 'app_data.db' doesn't exist, it creates it.
conn = sqlite3.connect('app_data.db')

# A Cursor object is used to execute SQL commands and fetch results.
cursor = conn.cursor()

print("Database connection established successfully!")

# Always close the connection when done!
conn.close()
```

### Understanding the Cursor

You can think of the **Cursor** object as a pointer or a workspace. While the `connection` represents the actual link to the database file, the `cursor` is what you use to:

- **Execute** SQL statements.
- **Fetch** results (rows) back from the database.
- **Keep track** of where you are in a large dataset.

:::tip
In professional Python development, you will often see the database file named `:memory:`. This creates a temporary database in RAM that is deleted when the program ends; perfect for fast testing!
:::

## 3. The `with` Statement for Connection

Just like with file I/O, it is best practice to use a **context manager** (`with` statement) to ensure the connection is closed automatically, even if errors occur. However, `sqlite3` handles the `with` block slightly differently than `open()` does.

In `sqlite3`, the `with` statement automatically **commits** (saves) your changes if the block finishes successfully, or **rolls them back** if an error occurs.

:::warning
Even when using `with`, the connection itself isn't always automatically closed in every Python version/implementation. It is still a best practice to explicitly call `.close()` or wrap the connection in a context manager to ensure the file handle is released.
:::

```python
import sqlite3

# The 'with' statement handles transaction management (saving changes)
with sqlite3.connect('app_data.db') as conn:
    cursor = conn.cursor()
    # Any changes made here are saved automatically!
    print("Cursor ready for commands.")

conn.close() # Best practice
```

:::summary

- **SQLite** is a lightweight, file-based database built into Python.
- **Tables** consist of **Rows** (records) and **Columns** (attributes).
- The **Connection** object manages the link to the `.db` file.
- The **Cursor** object is used to execute SQL commands and retrieve data.
- Use **Context Managers** (`with`) to ensure your data changes are saved (committed) safely.
  :::

# 🧱 Database Basics and Connecting with `sqlite3`

Relational databases are essential for persistent, structured data storage that goes beyond simple file I/O. **SQLite** is a C-language library that implements a small, fast, self-contained, high-reliability, full-featured, SQL database engine. It is the default database used in many applications and is built into Python via the **`sqlite3`** module.

## 1. Relational Database Concepts (RDBMS)

A database stores data in one or more **Tables**.

| SQL Term   | Python/Programming Equivalent | Description                                                             |
| :--------- | :---------------------------- | :---------------------------------------------------------------------- |
| **Table**  | Class or Data Structure       | A collection of related data, organized into rows and columns.          |
| **Column** | Attribute or Key              | Defines the type of data (e.g., `TEXT`, `INTEGER`) for a field.         |
| **Row**    | Object or Record              | A single entry or instance of data in the table.                        |
| **SQL**    | Language                      | **Structured Query Language** is used to communicate with the database. |

## 2. Connecting to an SQLite Database

The `sqlite3.connect()` function establishes a connection. If the database file does not exist, it will be created automatically.

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

## 3. The `with` Statement for Connection

Just like with file I/O, it is best practice to use a **context manager** (`with` statement) to ensure the connection is closed automatically, even if errors occur.

```python
import sqlite3

# The 'with' statement handles closing the connection for us
with sqlite3.connect('app_data.db') as conn:
    cursor = conn.cursor()
    print("Cursor ready for commands.")
    # Execute commands here...

print("Connection automatically closed.")
```

# 🏗️ Creating Tables and Inserting Data (CREATE/INSERT)

Now that we can connect to a database, it's time to build its structure. In SQL, we use **DDL** (Data Definition Language) to define the "blueprint" and **DML** (Data Manipulation Language) to handle the actual data.

## 1. Creating a Table (`CREATE TABLE`)

The `cursor.execute()` method runs a single SQL command. When creating a table, you must define the **Schema**: the names of your columns and what kind of data they hold.

```python
import sqlite3

with sqlite3.connect('todo_list.db') as conn:
    cursor = conn.cursor()

    # Create a table called 'tasks' if it doesn't already exist
    create_table_sql = """
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        priority INTEGER,
        status TEXT
    )
    """
    cursor.execute(create_table_sql)
```

|                 |                                                                       |
| --------------- | --------------------------------------------------------------------- |
| `PRIMARY KEY`   | A unique ID for every row (SQLite handles the numbering for you!).    |
| `NOT NULL`      | This column cannot be left empty; a value is mandatory.               |
| `IF NOT EXISTS` | A safety check so Python doesn't crash if the table is already there. |

:::note
Notice the Data Types: `TEXT` is for strings, `INTEGER` for whole numbers, and `REAL` for decimals. Unlike Python's flexible variables, SQL columns are "strict"—they usually only want one specific type of data.
:::

:::tip

Triple Quotes `"""`

SQL commands can get very long. We use Python's **multi-line strings** (triple quotes) so we can indent our SQL code and put each column on a new line. This makes your database structure much easier to read and edit compared to one giant, cramped line of text!
:::

## 2. Inserting a Single Row (`INSERT INTO`)

Once our `tasks` table is created, we can add records to it. We will use the columns we just defined (`name`, `priority`, `status`) to fill in the details. You pass the SQL string for insertion to `cursor.execute()`.

```python
# Insert a new task
insert_task_sql = """
INSERT INTO tasks (name, priority, status)
VALUES ('Learn SQL', 1, 'In Progress');
"""
cursor.execute(insert_task_sql)
```

:::tip
Notice we didn't insert anything into the `id` column. Because we marked it as `INTEGER PRIMARY KEY`, SQLite automatically assigns the next available number (1, 2, 3...) to every new row.
:::

## 3. Saving Your Work (The Commit)

In many programming tasks, changes happen instantly. In databases, changes are "staged" first. Think of it like a "Save" button in a word processor.

:::warning
**Crucial Step:** Your `CREATE` or `INSERT` commands are not permanent until you call `conn.commit()`. If your program closes before this line, your data evaporates!
:::

```python
conn.commit()
print("Table created and task inserted successfully.")
```

## 4. Inserting Multiple Rows (`executemany`)

The `cursor.executemany()` method is highly efficient for inserting many rows at once. It takes the SQL command and a list of tuples (or lists) representing the data for each row.

```python
# A list of tuples representing our new tasks
new_tasks = [
    ('Check Mail', 2, 'To Do'),
    ('Read Book', 3, 'To Do'),
    ('Code Project', 1, 'In Progress')
]

# We use '?' as placeholders to prevent security risks
insert_many_sql = """
INSERT INTO tasks (name, priority, status)
VALUES (?, ?, ?);
"""
cursor.executemany(insert_many_sql, new_tasks)
conn.commit()
```

:::note
The `?` symbols are Placeholders. They tell Python: "Wait until the data arrives, then safely slot it in here." This is a vital security practice to prevent SQL Injection (which we will cover soon!).
:::

:::summary

- `CREATE TABLE` defines the columns and data types for your data.
- **Constraints** like `NOT NULL` and `PRIMARY KEY` keep your data organized and valid.
- `INSERT INTO` adds new rows to an existing table.
- `conn.commit()` is the "Save" button; without it, your changes aren't permanent.
- `executemany()` is the efficient way to insert lists of data using `?` placeholders.
  :::

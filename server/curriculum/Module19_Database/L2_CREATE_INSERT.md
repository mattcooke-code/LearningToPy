# 🏗️ Creating Tables and Inserting Data (CREATE/INSERT)

The **CREATE** command is Data Definition Language (DDL) and sets up the database schema. **INSERT** is Data Manipulation Language (DML) and adds records to the tables.

## 1. Creating a Table (`CREATE TABLE`)

The `cursor.execute()` method runs a single SQL command. When creating a table, you define the name, columns, and their data types. Common SQLite data types include `TEXT`, `INTEGER`, and `REAL` (for floating point numbers).

```python
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

• `PRIMARY KEY`: A unique identifier for each row.

• `NOT NULL`: Ensures the column must have a value.

## 2. Inserting a Single Row (`INSERT INTO`)

You pass the SQL string for insertion to `cursor.execute()`.

```python
# Insert a new task
insert_task_sql = """
INSERT INTO tasks (name, priority, status)
VALUES ('Learn SQL', 1, 'In Progress');
"""
cursor.execute(insert_task_sql)
```

## 3. Committing Changes

Crucially, changes to the database (like CREATE, INSERT, UPDATE, DELETE) are **not permanent** until you call `conn.commit()`! If you forget to commit, the changes will be lost when the connection closes.

```python
conn.commit()
print("Table created and task inserted successfully.")
```

## 4. Inserting Multiple Rows (`executemany`)

The `cursor.executemany()` method is highly efficient for inserting many rows at once. It takes the SQL command and a list of tuples (or lists) representing the data for each row.

```python
new_tasks = [
    ('Check Mail', 2, 'To Do'),
    ('Read Book', 3, 'To Do'),
    ('Code Project', 1, 'In Progress')
]

insert_many_sql = """
INSERT INTO tasks (name, priority, status)
VALUES (?, ?, ?);
"""
# The question marks (?) are placeholders for the data
cursor.executemany(insert_many_sql, new_tasks)
conn.commit()
```

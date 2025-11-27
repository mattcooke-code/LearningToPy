# 🔍 Retrieving Data with SELECT and Cursors

The **SELECT** command is the most frequently used SQL operation. It retrieves data from tables based on specified criteria.

## 1. The `SELECT` Statement

The general syntax is `SELECT [columns] FROM [table] WHERE [conditions]`.

```sql
-- Select all columns (using *) from the 'tasks' table
SELECT * FROM tasks;

-- Select only the 'name' and 'priority' columns
SELECT name, priority FROM tasks;

-- Select tasks with a priority of 1
SELECT * FROM tasks WHERE priority = 1;
```

## 2. Fetching Results in Python

After calling `cursor.execute(SELECT_SQL)`, the results are loaded into the cursor. You use the following methods to pull the data into your Python code:

| Method          | Description                                          | Return Type      |
| --------------- | ---------------------------------------------------- | ---------------- |
| `.fetchone()`   | Retrieves the next single row of a query result set. | Tuple or `None`. |
| `.fetchall()`   | Retrieves all remaining rows as a list.              | List of Tuples.  |
| `.fetchmany(n)` | Retrieves the next $n$ rows.                         | List of Tuples.  |

```python
# Assuming a connection and table setup from 19.2

# 1. Execute the query
cursor.execute("SELECT name, status FROM tasks WHERE priority = 1;")

# 2. Fetch all results at once
high_priority_tasks = cursor.fetchall()
print(f"High Priority Tasks: {high_priority_tasks}")
# Output: High Priority Tasks: [('Learn SQL', 'In Progress'), ('Code Project', 'In Progress')]
```

## 3. Iterating Over the Cursor

For large datasets, fetching all results into memory at once is inefficient. The cursor object itself is an **iterable**, allowing you to loop through the results one row at a time.

```python
cursor.execute("SELECT name, priority FROM tasks ORDER BY priority DESC;")

print("\n--- All Tasks ---")
for row in cursor:
    # Each 'row' is a tuple, e.g., ('Check Mail', 2)
    task_name = row[0]
    task_priority = row[1]
    print(f"Task: {task_name} (Prio: {task_priority})")
```

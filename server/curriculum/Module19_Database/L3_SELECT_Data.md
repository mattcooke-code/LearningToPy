# 🔍 Retrieving Data with SELECT and Cursors

The **SELECT** command is the most frequently used SQL operation. It allows you to "query" the database to find exactly the records you need.

## 1. The `SELECT` Statement

The general syntax is `SELECT [columns] FROM [table] WHERE [conditions]`.

```sql
-- Select every column (using *) from the 'tasks' table
SELECT * FROM tasks;

-- Select specific columns to save memory
SELECT name, priority FROM tasks;

-- Filter results using WHERE
SELECT * FROM tasks WHERE priority = 1;

-- Sort results using ORDER BY (ASC for ascending, DESC for descending)
SELECT * FROM tasks ORDER BY priority DESC;
```

## 2. Fetching Results in Python

Executing a `SELECT` statement doesn't immediately give you a list. Instead, it "loads" the results into the **Cursor**. You then "fetch" the data from that cursor into Python variables.

| Method          | Description                            | Return Type               |
| --------------- | -------------------------------------- | ------------------------- |
| `.fetchone()`   | Grabs the **very next** single row.    | A single Tuple or `None`. |
| `.fetchall()`   | Grabs **every** remaining row at once. | List of Tuples.           |
| `.fetchmany(n)` | Grabs the next `n` rows.               | List of Tuples.           |

```python
# 1. Execute the query
cursor.execute("SELECT name, status FROM tasks WHERE priority = 1;")

# 2. Fetch all results at once
high_priority_tasks = cursor.fetchall()

print(f"High Priority Tasks: {high_priority_tasks}")
# Output: High Priority Tasks: [('Learn SQL', 'In Progress'), ('Code Project', 'In Progress')]
```

:::warning

**The Tuple Trap:** Even if you only select one column (e.g., `SELECT name...`), `fetchone()` will still return a **_tuple_** with one item: `('Learn SQL', )`. To get the string, you'll need to access the index: `result[0]`.
:::

## 3. Iterating Over the Cursor

For small tables, `fetchall()` is fine. However, if your database has 1 million rows, `fetchall()` will try to cram all of them into your computer's RAM at once, which could crash your program.

Because the cursor is an **iterable**, you can loop through it. This processes one row at a time, keeping your memory usage low.

:::tip
**Tuple Unpacking:** Instead of using `row[0]` and `row[1]`, you can unpack the tuple directly in the `for` loop header for much cleaner code!
:::

```python
cursor.execute("SELECT name, priority FROM tasks ORDER BY priority DESC;")

print("\n--- Current Task List ---")

# Python unpacks each tuple into 'name' and 'prio' automatically
for name, prio in cursor:
    print(f"Task: {name} (Priority: {prio})")
```

:::note
If a `SELECT` query finds no matches, `fetchall()` will return an **empty list** `[]`, and `fetchone()` will return `None`. Your code should always be prepared to handle "no results found."
:::

:::summary

- `SELECT` retrieves data; use `*` for all columns or name specific columns for better performance.
- `WHERE` filters your data, and `ORDER BY` sorts it.
- `fetchone()` is for single results; `fetchall()` is for grabbing everything at once.
- **Iterating** directly over the cursor (`for row in cursor:`) is the most memory-efficient way to handle large datasets.
- Always remember that SQL results come back as **Tuples**, which can be easily unpacked in Python.
  :::

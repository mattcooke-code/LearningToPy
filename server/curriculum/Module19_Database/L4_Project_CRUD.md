# 🔒 Project: Parameterized Queries and Updating Data (CRUD)

This project focuses on completing the full **CRUD** (Create, Read, Update, Delete) cycle and introducing the essential concept of **parameterized queries** for security.

## 1. Parameterized Queries (Security)

Never use Python string formatting (like f-strings) to insert user-provided values into SQL commands. This practice is a major security vulnerability known as **SQL Injection**.

Instead, always use **placeholders (`?`)** in the SQL string, and pass the data as a separate tuple to `cursor.execute()`. The `sqlite3` module handles the safe insertion of values for you.

```python
user_input_name = "New Item"
user_input_price = 15.00

# DANGEROUS: f-string insertion (A hacker could break this!)
# cursor.execute(f"INSERT INTO products (name, price) VALUES ('{user_input_name}', {user_input_price})")

# SAFE: Parameterized Query
safe_sql = "INSERT INTO products (name, price) VALUES (?, ?)"
cursor.execute(safe_sql, (user_input_name, user_input_price))
```

## 2. Modifying Existing Data (`UPDATE`)

The `UPDATE` command changes one or more records. It is critical to use a `WHERE` clause to specify which rows to change; otherwise, you update _every_ row.

```sql
-- Update the price of the 'Keyboard'
UPDATE products
SET price = 85.00
WHERE name = 'Keyboard';
```

## 3. Deleting Data (`DELETE`)

The `DELETE` command removes rows from a table. Again, a `WHERE` clause is essential.

```sql
-- Delete the product named 'Mouse'
DELETE FROM products
WHERE name = 'Mouse';
```

Remember: After `UPDATE` or `DELETE`, you must call `conn.commit()` to make the changes permanent.

### Project Task

Your task is to build a sequence that:

1. Inserts a new item using a **parameterized query**.

2. Updates the price of an existing item.

3. Deletes the cheapest item.

4. Confirms all changes with a final `SELECT`.

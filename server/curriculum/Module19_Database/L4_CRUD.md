# 🔄 The Data Lifecycle: CRUD and Security

In the world of software development, almost every application revolves around **CRUD**. This acronym describes the four basic functions of persistent storage.

| Letter | Function                 | SQL Command |
| ------ | ------------------------ | ----------- |
| **C**  | **_Create_**             | `INSERT`    |
| **R**  | **_Read_** (or Retrieve) | `SELECT`    |
| **U**  | **_Update_**             | `UPDATE`    |
| **D**  | **_Delete_**             | `DELETE`    |

:::note

While the term might be new, you've actually been doing "CRUD" since the start of this module!

- **Create (`INSERT`):** You mastered this in Lesson 2.
- **Read (`SELECT`):** You handled this in Lesson 3.

In this lesson, we are completing the cycle by learning how to **Update** and **Delete** records, while ensuring our code is **Secure**.
:::

## 1. Safety First: Parameterized Queries

Before we modify data, we must talk about **Security**. A common mistake is using Python f-strings to build SQL queries. This opens the door to **_SQL Injection_**, where a malicious user could type SQL code into an input field and delete your entire database.

:::warning
**The Golden Rule:** Never use f-strings or `.format()` to put variables into your SQL. Always use the `?` placeholder.
:::

```python
# USER INPUTS
product_name = "Gaming Mouse"
product_price = 49.99

# ❌ DANGEROUS: f-string (Vulnerable to hackers)
cursor.execute(f"INSERT INTO products VALUES ('{product_name}', {product_price})")

# ✅ SAFE: Parameterized Query
# We pass the data as a TUPLE in the second argument
cursor.execute("INSERT INTO products (name, price) VALUES (?, ?)", (product_name, product_price))
```

## 2. Modifying Data (`UPDATE`)

The `UPDATE` command changes existing records. It uses a `SET` clause to define the new values and a `WHERE` clause to target specific rows.

```python
# Update the price of a specific item
update_sql = "UPDATE products SET price = ? WHERE name = ?"
cursor.execute(update_sql, (55.00, "Gaming Mouse"))

conn.commit() # Don't forget to save!
```

:::warning
**The "Where" Hazard:** If you forget the `WHERE` clause in an `UPDATE` statement, SQL will apply that change to _every single row_ in the table. There is no "undo" button once you commit!
:::

## 3. Removing Data (`DELETE`)

The `DELETE` command removes rows entirely. Like Update, it is almost always paired with a `WHERE` clause.

```python
# Remove a product from the table
delete_sql = "DELETE FROM products WHERE name = ?"
cursor.execute(delete_sql, ("Old Keyboard",))

conn.commit()
```

:::note
Note the comma in `("Old Keyboard",)`. In Python, a single item in parentheses needs a trailing comma to be recognized as a tuple. Since `execute()` expects a tuple for parameters, this is a common syntax requirement!
:::

:::summary

- **CRUD** stands for Create, Read, Update, and Delete.
- **SQL Injection** is a major security risk; avoid it by using `?` placeholders.
- `UPDATE` modifies existing records using `SET`.
- `DELETE` removes rows.
- `WHERE` is vital for both Update and Delete to avoid affecting the entire table.
- Always `commit()` after any operation that changes data (C, U, or D).
  :::

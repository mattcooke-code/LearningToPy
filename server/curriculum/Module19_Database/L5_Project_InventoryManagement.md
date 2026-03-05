# 📊 Module 19 Project: Inventory Management Script

You've learned how to connect to databases, create tables, insert data, query records, update information, and delete rows - all while keeping your code secure with parameterized queries. Now it's time to build a complete **Inventory Management Script** that puts all these skills together in a single, linear program.

## Project Goal

Create a Python script that manages a product inventory database. Your script will:

1. Create and set up a database table
2. Insert initial product data
3. Query and display products in different ways
4. Update a product's price
5. Restock a product
6. Delete a product
7. Generate a final report

## The Database Structure

Your database will have a single table called `products` with the following structure:

| Column     | Type                | Description                                      |
| ---------- | ------------------- | ------------------------------------------------ |
| `id`       | INTEGER PRIMARY KEY | Auto-incrementing unique identifier              |
| `name`     | TEXT NOT NULL       | Product name                                     |
| `category` | TEXT NOT NULL       | Product category (e.g., 'Electronics', 'Office') |
| `price`    | REAL                | Product price in dollars                         |
| `stock`    | INTEGER             | Number of units in stock                         |

## Sample Data

You'll insert the following products:

| name       | category    | price  | stock |
| ---------- | ----------- | ------ | ----- |
| Laptop     | Electronics | 899.99 | 10    |
| Mouse      | Electronics | 24.99  | 50    |
| Desk Chair | Office      | 199.99 | 15    |
| Notebook   | Office      | 4.99   | 200   |
| Monitor    | Electronics | 299.99 | 8     |
| Pen        | Office      | 1.99   | 500   |

## Your Tasks

### Task 1: Import and Connect

- Import the `sqlite3` module
- Connect to `inventory.db` using a `with` statement
- Create a cursor

### Task 2: Create the Table

- Use `CREATE TABLE IF NOT EXISTS` to create the `products` table with all five columns
- Commit the changes

### Task 3: Insert Sample Data

- Use `executemany()` to insert all the sample products at once
- Commit the changes
- Print a message confirming the data was inserted

### Task 4: Query and Display All Products

- Execute a `SELECT` query to get all products
- Use `fetchall()` to retrieve the results
- Loop through and print each product in a readable format

### Task 5: Query and Display Electronics Products

- Execute a `SELECT` query to get only products in the 'Electronics' category
- Use `fetchall()` to retrieve the results
- Loop through and print each electronics product

### Task 6: Query and Display Low Stock Products

- Execute a `SELECT` query to get products with stock less than 20
- Use `fetchall()` to retrieve the results
- Loop through and print each low stock product

### Task 7: Calculate and Display Total Inventory Value

- Execute a `SELECT` query that calculates the sum of `price * stock` for all products
- Use `fetchone()` to get the result
- Print the total value formatted with commas and 2 decimal places

### Task 8: Update a Product Price

- Update the price of 'Laptop' to `849.99` using an `UPDATE` query with `?` placeholders
- Commit the change
- Print a confirmation message

### Task 9: Restock a Product

- Add 100 units to the stock of 'Notebook' using an `UPDATE` query
- Commit the change
- Print a confirmation message

### Task 10: Delete a Product

- Delete 'Pen' from the database using a `DELETE` query
- Commit the change
- Print a confirmation message

### Task 11: Display Final Inventory

- Run the same `SELECT` query from Task 4 to get all remaining products
- Display them in the same format as before
- Calculate and display the new total inventory value

## Expected Output

Your program should produce output similar to this:

```text
=== INVENTORY MANAGEMENT SYSTEM ===

Inserted 6 sample products.

--- Initial Inventory ---
All Products:
ID: 1 | Laptop (Electronics) | $899.99 | Stock: 10
ID: 2 | Mouse (Electronics) | $24.99 | Stock: 50
ID: 3 | Desk Chair (Office) | $199.99 | Stock: 15
ID: 4 | Notebook (Office) | $4.99 | Stock: 200
ID: 5 | Monitor (Electronics) | $299.99 | Stock: 8
ID: 6 | Pen (Office) | $1.99 | Stock: 500

Electronics Products:

Laptop: $899.99 (10 in stock)

Mouse: $24.99 (50 in stock)

Monitor: $299.99 (8 in stock)

Low Stock (<20):

Laptop: 10 units

Desk Chair: 15 units

Monitor: 8 units

Total Inventory Value: $15,473.50

--- Making Changes ---
Updated Laptop price to $849.99
Restocked Notebook: +100 units (now 300)
Deleted Pen

--- Final Inventory ---
All Products:
ID: 1 | Laptop (Electronics) | $849.99 | Stock: 10
ID: 2 | Mouse (Electronics) | $24.99 | Stock: 50
ID: 3 | Desk Chair (Office) | $199.99 | Stock: 15
ID: 4 | Notebook (Office) | $4.99 | Stock: 300
ID: 5 | Monitor (Electronics) | $299.99 | Stock: 8

Total Inventory Value: $15,223.50

Database connection closed.
```

## Success Criteria

Your project will be successful when:

- ✅ All SQL queries use parameterized `?` placeholders (no f-strings!)
- ✅ The table is created correctly
- ✅ Sample data is inserted using `executemany()`
- ✅ All queries return and display the expected results
- ✅ The update, restock, and delete operations work correctly
- ✅ The final inventory matches the expected output

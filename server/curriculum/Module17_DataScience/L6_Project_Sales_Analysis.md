# 📊 Module 17 Project: Sales Analysis with NumPy and Pandas

You've learned about NumPy arrays, vectorized operations, and Pandas DataFrames. Now it's time to combine all these skills in a real-world sales analysis project.

## The Scenario

You're a data analyst for a retail company. You've been given sales data for the first quarter of the year. Your task is to:

1. Organize the data into a Pandas DataFrame
2. Calculate revenue for each product
3. Identify expensive products using boolean masking
4. Find high-volume, affordable products using complex filters
5. Generate summary statistics
6. Create a formatted report

## The Data

You'll work with three simple data structures:

```python
products = ['Laptop', 'Mouse', 'Monitor', 'Keyboard', 'Headphones']
prices = [1200, 25, 300, 75, 150]
units_sold = [50, 200, 30, 150, 100]
```

## Your Tasks

### Task 1: Import Libraries

Import `numpy` and `pandas`.

### Task 2: Create a Data Dictionary

Create a dictionary called sales_dict where:

- Keys are the column names: `'Product'`, `'Price'`, and `'Units_Sold'`
- Values are the corresponding lists from above

### Task 3: Create a DataFrame

Pass your dictionary to `pd.DataFrame()` to create a DataFrame called `sales_df`.

### Task 4: Inspect the Data

Print the first 3 rows using `.head()` to verify your DataFrame looks correct.

### Task 5: Calculate Revenue

Add a new column called `'Revenue'` to your DataFrame. This should be the product of `'Price'` and `'Units_Sold'` (use vectorized multiplication).

### Task 6: Create a Boolean Mask

Create a boolean Series called `expensive_mask` that identifies products where the price is greater than $200.

### Task 7: Filter Expensive Products

Use your mask to create a new DataFrame called `expensive_products` containing only the rows where `expensive_mask` is True.

### Task 8: Find High-Volume, Affordable Products

Create a filtered DataFrame called `high_volume` containing products that meet both conditions:

- More than 100 units sold
- Price less than $100

:::tip
Remember to use `&` and wrap each condition in parentheses `()`.
:::

### Task 9: Calculate Statistics

Calculate and store the following values:

- `avg_revenue`: The average revenue per product
- `total_revenue`: The total revenue across all products
- `max_revenue`: The maximum revenue value

You may use either NumPy functions (`np.mean()`, `np.sum()`, `np.max()`) or Pandas methods (`.mean()`, `.sum()`, `.max()`) - both are valid!

### Task 10: Generate a Report

Complete the print statements in the starter code by inserting the correct variable names. The formatting has been done for you.

### Expected Output

When you've completed all tasks correctly, your output should look like this:

```text
   Product  Price  Units_Sold
0   Laptop   1200          50
1    Mouse     25         200
2  Monitor    300          30

ORIGINAL DATA
     Product  Price  Units_Sold  Revenue
0     Laptop   1200          50    60000
1      Mouse     25         200     5000
2    Monitor    300          30     9000
3   Keyboard     75         150    11250
4 Headphones    150         100    15000

PRODUCTS WITH PRICE > $200
     Product  Price  Units_Sold  Revenue
0     Laptop   1200          50    60000
2    Monitor    300          30     9000

HIGH VOLUME PRODUCTS (Units > 100 AND Price < $100)
    Product  Price  Units_Sold  Revenue
1     Mouse     25         200     5000
3  Keyboard     75         150    11250

REVENUE STATISTICS
Average Revenue: $20050.00
Total Revenue: $100250.00
Maximum Revenue: $60000.00
```

## Success Criteria

Your project is complete when:

✅ All imports are correct

✅ The DataFrame is created properly

✅ The Revenue column is calculated correctly

✅ Boolean masking works as expected

✅ Complex filtering with & works

✅ Statistics are calculated (using either method)

✅ The final report prints with the correct variable names

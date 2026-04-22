# 📊 Module Project: Sales Analytics Toolkit

Congratulations! You've mastered Python's advanced function concepts: **lambda functions**, **flexible arguments**, **decorators**, and **functional programming tools**. Now it's time to build a complete **Sales Analytics Toolkit** that showcases all these skills in a real-world business application.

## The Challenge

You work for a retail company that needs to analyze sales data across multiple regions and product categories. Your task is to build a flexible analytics toolkit that can answer various business questions by processing sales data efficiently.

## The Dataset

```python
# Sales data from Q1 2024
# Each entry: (region, product_category, sales_amount, units_sold, profit_margin)
sales_data = [
    ('North', 'Electronics', 125000, 450, 0.35),
    ('North', 'Clothing', 82000, 1200, 0.55),
    ('North', 'Home Goods', 45000, 380, 0.42),
    ('South', 'Electronics', 98000, 320, 0.35),
    ('South', 'Clothing', 112000, 1650, 0.55),
    ('South', 'Food', 67000, 8900, 0.22),
    ('East', 'Electronics', 156000, 520, 0.35),
    ('East', 'Clothing', 94000, 1380, 0.55),
    ('East', 'Books', 28000, 1250, 0.48),
    ('East', 'Home Goods', 62000, 510, 0.42),
    ('West', 'Electronics', 210000, 680, 0.35),
    ('West', 'Clothing', 145000, 2100, 0.55),
    ('West', 'Food', 89000, 11200, 0.22),
    ('West', 'Books', 35000, 1580, 0.48),
    ('West', 'Home Goods', 78000, 640, 0.42)
]
```

## Project Requirements

Your toolkit must include the following components:

### 1. Lambda Utilities (Using `lambda`)

Create quick, reusable lambda functions for common extractions and calculations:

- Extract region, category, sales amount, etc.
- Calculate profit (sales_amount \* profit_margin)
- Calculate average sale value (sales_amount / units_sold)

### 2. Flexible Query Function (Using `*args` and `**kwargs`)

Build a function that can query the sales data with flexible filtering and sorting options:

```python
def query_sales_data(*criteria, **options):
    """
    Query sales data with flexible criteria.

    Args:
        *criteria: Functions that each return True/False for an entry
        **options: Configuration options like 'sort_by', 'limit', 'reverse'

    Returns:
        Filtered and processed data based on criteria and options
    """
    pass
```

### 3. Performance Monitor Decorator (Using `decorators`)

Create a decorator that logs query performance metrics including execution time and result count:

```python
@monitor_performance
def query_sales_data(*criteria, **options):
    # Your implementation here
    pass
```

### 4. Reporting Functions (Using `map`, `filter`, `reduce`)

Use functional programming tools to generate business insights:

- Total sales by region
- Average profit margin by category
- Best-selling categories
- Company-wide totals

## Business Questions to Answer

Your toolkit should be able to answer questions like:

1. "Show me the top 3 Electronics sales by amount in any region"
2. "What's the total profit from Clothing across all regions?"
3. "Which categories have average sale value over $100?"
4. "What's the average profit margin for categories with total sales over $100,000?"
5. "Show me the performance metrics for any query I run"

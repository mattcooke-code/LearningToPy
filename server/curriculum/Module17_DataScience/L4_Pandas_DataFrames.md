# 🖼️ Working with Pandas DataFrames

The **DataFrame** is the most common and powerful Pandas object. It is a **two-dimensional labeled data structure** with columns of potentially different types. You can think of a DataFrame as a spreadsheet or a SQL table.

## 1. DataFrame Structure

A DataFrame is essentially a collection of Pandas Series objects that share a common index.

| Feature     | Description                                                                                       |
| :---------- | :------------------------------------------------------------------------------------------------ |
| **Columns** | Each column is a Series, usually representing a specific variable (e.g., 'Name', 'Age', 'Score'). |
| **Index**   | The row labels, used to identify and select data.                                                 |

## 2. Creating a DataFrame

The most common way to create a DataFrame is from a dictionary of lists or NumPy arrays, where the dictionary keys become the column names.

```python
import pandas as pd

# Dictionary where keys are column names, and values are lists of data
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['NY', 'LA', 'SF']
}

df = pd.DataFrame(data)
print(df)
# Output:
#       Name  Age City
# 0    Alice   25   NY
# 1      Bob   30   LA
# 2  Charlie   35   SF
```

DataFrames are also commonly loaded from external files like CSV (`.read_csv()`), Excel (`.read_excel()`), or JSON.

## 3. Inspecting a DataFrame

Once a DataFrame is loaded, you need to quickly inspect its structure, dimensions, and data types.

| Method     | Description                                                                             |
| ---------- | --------------------------------------------------------------------------------------- |
| `.head(n)` | Shows the first $n$ rows (default is 5).                                                |
| `.tail(n)` | Shows the last $n$ rows.                                                                |
| `.shape`   | A tuple: `(number_of_rows, number_of_columns)`.                                         |
| `.info()`  | Prints a concise summary, including the index type, column dtypes, and non-null values. |
| `.dtypes`  | Lists the data type of each column.                                                     |

```python
print(df.head(2)) # Show first 2 rows
print("-" * 20)
print(f"Shape: {df.shape}")
print("-" * 20)
df.info() # Important for understanding data types and missing values
```

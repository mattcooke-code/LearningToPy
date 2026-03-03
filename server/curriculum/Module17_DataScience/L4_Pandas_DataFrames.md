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

# The Matrix character database
matrix_data = {
    'Character': ['Neo', 'Trinity', 'Morpheus', 'Agent Smith'],
    'Status': ['The One', 'Human', 'Human', 'Program'],
    'Awakening_Level': [100, 95, 99, 0],
    'Can_Fly': [True, True, False, False]
}

matrix_df = pd.DataFrame(matrix_data)
print(matrix_df)
# Output:
#     Character   Status  Awakening_Level  Can_Fly
# 0         Neo  The One              100     True
# 1     Trinity    Human               95     True
# 2     Morpheus    Human               99    False
# 3  Agent Smith  Program                0    False
```

DataFrames are also commonly loaded from external files like CSV (`.read_csv()`), Excel (`.read_excel()`), or JSON.

## 3. Inspecting a DataFrame

Once a DataFrame is loaded, you need to quickly inspect its structure, dimensions, and data types.

| Method     | Description                                                                             |
| ---------- | --------------------------------------------------------------------------------------- |
| `.head(n)` | Shows the first number of rows (default is 5).                                          |
| `.tail(n)` | Shows the last number of rows.                                                          |
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

:::tip
The `.info()` method is your best friend when exploring a new dataset. It tells you:

- How many rows and columns you have
- The data type of each column (important for knowing what operations you can do)
- Whether any data is missing (null values)
  :::

## 4. Accessing Columns

You can access a single column of a DataFrame in two ways:

```python
# Method 1: Dot notation (only works if column name has no spaces)
awakening = matrix_df.Awakening_Level
print(awakening)
# Output:
# 0    100
# 1     95
# 2     99
# 3      0
# Name: Awakening_Level, dtype: int64

# Method 2: Bracket notation (works for any column name, especially with spaces)
characters = matrix_df['Character']
print(characters)
# Output:
# 0           Neo
# 1       Trinity
# 2       Morpheus
# 3    Agent Smith
# Name: Character, dtype: object
```

## 5. Selecting Rows

To select specific rows, you can use slicing or `.loc[]` / `.iloc[]`:

```python
# Slice by integer position (like a list)
first_two = matrix_df[0:2]
print(first_two)
# Output:
#   Character Status  Awakening_Level  Can_Fly
# 0       Neo  The One              100     True
# 1   Trinity   Human               95     True

# Select by label/index using .loc[]
# Here we don't have custom labels, so we'll use .iloc[] for position
second_row = matrix_df.iloc[1]  # Trinity's data
print(second_row)
```

We will learn more about `.loc[]` and `.iloc[]` in the next lesson.

:::summary

- **DataFrames** are 2D labeled data structures, like spreadsheets or SQL tables
- Create DataFrames from dictionaries where **keys become column names**
- Essential inspection methods:
  - `.head()` / `.tail()` - preview rows
  - `.shape` - dimensions (rows, columns)
  - `.info()` - data types and null values
  - `.dtypes` - just the data types
- Access columns via **dot notation** (`df.column`) or **bracket notation** (`df['column']`)
- Access rows via _slicing_ (`df[start:end]`) or `.iloc[]` for positional indexing
- DataFrames are collections of Series that share an index

:::

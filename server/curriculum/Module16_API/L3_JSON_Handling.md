# ⚙️ Handling JSON Data with `.json()`

Most modern APIs communicate using **JSON** (JavaScript Object Notation). While the `response.text` attribute gives you the raw data as a string, Python cannot easily work with it until it's converted into native Python objects.

This is where the `requests` library shines: its **`.json()`** method automatically converts a JSON response string into familiar Python data structures.

## 1. JSON and Python Data Mapping

JSON is essentially a lightweight format for storing and transporting data. Fortunately, its structure maps almost perfectly to Python's built-in data types:

| JSON Type                | Python Type              | Description                      |
| :----------------------- | :----------------------- | :------------------------------- |
| **Object** (`{}`)        | **Dictionary**           | A collection of key-value pairs. |
| **Array** (`[]`)         | **List**                 | An ordered sequence of values.   |
| String (`"hello"`)       | String (`"hello"`)       | Text data.                       |
| Number (`123`, `4.5`)    | Integer or Float         | Numeric data.                    |
| Boolean (`true`/`false`) | Boolean (`True`/`False`) | True or False values.            |
| Null (`null`)            | None                     | The absence of a value.          |

## 2. Using the `.json()` Method

When a `requests.get()` call is successful (Status Code 200), the response object has a `.json()` method that handles the parsing process for you.

```python
import requests

api_url = "[https://jsonplaceholder.typicode.com/todos/1](https://jsonplaceholder.typicode.com/todos/1)"

response = requests.get(api_url)

# 1. Convert the JSON string to a Python dictionary
if response.status_code == 200:
    # `todo_item` is now a standard Python dictionary
    todo_item = response.json()

    # 2. Print the Python type and the extracted data
    print(f"Data Type: {type(todo_item)}")
    print("--- Extracted Data ---")
    print(f"User ID: {todo_item['userId']}")
    print(f"Title: {todo_item['title']}")
else:
    print(f"Failed to retrieve data. Status: {response.status_code}")
```

In the example above, the JSON object was parsed into the Python dictionary: `{'userId': 1, 'id': 1, 'title': 'delectus aut autem', 'completed': False}`

You can then use standard **dictionary indexing** (`['key']`) to access any piece of information you need.

## 3. Handling Lists of Data

Many API endpoints return a list of objects (a JSON array) rather than a single object. For example, fetching all posts:

```python
import requests

# Fetching all comments for a specific post
api_url_list = "[https://jsonplaceholder.typicode.com/posts/2/comments](https://jsonplaceholder.typicode.com/posts/2/comments)"

response_list = requests.get(api_url_list)

if response_list.status_code == 200:
    # `comments_list` is now a Python List
    comments_list = response_list.json()

    print(f"Total Comments Retrieved: {len(comments_list)}")
    print(f"Type of first element: {type(comments_list[0])}")

    # Access the email of the first comment (List index 0, then Dictionary key 'email')
    first_comment_email = comments_list[0]['email']
    print(f"First Commenter Email: {first_comment_email}")
```

When dealing with a list, you will typically use a `for` loop to iterate through the items, processing each dictionary one by one. This combines your knowledge of **Iteration** (Module 4) and **Data Structures** (Module 5) with API interaction.

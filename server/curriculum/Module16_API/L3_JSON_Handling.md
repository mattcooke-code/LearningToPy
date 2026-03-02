# ⚙️ Handling JSON Data with `.json()`

Most modern APIs communicate using **JSON** (JavaScript Object Notation). While the `response.text` attribute gives you the raw data as a string, Python cannot easily work with it until it's converted into native Python objects. This is where the `requests` library shines: its **`.json()`** method automatically converts a JSON response string into familiar Python data structures.

:::note
**Method vs. Attribute:** In the `requests` library, `.status_code` and `.text` are attributes (variables attached to the object). However, `.json()` is a **method** (a function attached to the object), which is why it requires parentheses `()` to run.
:::

## 1. JSON and Python Data Mapping

JSON is essentially a lightweight format for storing and transporting data. Fortunately, its structure maps almost perfectly to Python's built-in data types:

| JSON Type                | Python Type              | Description                                                     |
| :----------------------- | :----------------------- | :-------------------------------------------------------------- |
| Object (`{}`)            | Dictionary               | A collection of key-value pairs. E.g. `{"id": 1}` → `{'id': 1}` |
| Array (`[]`)             | List                     | An ordered sequence of values. E.g. `[1, 2]` → `[1, 2]`         |
| String (`"hello"`)       | String (`"hello"`)       | Text data. E.g. "Hi" → "Hi"                                     |
| Number (`123`, `4.5`)    | Integer or Float         | Numeric data.                                                   |
| Boolean (`true`/`false`) | Boolean (`True`/`False`) | True or False values.                                           |
| Null (`null`)            | `None `                  | The absence of a value.                                         |

## 2. Using the `.json()` Method

When a `requests.get()` call is successful (Status Code 200), the response object has a `.json()` method that handles the parsing process for you.

```python
import requests
from requests.exceptions import JSONDecodeError

api_url = "https://jsonplaceholder.typicode.com/users/1"
response = requests.get(api_url)

try:
    # Attempt to parse the JSON
    user_data = response.json()

    # Only process if the request was successful
    if response.status_code == 200:
        print(f"Name: {user_data['name']}")
        print(f"Email: {user_data['email']}")
    else:
        print(f"Request failed with status code: {response.status_code}")

except JSONDecodeError:
    # Handle cases where response isn't valid JSON
    print("Error: Invalid JSON response")
```

In the example above, the JSON object was parsed into the Python dictionary: `{'userId': 1, 'id': 1, 'title': 'delectus aut autem', 'completed': False}`

You can then use standard **dictionary indexing** (`['key']`) to access any piece of information you need.

:::tip
Sometimes, a server will give you a **Status Code 200 (OK)**, but the "package" it sends back is empty or contains gibberish instead of JSON.

If you try to run `.json()` on a response that isn't valid JSON, Python will throw a `JSONDecodeError`. Think of this like trying to translate a book into English, only to open it and find the pages are blank or covered in random ink splatters—you simply can't "decode" it.

### Why we import it:

By importing `JSONDecodeError` from the `requests` library, we can "catch" this specific mistake using a `try/except` block. This keeps your program running smoothly even if the API has a bad day.

- **The "Try" block:** "Attempt to turn this into a Python dictionary."
- **The "Except" block:** "If the data is garbled, don't crash! Just tell me the data was invalid."
  :::

## 3. Handling Lists of Data

Many API endpoints return a list of objects (a JSON array) rather than a single object. For example, fetching all posts:

```python
import requests

# Fetching all comments for a specific post
api_url_list = "https://jsonplaceholder.typicode.com/posts/2/comments"

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

:::summary

- **JSON vs. Python**: JSON data structures map almost 1:1 with Python (Objects to Dictionaries, Arrays to Lists).
- **The `.json()` Method**: Unlike `.status_code`, `.json()` is a method that must be called with parentheses to parse a response body.
- **Defensive Coding:** A `200 OK` status doesn't guarantee valid data. Using `try/except` with `JSONDecodeError` prevents crashes from malformed responses.
- **Data Navigation:** Once parsed, you can access API data using standard Python indexing (e.g., `data["key"]` or `data[0]`).
  :::

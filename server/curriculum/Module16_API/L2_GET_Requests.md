# 📤 Making GET Requests and Query Parameters

The **GET** method is the simplest and most common way to retrieve data from a web server. It is essential for interacting with APIs that provide information. In this lesson, we'll focus on getting the actual content of a successful HTTP response.

## 1. The Basic `requests.get()` Call

The `requests` library handles the low-level communication for you. To fetch data, you use `requests.get(url)` and then access the response's content using the `.text` attribute for raw strings.

```python
import requests

api_url = "https://jsonplaceholder.typicode.com/posts/1"

# The GET request
response = requests.get(api_url)

# Check the status code (200 = Success)
if response.status_code == 200:
    # Access content as a string
    data_string = response.text
    print(data_string)
else:
    print(f"Error: Status Code {response.status_code}")
```

:::note
For data returned in JSON format (which is the most common for APIs), you should use the `.json()` method, which we will cover in the next lesson.
:::

## 2. Using Query Parameters

**Query Parameters** allow you to filter or customize the results returned by an API. These appear in a URL after a question mark `?` and are separated by ampersands `&`.

### Using the `params` Argument (Recommended)

While you _could_ manually type out a long URL string, the `requests` library provides a `params` argument that accepts a **Python Dictionary**.

### Why use `params`?

- **Automatic Encoding:** It converts special characters (like spaces or symbols) into a format the web understands (URL Encoding).
- **Readability:** Dictionaries are easier to read and maintain than long, messy strings.
- **Debugging:** You can use `response.url` to see exactly what URL the library built for you.

```python
import requests

base_url = "https://jsonplaceholder.typicode.com/posts"

# Define parameters as a dictionary
query_params = {
    'userId': 5,
    '_limit': 3
}

# The library builds the URL: .../posts?userId=5&_limit=3
response = requests.get(base_url, params=query_params)

# DEBUGGING TIP: Print the final URL to verify your parameters
print(f"Request URL: {response.url}")

if response.status_code == 200:
    print("Successfully retrieved filtered data.")
```

:::warning
Query parameters are visible in the browser's address bar and server logs. **Never** use them to send sensitive data like passwords or secret API keys. Use Headers or POST bodies for sensitive info.
:::

:::summary

- **GET Purpose:** Used primarily to retrieve or "read" data from a server.
- **Status Codes**: A `200` status code indicates the request was successful; 400-level codes indicate a client-side error.
- **The `.text` Attribute:** Converts the server's response into a readable Python string.
- **Query Parameters:** Key-value pairs used to filter API results, starting with `?` in the URL.
- **The `params` Argument:** The best-practice method for sending query strings via a Python dictionary.
- **URL Encoding:** The automatic process where `requests` ensures special characters in your parameters don't break the URL.
- **Debugging:** Always check `response.url` if you aren't getting the data you expected.
  :::

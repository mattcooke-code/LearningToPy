# 📤 Making GET Requests and Query Parameters

The **GET** method is the simplest and most common way to retrieve data from a web server. It is essential for interacting with APIs that provide information. In this lesson, we'll focus on getting the actual content of a successful HTTP response.

## 1. The Basic `requests.get()` Call

The `requests` library makes fetching data straightforward. You pass the URL, and Python handles the low-level communication.

### Simple GET Request

To fetch the data, you use `requests.get(url)`. The key is accessing the response's content. For text or HTML, you use the `.text` attribute.

```python
import requests

# A simple public API endpoint
api_url = "[https://jsonplaceholder.typicode.com/posts/1](https://jsonplaceholder.typicode.com/posts/1)"

# The GET request
response = requests.get(api_url)

# Check the status code (must be 200 for success)
if response.status_code == 200:
    # Access the content as a raw string (usually JSON or HTML)
    data_string = response.text
    print(data_string)
else:
    print(f"Error fetching data: Status Code {response.status_code}")
```

**Note**: For data returned in JSON format (which is the most common for APIs), you should use the cleaner `.json()` method, which we will cover in the next lesson.

## 2. Using Query Parameters

Often, you don't want all the data from an API; you want to filter or customize the result. You achieve this by passing **Query Parameters** (sometimes called query strings).

In a URL, query parameters appear after a question mark (`?`) and are separated by ampersands (`&`).

### URL Example with Query Parameters:

`https://api.example.com/users**?city=London&status=active**`

While you _could_ manually construct this string, it's error-prone, especially with special characters. The `requests` library provides a much cleaner way using the optional `params` argument.

### Using the `params` Argument (Recommended)

You pass a Python Dictionary of key-value pairs to the `params` parameter in the `requests.get()` function. The library automatically builds and encodes the URL for you.

```python
import requests

base_url = "[https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)"

# Define the query parameters as a Python dictionary
# We want to find all posts belonging to 'userId' 5
params = {
    'userId': 5,
    '_limit': 3 # A common parameter to limit the number of results
}

# The requests library automatically converts this dictionary into the correct query string in the URL
response = requests.get(base_url, params=params)

print(f"Request URL: {response.url}")
# Output: Request URL: [https://jsonplaceholder.typicode.com/posts?userId=5&_limit=3](https://jsonplaceholder.typicode.com/posts?userId=5&_limit=3)

if response.status_code == 200:
    # This response.text will now contain only the data filtered for userId 5
    print("Successfully retrieved filtered data.")
```

Using the `params` argument is the **best practice** for passing query strings in Python.

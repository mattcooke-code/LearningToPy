# ✍️ Sending Data with POST Requests

While **GET** requests are for retrieving data, **POST** requests are for sending data to the server to create or submit a new resource (e.g., creating a new user, submitting a form, or adding a new post to a forum).

## 1. The POST Method

The key difference with POST is that the data is sent in the **request body**, not in the URL (like query parameters in a GET request). This allows you to send large, complex payloads of data.

To use the POST method in Python, you use `requests.post()`.

## 2. Sending JSON Payloads

When interacting with modern APIs, the data you send is typically formatted as a JSON object. The `requests` library makes this extremely easy using the `json` keyword argument.

When you pass a Python dictionary to the `json` argument, `requests` automatically does two things:

1.  **Converts** the Python dictionary into a JSON string.
2.  Sets the correct **Content-Type** header (usually `application/json`) so the server knows how to interpret the data.

### Example: Creating a New Post

We will use a placeholder API that simulates creating a new post.

```python
import requests

api_url = "[https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)"

# The data we want to send (the "payload") as a Python dictionary
new_post_data = {
    'title': 'Python API Test',
    'body': 'This post was created using the requests.post() method!',
    'userId': 99
}

# Send the POST request using the 'json' argument
response = requests.post(api_url, json=new_post_data)

# Successful creation usually returns a 201 (Created) status code
if response.status_code == 201:
    # The server typically returns the newly created resource, including its ID
    created_post = response.json()

    print(f"Post created successfully! Status: {response.status_code}")
    print(f"New ID assigned by server: {created_post.get('id')}")
else:
    print(f"Failed to create post. Status: {response.status_code}")
```

## 3. Introduction to Request Headers

Sometimes, you need to send extra non-data information along with your request, such as a token for authentication or specifying the data format. This information goes into **HTTP Headers**.

You pass a Python dictionary to the optional `headers` argument. This is often used for:

• **Authentication**: Passing an API key (e.g., `Authorization: Bearer <token>`).

• **Content Type**: Manually setting the data format.

```python
# Example of using a custom header for a fictional API key
headers = {
    'Authorization': 'Bearer 12345ABCDEF',
    'Custom-Tracking-Id': 'A987Z'
}

response = requests.post(api_url, json=new_post_data, headers=headers)
```

For security, POST requests that modify data often require some form of **Authentication**, which is typically handled by passing secrets in these headers.

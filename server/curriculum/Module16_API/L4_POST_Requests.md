# ✍️ Sending Data with POST Requests

While **GET** requests are for retrieving data, **POST** requests are for sending data to the server to create or submit a new resource (e.g., creating a new user, submitting a form, or adding a new post to a forum). We can think of POST requests as if we are sending a parcel to someone.

## 1. The POST Method

The key difference with POST is that the data is sent in the **request body**, not in the URL (like query parameters in a GET request). This allows you to send large, complex payloads of data.

:::note
To use the POST method in Python, you use `requests.post()`.
:::

## 2. Sending JSON Payloads

When interacting with modern APIs, the data you send is typically formatted as a JSON object. The `requests` library makes this extremely easy using the `json` keyword argument.

When you pass a Python dictionary to the `json` argument, `requests` automatically does two things:

1.  **Converts** the Python dictionary into a JSON string.
2.  Sets the correct **Content-Type** header (usually `application/json`) so the server knows how to interpret the data.

### Example: Creating a New Post

We will use a placeholder API that simulates creating a new post.

```python
import requests
from requests.exceptions import JSONDecodeError

api_url = 'https://jsonplaceholder.typicode.com/posts'
new_post = {
    'title': 'My Python Post',
    'body': 'Learning to use POST requests!',
    'userId': 1
}

try:
    # Make the POST request
    response = requests.post(api_url, json=new_post)

    # Parse the JSON response (this happens regardless of status code)
    response_data = response.json()

    # Check if the request was successful
    if response.status_code == 201:  # 201 = Created (common for POST)
        print("Success! New post created:")
        print(f"Post ID: {response_data['id']}")
        print(f"Title: {response_data['title']}")
    elif response.status_code == 200:  # Some APIs use 200 for success
        print("Success! Post created:")
        print(response_data)
    else:
        print(f"Request failed with status code: {response.status_code}")

except JSONDecodeError:
    print("Error: The response wasn't valid JSON")

```

:::note
**Status Code 201:** While a status code of `200 OK` generally denotes a success response, once you successfully complete a POST request, you will usually receive a more specific `201 Created` response.
:::

### `json=` vs `data=` – What's the Difference?

When sending data with POST requests, you have two common options:

1. **`json=`:** Use this when you're sending Python dictionaries. Requests will automatically:
   - Convert your dict to a JSON string
   - Set the `Content-Type` header to `application/json`

```python
  payload = {'title': 'Caesar', 'body': 'Apes together strong.', 'userId': 1968}
  response = requests.post(url, json=payload)
```

1. **`data=`:** Use this for form-encoded data (like HTML forms). The data gets sent as `application/x-www-form-urlencoded`:

```python
form_data = {'key1': 'value1', 'key2': 'value2'}
response = requests.post(url, data=form_data)
```

| Parameter | Best For         | Content-Type                        | Data Format           |
| --------- | ---------------- | ----------------------------------- | --------------------- |
| `json=`   | JSON APIs        | `application/json`                  | Python dict           |
| `data=`   | Form submissions | `application/x-www-form-urlencoded` | Python dict or string |

:::note
**Key takeaway:** If you're working with a modern API (most are JSON APIs), use `json=`. If you're submitting a web form, use `data=`.
:::

## 3. Introduction to Request Headers

Sometimes, you need to send extra non-data information along with your request, such as a token for authentication or specifying the data format. This information goes into **HTTP Headers**. Returning to our analogy of sending a parcel: the **Headers** are like the shipping label (they contain the address and any delivery instructions). The **JSON Payload** is the item inside the box that needs to be delivered.

You pass a Python dictionary to the optional `headers` argument. This is often used for:

|                    |                                                             |
| ------------------ | ----------------------------------------------------------- |
| **Authentication** | Passing an API key (e.g., `Authorization: Bearer <token>`). |
| **Content Type**   | Manually setting the data format.                           |

```python
# Example of using a custom header for a fictional API key
headers = {
    'Authorization': 'Bearer 12345ABCDEF',
    'Custom-Tracking-Id': 'A987Z'
}

response = requests.post(api_url, json=new_post_data, headers=headers)
```

For security, POST requests that modify data often require some form of **Authentication**, which is typically handled by passing secrets in these headers.

:::warning
**Keep Your Secrets Secret!**

Never hardcode sensitive information like **_Passwords_** or **_API Keys_** directly into your scripts if you plan on sharing your code or uploading it to GitHub. If a hacker gets hold of your `Authorization` header token, they can perform actions as if they were you!
:::

:::summary

- **POST vs GET:** POST sends data in the _request body_ to create new resources.
- **The `json` Argument:** Using `json=dictionary` in `requests.post()` automatically converts your data to a JSON string and sets the correct headers.
- **Status Code 201:** A successful POST request typically returns a `201 Created` status.
- **Headers:** Use the `headers` argument to send metadata, like **API Keys** for authentication.
  :::

# ⚙️ Project: Package Setup and Use

The core professional workflow for any new Python project involves setting up a virtual environment and managing dependencies. This project simulates that entire workflow, culminating in the use of a common third-party library, `requests`.

### Project Goal

You will write a short Python script that performs the following tasks:

1. **Dependency**: Requires the external `requests` library (used for making HTTP requests).

2. **Functionality**: Defines a function that fetches a list of public user information (specifically, random user data).

3. **Tooling Demonstration**: The instructions for this project assume you have created and activated a project-specific virtual environment and installed `requests` using `pip`.

### The `requests` Library

The `requests` library is an elegant and simple HTTP library for Python. It allows you to send HTTP requests (like `GET` and `POST`) easily.

### Example Request:

```python
import requests

response = requests.get('[https://api.example.com/data](https://api.example.com/data)')
data = response.json()
```

### Project Requirements

Your code must:

1. Import the `requests` library.

2. Define a function `fetch_random_user()` that takes no arguments.

3. Inside the function, make a `GET` request to the test API: `https://randomuser.me/api/?results=1`.

4. Return the decoded JSON data (a Python dictionary) from the response.

5. Call the function and print the full name of the returned user (found in the JSON path: `['results'][0]['name']['first']` and `['results'][0]['name']['last']`).

This project solidifies the link between environment setup (simulated) and actual code execution involving external dependencies.

# 🏷️ HTML Structure and the Document Object Model (DOM)

**Web Scraping** is the automated process of extracting specific data from websites. Instead of manually copying and pasting information, we write scripts that "read" the underlying code of a webpage and pull out exactly what we need, such as product prices, news headlines, or sports scores.

## 1. HyperText Markup Language (HTML)

Before you can scrape a website, you must understand how it is built. HTML uses **tags** to define the elements of a page. Most tags come in pairs: an opening tag (`<tag>`) and a closing tag (`</tag>`). The content between them is the element's value.

- **The Container:** Every HTML document must be enclosed within an opening `<html>` tag and a closing `</html>` tag. This tells the browser (and your scraper) where the document begins and ends.
- **Elements:** The main building blocks (e.g., `<h1>`, `<p>`, `<a>`, `<div>`).
- **Attributes:** Provide extra information about an element, usually defining its style or function (e.g., `href` for a link, `class` or `id` for styling).

```html
<html>
  <body>
    <div class="product-card" id="item-123">
      <a href="/details/123">
        <h2>Product Title</h2>
      </a>
      <p>Price: $10.00</p>
    </div>
  </body>
</html>
```

:::note
In the example above:

- `html`, `body`, `div`, `a`, `h2`, and `p` are **tags**.
- `class="product-card"` and `id="item-123"` are **attributes**.
  :::

## 2. The Document Object Model (DOM)

The DOM is a programming interface that treats an HTML document as a **tree structure** of nodes. Every element, attribute, and piece of text is a node in this tree. When we scrape, we don't just "read text"; we navigate this tree to find specific "branches" (nodes).

|                  |                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Node**    | The `<html>` tag. It contains everything else.                                                                                                          |
| **Parent/Child** | Elements nested inside another are its children. In our example, the `<a>` and `<p>` tags are children of the `<div>`. The `<div>` is their **parent**. |
| **Siblings**     | Elements that share the same parent. Here, the `<a>` and `<p>` tags are **siblings**.                                                                   |

### Why this matters for Scraping

Scraping involves identifying a "path" to the data. If you want the "Product Title," you tell your script to:

1. Find the `div` with the ID `item-123`.
2. Look inside for its child, the `h2` tag.
3. Extract the text.

:::tip

**GPS for Data**

Think of _Classes_ and _IDs_ as the "GPS coordinates" for your scraper.

While a webpage might have fifty `<h2>` tags (the "streets"), it will likely only have one `id="product-price"` (the "exact address"). When you start scraping, you will spend most of your time looking for these specific `id` or `class` attributes to tell your Python script exactly where to "land" on the page.
:::

:::summary

- **Web Scraping** is the automated extraction of data from websites.
- **HTML** provides the structure using _tags_ (like `<div>`) and _attributes_ (like `class`).
- The **DOM** turns HTML into a _tree of nodes_, allowing us to navigate the page programmatically.
- **Nodes** are related to each other as **Parents**, **Children**, or **Siblings**.
- Successful scraping relies on targeting specific nodes using their **tag names**, **classes**, or **IDs**.
  :::

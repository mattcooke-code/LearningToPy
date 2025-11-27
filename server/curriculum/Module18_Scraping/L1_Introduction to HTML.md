# 🏷️ HTML Structure and the Document Object Model (DOM)

Before you can scrape a website, you must understand how a webpage is built. Web scraping is fundamentally about navigating the structure of HTML.

## 1. HyperText Markup Language (HTML)

HTML uses **tags** to define the elements of a page. Most tags come in pairs: an opening tag (`<tag>`) and a closing tag (`</tag>`). The content between them is the element's value.

- **Elements:** The main building blocks (e.g., `<h1>`, `<p>`, `<a>`, `<div>`).
- **Attributes:** Provide extra information about an element, usually defining its style or function (e.g., `href` for a link, `class` or `id` for styling).

```html
<div class="product-card" id="item-123">
  <a href="/details/123">
    <h2>Product Title</h2>
  </a>
</div>
```

In the example above:

• `div`, `a`, `h2` are **tags**.

• `class="product-card"` and `id="item-123"` are **attributes**.

## 2. The Document Object Model (DOM)

The DOM is a programming interface that treats an HTML document as a **tree structure** of nodes. Every element, attribute, and piece of text is a node in this tree.

• **Root Node**: The `<html>` tag.

• **Parent/Child**: Elements nested inside another are its children (e.g., `<a>` is a child of the `<div>`).

• **Siblings**: Elements at the same level (e.g., two separate `<p>` tags inside the same `<div>`).

Scraping involves finding a specific node (e.g., a product price) by navigating down this tree structure from the root, often targeting nodes based on their **tag name, class name**, or **ID**.

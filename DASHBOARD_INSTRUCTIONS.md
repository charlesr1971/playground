# Dashboard Index Page Instructions

To create a dashboard index page that links to all subfolders (each with its own `index.htm`), follow these steps:

1. **For each subfolder in the root:**
    - Assume each subfolder contains an `index.htm` file.
    - The dashboard should generate a card for each subfolder.
    - The card title should use the subfolder name, replacing hyphens (`-`) with spaces and capitalizing each word.
    - The card should link to `subfolder/index.htm`.

2. **Card Style:**
    - Each card should be visually distinct (e.g., with a border, shadow, padding, and hover effect).
    - Cards should be arranged in a responsive flexbox grid.

3. **Example HTML for a single card:**
    ```html
    <a class="card" href="ai-todo-list/index.htm">
      <div class="card-title">Ai Todo List</div>
      <div class="card-link">Open</div>
    </a>
    ```

4. **Add new cards for each new subfolder:**
    - Copy the card block and update the `href` and title as described above.

5. **Page Structure:**
    - The dashboard should have a main heading (e.g., "Project Dashboard").
    - All cards should be inside a container with a class like `card-list`.

6. **Styling:**
    - Use CSS to style the dashboard and cards for a clean, modern look.

---

**Prompt for Copilot or reuse:**

> Can you make an index page inside the root, that acts as a dashboard that links to the subfolders. Each subfolder will always have an index.htm. Add each link into a card style block, with title that uses the subfolder name with hyphens, replaced with spaces and the words capitalised. Then write this prompt into instructions, in a markdown file so that I can reuse it, when I add more subfolders.

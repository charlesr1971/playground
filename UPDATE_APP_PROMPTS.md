# Instructions for Updating App Blueprint Prompts

This file describes how to keep the blueprint prompt (e.g., `APP_BLUEPRINT_PROMPT.md`) in each app subfolder up to date as you develop and enhance your modules.

---

## Purpose
Maintain a living blueprint for each app/module by updating its prompt file whenever you add, change, or remove features. This ensures you always have an accurate, reusable description for rebuilding or evolving each app.

---

## How to Update App Blueprint Prompts

1. **After making changes to an app (e.g., adding features, refactoring, UI updates):**
    - Summarize the new or changed requirements, features, or design decisions.
    - Open the `APP_BLUEPRINT_PROMPT.md` (or equivalent) in the app's folder.
    - Add or update the prompt to reflect the latest state and requirements of the app.
    - Ensure the prompt is clear, complete, and actionable for future use.

2. **When using a new prompt to modify an app:**
    - Copy the new prompt or instructions into the blueprint file, either as a new section or by updating the main prompt.
    - Optionally, keep a changelog or dated history of major prompt updates within the file.

3. **Best Practices:**
    - Use markdown formatting for clarity.
    - Keep the prompt focused on what the app should do and how it should behave.
    - Remove outdated instructions as features are replaced or removed.
    - Encourage contributors to update the blueprint prompt as part of the development workflow.

---

## Example Workflow

1. You add a new feature (e.g., dark mode) to an app in `my-app/`.
2. Update `my-app/APP_BLUEPRINT_PROMPT.md` to include instructions for the new feature.
3. When you or others want to regenerate or extend the app, use the updated prompt as the blueprint.

---

## Prompt for Copilot or Reuse

> Can you update the blueprint prompt in this app's folder to reflect the latest features, requirements, and design decisions, based on the most recent changes or prompts used to modify the app?

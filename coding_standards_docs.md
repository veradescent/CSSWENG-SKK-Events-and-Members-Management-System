# MDN JavaScript Coding Style — Project Implementation

This document gives a compact, practical implementation of the MDN JavaScript code-style guidance for use within a project. It summarizes the important rules and provides examples and a recommended tooling configuration so your team can apply the MDN conventions consistently.

> Based on MDN Web Docs "Guidelines for writing JavaScript code examples" — adapted here into a project style-guide you can paste into your repository's `CONTRIBUTING.md` or `docs/STYLE.md`.

---

## Table of contents

1. Formatter & tooling
2. Language features to prefer
3. Files, modules, and top-level `await`
4. Variables and declarations
5. Functions
6. Comments and logging
7. Arrays & objects
8. Control flow (loops / conditionals)
9. Asynchronous code (promises, async/await)
10. Operators & expressions
11. Strings & template literals
12. Accessibility / Web APIs to avoid in examples
13. Examples
14. Quick checklist

---

## 1. Formatter & tooling

- **Prettier** is the canonical formatter. Use the project Prettier configuration (commit `.prettierrc` / `.prettierignore`) and run it on save and in CI.
- Use **ESLint** for rules that require linting. Prefer the `eslint:recommended` set plus project-specific rules. Keep formatting decisions to Prettier and behavior/style rules to ESLint.
- Add `npm` scripts:

```json
{
  "format": "prettier --write '**/*.{js,jsx,ts,tsx,json,md}'",
  "lint": "eslint . --ext .js,.jsx"
}
```

- Run Prettier and ESLint in CI and as pre-commit hooks (Husky/Lint-staged recommended).

---

## 2. Language features to prefer

- Use modern JavaScript features that are supported by the project's browser/node baseline. Check compatibility before using bleeding-edge features.
- Prefer `const` and `let` over `var`.
- Prefer array methods (`map`, `filter`, `reduce`) over manual loops when clearer.

---

## 3. Files, modules, and top-level `await`

- Use ES modules (`import` / `export`) where possible.
- **Avoid top-level `await`** in code intended to run in environments where modules aren't guaranteed. If your project is ESM-only and the environment supports it, top-level `await` is allowed.

---

## 4. Variables and declarations

- Use `const` by default. Use `let` only for reassignment.
- Prefer meaningful variable names; keep them concise but descriptive.
- Avoid single-letter names except for common indices (`i`, `j`, `k`) or small scopes.
- Group related declarations and keep scope as small as possible.

**Bad:**

```js
let a = 1;
let b = 2;
function foo(x) { return x + a + b; }
```

**Good:**

```js
const left = 1;
const right = 2;
function sum(value) {
  return value + left + right;
}
```

---

## 5. Functions

- Prefer small, single-purpose functions with clear names.
- Use arrow functions for anonymous callbacks and small utilities; use function declarations for named functions that form part of the public API.
- Name functions so their purpose is clear (e.g. `formatCurrency`, `fetchUserData`).
- Use default parameters rather than `||` fallbacks where appropriate.

**Example:**

```js
function multiply(a, b = 1) {
  return a * b;
}

const square = (x) => multiply(x, x);
```

---

## 6. Comments and logging

- Use comments to explain **why** something is done, not **what** the code does.
- Use single-line `//` comments. If a multi-line comment is needed, prefix each line with `//`.
- Leave a single space after `//` and start with a capital letter. Do not end the comment with a period unless it is a full sentence that needs it.
- When examples show `console.log()` outputs, put the resulting value in a trailing comment (after the call), not in a preceding comment.

**Good:**

```js
// Calculate the total price including taxes and shipping
const total = goodsPrice + shipping + taxes;
console.log(total); // 103.50
```

---

## 7. Arrays & objects

- Create arrays with literals: `const arr = []`, not `new Array(...)`.
- Use `push()` to add items rather than assigning to `arr[arr.length]`.
- Prefer object literals for simple maps. Use `Map` when you need ordered or complex keys.

**Good:**

```js
const pets = [];
pets.push('cat');
const config = { host: 'localhost', port: 8080 };
```

---

## 8. Control flow (loops / conditionals)

- Use expressive constructs: `for..of` for arrays, `for..in` only for object keys (but prefer `Object.keys()`/`Object.entries()`), array iteration methods where appropriate.
- Keep conditions small and readable. When a condition is complex, extract it into a well-named boolean function or variable.

**Example:**

```js
for (const item of items) {
  if (!isValid(item)) continue;
  process(item);
}
```

---

## 9. Asynchronous code (Promises, async/await)

- Prefer `async/await` for readability except when `Promise` chaining is clearer.
- Avoid top-level `await` unless ESM-only and environment supports it.
- Always handle errors (`try/catch` around `await` or `.catch()` on promises).

**Good:**

```js
async function fetchUser(id) {
  try {
    const res = await fetch(`/users/${id}`);
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch user', err);
    throw err;
  }
}
```

---

## 10. Operators & expressions

- Prefer readability. Use parentheses to clarify precedence when needed.
- Use strict equality (`===` / `!==`) unless intentionally using type-coercing equality and clearly documenting it.

---

## 11. Strings & template literals

- Prefer template literals for string interpolation and multi-line strings.

```js
const message = `Hello ${name}, today is ${date.toLocaleDateString()}`;
```

---

## 12. Web APIs to avoid in docs/examples

- When writing examples intended to run in many environments, avoid web APIs that are not widely supported or are experimental unless the example documents that specific API.

---

## 13. Examples

Keep examples short, valid, and copy-paste ready. Use comments for omitted code (`// …`) and indicate what the developer should add.

**Example with ellipsis and comment:**

```js
function example() {
  // Add your code here
  // …
}
```

**Bad ellipsis:**

```js
function example() {
  …
}
```

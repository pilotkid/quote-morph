# QuoteMorph

This extension, **QuoteMorph**, automatically converts single or double-quoted strings to backticks in your code when template literals are detected. It is designed to enhance your coding experience by seamlessly switching string encapsulation, especially when working with template literals.

## Features

- Automatically detects when `${}` or `{}` is typed within a string and converts the surrounding quotes to backticks.
- Works in real-time as you type, ensuring a smooth and efficient workflow.
- Supports both single (`'`) and double (`"`) quotes.

### Example
![Demo Video](docs/images/Demo.gif)

Before typing `${}`:
```typescript
const message = "Hello, world!";
```

After typing `${}`:
```typescript
const message = `Hello, ${name}!`;
```

## Requirements

This extension does not have any special requirements or dependencies. It works out of the box with Visual Studio Code.

## Extension Settings

This extension does not introduce any new settings. It works automatically when installed and activated.

## Known Issues

- The extension currently only supports single-line strings. Multi-line strings are not yet handled.
- If there are nested quotes or complex string structures, the behavior might be unpredictable.

## Release Notes

### 1.0.0

- Initial release of **QuoteMorph**.
- Added support for detecting `${}` and `{}` within strings and converting quotes to backticks.

---

## Following Extension Guidelines

This extension adheres to the [Visual Studio Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines) to ensure best practices and a high-quality user experience.

## Please also consider supporting me on ko-fi
https://ko-fi.com/marcellobachechi

<a href='https://ko-fi.com/marcellobachechi' target='_blank'><img height='35' style='border:0px;height:46px;' src='docs/images/kofi.png' border='0' alt='Buy Me a Coffee at ko-fi.com' />


**Enjoy coding with QuoteMorph!**

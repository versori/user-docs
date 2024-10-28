# Versori Documentation

This repository is the source for https://docs.versori.com.

The site is powered by [Mintlify][mintlify], and updates to the `main` branch will be automatically deployed.

## 🚀 Getting Started

Start the development server using the following command:

```sh
npx mintlify dev -p 3333
```

### 📝 Editing existing files

Edit any files as necessary and the changes will be reflected in the browser. 

### 📄 Creating new files

Files are served at the same path as they are located in this repository. Add a new `.mdx` file at the location
of your choosing and it will be available at that path.

In order for the page to appear in sidebar, it must be added to the `navigation` array in `mint.json`.

### 🔩 API References

The API Reference pages are generated using the following command:

```sh
npx @mintlify/scraping@latest openapi-file <openapi-file> -o <output-directory>
```

The OpenAPI specifications in this repository are not the source of truth for the Versori APIs, manual changes 
*MUST NOT* be made in this repository. If you notice any issues with the API Reference pages, they must be made 
upstream within their respective repositories.

> External contributors should consult the 
> [Contributing OpenAPI specification changes](CONTRIBUTING.md#contributing-openapi-specification-changes) section of
> the CONTRIBUTING.md guidelines for more information for contributing to the API Reference pages.

### 🙋 Need more help?

Check out the [Mintlify documentation][mintlify-docs] for more information.

## 🤝 Contributing

We welcome contributions to this project. Please read the [Contributing Guidelines](CONTRIBUTING.md) for more information.

[mintlify]: https://mintlify.com
[mintlify-docs]: https://mintlify.com/docs

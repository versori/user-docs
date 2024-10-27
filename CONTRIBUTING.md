# Contributing

If you're reading this file, then you may be interested in contributing to this project. We welcome contributions from 
the community and are happy to have you here. 

The [README](README.md) contains some useful information for getting started, the rest of this document outlines some
guidelines for contributing any changes back to the project.

## Requesting Changes

For relatively small edits, or contributing new content, we request that contributors provide a pull request with any
desired changes. For larger changes, we recommend creating a GitHub Issue to discuss the changes with the maintainers
before investing your own time to ensure that your valuable time is not wasted.

### Reporting Bugs

If you have found a bug in the documentation, please create a GitHub Issue with information about the bug, including
any relevant context or information that may help the maintainers to reproduce and/or fix it. Alternatively, pull 
requests are welcome to fix the bug directly.

## Making Changes

### Commit messages

Versori follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit
messages. This means that all commit messages should be in the format of `<type>(<scope>): <description>`, for example:

```
feat(tools): add new Filter tool documentation
```

> Although not yet implemented, this format allows for automated changelog generation and versioning, and helps to keep 
> the commit history clean. Additionally, it helps keep Versori's Git repository consistent with other repositories that
> are internally maintained.

The `<type>` should be one of the following:

- `feat`: A new feature or addition/removals to the documentation or changes to URLs
- `fix`: A bug fix, correction or improvement to the documentation, including style changes
- `docs`: Changes to the documentation contained within this repository, such as this file or the [README](README.md).
- `chore`: Any other changes that do not fit into the above categories and does not affect the deployed documentation.

The `<scope>` property is optional, but should be used to indicate the part of the documentation that the commit 
affects. Typically, this will be the name of the page or section that is being changed. See the commit history for
examples on its usage.

### Contributing content

When contributing content to the documentation, whether additions or edits, please ensure that your tone of phrase is 
professional, respectful and written in proper English without spelling mistakes. Also make your best attempt to keep
the content as consistent as possible with the existing documentation.

### Contributing code snippets

Many aspects of the documentation contain code snippets. When contributing code, please ensure that the code is valid
and follows the same coding standards as the existing code (such as variable name conventions, whitespace and 
comments). 

All code snippets should be made available in the same set of programming languages. Initially this is solely
TypeScript, but other languages may be added in the future. If a new language is being added to the documentation, all
existing snippets must be updated to include the new language.

### Contributing OpenAPI specification changes

The OpenAPI specifications in this repository are not the source of truth for the Versori APIs, manual changes
*MUST NOT* be made in this repository. If you notice any issues with the API Reference pages, please raise a GitHub
Issue.

External contributors may provide PRs to update the OpenAPI specifications in the `openapi` directory, but these will
be triaged by the maintainers and updated internally before being merged.

### Localisation

At the time of writing, this documentation is only available in English. If you would like to contribute translations
to other languages, please create a GitHub Issue to discuss this with the maintainers.




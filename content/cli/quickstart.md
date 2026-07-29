---
title: "Quickstart"
description: "Set up authentication and run your first CLI command."
weight: 3
---

After [installing](/cli/installation/) the Versori CLI, follow these steps to authenticate and start managing your resources.

{{% steps %}}
1. **Generate a JWT for the CLI**

   Generate a JWT token from the [Versori console](https://ai.versori.com/account?content=keys) for the organisation you want to manage.

   {{< image src="/images/cli/generate-jwt-for-cli.png" alt="Generating a JWT for the CLI" >}}
   *Generating a JWT for the CLI*

2. **Add a context**

   A context stores your authentication credentials for an organisation. You need a JWT token generated from the [Versori console](https://ai.versori.com/account?content=keys) for the organisation you want to manage.

   ```sh
   versori context add \
     --name my-context \
     --organisation <organisation-id> \
     --jwt <jwt-token>
   ```

   > [!TIP]
   > Pass in `--jwt -` to read the JWT from stdin.

3. **Verify your context**

   Confirm the context was created and is active:

   ```sh
   versori context list
   ```

4. **Run your first command**

   List the projects in your organisation:

   ```sh
   versori projects list
   ```
{{% /steps %}}

## Next steps

{{% columns %}}
- ### [Project Workflow](/cli/workflow/)
  Follow a complete project lifecycle from creation to deployment.

- ### [Configuration](/cli/configuration/)
  Learn about the config file, contexts, and global flags.
{{% /columns %}}

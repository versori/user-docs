---
title: "Project Workflow"
description: "A typical workflow for managing Versori projects with the CLI."
weight: 6
---

This guide walks through a complete project lifecycle using the Versori CLI — from creation through deployment and monitoring.

## Create and sync a project

{{% steps %}}
1. **Create a new project**

   ```sh
   versori projects create --name my-project
   ```

2. **Pull project files locally**

   ```sh
   versori projects sync --project <project-id>
   ```

   This creates a `.versori` file in the target directory so that subsequent commands can infer the project and context automatically.
{{% /steps %}}

## Develop and deploy

{{% steps %}}
1. **Edit files locally**

   Make your changes to the project files in the synced directory.

2. **Push changes**

   Save your local changes to the project without deploying:

   ```sh
   versori projects save
   ```

3. **Deploy to an environment**

   ```sh
   versori projects deploy --environment production
   ```

4. **Check logs**

   ```sh
   versori projects logs --environment production --since 1h
   ```
{{% /steps %}}

## Version and promote

For more controlled releases, use versioned snapshots:

```sh
versori projects versions create --project <project-id> --name v1.0

versori projects versions deploy \
  --project <project-id> \
  --version-id <id> \
  --environment production
```

## Test with proxy

Send an HTTP request directly to a deployed project environment:

```sh
versori projects proxy \
  --project <project-id> \
  --environment production \
  --path /my-endpoint \
  --method POST
```

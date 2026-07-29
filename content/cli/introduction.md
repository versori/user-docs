---
title: "Introduction"
description: "A command-line interface for managing resources on the Versori platform."
weight: 1
---

The Versori CLI lets you manage projects, systems, connections, users, and more directly from your terminal. It supports the full project lifecycle — from creation and local development through deployment and monitoring.

{{% columns %}}
- ### [Installation](/cli/installation/)
  Install the CLI on macOS, Linux, or Windows.

- ### [Quickstart](/cli/quickstart/)
  Set up authentication and run your first command.

- ### [Commands](/cli/commands/context/)
  Full reference for all available commands.

- ### [Project Workflow](/cli/workflow/)
  Learn the typical workflow for managing projects.
{{% /columns %}}

## Overview

| Command | Alias | Description |
|---|---|---|
| `version` | | Show the CLI version |
| `context` | | Manage authentication contexts |
| `projects` | `project` | Manage projects (incl. `activations`, `variables`, `users`) |
| `systems` | `system` | Manage systems |
| `connections` | `connection` | Manage connections |
| `users` | `user` | Manage end-users |
| `kv` | | Inspect and manage KV store entries |
| `issues` | `issue` | List, inspect, and update issues |
| `notifications` | | Manage organisation notification channels and project bindings |
| `execution-pools` | `ep` | Manage execution pools |
| `skills` | | Install AI agent skills (e.g. `coding-versori-sdk`) |

## Global flags

These flags are available on every command.

| Flag | Short | Default | Description |
|---|---|---|---|
| `--config` | `-c` | `~/.versori/config.yaml` | Path to the config file |
| `--context` | `-x` | *(active context)* | Use a specific context for this invocation |
| `--output` | `-o` | `table` | Output format: `table`, `json`, or `yaml` |

> [!TIP]
> Run `versori <command> --help` for detailed usage of any command.

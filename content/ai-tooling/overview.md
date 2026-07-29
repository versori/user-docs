---
title: "AI-Assisted Integration Development"
description: "Use the Versori skill in your AI coding tool to build data integrations locally."
weight: 2
---

Versori ships a built-in skill, `coding-versori-sdk`, that turns your AI coding tool into a Versori integration expert. It guides the agent through the full integration lifecycle — from research and system setup through code generation, testing, and deployment.

The skill works with any AI coding tool that supports skills or agent files, including [Cursor](https://cursor.com/), [Codex](https://openai.com/codex/), and [Claude Code](https://www.anthropic.com/claude-code). When you describe an integration task, the skill provides your agent with structured knowledge about the Versori CLI, Run SDK, and platform workflow. It activates automatically when you work on ETL pipelines, API integrations, data synchronisation, webhooks, or mention Versori.

{{% columns %}}
- ### [Installation](/ai-tooling/installation/)
  Add the skill to Cursor, Codex, Claude Code, or any other AI coding tool.

- ### [Workflow](/ai-tooling/workflow/)
  The structured 8-step process the skill follows to build integrations.

- ### [Tips & Best Practices](/ai-tooling/tips/)
  Get the most out of AI-assisted integration development.

- ### [Run SDK](/run-sdk/introduction/)
  Learn about the SDK used to build integration workflows.
{{% /columns %}}

## What the skill does

The skill equips your AI tool with knowledge of Versori's platform, CLI commands, and SDK patterns. When activated, it follows a structured workflow to:

- **Research** your integration requirements and produce a structured plan
- **Set up systems** on the Versori platform using the CLI
- **Create connections** with the correct authentication for each system
- **Generate TypeScript workflows** using the Versori Run SDK
- **Write and run tests** to validate your integration logic
- **Deploy** the finished integration via the CLI

## Prerequisites

Before using the skill, make sure you have:

- A [Versori account](https://platform.versori.com) with an active organisation
- The [Versori CLI installed](/cli/installation/) and [authenticated](/cli/quickstart/)
- [Node.js](https://nodejs.org/) or [Deno](https://deno.com/) installed for local development and testing
- An AI coding tool such as Cursor, Codex, or Claude Code

> [!NOTE]
> The skill is distributed with the Versori CLI. Run `versori skills download` to add it to any AI tool, or install
> the Claude Code plugin for a one-step setup. See the [Installation](/ai-tooling/installation/) page for details.

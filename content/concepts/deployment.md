---
title: Deployment
weight: 4
---

Deployment promotes your Project to production with monitoring, alerting, and safe versioning.

Principles:

- **Immutable builds**: Promote the same artifact through environments.
- **Config as data**: Keep credentials and endpoints in Connections; avoid hard‑coding in workflows.
- **Progressive rollout**: Use canaries or staged rollouts for sensitive changes.

Operational guidance:

- Monitor latency, error rates, and retries per workflow.
- Alert on persistent failures and backoff exhaustion.
- Track Connector and Project versions to align with upstream API changes.

Related: [Run SDK](/concepts/run-sdk/)

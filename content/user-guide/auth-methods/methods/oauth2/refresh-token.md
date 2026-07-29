---
title: Refresh Token
weight: 4
---

## Refresh Token

The `refresh_token` grant is used to refresh an access token when it expires. This is a standard OAuth 2.0 grant type
and is supported by most systems.

Users do not typically need to configure this grant type manually, and instead use the
[`authorization_code`](/user-guide/auth-methods/methods/oauth2/authorization-code/) or
[`client_credentials`](/user-guide/auth-methods/methods/oauth2/client-credentials/) grant types.

> [!NOTE]
> Creating new [Connections](/user-guide/getting-started/connect/) using the `refresh_token` grant type directly is not
> supported via our UI, but can be created manually via the
> [CreateConnection](/api-reference/platform-api/) using the `oauth2-token` credential type.

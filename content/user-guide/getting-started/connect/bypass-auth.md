---
title: Bypass authentication
weight: 2
---

Bypassing authentication allows you to create a connection to an external system without providing credentials. This is
useful when the target API does not require authentication — for example, public endpoints or services that rely on
network-level security such as IP allowlists.

> [!WARNING]
> Bypassing authentication means requests to the external system and incoming webhook traffic will not include any
> credentials. Only use this option when you are confident the target system does not require request-level
> authentication. For IP-based security, see [IP Allowlist](/user-guide/advanced/).

## When to bypass authentication

Most connections require credentials — API keys, OAuth tokens, or other authentication methods — to communicate with
external systems. However, there are scenarios where authentication is unnecessary or handled outside the platform:

- **Public APIs**: The external system exposes endpoints that do not require authentication.
- **IP allowlisting**: The target system uses network-level restrictions instead of request-level credentials, allowing
  traffic from known IP addresses without further authentication.
- **Internal services**: You are connecting to an internal service within your own infrastructure that does not enforce
  authentication.

> [!TIP]
> If you are unsure whether the target system requires authentication, check with the API provider first. Bypassing
> authentication when credentials are required will result in failed requests.

## Creating a bypassed connection

You can bypass authentication when creating a new connection for a connector. This creates an authentication method
called "No Auth" with the type set to "None - Authentication Bypassed".

{{% steps %}}
1. **Open the New Connection form**

   Navigate to your connector and select **New Connection**. Choose the **No Auth** option under Auth Method to indicate
   that no credentials are required.

2. **Configure the connection**

   Provide a **Name** and optional **Description** for the authentication method, then enter the **API Base URL** for
   the target system. This is the root URL that all requests will be sent to.

   {{< image src="/images/guides/connect/bypass-auth-001.png" alt="New Connection form showing No Auth selected as the authentication method with fields for name, description, and API Base URL" >}}
   *The New Connection form with No Auth selected and the API Base URL configured*

3. **Confirm the bypass**

   Click **Bypass Authentication** to create the connection. The connection is now available to use in your integration,
   and all requests will be sent to the configured base URL without credentials.
{{% /steps %}}

> [!NOTE]
> The connection will appear in your list of available connections with its authentication status clearly marked as
> bypassed. You can use it in your workflows just like any other connection.

## Reverting a bypassed connection

If you later need to add authentication to a bypassed connection, select a different authentication method for the
connector. This updates the connection form to allow you to choose an existing authenticated connection or create a new
one with credentials.

> [!TIP]
> Reverting a bypassed connection does not delete it. The existing bypassed connection remains available until you
> replace it with an authenticated one.

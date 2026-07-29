---
title: "Setting Up Single Sign-On"
weight: 1
---

Setting up SSO for your organisation is done from the **SSO Integration** tab in Settings. It has two parts: verify a
domain your organisation owns, then add an SSO connection for that domain.

> [!NOTE]
> Only organisation administrators can set up SSO. If you don't see the **SSO Integration** tab, either you don't
> have admin permissions, or SSO isn't yet enabled for your organisation — contact Versori support to enable it.

## Opening SSO Integration

{{% steps %}}
1. **Open your account settings**

   Click your profile in the top-right corner and select **View account**.

2. **Go to SSO Integration**

   In the **Organisation** section of the settings menu, click **SSO Integration**.
{{% /steps %}}

## Step 1: Verify a domain

Versori only allows SSO connections for domains your organisation has proven it owns, by publishing a DNS record.

{{% steps %}}
1. **Add the domain**

   Under **Verified Domains**, enter the domain (for example `acme.com`) and click **Add domain**.

2. **Publish the DNS record**

   Versori generates a DNS TXT record name and value for the domain. Add this record with whoever manages your
   organisation's DNS.

3. **Verify it**

   Once the record has been published, click **Verify** next to the domain. If the record can't be found yet, it can
   take a while for DNS changes to propagate — try again shortly.
{{% /steps %}}

A verified domain shows a **Verified** badge. You can remove a domain at any time; if you add it again later, it will
need to be verified again.

## Step 2: Add an SSO connection

Once a domain is verified, you can add one SSO connection for it. Each verified domain can only hold a single
connection, so **Add Connection** is only available for domains that don't already have one.

{{% steps %}}
1. **Start a new connection**

   Click **Add Connection**, then choose the domain to connect (only verified domains without an existing connection
   are offered) and give the connection a **Name** — this is shown to your members when they sign in.

2. **Choose the connection type**

   Select **SAML** or **OIDC**, depending on what your identity provider supports. This can't be changed later — to
   switch types, remove the connection and create a new one.

3. **Provide your identity provider's details**

   **For SAML**, provide either a metadata URL or paste your identity provider's raw metadata XML directly. You can
   optionally override the ACS URL or turn on **Force Authentication**.

   **For OIDC**, provide the Client ID and Client Secret from your identity provider, then either a well-known
   discovery URL or the individual endpoints (issuer, authorization, token, JWKS, and user info URLs).

4. **Create the connection**

   Click **Create Connection**. Members signing in with an email on the verified domain are now routed to your
   identity provider.
{{% /steps %}}

## Managing connections

Each connection shows its **Type** (SAML or OIDC) and **Status** (Active or Disabled).

- **Editing** — update the name, description, or provider details. Secret fields (like an OIDC client secret) are
  left blank when editing and keep their current value unless you enter a new one. For OIDC connections, the Client
  ID can't be changed — remove and recreate the connection to use a different one.
- **Removing** — removes the connection entirely. Members on that domain will no longer be able to sign in via that
  provider, so make sure they have another way to access Versori first.

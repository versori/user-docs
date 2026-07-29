---
title: "Installation"
description: "Install the Versori CLI on macOS, Linux, or Windows."
weight: 2
---

## Install script (recommended)

The quickest way to install the Versori CLI is with the install script. It automatically detects your OS and architecture, downloads the latest release binary from GitHub, and places it in `/usr/local/bin`.

```sh
curl -fsSL https://raw.githubusercontent.com/versori/cli/main/install.sh | sh
```

To pin to a specific version, set `VERSORI_VERSION`:

```sh
VERSORI_VERSION=v0.0.1 curl -fsSL https://raw.githubusercontent.com/versori/cli/main/install.sh | sh
```

> [!NOTE]
> Supported platforms: Linux and macOS on `amd64` and `arm64`. Windows users should download a pre-built binary from the [releases page](https://github.com/versori/cli/releases).

## Download a pre-built binary

Pre-built binaries for Linux, macOS, and Windows (`amd64` and `arm64`) are available on the [GitHub releases page](https://github.com/versori/cli/releases).

{{% steps %}}
1. **Download the archive**

   Download the archive for your platform from the [releases page](https://github.com/versori/cli/releases).

2. **Extract the binary**

   Extract the downloaded archive to get the `versori` binary.

3. **Add to your PATH**

   Move the `versori` binary to a directory on your `PATH`, for example `/usr/local/bin`.
{{% /steps %}}

## Verify the installation

After installing, verify the CLI is available:

```sh
versori version
```

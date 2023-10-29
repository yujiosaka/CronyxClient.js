# CronyxClient.js [![npm version](https://badge.fury.io/js/cronyx-client.svg)](https://badge.fury.io/js/cronyx-client) [![CI/CD](https://github.com/yujiosaka/CronyxClient.js/actions/workflows/ci_cd.yml/badge.svg)](https://github.com/yujiosaka/CronyxClient.js/actions/workflows/ci_cd.yml)

###### [API](https://github.com/yujiosaka/CronyxClient.js/blob/main/docs/API.md) | [Code of Conduct](https://github.com/yujiosaka/CronyxClient.js/blob/main/docs/CODE_OF_CONDUCT.md) | [Contributing](https://github.com/yujiosaka/CronyxClient.js/blob/main/docs/CONTRIBUTING.md) | [Changelog](https://github.com/yujiosaka/CronyxClient.js/blob/main/docs/CHANGELOG.md)

A TypeScript HTTP client wrapper for [CronyxServer](https://github.com/yujiosaka/CronyxServer), seamlessly integrating the power of [Cronyx](https://github.com/yujiosaka/Cronyx) across platforms using a familiar API interface.

## 🌟 Features

<img src="https://github.com/yujiosaka/CronyxClient.js/assets/2261067/1dfc905b-9728-48d6-8b9f-8b47fd0fa749" alt="icon" width="300" align="right">

CronyxClient.js bridges the capabilities of Cronyx and CronyxServer, offering a way to schedule and manage tasks without losing the feel of the original [Cronyx API](https://github.com/yujiosaka/Cronyx/blob/main/docs/API.md).

### Why CronyxClient.js?

🌐 **Unified Experience**: Retain the simplicity and power of the Cronyx API while benefiting from the language-agnostic capabilities of CronyxServer.

🔌 **Plug & Play**: With just a URL configuration, connect to any running instance of CronyxServer and harness its capabilities without changing your existing Cronyx codebase.

🚀 **Familiar API**: Use the same API as Cronyx, and let CronyxClient.js handle the translation to CronyxServer's RESTful API.

## 🚀 Getting Started

To harness the capabilities of CronyxClient.js, follow these simple steps:

### Installation

Install the CronyxClient.js package using npm:

```sh
$ npm install cronyx-client
# or
# $ bun add cronyx-client
```

### Basic Usage

Using CronyxClient.js mirrors the use of Cronyx, with the additional specification of the CronyxServer URL:

```ts
import CronyxClient from "cronyx-client";

const cronyx = new CronyxClient({ url: "http://localhost:3000/" });
const job = await cronyx.requestJobStart({
  jobName: "hourly-job",
  jobInterval: "0 * * * *",
});

// The rest of your code remains the same
```

### Integrations and Compatibilities

CronyxClient.js is built on top of the Cronyx foundation, ensuring compatibility and integration with:

- **Cronyx**: Maintain the same API functions and structures, ensuring a seamless transition to CronyxClient.js.
- **CronyxServer**: Directly communicates with the server using its RESTful endpoints, translating your Cronyx API calls to HTTP requests.

## 💻 Development

Using Visual Studio Code and the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension, you can simplify the development environment setup process. The extension allows you to develop inside a Docker container and automatically sets up the development environment for you.

1. Install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension in Visual Studio Code.

2. Clone the repository:

```sh
git clone https://github.com/yujiosaka/CronyxClient.js.git
```

3. Open the cloned repository in Visual Studio Code.

4. When prompted by Visual Studio Code, click "Reopen in Container" to open the project inside the Docker container.

5. The extension will build the Docker container and set up the development environment for you. This may take a few minutes.

6. Build and run the Docker container with Docker Compose:

```sh
$ docker-compose up --build
```

This will start testing in watch mode.

## 🧑‍💻️ API reference

See [here](https://github.com/yujiosaka/CronyxClient.js/blob/main/docs/API.md) for the API reference.

## 🐞 Debugging tips

### Enable debug logging

Job status changes are logged via the [debug](https://github.com/visionmedia/debug) module under the `cronyx:client` namespace.

```sh
env DEBUG="cronyx:client" node script.js
# or
# env DEBUG="cronyx:client" bun script.js
```

## 💳 License

This project is licensed under the MIT License. See [LICENSE](https://github.com/yujiosaka/Cronyx/blob/main/LICENSE) for details.

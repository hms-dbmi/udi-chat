### Universal Discovery Interface Chatbot Prototype

This repository contains the prototype for the Universal Discovery Interface (UDI) chatbot.

The chatbot responds to queries with visualization of the available datasets. This interface is useful as we develop and experiment with the [UDI-Grammar](https://github.com/hms-dbmi/udi-grammar).

![A screenshot of the chatbot interface showing user queries and response visualizations.](./docs/chatbot_screenshot.png)

## 🚅 Quick start for developers

### Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

### set environment variables (optional)

| Variable                      | Description                                                                    | Default                                         |
| ----------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------- |
| `VITE_LLM_API_BASE_URL`       | Base URL for the LLM API.                                                      | `http://localhost`                              |
| `VITE_LLM_API_PORT`           | Port where the LLM API is running.                                             | `55001`                                         |
| `VITE_DATA_PACKAGE_PATH`      | Path to the data package that lists all data resources available to visualize. | `./data/hubmap_2025-05-05/datapackage_udi.json` |
| `VITE_PRODUCTION`             | Toggles production mode, set to true to hide debug features.                   | `false`                                         |
| `VITE_BENCHMARK_ENDPOINT_URL` | Path or endpoint for benchmark analysis results.                               | `./data/benchmark/benchmark_analysis.json`      |

Example .env file:

```
# .env
# LLM API configuration
VITE_LLM_API_BASE_URL=http://localhost
VITE_LLM_API_PORT=8080

# Data configuration
VITE_DATA_PACKAGE_PATH=./data/my_awesome_data/datapackage.json

# Mode toggle
VITE_PRODUCTION=true
```

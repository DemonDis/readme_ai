# Readme AI - User Guide

VSCode extension for generating README files using AI and repomix.

## Features

- 📦 Pack your repository into a single file using **repomix**
- 🤖 Send code to AI for README generation
- 🔢 Token counting for Qwen model
- ⚙️ Automatic creation of `.ilnsk` and `repomix.config.json` config files

## Installation

### From Source

```bash
npm install
npm run compile
npm run package
```

Install the resulting `.vsix` file via VSCode: `Extensions: Install from VSIX`

### Development Mode

```bash
npm install
npm run compile
# Press F5 to run in development mode
```

## Configuration

### `.ilnsk` File

Created automatically in the project root:

```json
{
  "apiUrl": "https://api.openai.ru/v1/",
  "apiKey": "your-api-key",
  "model": "gpt",
  "prompt": "...",
  "gitmoji": true
}
```

### `repomix.config.json` File

Created automatically with optimal settings for code packing.

### UI Setup

1. Open **Explorer** (left panel)
2. Click **Readme AI → Setup**
3. Enter API URL, API Key, and model name

## Usage

1. Open **Explorer** → **Readme AI**
2. Click **Generate README**
3. The plugin will:
   - Run repomix → creates `repomix-output.xml`
   - Count tokens for Qwen
   - Send code to AI
   - Create `README.md`

## Commands

| Command | Description |
|---------|-------------|
| `Readme AI: Setup` | Configure API parameters |
| `Readme AI: Generate README` | Generate README |

## Requirements

- VSCode version 1.115.0 or higher
- Node.js 18+

## Development

```bash
# Compile
npm run compile

# Build .vsix
npm run package

# Auto-recompile
npm run watch
```

## Publishing

```bash
# Publish to VSCode Marketplace
npm run publish

# Publish with version bump
npm run publish:minor
npm run publish:patch
```

---

**Note:** Before publishing, create a publisher account at https://marketplace.visualstudio.com/ and update the `publisher` field in `package.json`.
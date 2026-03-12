# claude-code-tts

An MCP server that adds text-to-speech to Claude Code using the macOS `say` command.

## Quick Start

```bash
claude mcp add --transport stdio tts -- npx claude-code-tts
```

To allow Claude to speak without requiring confirmation each time, add the following to your `~/.claude/settings.json`:

```json
{
  "permissions": {
    "allow": [
      "mcp__tts__speak",
      "mcp__tts__list_voices"
    ]
  }
}
```

Then ask Claude to speak something — it will use the `speak` tool automatically.

## Tools

### `speak`

Speak text aloud using macOS text-to-speech.

| Parameter | Type   | Default     | Description                     |
|-----------|--------|-------------|---------------------------------|
| `text`    | string | (required)  | The text to speak               |
| `voice`   | string | `Samantha`  | macOS voice name                |
| `rate`    | number | `175`       | Speech rate in words per minute |

### `list_voices`

Lists all available macOS TTS voices. Use this to find voice names for the `speak` tool.

## Requirements

- macOS (uses the built-in `/usr/bin/say` command)
- Node.js 18+

## License

MIT

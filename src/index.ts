#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { platform } from "node:os";

const execFileAsync = promisify(execFile);

const server = new McpServer({
  name: "claude-code-tts",
  version: "1.0.0",
});

server.tool(
  "speak",
  "Speak text aloud using macOS text-to-speech",
  {
    text: z.string().describe("The text to speak aloud"),
    voice: z
      .string()
      .default("Samantha")
      .describe("macOS voice name (run list_voices to see options)"),
    rate: z
      .number()
      .default(175)
      .describe("Speech rate in words per minute"),
  },
  async ({ text, voice, rate }) => {
    if (platform() !== "darwin") {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: text-to-speech is only supported on macOS. This tool uses the built-in `say` command which is not available on other platforms.",
          },
        ],
        isError: true,
      };
    }

    try {
      await execFileAsync("/usr/bin/say", [
        "-v",
        voice,
        "-r",
        String(rate),
        text,
      ]);
      return {
        content: [
          {
            type: "text" as const,
            text: `Spoke: "${text}" (voice: ${voice}, rate: ${rate} wpm)`,
          },
        ],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          { type: "text" as const, text: `Error running say: ${message}` },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "list_voices",
  "List available macOS text-to-speech voices",
  {},
  async () => {
    if (platform() !== "darwin") {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: text-to-speech is only supported on macOS.",
          },
        ],
        isError: true,
      };
    }

    try {
      const { stdout } = await execFileAsync("/usr/bin/say", ["-v", "?"]);
      return {
        content: [{ type: "text" as const, text: stdout }],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing voices: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("claude-code-tts MCP server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

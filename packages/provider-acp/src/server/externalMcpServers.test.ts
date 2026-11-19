import { EnvironmentId, ProviderInstanceId, ThreadId } from "@t3tools/contracts";
import { describe, expect, it } from "vitest";
import { acpMcpContext } from "./adapter.ts";

describe("acpMcpContext external MCP servers", () => {
  it("injects configured external HTTP and stdio MCP servers alongside t3-code for Antigravity/ACP", () => {
    const context = acpMcpContext(
      {
        environmentId: EnvironmentId.make("env-1"),
        threadId: ThreadId.make("thread-1"),
        providerSessionId: "session-1",
        providerInstanceId: ProviderInstanceId.make("antigravity"),
        endpoint: "http://127.0.0.1:4321/mcp",
        authorizationHeader: "Bearer t3-token",
        browserToolsAvailable: true,
        externalMcpServers: [
          {
            name: "t3-code",
            transport: "http",
            url: "https://should-be-ignored.example/mcp",
          },
          {
            name: "pantadex-http",
            transport: "http",
            url: "https://dex.pantaserver.duckdns.org/gemini+hermes+humanize+image+pv+ops/mcp",
          },
          {
            name: "pantadex",
            transport: "stdio",
            command: "npx",
            args: [
              "-y",
              "mcp-remote",
              "https://dex.pantaserver.duckdns.org/gemini+hermes+humanize+image+pv+ops/mcp",
            ],
          },
        ],
      },
      { command: "node", entrypoint: "/t3/server.mjs" },
      true,
      false,
    );

    // t3-code is preserved and never overwritten by external servers
    expect(context.httpServers.map((s) => s.name)).toEqual([
      "t3-code",
      "pantadex-http",
      "pantadex",
    ]);
    expect(context.servers.map((s) => s.name)).toEqual(["t3-code", "pantadex"]);
    expect(context.acpServers.map((s) => s.name)).toEqual([
      "t3-code",
      "pantadex-http",
      "pantadex",
    ]);
  });
});

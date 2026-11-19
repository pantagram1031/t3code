# T3 Code Fork — Native `t3_provider_limits` & External MCP (`pantadex`)

Branch: `feat/mcp-provider-limits-and-external-mcp`

## What This Fork Implements

### 1. Live Provider Usage Limits in MCP
- `orchestrator_capabilities` now includes each provider's live `usageLimits` (`ServerProviderUsageLimits`: 5h/weekly `usedPercent`, `resetsAt`, `windowDurationMins`, `resetCredits`) directly from `ProviderRegistry`.
- Added read-only MCP tool **`t3_provider_limits`** (`providerInstanceId?`, `refresh?`):
  - Returns live quotas across Codex, Claude 1, Claude 2, and Antigravity.
  - Pass `refresh: true` to force a live probe via `ProviderRegistry.refreshInstance()` / `refresh()`.
  - Added to `McpToolExposure.ts` `DIRECT_TOOLS`, `CLAUDE_READ_ONLY_T3_MCP_ALLOWED_TOOLS`, `t3McpToolPresentation.ts`, and `orchestrationInstructions.ts`.

### 2. Native External MCP Servers (Pantadex) for Every Agent
- Added `externalMcpServers` to `ServerSettings` (`packages/contracts/src/settings.ts`).
- Resolved per-thread in `ProviderSessionManager.ts` (filtering by `enabled` + optional `drivers` allowlist and applying `driverUrls[driver]` overrides).
- Injected natively across all 3 adapter families:
  - **ACP / Antigravity (`packages/provider-acp/src/server/adapter.ts`, `acpMcpContext`)**: Appended alongside `"t3-code"` in `servers`, `acpServers`, and `httpServers` (`session/new` `mcpServers`), leaving `makeAntigravityTextGeneration` untouched.
  - **Claude (`apps/server/src/orchestration-v2/Adapters/ClaudeAdapterV2.ts`)**: Injected into `mcpServers` and auto-approved via `allowedTools: ["mcp__<name>__*"]` when not in a read-only sandbox.
  - **Codex (`apps/server/src/orchestration-v2/Adapters/CodexAdapterV2.ts`)**: Injected into `mcp_servers.<name>` per-thread config.

## Example `settings.json` Config for Pantadex (Antigravity + Every Agent)

Add this block to `C:\Users\SAMSUNG\.t3\userdata\settings.json` when running this fork (Claude 1/2 already have `claude.ai` Pantadex and Codex already has `~/.codex/config.toml` Pantadex, so scoping `drivers: ["antigravity"]` avoids duplicates—or omit `drivers` to inject everywhere):

```json
{
  "externalMcpServers": [
    {
      "name": "pantadex",
      "enabled": true,
      "transport": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://dex.pantaserver.duckdns.org/gemini+hermes+humanize+image+pv+ops/mcp"
      ],
      "drivers": ["antigravity"]
    }
  ]
}
```

## Running the Fork Server Locally

```powershell
cd C:\Users\SAMSUNG\dev\t3-projects\t3code-fork
corepack pnpm dev:server
```

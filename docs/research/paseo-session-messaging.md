# Paseo session-to-session messaging — research reference

**Source:** dispatched researcher brief, 2026-11-01 (read pi 0.85.1
docs/source, Paseo CLI/daemon 0.11.4 source, live daemon state;
paths in the applied-in note's design section).
**Class:** lens + build facts — mechanism inventory for the direct
relay; never law.
**Gist:** pi sessions are isolated processes (no native bus); the
PASEO DAEMON is the native cross-session transport — each tab is a
`pi --mode rpc` child it owns. `paseo send <id> --prompt-file <msg>
--no-wait` delivers into a standing session; `paseo ls --json`
resolves peers; `paseo wait` + `paseo logs --filter text` read
replies.
**Hard limits (0.11.4):** CLI send to a BUSY agent =
interrupt-and-replace (cancels the running turn) — check status or
`paseo wait` first; no sender attribution (messages must
self-identify); replies are poll-based. The daemon's MCP
agent-to-agent tools (send_agent_prompt, finish notifications,
steer-default) are NOT available — pi 0.85.1 lacks MCP support;
revisit when pi gains it. Upstream has `--behavior steer|interrupt`,
not this install.
**Alternative:** a pi extension (fs.watch inbox → sendMessage
triggerTurn — the official file-trigger pattern) gives a Paseo-free
path with sub-second latency; extensions cannot cross processes, so
the daemon remains the transport for standing tabs.
**Applied in:**
`.hivemind/designs/2026-11-01-pp-automation-levels.md` (the relay
mechanics section).

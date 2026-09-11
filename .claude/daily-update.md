Date: 2026-09-11
Developer: ecopello

- Extracted the AI provider call, error mapping, and usage-logging logic out of the chat endpoint into a new AiCompletionService in the ai module, so the controller only builds the request and formats the response
- Fixed a bug where an AI provider call's result/error was silently dropped instead of being awaited, which meant every chat request would fail or could crash the server

Date: 2026-09-10
Developer: ecopello

- Added persistence for AI usage metrics (tokens, latency, cost, success/failure) recorded on every /ai/chat call
- Protected /ai/chat with authentication so usage can be tied to the requesting user
- Fixed a broken import path in the chat endpoint that was silently relying on baseUrl resolution

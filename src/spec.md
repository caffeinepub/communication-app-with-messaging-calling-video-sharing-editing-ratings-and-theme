# Specification

## Summary
**Goal:** Fix the broken “Chat” button flow when starting a 1:1 conversation from the Directory so it reliably opens (or creates) the correct chat thread.

**Planned changes:**
- Update the backend Directory/user search API to include each matched user’s principal along with username and displayName (while keeping the existing minimum search length rule).
- Update the frontend user search hook to map and return the backend-provided principal (removing the empty-principal workaround).
- Update the Directory page Chat button behavior to use the result principal to derive/reuse the conversationId, call the backend as needed, and navigate to `/chats/$conversationId`.
- Add clear English error feedback (toast/message) when chat initiation fails instead of silently failing; avoid navigating when principal is missing.

**User-visible outcome:** From the Directory search results, users can click “Chat” and reliably land in the correct 1:1 chat thread (existing or newly created), with a clear error message if something goes wrong.

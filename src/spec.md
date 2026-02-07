# Specification

## Summary
**Goal:** Fix the chat thread view to show only real, persisted messages with correct sender names, and make the message history scrollable with expected auto-scroll behavior.

**Planned changes:**
- Replace any hardcoded/mock chat thread messages with canister-backed message fetching; show an empty state when a conversation has no messages.
- Fix per-message sender labeling so incoming messages display the actual other participant’s username/handle (consistent with the thread header), and do not show a hardcoded name (e.g., “Alice”).
- Make the message list area scrollable and implement “auto-scroll only when near bottom” behavior for newly arriving messages.
- Add/extend backend canister storage and APIs to persist and list 1:1 conversation messages (send + list by conversation) with access restricted to conversation participants; update frontend send/fetch logic to use polling (no WebSockets).

**User-visible outcome:** Chat threads display only the real message history for that conversation (or an empty state if none), incoming messages show the correct sender name, and users can scroll through messages without being forced to the bottom unless they’re already near it.

import { Principal } from '@dfinity/principal';

/**
 * Derives the other participant's principal from a conversation ID.
 * Conversation IDs follow the pattern: principal1:principal2 (sorted)
 */
export function getOtherParticipantFromConversationId(
  conversationId: string,
  currentPrincipal: string
): string | null {
  const participants = conversationId.split(':');
  if (participants.length !== 2) {
    return null;
  }
  return participants.find((p) => p !== currentPrincipal) || null;
}

/**
 * Creates a conversation ID from two principals (sorted)
 */
export function createConversationId(principal1: string, principal2: string): string {
  const sorted = [principal1, principal2].sort();
  return `${sorted[0]}:${sorted[1]}`;
}

/**
 * Gets a safe display label for a conversation
 */
export function getConversationDisplayLabel(conversationId: string, fallback: string = 'Chat'): string {
  const participants = conversationId.split(':');
  if (participants.length !== 2) {
    return fallback;
  }
  
  // Return the first 8 characters of the first principal as fallback
  return participants[0].substring(0, 8) + '...';
}

/**
 * Validates if a string is a valid principal
 */
export function isValidPrincipal(text: string): boolean {
  try {
    Principal.fromText(text);
    return true;
  } catch {
    return false;
  }
}

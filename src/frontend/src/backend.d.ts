import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MessageReply {
    messageId: bigint;
    timestamp: bigint;
}
export type DisplayName = string;
export type ConversationId = string;
export interface CallLogEntry {
    id: bigint;
    duration: bigint;
    callType: CallType;
    toUser?: Username;
    notes: string;
    timestamp: bigint;
    fromUser?: Username;
}
export interface Message {
    messageId: bigint;
    text: string;
    sender: Principal;
    conversationId: ConversationId;
    timestamp: bigint;
}
export type Username = string;
export interface MessageRequest {
    text: string;
    sender: Principal;
    conversationId: ConversationId;
}
export interface UserProfile {
    username: Username;
    displayName: DisplayName;
}
export enum CallType {
    stream = "stream",
    audio = "audio",
    webcam = "webcam"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addConversation(conversationId: ConversationId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createUserProfile(username: string, displayName: string): Promise<void>;
    deleteCallEntry(callId: bigint): Promise<void>;
    deleteMessage(conversationId: ConversationId, messageId: bigint): Promise<void>;
    getCallHistory(): Promise<Array<CallLogEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserConversations(): Promise<Array<ConversationId>>;
    getUserProfile(principal: Principal): Promise<UserProfile | null>;
    hasConversation(conversationId: ConversationId): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listMessages(conversationId: ConversationId): Promise<Array<Message>>;
    recordCall(fromUser: Username | null, toUser: Username | null, callType: CallType, duration: bigint, notes: string): Promise<void>;
    removeConversation(conversationId: ConversationId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(searchText: string): Promise<Array<UserProfile>>;
    sendMessage(request: MessageRequest): Promise<MessageReply>;
    updateProfile(username: string | null, displayName: string | null): Promise<void>;
}

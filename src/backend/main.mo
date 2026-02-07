import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types for user data
  public type Username = Text;
  public type DisplayName = Text;
  public type ConversationId = Text;
  public type UserProfile = {
    username : Username;
    displayName : DisplayName;
  };

  public type DirectoryUserResult = {
    username : Username;
    displayName : DisplayName;
    principal : Principal;
  };

  // Types for call logs
  public type CallLogEntry = {
    id : Nat;
    timestamp : Int;
    fromUser : ?Username;
    toUser : ?Username;
    callType : CallType;
    duration : Nat;
    notes : Text;
  };

  public type CallType = {
    #audio;
    #webcam;
    #stream;
  };

  // Types for messages
  public type Message = {
    messageId : Nat;
    conversationId : ConversationId;
    sender : Principal;
    text : Text;
    timestamp : Int;
  };

  public type MessageRequest = {
    conversationId : ConversationId;
    sender : Principal;
    text : Text;
  };

  public type MessageReply = {
    messageId : Nat;
    timestamp : Int;
  };

  var nextCallLogId = 0;
  var nextMessageId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let userConversations = Map.empty<Principal, Set.Set<ConversationId>>();
  let userCallLogs = Map.empty<Principal, [CallLogEntry]>();
  let messages = Map.empty<ConversationId, [Message]>();

  // Required by frontend: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Required by frontend: Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Validate the profile data
    let cleanedUsername = cleanUsername(profile.username);
    validateUsername(cleanedUsername);
    validateDisplayName(profile.displayName);

    let validatedProfile = {
      username = cleanedUsername;
      displayName = profile.displayName;
    };

    userProfiles.add(caller, validatedProfile);
  };

  // Get any user's profile (public for chat discovery)
  public query ({ caller }) func getUserProfile(principal : Principal) : async ?UserProfile {
    userProfiles.get(principal);
  };

  // Profile search for Directory (includes principal)
  public query func searchDirectoryUsers(searchText : Text) : async [DirectoryUserResult] {
    if (searchText.size() < 3) {
      Runtime.trap("Search term must be at least 3 characters");
    };

    let results = userProfiles.toArray().filter(
      func((p, profile)) {
        profile.username.contains(#text(searchText)) or
        profile.displayName.contains(#text(searchText));
      }
    );

    results.map(
      func((p, profile)) {
        {
          username = profile.username;
          displayName = profile.displayName;
          principal = p;
        };
      }
    );
  };

  // Deprecated search (legacy, returns only usernames)
  public query func searchUsers(searchText : Text) : async [UserProfile] {
    if (searchText.size() < 3) {
      Runtime.trap("Search term must be at least 3 characters");
    };

    userProfiles.values().toArray().filter(
      func(profile) {
        profile.username.contains(#text(searchText)) or
        profile.displayName.contains(#text(searchText));
      }
    );
  };

  // Get caller's conversations
  public query ({ caller }) func getUserConversations() : async [ConversationId] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access conversations");
    };

    switch (userConversations.get(caller)) {
      case (?ids) { ids.toArray() };
      case (null) { [] };
    };
  };

  // Add a conversation to caller's list
  public shared ({ caller }) func addConversation(conversationId : ConversationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add conversations");
    };

    // Verify caller is a participant in this conversation
    if (not isParticipant(caller, conversationId)) {
      Runtime.trap("Unauthorized: You are not a participant in this conversation");
    };

    let updatedConversations = switch (userConversations.get(caller)) {
      case (?conversations) {
        conversations.add(conversationId);
        conversations;
      };
      case (null) { Set.fromIter([conversationId].values()) };
    };
    userConversations.add(caller, updatedConversations);
  };

  // Remove a conversation from caller's list
  public shared ({ caller }) func removeConversation(conversationId : ConversationId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove conversations");
    };

    switch (userConversations.get(caller)) {
      case (?conversations) {
        conversations.remove(conversationId);
        if (conversations.isEmpty()) {
          userConversations.remove(caller);
        } else {
          userConversations.add(caller, conversations);
        };
      };
      case (null) { Runtime.trap("No conversations to remove") };
    };
  };

  // Check if caller has a specific conversation
  public query ({ caller }) func hasConversation(conversationId : ConversationId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check conversations");
    };

    switch (userConversations.get(caller)) {
      case (?conversations) { conversations.contains(conversationId) };
      case (null) { false };
    };
  };

  // Create new user profile
  public shared ({ caller }) func createUserProfile(username : Text, displayName : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    let cleanedUsername = cleanUsername(username);
    validateUsername(cleanedUsername);
    validateDisplayName(displayName);

    switch (userProfiles.get(caller)) {
      case (?_) { Runtime.trap("Username already exists") };
      case (null) {
        let profile = {
          username = cleanedUsername;
          displayName;
        };
        userProfiles.add(caller, profile);
      };
    };
  };

  // Update caller's profile
  public shared ({ caller }) func updateProfile(username : ?Text, displayName : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let cleanedUsernameOpt = switch (username) {
      case (null) { null };
      case (?name) { ?cleanUsername(name) };
    };

    let updatedProfile = switch (userProfiles.get(caller)) {
      case (?existingProfile) {
        {
          username = switch (cleanedUsernameOpt) {
            case (null) { existingProfile.username };
            case (?u) {
              validateUsername(u);
              u;
            };
          };
          displayName = switch (displayName) {
            case (null) { existingProfile.displayName };
            case (?d) {
              validateDisplayName(d);
              d;
            };
          };
        };
      };
      case (null) { Runtime.trap("User profile not found") };
    };
    userProfiles.add(caller, updatedProfile);
  };

  // Helper functions for username validation
  func cleanUsername(username : Text) : Text {
    let cleansed = username.map(
      func(c) { if (c == ' ' or c == '_') { '_' : Char } else { c } }
    );
    if (cleansed.size() > 32) {
      let array = cleansed.toArray();
      Text.fromArray(array.sliceToArray(0, 32));
    } else {
      cleansed;
    };
  };

  func validateUsername(username : Text) {
    let usernameLower = username.toLower();
    if (usernameLower.size() < 3 or usernameLower.size() > 32) {
      Runtime.trap("Username must be between 3 and 32 characters");
    };
    if (usernameLower.startsWith(#text "icp_") or usernameLower.startsWith(#text "ic_") or usernameLower.endsWith(#text "_icp")) {
      Runtime.trap("Username cannot include 'icp' or 'ic' at start or end in any form");
    };
    assert userProfiles.values().all(
      func(profile) {
        profile.username.toLower() != username.toLower();
      }
    );
  };

  func validateDisplayName(displayName : Text) {
    if (displayName.size() < 1 or displayName.size() > 32) {
      Runtime.trap("Display name must be between 1 and 32 characters");
    };
    if (displayName.contains(#text("icp")) or displayName.contains(#text("ic"))) {
      Runtime.trap("Display name cannot contain 'icp' or 'ic'");
    };
  };

  // Record a call in the user's call history
  public shared ({ caller }) func recordCall(fromUser : ?Username, toUser : ?Username, callType : CallType, duration : Nat, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record calls");
    };

    let callEntry : CallLogEntry = {
      id = nextCallLogId;
      timestamp = Time.now();
      fromUser;
      toUser;
      callType;
      duration;
      notes;
    };
    nextCallLogId += 1;

    let existingLog = switch (userCallLogs.get(caller)) {
      case (?entries) { entries };
      case (null) { [] };
    };

    userCallLogs.add(caller, existingLog.concat([callEntry]));
  };

  // Retrieve caller's call history
  public query ({ caller }) func getCallHistory() : async [CallLogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access call history");
    };

    switch (userCallLogs.get(caller)) {
      case (?entries) { entries };
      case (null) { [] };
    };
  };

  // Delete a specific call log entry
  public shared ({ caller }) func deleteCallEntry(callId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete call entries");
    };

    let updatedLog = switch (userCallLogs.get(caller)) {
      case (?entries) {
        let filtered = entries.filter(func(entry) { entry.id != callId });
        if (filtered.size() == entries.size()) {
          Runtime.trap("Call entry not found");
        };
        filtered;
      };
      case (null) { Runtime.trap("No call history found for user") };
    };

    userCallLogs.add(caller, updatedLog);
  };

  // Helper function to check if a principal is a participant in a conversation
  func isParticipant(principal : Principal, conversationId : ConversationId) : Bool {
    let principalText = principal.toText();
    conversationId.contains(#text(principalText));
  };

  // Helper function to extract participants from conversationId
  func getParticipants(conversationId : ConversationId) : [Principal] {
    // ConversationId format: "principal1:principal2" (sorted)
    let parts = conversationId.split(#char ':');
    let partsArray = parts.toArray();
    if (partsArray.size() != 2) {
      return [];
    };
    let p1 = Principal.fromText(partsArray[0]);
    let p2 = Principal.fromText(partsArray[1]);
    [p1, p2];
  };

  // Message functionality
  public shared ({ caller }) func sendMessage(request : MessageRequest) : async MessageReply {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    // Verify caller is a participant in this conversation
    if (not isParticipant(caller, request.conversationId)) {
      Runtime.trap("Unauthorized: You are not a participant in this conversation");
    };

    // Verify the sender in the request matches the caller
    if (request.sender != caller) {
      Runtime.trap("Unauthorized: Cannot send messages on behalf of another user");
    };

    let message : Message = {
      messageId = nextMessageId;
      conversationId = request.conversationId;
      sender = caller;
      text = request.text;
      timestamp = Time.now();
    };
    nextMessageId += 1;

    let existingMessages = switch (messages.get(request.conversationId)) {
      case (?msgList) { msgList };
      case (null) { [] };
    };

    messages.add(request.conversationId, existingMessages.concat([message]));

    {
      messageId = message.messageId;
      timestamp = message.timestamp;
    };
  };

  public query ({ caller }) func listMessages(conversationId : ConversationId) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access messages");
    };

    // Verify caller is a participant in this conversation
    if (not isParticipant(caller, conversationId)) {
      Runtime.trap("Unauthorized: You are not a participant in this conversation");
    };

    switch (messages.get(conversationId)) {
      case (?msgs) { msgs };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func deleteMessage(conversationId : ConversationId, messageId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete messages");
    };

    // Verify caller is a participant in this conversation
    if (not isParticipant(caller, conversationId)) {
      Runtime.trap("Unauthorized: You are not a participant in this conversation");
    };

    switch (messages.get(conversationId)) {
      case (?existingMessages) {
        // Find the message to verify ownership
        let messageToDelete = existingMessages.filter(func(msg) { msg.messageId == messageId });
        if (messageToDelete.size() == 0) {
          Runtime.trap("Message not found");
        };

        // Verify caller is the sender of the message or is an admin
        if (messageToDelete[0].sender != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own messages");
        };

        let filteredMessages = existingMessages.filter(func(msg) { msg.messageId != messageId });
        messages.add(conversationId, filteredMessages);
      };
      case (null) { Runtime.trap("Conversation not found") };
    };
  };
};


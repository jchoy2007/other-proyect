import { Business, Conversation, ConversationMessage } from "../types.js";

// In-memory store - replace with database in production (Supabase, MongoDB, etc.)
class BusinessStore {
  private businesses: Map<string, Business> = new Map();
  private conversations: Map<string, Conversation> = new Map();

  // === BUSINESS CRUD ===

  create(business: Business): Business {
    this.businesses.set(business.id, business);
    return business;
  }

  get(id: string): Business | undefined {
    return this.businesses.get(id);
  }

  getByPhoneId(phoneNumberId: string): Business | undefined {
    for (const business of this.businesses.values()) {
      if (business.phoneNumberId === phoneNumberId) return business;
    }
    return undefined;
  }

  getAll(): Business[] {
    return Array.from(this.businesses.values());
  }

  update(id: string, data: Partial<Business>): Business | undefined {
    const existing = this.businesses.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data, id: existing.id };
    this.businesses.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.businesses.delete(id);
  }

  // === CONVERSATIONS ===

  private conversationKey(businessId: string, customerPhone: string): string {
    return `${businessId}:${customerPhone}`;
  }

  getConversation(
    businessId: string,
    customerPhone: string
  ): Conversation | undefined {
    return this.conversations.get(
      this.conversationKey(businessId, customerPhone)
    );
  }

  getOrCreateConversation(
    businessId: string,
    customerPhone: string
  ): Conversation {
    const key = this.conversationKey(businessId, customerPhone);
    let conversation = this.conversations.get(key);

    if (!conversation) {
      conversation = {
        businessId,
        customerPhone,
        messages: [],
        status: "active",
        startedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      this.conversations.set(key, conversation);
    }

    return conversation;
  }

  addMessage(
    businessId: string,
    customerPhone: string,
    message: ConversationMessage
  ): void {
    const conversation = this.getOrCreateConversation(
      businessId,
      customerPhone
    );
    conversation.messages.push(message);
    conversation.lastMessageAt = message.timestamp;
  }

  getBusinessConversations(businessId: string): Conversation[] {
    const result: Conversation[] = [];
    for (const conv of this.conversations.values()) {
      if (conv.businessId === businessId) result.push(conv);
    }
    return result;
  }

  getStats(businessId: string) {
    const conversations = this.getBusinessConversations(businessId);
    return {
      totalConversations: conversations.length,
      activeConversations: conversations.filter((c) => c.status === "active")
        .length,
      messagesProcessed: conversations.reduce(
        (sum, c) => sum + c.messages.length,
        0
      ),
    };
  }
}

export const businessStore = new BusinessStore();

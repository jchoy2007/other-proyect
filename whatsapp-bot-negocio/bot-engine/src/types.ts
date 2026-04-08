export interface Business {
  id: string;
  name: string;
  phoneNumberId: string;
  industry: string;
  systemPrompt: string;
  menuItems?: MenuItem[];
  schedule?: Schedule;
  faq?: FAQItem[];
  settings: BotSettings;
  createdAt: string;
}

export interface MenuItem {
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

export interface Schedule {
  timezone: string;
  hours: {
    [day: string]: { open: string; close: string } | null;
  };
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface BotSettings {
  greeting: string;
  awayMessage: string;
  transferKeyword: string;
  language: string;
  maxConversationHistory: number;
}

export interface Conversation {
  businessId: string;
  customerPhone: string;
  messages: ConversationMessage[];
  status: "active" | "transferred" | "closed";
  startedAt: string;
  lastMessageAt: string;
}

export interface ConversationMessage {
  role: "customer" | "bot" | "agent";
  content: string;
  timestamp: string;
}

export interface WhatsAppWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  text?: { body: string };
  interactive?: {
    type: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string };
  };
}

export interface Stats {
  totalConversations: number;
  activeConversations: number;
  messagesProcessed: number;
  avgResponseTime: number;
}

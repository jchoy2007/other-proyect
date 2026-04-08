import Anthropic from "@anthropic-ai/sdk";
import { Business, ConversationMessage } from "../types.js";

const anthropic = new Anthropic();

function buildSystemPrompt(business: Business): string {
  let prompt = `Eres el asistente virtual de "${business.name}". Tu trabajo es atender a los clientes por WhatsApp de forma amigable, profesional y eficiente.

REGLAS IMPORTANTES:
- Responde SIEMPRE en español
- Se breve y directo (maximo 2-3 parrafos por mensaje)
- Usa un tono amigable pero profesional
- Si no sabes algo, di que vas a consultar con el equipo
- Si el cliente pide hablar con una persona, responde EXACTAMENTE: "[TRANSFERIR]"
- Nunca inventes informacion que no tengas
- Usa emojis con moderacion para ser amigable

INFORMACION DEL NEGOCIO:
${business.systemPrompt}
`;

  if (business.menuItems && business.menuItems.length > 0) {
    prompt += "\n\nMENU/CATALOGO:\n";
    for (const item of business.menuItems) {
      if (item.available) {
        prompt += `- ${item.name} (${item.category}): $${item.price} - ${item.description}\n`;
      }
    }
  }

  if (business.faq && business.faq.length > 0) {
    prompt += "\n\nPREGUNTAS FRECUENTES:\n";
    for (const faq of business.faq) {
      prompt += `P: ${faq.question}\nR: ${faq.answer}\n\n`;
    }
  }

  if (business.schedule) {
    prompt += "\n\nHORARIO:\n";
    for (const [day, hours] of Object.entries(business.schedule.hours)) {
      if (hours) {
        prompt += `${day}: ${hours.open} - ${hours.close}\n`;
      } else {
        prompt += `${day}: Cerrado\n`;
      }
    }
  }

  return prompt;
}

export async function generateResponse(
  business: Business,
  conversationHistory: ConversationMessage[],
  customerMessage: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt(business);

  const messages: Anthropic.MessageParam[] = [];

  // Add conversation history (last N messages for context)
  const maxHistory = business.settings.maxConversationHistory || 20;
  const recentMessages = conversationHistory.slice(-maxHistory);

  for (const msg of recentMessages) {
    messages.push({
      role: msg.role === "customer" ? "user" : "assistant",
      content: msg.content,
    });
  }

  // Add current customer message
  messages.push({ role: "user", content: customerMessage });

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock?.text || "Lo siento, no pude procesar tu mensaje. Un momento por favor.";
  } catch (error) {
    console.error("AI response error:", error);
    return "Disculpa, estoy teniendo un problema tecnico. Por favor intenta de nuevo en unos segundos.";
  }
}

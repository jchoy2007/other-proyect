import { Router, Request, Response } from "express";
import { businessStore } from "../store/businesses.js";
import { generateResponse } from "../services/ai.js";
import { sendWhatsAppMessage } from "../services/whatsapp.js";
import { WhatsAppWebhookMessage } from "../types.js";

export const webhookRouter = Router();

// Verification endpoint (Meta verifies this when you set up the webhook)
webhookRouter.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages from WhatsApp
webhookRouter.post("/", async (req: Request, res: Response) => {
  // Always respond 200 quickly to avoid Meta retries
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== "whatsapp_business_account") return;

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== "messages") continue;

        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;
        const messages: WhatsAppWebhookMessage[] = value.messages || [];

        if (!phoneNumberId || messages.length === 0) continue;

        // Find which business this phone number belongs to
        const business = businessStore.getByPhoneId(phoneNumberId);
        if (!business) {
          console.log(
            `No business found for phone ID: ${phoneNumberId}`
          );
          continue;
        }

        for (const message of messages) {
          await handleIncomingMessage(business.id, phoneNumberId, message);
        }
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
  }
});

async function handleIncomingMessage(
  businessId: string,
  phoneNumberId: string,
  message: WhatsAppWebhookMessage
) {
  const business = businessStore.get(businessId);
  if (!business) return;

  // Extract the text content from the message
  let customerText = "";
  if (message.type === "text" && message.text) {
    customerText = message.text.body;
  } else if (message.type === "interactive" && message.interactive) {
    customerText =
      message.interactive.button_reply?.title ||
      message.interactive.list_reply?.title ||
      "";
  } else {
    // For unsupported message types (audio, image, etc.)
    customerText =
      "[El cliente envio un mensaje de tipo: " + message.type + "]";
  }

  if (!customerText) return;

  const customerPhone = message.from;
  const now = new Date().toISOString();

  // Store customer message
  businessStore.addMessage(businessId, customerPhone, {
    role: "customer",
    content: customerText,
    timestamp: now,
  });

  // Get conversation history
  const conversation = businessStore.getOrCreateConversation(
    businessId,
    customerPhone
  );

  // Check if conversation is transferred to human
  if (conversation.status === "transferred") {
    console.log(
      `Conversation with ${customerPhone} is transferred - skipping bot response`
    );
    return;
  }

  // Generate AI response
  const aiResponse = await generateResponse(
    business,
    conversation.messages,
    customerText
  );

  // Check if AI wants to transfer to human
  if (aiResponse.includes("[TRANSFERIR]")) {
    conversation.status = "transferred";
    const transferMsg =
      "Te estoy conectando con una persona de nuestro equipo. En un momento te atendera. Gracias por tu paciencia.";

    await sendWhatsAppMessage(phoneNumberId, customerPhone, transferMsg);

    businessStore.addMessage(businessId, customerPhone, {
      role: "bot",
      content: transferMsg,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send notification to business owner (email, push, etc.)
    console.log(
      `TRANSFER REQUESTED: Business ${businessId}, Customer ${customerPhone}`
    );
    return;
  }

  // Send AI response via WhatsApp
  const sent = await sendWhatsAppMessage(
    phoneNumberId,
    customerPhone,
    aiResponse
  );

  if (sent) {
    businessStore.addMessage(businessId, customerPhone, {
      role: "bot",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });
  }

  console.log(
    `[${business.name}] ${customerPhone}: ${customerText} -> ${aiResponse.substring(0, 100)}...`
  );
}

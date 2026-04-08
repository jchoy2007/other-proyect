const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage(
  phoneNumberId: string,
  to: string,
  message: string
): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) {
    console.error("WHATSAPP_TOKEN not configured");
    return false;
  }

  try {
    const response = await fetch(
      `${GRAPH_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("WhatsApp API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("WhatsApp send error:", error);
    return false;
  }
}

export async function sendWhatsAppInteractiveButtons(
  phoneNumberId: string,
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN;
  if (!token) return false;

  try {
    const response = await fetch(
      `${GRAPH_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: bodyText },
            action: {
              buttons: buttons.map((btn) => ({
                type: "reply",
                reply: { id: btn.id, title: btn.title },
              })),
            },
          },
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("WhatsApp interactive send error:", error);
    return false;
  }
}

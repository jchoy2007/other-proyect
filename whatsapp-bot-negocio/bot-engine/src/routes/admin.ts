import { Router, Request, Response } from "express";
import { businessStore } from "../store/businesses.js";
import { Business } from "../types.js";
import crypto from "crypto";

export const adminRouter = Router();

// Simple auth middleware
function requireAuth(req: Request, res: Response, next: () => void) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== process.env.ADMIN_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

adminRouter.use(requireAuth);

// List all businesses
adminRouter.get("/businesses", (_req: Request, res: Response) => {
  res.json(businessStore.getAll());
});

// Get single business
adminRouter.get("/businesses/:id", (req: Request, res: Response) => {
  const business = businessStore.get(req.params.id);
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json(business);
});

// Create business
adminRouter.post("/businesses", (req: Request, res: Response) => {
  const {
    name,
    phoneNumberId,
    industry,
    systemPrompt,
    menuItems,
    schedule,
    faq,
    settings,
  } = req.body;

  if (!name || !phoneNumberId || !industry) {
    res.status(400).json({ error: "name, phoneNumberId, and industry are required" });
    return;
  }

  const business: Business = {
    id: crypto.randomUUID(),
    name,
    phoneNumberId,
    industry,
    systemPrompt: systemPrompt || `Somos ${name}, un negocio de ${industry}.`,
    menuItems: menuItems || [],
    schedule: schedule || undefined,
    faq: faq || [],
    settings: settings || {
      greeting: `Hola! Bienvenido a ${name}. En que te puedo ayudar?`,
      awayMessage:
        "En este momento no estamos disponibles. Te responderemos lo antes posible.",
      transferKeyword: "agente",
      language: "es",
      maxConversationHistory: 20,
    },
    createdAt: new Date().toISOString(),
  };

  businessStore.create(business);
  res.status(201).json(business);
});

// Update business
adminRouter.put("/businesses/:id", (req: Request, res: Response) => {
  const updated = businessStore.update(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json(updated);
});

// Delete business
adminRouter.delete("/businesses/:id", (req: Request, res: Response) => {
  const deleted = businessStore.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Business not found" });
    return;
  }
  res.json({ success: true });
});

// Get business conversations
adminRouter.get(
  "/businesses/:id/conversations",
  (req: Request, res: Response) => {
    const conversations = businessStore.getBusinessConversations(
      req.params.id
    );
    res.json(conversations);
  }
);

// Get business stats
adminRouter.get("/businesses/:id/stats", (req: Request, res: Response) => {
  const stats = businessStore.getStats(req.params.id);
  res.json(stats);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { webhookRouter } from "./routes/webhook.js";
import { adminRouter } from "./routes/admin.js";
import { businessStore } from "./store/businesses.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "BotVentas Engine",
    businesses: businessStore.getAll().length,
  });
});

// WhatsApp webhook (receives messages from Meta)
app.use("/webhook", webhookRouter);

// Admin API (manage businesses and bot configs)
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`BotVentas Engine running on port ${PORT}`);
});

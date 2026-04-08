import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BotVentas - Bot de WhatsApp con IA para tu Negocio",
  description:
    "Automatiza tu atencion al cliente con un bot de WhatsApp inteligente. Responde 24/7, agenda citas, toma pedidos y aumenta tus ventas mientras duermes.",
  keywords:
    "bot whatsapp, chatbot negocio, automatizacion whatsapp, bot ventas, atencion al cliente automatizada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

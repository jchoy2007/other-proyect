import React from "react";
import { Red } from "./config";

/** Iconos simplificados de redes sociales (trazos blancos). */
export const IconoRed: React.FC<{ red: Red; size: number; color?: string }> = ({
  red,
  size,
  color = "#fff",
}) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" as const };
  const st = { stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (red) {
    case "instagram":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="5" {...st} />
          <circle cx="12" cy="12" r="4.2" {...st} />
          <circle cx="17.3" cy="6.7" r="1.1" fill={color} />
        </svg>
      );
    case "facebook":
      return (
        <svg {...p}>
          <path d="M14 8h2.5V4.5H14c-2.2 0-3.8 1.8-3.8 4V11H8v3.4h2.2V21h3.5v-6.6h2.6l.5-3.4h-3.1V8.9c0-.5.3-.9.8-.9z" fill={color} />
        </svg>
      );
    case "tiktok":
      return (
        <svg {...p}>
          <path
            d="M14.5 3c.3 2.4 1.9 4 4.5 4.2v3.3c-1.6 0-3.1-.5-4.4-1.4v6.2c0 3.3-2.6 5.7-5.6 5.7S3.5 18.6 3.5 15.4c0-3.4 3-6 6.5-5.5v3.4c-1.5-.4-3.1.7-3.1 2.2 0 1.3 1 2.3 2.3 2.3 1.4 0 2.3-1 2.3-2.5V3h3z"
            fill={color}
          />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...p}>
          <path d="M4 20l1.2-4A8.5 8.5 0 1 1 8.4 19z" {...st} />
          <path
            d="M9 8.3c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .6.6 1 1.4 1.8 2.4 2.3.2.1.4.1.6-.1l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.2.1.4.3.4.5v.5c0 .3-.1.6-.4.8-.6.5-1.5.7-2.3.5-2.5-.7-4.6-2.7-5.4-5.2-.3-.8-.1-1.6.4-2.2z"
            fill={color}
          />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="3" {...st} />
          <path d="M8 10.5V17M8 7.5v.01M11.5 17v-6.5M11.5 13c0-1.6 1-2.6 2.4-2.6 1.4 0 2.1 1 2.1 2.6V17" {...st} />
        </svg>
      );
    case "youtube":
      return (
        <svg {...p}>
          <rect x="2.5" y="5.5" width="19" height="13" rx="4" {...st} />
          <path d="M10.3 9.3v5.4l4.6-2.7z" fill={color} />
        </svg>
      );
  }
};

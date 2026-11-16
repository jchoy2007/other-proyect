import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { config, dirDia } from '../config.js';
import type { Guion, Tendencia } from '../tipos.js';
import { escribirJson, leerJson, log, slug } from '../lib/util.js';

const EscenaSchema = z.object({
  voz: z.string(),
  textoPantalla: z.string(),
  claveVisual: z.string(),
});

const GuionSchema = z.object({
  titulo: z.string(),
  descripcion: z.string(),
  hashtags: z.array(z.string()),
  gancho: z.string(),
  escenas: z.array(EscenaSchema),
  basadoEn: z.array(z.string()),
  fuentes: z.array(z.string()),
});

const LoteSchema = z.object({ guiones: z.array(GuionSchema) });

function instrucciones(): string {
  return `Eres el guionista de un canal de YouTube y TikTok en ${config.idioma === 'es' ? 'español neutro latino' : 'inglés'} dedicado a ${config.tema}.
Tu trabajo: convertir lo que la gente está buscando HOY en videos que se vean completos y se compartan.

Reglas duras:
- Antes de escribir, usa la búsqueda web para verificar cada dato (fechas, precios, plataformas, nombres, mecánicas). No inventes nada. Si algo no está confirmado, dilo como rumor y cita la fuente.
- Cada video tiene un gancho en los primeros 3 segundos que responde a la búsqueda exacta de la gente.
- Nada de spoilers de historia ni finales. Nada de contenido filtrado (leaks). Nada de violencia gráfica en los primeros 7 segundos del guion (política de monetización de YouTube).
- Voz natural, frases cortas, como un amigo que sabe mucho. Sin relleno ni "en este video veremos".
- "textoPantalla": máximo 6 palabras por escena. "claveVisual": 2-4 palabras en inglés simples (ej. "trailer beach", "car chase", "map leonida", "vice city night") que sirvan para buscar el clip de fondo.
- short: 8-12 escenas, voz total de 45-58 segundos. largo: 25-40 escenas, voz total de 6-9 minutos, con estructura (promesa, desarrollo con 3-5 puntos, cierre con pregunta para comentarios).
- Títulos: específicos, con la búsqueda de la gente dentro, sin mayúsculas gritadas ni clickbait falso. Descripción: 2-4 frases + fuentes.
- Hashtags: 4-8, el primero #${config.tema.replace(/\s+/g, '')}; en shorts incluye #Shorts.
- Cada guion distinto en ángulo: no repitas el mismo tema en dos videos del día.`;
}

export async function generarGuiones(tendencias: Tendencia[], formatos: Array<'short' | 'largo'>): Promise<Guion[]> {
  const client = new Anthropic();
  const lista = tendencias.slice(0, 25).map((t, i) => `${i + 1}. "${t.consulta}" (${t.fuente}${t.pais ? ', ' + t.pais : ''}, peso ${t.puntuacion.toFixed(1)})`).join('\n');
  const pedido = formatos.map((f, i) => `Video ${i + 1}: formato ${f}`).join('\n');
  const fecha = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  log('guiones', `Pidiendo ${formatos.length} guiones a ${config.modelo}…`);
  const stream = client.beta.messages.stream({
    model: config.modelo,
    max_tokens: 64000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: [{ type: 'text', text: instrucciones(), cache_control: { type: 'ephemeral' } }],
    tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 12 }],
    messages: [
      {
        role: 'user',
        content: `Hoy es ${fecha}. Esto es lo que la gente está buscando sobre ${config.tema} ahora mismo, ordenado por peso:\n${lista}\n\nProduce exactamente estos videos:\n${pedido}\n\nVerifica los datos con búsqueda web antes de escribir. Devuelve el resultado en el formato JSON pedido.`,
      },
    ],
    output_config: { format: zodOutputFormat(LoteSchema) },
  });
  const msg = await stream.finalMessage();
  if (msg.stop_reason === 'refusal') throw new Error('El modelo rechazó la petición (stop_reason: refusal).');
  if (msg.stop_reason === 'max_tokens') throw new Error('Respuesta truncada por max_tokens.');
  const texto = msg.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
  const lote = LoteSchema.parse(JSON.parse(texto));
  const usadas = msg.usage;
  log('guiones', `Tokens: entrada ${usadas.input_tokens}, salida ${usadas.output_tokens}, caché leída ${usadas.cache_read_input_tokens ?? 0}`);

  return lote.guiones.map((g, i) => ({
    ...g,
    id: `${new Date().toISOString().slice(0, 10)}-${i + 1}-${slug(g.titulo)}`,
    formato: formatos[i] ?? 'short',
  }));
}

export async function pasoGuiones(dir = dirDia()): Promise<Guion[]> {
  const { tendencias } = await leerJson<{ tendencias: Tendencia[] }>(path.join(dir, 'tendencias.json'));
  const formatos = config.formatos.slice(0, config.videosPorDia);
  const guiones = await generarGuiones(tendencias, formatos);
  await escribirJson(path.join(dir, 'guiones.json'), guiones);
  for (const g of guiones) log('guiones', `${g.formato.padEnd(5)} ${g.escenas.length} escenas · ${g.titulo}`);
  return guiones;
}

if (process.argv[1] && process.argv[1].endsWith('guiones.ts')) {
  pasoGuiones().catch((e) => { console.error(e); process.exit(1); });
}

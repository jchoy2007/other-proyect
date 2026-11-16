import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

export async function leerJson<T>(ruta: string): Promise<T> {
  return JSON.parse(await fs.readFile(ruta, 'utf8')) as T;
}

export async function escribirJson(ruta: string, datos: unknown): Promise<void> {
  await fs.mkdir(path.dirname(ruta), { recursive: true });
  await fs.writeFile(ruta, JSON.stringify(datos, null, 2), 'utf8');
}

export async function existe(ruta: string): Promise<boolean> {
  try { await fs.access(ruta); return true; } catch { return false; }
}

export function log(paso: string, msg: string): void {
  console.log(`[${new Date().toISOString().slice(11, 19)}] [${paso}] ${msg}`);
}

/** Ejecuta un comando y devuelve stdout; lanza error con stderr si falla */
export function ejecutar(cmd: string, args: string[], opciones: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): Promise<string> {
  return new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: opciones.cwd, env: { ...process.env, ...opciones.env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('error', rej);
    p.on('close', (code) => (code === 0 ? res(out) : rej(new Error(`${cmd} ${args.slice(0, 3).join(' ')}… salió con ${code}\n${err.slice(-2000)}`))));
  });
}

export function slug(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

export async function duracionMedia(ruta: string): Promise<number> {
  const out = await ejecutar('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ruta]);
  return parseFloat(out.trim()) || 0;
}

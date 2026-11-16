// Capa de acceso al mando por WebHID. Protocolo de calibración portado de
// dualshock-tools (https://github.com/dualshock-tools/dualshock-tools.github.io, licencia MIT, (c) 2024 the_al).

export const VENDOR_SONY = 0x054c;
export const MODELOS = {
  0x05c4: { nombre: 'DualShock 4 (v1)', familia: 'ds4' },
  0x09cc: { nombre: 'DualShock 4 (v2)', familia: 'ds4' },
  0x0ce6: { nombre: 'DualSense', familia: 'ds5' },
  0x0df2: { nombre: 'DualSense Edge', familia: 'ds5' },
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function hex32(n) {
  return (n >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

async function conTimeout(promesa, ms, etiqueta) {
  if (!ms) return promesa;
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error(`${etiqueta}: sin respuesta en ${ms} ms`)), ms); });
  try { return await Promise.race([promesa, timeout]); } finally { clearTimeout(t); }
}

/** Clase base: envío/recepción de feature reports con el tamaño que declara el descriptor HID */
export class Mando {
  constructor(device) {
    this.device = device;
    this.familia = MODELOS[device.productId]?.familia ?? 'desconocida';
    this.nombre = MODELOS[device.productId]?.nombre ?? `Dispositivo ${device.productId.toString(16)}`;
    this.conexion = 'desconocida'; // 'usb' | 'bluetooth'
    this.esClon = false;
  }

  _reservar(reportId, datos) {
    const fr = this.device.collections?.[0]?.featureReports ?? [];
    const item = fr.find((e) => e.reportId === reportId)?.items?.[0];
    const len = item?.reportCount ?? datos.length;
    const out = new Uint8Array(Math.max(len, datos.length));
    out.set(datos.slice(0, out.length));
    return out;
  }

  async enviar(reportId, datos) {
    const buf = Array.isArray(datos) ? this._reservar(reportId, datos) : datos;
    try {
      await this.device.sendFeatureReport(reportId, buf);
    } catch (e) {
      throw new Error(`sendFeatureReport(0x${reportId.toString(16)}): ${e.message || e}`);
    }
  }

  /** Devuelve un DataView cuyo byte 0 es el ID del informe (así lo entrega WebHID) */
  async recibir(reportId, timeoutMs = 0) {
    return conTimeout(this.device.receiveFeatureReport(reportId), timeoutMs, `receiveFeatureReport(0x${reportId.toString(16)})`);
  }

  async cerrar() {
    if (this.device?.opened) await this.device.close();
  }

  /**
   * Extrae los ejes de un informe de entrada. Devuelve valores 0-255 o null si el informe no es de ejes.
   * USB: informe 0x01, ejes en bytes 0-3. Bluetooth: DS4 informe 0x11 (ejes desde byte 2), DS5 informe 0x31 (desde byte 1).
   */
  ejes(reportId, data) {
    let o = -1;
    if (reportId === 0x01) o = 0;
    else if (this.familia === 'ds4' && reportId === 0x11) o = 2;
    else if (this.familia === 'ds5' && reportId === 0x31) o = 1;
    if (o < 0 || data.byteLength < o + 4) return null;
    return { lx: data.getUint8(o), ly: data.getUint8(o + 1), rx: data.getUint8(o + 2), ry: data.getUint8(o + 3) };
  }

  /** Llamar con el primer informe de entrada: 63 bytes = USB, 77 = Bluetooth */
  detectarConexion(reportId, data) {
    if (reportId === 0x01 && data.byteLength === 63) this.conexion = 'usb';
    else if (reportId === 0x11 || reportId === 0x31 || data.byteLength >= 77) this.conexion = 'bluetooth';
    else this.conexion = 'usb';
    return this.conexion;
  }
}

/** DualShock 4: informes 0x90 (comando) / 0x91, 0x92 (estado), 0xa0 (NVS), 0xa3 (info) */
export class DualShock4 extends Mando {
  async info() {
    const v = await this.recibir(0xa3);
    const ok = v.getUint8(0) === 0xa3 && v.byteLength >= 49;
    if (!ok) this.esClon = true;
    let fecha = '';
    if (ok) {
      const txt = (a, b) => new TextDecoder().decode(v.buffer.slice(a, b)).replace(/\0/g, '').trim();
      fecha = `${txt(1, 0x10)} ${txt(0x10, 0x20)}`;
    }
    if (!this.esClon) {
      try { await this.recibir(0x81, 1000); } catch { this.esClon = true; }
    }
    return { fecha, hw: ok ? v.getUint16(0x21, true).toString(16) : '', clon: this.esClon };
  }

  async _estado(esperado1, esperado2, paso) {
    const d1 = (await this.recibir(0x91)).getUint32(0, false);
    const d2 = (await this.recibir(0x92)).getUint32(0, false);
    if (d1 !== esperado1 || d2 !== esperado2) throw new Error(`${paso}: respuesta inesperada ${hex32(d1)} ${hex32(d2)}`);
  }

  async centroInicio() { await this.enviar(0x90, [1, 1, 1]); await sleep(200); await this._estado(0x91010101, 0x920101ff, 'inicio centro'); }
  async centroMuestra() { await this.enviar(0x90, [3, 1, 1]); await sleep(200); await this._estado(0x91010101, 0x920101ff, 'muestra centro'); }
  async centroFin() { await this.enviar(0x90, [2, 1, 1]); await sleep(200); await this._estado(0x91010102, 0x92010101, 'fin centro'); }
  async rangoInicio() { await this.enviar(0x90, [1, 1, 2]); await sleep(200); await this._estado(0x91010201, 0x920102ff, 'inicio rango'); }
  async rangoFin() { await this.enviar(0x90, [2, 1, 2]); await sleep(200); await this._estado(0x91010202, 0x92010201, 'fin rango'); }

  /** Guarda de forma permanente lo calibrado (desbloquea y vuelve a bloquear la memoria no volátil) */
  async guardar() {
    await this.enviar(0xa0, [10, 2, 0x3e, 0x71, 0x7f, 0x89]);
    await this.enviar(0xa0, [10, 1, 0]);
  }
  /** Descarta la calibración temporal reiniciando el mando */
  async reiniciar() { try { await this.enviar(0xa0, [4, 1, 0]); } catch { /* el mando se desconecta al reiniciar */ } }

  async estadoNvs() {
    try {
      await this.enviar(0x08, [0xff, 0, 12]);
      const d = await this.recibir(0x11);
      const r = d.getUint8(1);
      return r === 1 ? 'bloqueada (cambios temporales)' : r === 0 ? 'desbloqueada (cambios permanentes)' : 'desconocido';
    } catch { return 'desconocido'; }
  }
}

/** DualSense / DualSense Edge: informes 0x80/0x81 (NVS e info), 0x82/0x83 (calibración), 0x20 (info) */
export class DualSense extends Mando {
  async info() {
    const v = await this.recibir(0x20);
    const ok = v.getUint8(0) === 0x20 && v.byteLength === 64;
    if (!ok) this.esClon = true;
    const txt = (a, b) => new TextDecoder().decode(v.buffer.slice(a, b)).replace(/\0/g, '').trim();
    return { fecha: ok ? `${txt(1, 12)} ${txt(12, 20)}` : '', hw: '', clon: this.esClon };
  }

  async _estado(esperado, paso) {
    const d = (await this.recibir(0x83)).getUint32(0, false);
    if (d !== esperado) throw new Error(`${paso}: respuesta inesperada ${hex32(d)}`);
  }

  async centroInicio() { await this.enviar(0x82, [1, 1, 1]); await this._estado(0x83010101, 'inicio centro'); }
  async centroMuestra() { await this.enviar(0x82, [3, 1, 1]); await this._estado(0x83010101, 'muestra centro'); }
  async centroFin() { await this.enviar(0x82, [2, 1, 1]); await this._estado(0x83010102, 'fin centro'); }
  async rangoInicio() { await this.enviar(0x82, [1, 1, 2]); await this._estado(0x83010201, 'inicio rango'); }
  async rangoFin() { await this.enviar(0x82, [2, 1, 2]); await this._estado(0x83010202, 'fin rango'); }

  async guardar() {
    await this.enviar(0x80, [3, 2, 101, 50, 64, 12]);
    await this.recibir(0x81);
    await this.enviar(0x80, [3, 1]);
    await this.recibir(0x81);
  }
  async reiniciar() { try { await this.enviar(0x80, [1, 1]); } catch { /* se desconecta */ } }

  async estadoNvs() {
    try {
      await this.enviar(0x80, [3, 3]);
      const d = await this.recibir(0x81);
      const r = d.getUint32(1, false);
      if (r === 0x15010100) return 'pendiente de reinicio';
      if (r === 0x03030201) return 'bloqueada (cambios temporales)';
      if (r === 0x03030200) return 'desbloqueada (cambios permanentes)';
      return 'desconocido';
    } catch { return 'desconocido'; }
  }
}

export function crearMando(device) {
  const fam = MODELOS[device.productId]?.familia;
  if (fam === 'ds4') return new DualShock4(device);
  if (fam === 'ds5') return new DualSense(device);
  throw new Error(`Mando no soportado (productId 0x${device.productId.toString(16)})`);
}

export function filtrosHid() {
  return Object.keys(MODELOS).map((pid) => ({ vendorId: VENDOR_SONY, productId: Number(pid) }));
}

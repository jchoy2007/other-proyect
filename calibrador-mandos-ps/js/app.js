import { crearMando, filtrosHid, sleep, MODELOS } from './hid.js';

const $ = (s) => document.querySelector(s);
const estado = { mando: null, ejes: { lx: 128, ly: 128, rx: 128, ry: 128 }, muestras: [], midiendo: false, cobertura: { l: new Set(), r: new Set() }, calibrando: false, cambiosSinGuardar: false };

const norm = (v) => (v - 127.5) / 127.5;

function log(msg, tipo = 'info') {
  const el = document.createElement('div');
  el.className = `log ${tipo}`;
  el.textContent = `${new Date().toLocaleTimeString()}  ${msg}`;
  $('#registro').prepend(el);
}

function mostrar(id, visible) { $(id).classList.toggle('oculto', !visible); }

// ---------- Conexión ----------
async function conectar() {
  if (!navigator.hid) {
    log('Este navegador no tiene WebHID. Usa Chrome, Edge u Opera en PC/Mac/Chromebook (en Android llegará con Chrome 157).', 'error');
    return;
  }
  try {
    const [device] = await navigator.hid.requestDevice({ filters: filtrosHid() });
    if (!device) return;
    await abrir(device);
  } catch (e) {
    log(`No se pudo conectar: ${e.message}`, 'error');
  }
}

async function abrir(device) {
  if (!device.opened) await device.open();
  const mando = crearMando(device);
  estado.mando = mando;
  device.oninputreport = alRecibirEntrada;
  device.addEventListener?.('disconnect', desconectado);
  navigator.hid.addEventListener('disconnect', (ev) => { if (ev.device === device) desconectado(); });
  $('#nombre-mando').textContent = mando.nombre;
  $('#conexion').textContent = 'detectando…';
  mostrar('#panel-conectar', false);
  mostrar('#panel-mando', true);
  log(`Conectado: ${mando.nombre}`);
  // Esperar al primer informe de entrada para saber si es USB o Bluetooth
  await sleep(400);
  try {
    const info = await mando.info();
    $('#info-mando').textContent = info.clon ? 'ATENCIÓN: parece un mando clon/no original. La calibración está desactivada.' : `Firmware: ${info.fecha}`;
    if (!info.clon && mando.conexion === 'usb') $('#nvs').textContent = `Memoria: ${await mando.estadoNvs()}`;
  } catch (e) {
    $('#info-mando').textContent = `No se pudo leer la información (${e.message}).`;
  }
  actualizarBotones();
}

function desconectado() {
  if (!estado.mando) return;
  log('Mando desconectado.');
  estado.mando = null;
  estado.calibrando = false;
  mostrar('#panel-conectar', true);
  mostrar('#panel-mando', false);
}

async function desconectar() {
  if (estado.mando) await estado.mando.cerrar();
  desconectado();
}

function actualizarBotones() {
  const m = estado.mando;
  const usb = m?.conexion === 'usb';
  const puede = usb && !m?.esClon && !estado.calibrando;
  $('#conexion').textContent = m?.conexion === 'usb' ? 'USB' : m?.conexion === 'bluetooth' ? 'Bluetooth' : '…';
  mostrar('#aviso-bt', m?.conexion === 'bluetooth');
  for (const id of ['#btn-centro', '#btn-rango']) $(id).disabled = !puede;
  $('#btn-guardar').disabled = !puede || !estado.cambiosSinGuardar;
  $('#btn-reiniciar').disabled = !usb || estado.calibrando;
}

// ---------- Entrada y medición de drift ----------
function alRecibirEntrada(ev) {
  const m = estado.mando;
  if (!m) return;
  if (m.conexion === 'desconocida') { m.detectarConexion(ev.reportId, ev.data); actualizarBotones(); }
  const e = m.ejes(ev.reportId, ev.data);
  if (!e) return;
  estado.ejes = e;
  if (estado.midiendo) estado.muestras.push(e);
  if (estado.calibrando === 'rango') registrarCobertura(e);
}

function registrarCobertura(e) {
  const marcar = (set, x, y) => {
    const r = Math.hypot(norm(x), norm(y));
    if (r > 0.8) set.add(Math.round(((Math.atan2(norm(y), norm(x)) + Math.PI) / (2 * Math.PI)) * 47) % 48);
  };
  marcar(estado.cobertura.l, e.lx, e.ly);
  marcar(estado.cobertura.r, e.rx, e.ry);
  const pct = Math.round(((estado.cobertura.l.size + estado.cobertura.r.size) / 96) * 100);
  $('#progreso-rango').style.width = pct + '%';
  $('#texto-rango').textContent = `${pct}% (izq ${estado.cobertura.l.size}/48 · der ${estado.cobertura.r.size}/48)`;
}

function dibujar() {
  const { lx, ly, rx, ry } = estado.ejes;
  pintarStick($('#stick-izq'), norm(lx), norm(ly));
  pintarStick($('#stick-der'), norm(rx), norm(ry));
  $('#val-izq').textContent = `${fmt(norm(lx))}, ${fmt(norm(ly))}`;
  $('#val-der').textContent = `${fmt(norm(rx))}, ${fmt(norm(ry))}`;
  requestAnimationFrame(dibujar);
}
const fmt = (v) => (v >= 0 ? '+' : '') + v.toFixed(2);

function pintarStick(canvas, x, y) {
  const c = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, R = w / 2 - 6;
  c.clearRect(0, 0, w, h);
  const oscuro = matchMedia('(prefers-color-scheme: dark)').matches;
  c.strokeStyle = oscuro ? '#3a4150' : '#cfd4dc';
  c.lineWidth = 1.5;
  c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(cx, cy, R * 0.1, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx + R, cy); c.moveTo(cx, cy - R); c.lineTo(cx, cy + R); c.stroke();
  const d = Math.hypot(x, y);
  c.fillStyle = d < 0.08 ? '#22c55e' : d < 0.2 ? '#f59e0b' : '#ef4444';
  c.beginPath(); c.arc(cx + x * R, cy + y * R, 7, 0, Math.PI * 2); c.fill();
}

async function medirDrift() {
  if (!estado.mando) return;
  estado.muestras = [];
  estado.midiendo = true;
  $('#btn-medir').disabled = true;
  for (let i = 3; i > 0; i--) { $('#resultado-drift').textContent = `No toques los sticks… ${i}`; await sleep(1000); }
  estado.midiendo = false;
  $('#btn-medir').disabled = false;
  const n = estado.muestras.length;
  if (n < 20) { $('#resultado-drift').textContent = 'No llegaron suficientes datos del mando. Mueve un botón y vuelve a intentarlo.'; return; }
  const stats = (k) => {
    const vals = estado.muestras.map((s) => norm(s[k]));
    const media = vals.reduce((a, b) => a + b, 0) / n;
    const ruido = Math.sqrt(vals.reduce((a, b) => a + (b - media) ** 2, 0) / n);
    return { media, ruido };
  };
  const L = { x: stats('lx'), y: stats('ly') }, R = { x: stats('rx'), y: stats('ry') };
  const veredicto = (s) => {
    const off = Math.hypot(s.x.media, s.y.media);
    const pct = (off * 100).toFixed(1);
    if (off < 0.04 && s.x.ruido < 0.02 && s.y.ruido < 0.02) return `OK (desvío ${pct}%)`;
    if (off < 0.12) return `Drift leve (desvío ${pct}%): la calibración de centro lo corrige`;
    return `Drift fuerte (desvío ${pct}%): prueba calibrar centro; si vuelve, el sensor está desgastado`;
  };
  const lineas = [`Stick izquierdo: ${veredicto(L)} · ruido ${(Math.max(L.x.ruido, L.y.ruido) * 100).toFixed(1)}%`, `Stick derecho: ${veredicto(R)} · ruido ${(Math.max(R.x.ruido, R.y.ruido) * 100).toFixed(1)}%`];
  const zonaMuerta = Math.ceil(Math.max(Math.hypot(L.x.media, L.y.media) + 2 * Math.max(L.x.ruido, L.y.ruido), Math.hypot(R.x.media, R.y.media) + 2 * Math.max(R.x.ruido, R.y.ruido)) * 100);
  lineas.push(`Zona muerta recomendada en juegos si no quieres calibrar: ${Math.max(zonaMuerta, 3)}%`);
  $('#resultado-drift').innerHTML = lineas.map((l) => `<div>${l}</div>`).join('');
  log(`Medición: ${lineas.join(' | ')}`);
}

// ---------- Calibración de centro (4 muestras) ----------
async function calibrarCentro() {
  const m = estado.mando;
  if (!m) return;
  estado.calibrando = 'centro';
  actualizarBotones();
  mostrar('#asistente', true);
  const pasos = $('#pasos');
  try {
    await paso(pasos, 'Suelta los dos sticks y no toques el mando. Pulsa Continuar.');
    await m.centroInicio();
    for (let i = 1; i <= 4; i++) {
      await paso(pasos, `Muestra ${i} de 4: mueve los dos sticks en círculos un par de veces, suéltalos del todo y pulsa Continuar sin tocarlos.`);
      await m.centroMuestra();
    }
    await m.centroFin();
    estado.cambiosSinGuardar = true;
    log('Centro calibrado (temporal). Mide el drift y, si está bien, pulsa "Guardar permanente".', 'ok');
    $('#pasos').textContent = 'Listo. Comprueba la medición de drift; si es correcta, guarda de forma permanente.';
  } catch (e) {
    log(`Error calibrando centro: ${e.message}`, 'error');
    $('#pasos').textContent = `Error: ${e.message}`;
  } finally {
    estado.calibrando = false;
    $('#btn-continuar').classList.add('oculto');
    actualizarBotones();
  }
}

function paso(el, texto) {
  el.textContent = texto;
  const b = $('#btn-continuar');
  b.classList.remove('oculto');
  return new Promise((res) => { b.onclick = () => { b.onclick = null; res(); }; });
}

// ---------- Calibración de rango ----------
async function calibrarRango() {
  const m = estado.mando;
  if (!m) return;
  estado.calibrando = 'rango';
  estado.cobertura = { l: new Set(), r: new Set() };
  actualizarBotones();
  mostrar('#asistente', true);
  mostrar('#barra-rango', true);
  try {
    await m.rangoInicio();
    $('#pasos').textContent = 'Gira los dos sticks por todo el borde, despacio, al menos 4 vueltas completas cada uno (unos 15 segundos). Cuando la barra llegue al 100% o pasen 15 s, pulsa Terminar.';
    const b = $('#btn-continuar');
    b.textContent = 'Terminar';
    b.classList.remove('oculto');
    b.disabled = true;
    setTimeout(() => (b.disabled = false), 15000);
    await new Promise((res) => { b.onclick = () => { b.onclick = null; res(); }; });
    b.textContent = 'Continuar';
    await m.rangoFin();
    estado.cambiosSinGuardar = true;
    log('Rango calibrado (temporal). Si al mover los sticks llegan al borde del círculo, pulsa "Guardar permanente".', 'ok');
    $('#pasos').textContent = 'Listo. Mueve los sticks: deben llegar justo al borde. Si es así, guarda de forma permanente.';
  } catch (e) {
    log(`Error calibrando rango: ${e.message}`, 'error');
    $('#pasos').textContent = `Error: ${e.message}`;
  } finally {
    estado.calibrando = false;
    $('#btn-continuar').classList.add('oculto');
    mostrar('#barra-rango', false);
    actualizarBotones();
  }
}

async function guardar() {
  const m = estado.mando;
  if (!m) return;
  if (!confirm('Se escribirá la calibración en la memoria del mando. ¿Continuar?')) return;
  try {
    await m.guardar();
    estado.cambiosSinGuardar = false;
    log('Calibración guardada permanentemente.', 'ok');
    $('#nvs').textContent = `Memoria: ${await m.estadoNvs()}`;
  } catch (e) {
    log(`Error al guardar: ${e.message}`, 'error');
  }
  actualizarBotones();
}

async function reiniciar() {
  const m = estado.mando;
  if (!m) return;
  if (!confirm('Se reiniciará el mando y se descartarán los cambios no guardados. ¿Continuar?')) return;
  await m.reiniciar();
  estado.cambiosSinGuardar = false;
  log('Mando reiniciado. Vuelve a conectarlo.');
  desconectado();
}

// ---------- Arranque ----------
$('#btn-conectar').onclick = conectar;
$('#btn-desconectar').onclick = desconectar;
$('#btn-medir').onclick = medirDrift;
$('#btn-centro').onclick = calibrarCentro;
$('#btn-rango').onclick = calibrarRango;
$('#btn-guardar').onclick = guardar;
$('#btn-reiniciar').onclick = reiniciar;
$('#modelos').textContent = Object.values(MODELOS).map((m) => m.nombre).join(', ');
if (!navigator.hid) {
  mostrar('#sin-webhid', true);
  $('#btn-conectar').disabled = true;
}
requestAnimationFrame(dibujar);
window.addEventListener('beforeunload', (e) => { if (estado.cambiosSinGuardar) { e.preventDefault(); e.returnValue = ''; } });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
// Reconectar automáticamente con mandos ya autorizados
navigator.hid?.getDevices?.().then(async (devs) => { const d = devs.find((x) => MODELOS[x.productId]); if (d) { try { await abrir(d); } catch {} } });

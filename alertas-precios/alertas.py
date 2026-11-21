"""Alertas de bajadas de precio y errores de precio de Amazon US y Newegg US, con aviso al teléfono.

  python alertas.py prueba              → manda una notificación de prueba
  python alertas.py descubrir           → revisa feeds de ofertas (Slickdeals, Reddit, Keepa) una vez
  python alertas.py vigilar             → revisa tu lista de productos una vez
  python alertas.py todo --bucle 300    → ambas cosas cada 5 minutos, sin parar

Configuración en config.json (copia config.ejemplo.json). Claves opcionales por variables de entorno:
  NTFY_TOPIC (obligatoria), KEEPA_KEY (recomendada para Amazon), TELEGRAM_TOKEN + TELEGRAM_CHAT (opcional).
Solo usa la biblioteca estándar de Python 3.9+.
"""
from __future__ import annotations

import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent
CONFIG = RAIZ / "config.json"
ESTADO = RAIZ / "estado.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
PALABRAS_ERROR = re.compile(r"price\s*error|pricing\s*error|price\s*mistake|glitch|error\s*de\s*precio|\bPE\b", re.I)
TIENDAS = {"amazon": re.compile(r"amazon\.com\b|\bamazon\b", re.I), "newegg": re.compile(r"newegg\.com\b|\bnewegg\b", re.I)}


# ------------------------------------------------------------------ utilidades
def log(msg: str) -> None:
    print(f"[{datetime.now():%H:%M:%S}] {msg}", flush=True)


def leer_config() -> dict:
    base = json.loads((RAIZ / "config.ejemplo.json").read_text(encoding="utf-8"))
    if CONFIG.exists():
        base.update(json.loads(CONFIG.read_text(encoding="utf-8")))
    return base


def leer_estado() -> dict:
    if ESTADO.exists():
        try:
            return json.loads(ESTADO.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {"vistos": {}, "precios": {}}


def guardar_estado(e: dict) -> None:
    # Olvidar avisos de hace más de 14 días para que el archivo no crezca sin fin
    limite = time.time() - 14 * 86400
    e["vistos"] = {k: v for k, v in e["vistos"].items() if v > limite}
    ESTADO.write_text(json.dumps(e, indent=1, ensure_ascii=False), encoding="utf-8")


def obtener(url: str, timeout: int = 20, encabezados: dict | None = None) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", **(encabezados or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception as e:  # red caída, timeout…
        return 0, str(e)


def precio_de(texto: str) -> float | None:
    m = re.search(r"\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)", texto)
    return float(m.group(1).replace(",", "")) if m else None


def descuento_de(texto: str) -> tuple[float | None, float | None, float | None]:
    """(precio actual, precio anterior, % de descuento) a partir de títulos como '$49.99 (Reg. $199.99)' o '75% off'."""
    actual = precio_de(texto)
    anterior = None
    m = re.search(r"(?:reg\.?|was|list|msrp|retail|orig(?:inal)?\.?|compare(?:\s*at)?)[:\s]*\$\s?(\d[\d,]*(?:\.\d{1,2})?)", texto, re.I)
    if m:
        anterior = float(m.group(1).replace(",", ""))
    pct = None
    m = re.search(r"(\d{2})\s?%\s*off", texto, re.I)
    if m:
        pct = float(m.group(1))
    if actual and anterior and anterior > actual:
        pct = max(pct or 0, round((1 - actual / anterior) * 100, 1))
    return actual, anterior, pct


# ------------------------------------------------------------------ notificaciones
def notificar(cfg: dict, titulo: str, mensaje: str, url: str = "", prioridad: int = 3, etiquetas: str = "moneybag") -> None:
    tema = os.environ.get("NTFY_TOPIC") or cfg.get("ntfy_topic")
    if tema:
        servidor = cfg.get("ntfy_servidor", "https://ntfy.sh").rstrip("/")
        # ntfy acepta los encabezados en ASCII; el título va codificado para admitir acentos y emojis
        enc = {"Title": "=?UTF-8?B?" + __import__("base64").b64encode(titulo.encode()).decode() + "?=",
               "Priority": str(prioridad), "Tags": etiquetas}
        if url:
            enc["Click"] = url
            enc["Actions"] = f"view, Abrir, {url}"
        req = urllib.request.Request(f"{servidor}/{urllib.parse.quote(tema)}", data=mensaje.encode("utf-8"), headers=enc, method="POST")
        try:
            urllib.request.urlopen(req, timeout=15).read()
        except Exception as e:
            log(f"ntfy falló: {e}")
    tok, chat = os.environ.get("TELEGRAM_TOKEN"), os.environ.get("TELEGRAM_CHAT")
    if tok and chat:
        datos = urllib.parse.urlencode({"chat_id": chat, "text": f"{titulo}\n{mensaje}\n{url}", "disable_web_page_preview": "false"}).encode()
        try:
            urllib.request.urlopen(f"https://api.telegram.org/bot{tok}/sendMessage", data=datos, timeout=15).read()
        except Exception as e:
            log(f"Telegram falló: {e}")


def avisar_oferta(cfg: dict, estado: dict, o: dict) -> bool:
    clave = o["id"]
    if clave in estado["vistos"]:
        return False
    estado["vistos"][clave] = time.time()
    tienda = o["tienda"].capitalize()
    if o.get("error"):
        titulo, prioridad, tags = f"⚠️ POSIBLE ERROR DE PRECIO · {tienda}", 5, "rotating_light"
    elif (o.get("pct") or 0) >= 70:
        titulo, prioridad, tags = f"🔥 -{o['pct']:.0f}% · {tienda}", 4, "fire"
    else:
        titulo, prioridad, tags = f"📉 -{o.get('pct') or 0:.0f}% · {tienda}", 3, "chart_with_downwards_trend"
    lineas = [o["titulo"][:200]]
    if o.get("actual"):
        lineas.append(f"Ahora: ${o['actual']:,.2f}" + (f"  (antes ${o['anterior']:,.2f})" if o.get("anterior") else ""))
    lineas.append(f"Fuente: {o['fuente']}")
    notificar(cfg, titulo, "\n".join(lineas), o["url"], prioridad, tags)
    log(f"AVISO {titulo}: {o['titulo'][:90]}")
    return True


def interesa(cfg: dict, o: dict) -> bool:
    if o["tienda"] not in cfg["tiendas"]:
        return False
    t = o["titulo"].lower()
    if any(p.lower() in t for p in cfg.get("excluir", [])):
        return False
    if cfg.get("palabras_clave") and not any(p.lower() in t for p in cfg["palabras_clave"]) and not o.get("error"):
        return False
    if o.get("error"):
        return True
    if (o.get("pct") or 0) >= cfg["descuento_minimo"]:
        return (o.get("actual") or 0) >= cfg.get("precio_minimo", 0)
    return False


# ------------------------------------------------------------------ fuentes de descubrimiento
def tienda_de(texto: str) -> str | None:
    for nombre, rx in TIENDAS.items():
        if rx.search(texto):
            return nombre
    return None


def fuente_slickdeals(cfg: dict) -> list[dict]:
    urls = [
        "https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1",
        "https://slickdeals.net/newsearch.php?mode=popdeals&searcharea=deals&searchin=first&rss=1",
        "https://slickdeals.net/newsearch.php?q=price+error&searcharea=deals&searchin=first&rss=1",
        "https://slickdeals.net/newsearch.php?q=pricing+error&searcharea=deals&searchin=first&rss=1",
    ]
    ofertas = []
    for u in urls:
        st, xml = obtener(u)
        if st != 200:
            log(f"Slickdeals {st}: {u[:80]}")
            continue
        for item in re.findall(r"<item>(.*?)</item>", xml, re.S):
            def campo(tag):
                m = re.search(rf"<{tag}[^>]*>(.*?)</{tag}>", item, re.S)
                return html.unescape(re.sub(r"<!\[CDATA\[(.*?)\]\]>", r"\1", m.group(1), flags=re.S)).strip() if m else ""
            titulo, enlace, contenido = campo("title"), campo("link"), campo("content:encoded")
            slug = re.search(r'data-store-slug="([^"]+)"', contenido)
            tienda = tienda_de(slug.group(1) if slug else "") or tienda_de(titulo)
            if not tienda:
                continue
            actual, anterior, pct = descuento_de(titulo + " " + re.sub(r"<[^>]+>", " ", contenido)[:600])
            ofertas.append({"id": "sd:" + enlace.split("?")[0], "fuente": "Slickdeals", "tienda": tienda, "titulo": titulo,
                            "url": enlace.split("?")[0], "actual": actual, "anterior": anterior, "pct": pct,
                            "error": bool(PALABRAS_ERROR.search(titulo))})
    return ofertas


def fuente_reddit(cfg: dict) -> list[dict]:
    ofertas = []
    for sub in cfg.get("subreddits", ["buildapcsales", "deals"]):
        st, txt = obtener(f"https://www.reddit.com/r/{sub}/new.json?limit=50", encabezados={"User-Agent": "alertas-precios/1.0"})
        if st != 200:
            log(f"Reddit r/{sub}: HTTP {st} (Reddit suele bloquear servidores; desde tu PC funciona)")
            continue
        for h in json.loads(txt)["data"]["children"]:
            d = h["data"]
            texto = f"{d.get('title', '')} {d.get('url', '')} {d.get('link_flair_text') or ''}"
            tienda = tienda_de(d.get("url", "")) or tienda_de(d.get("title", ""))
            if not tienda:
                continue
            actual, anterior, pct = descuento_de(d.get("title", ""))
            ofertas.append({"id": "rd:" + d["id"], "fuente": f"r/{sub}", "tienda": tienda, "titulo": d["title"],
                            "url": d.get("url") or f"https://reddit.com{d['permalink']}", "actual": actual, "anterior": anterior,
                            "pct": pct, "error": bool(PALABRAS_ERROR.search(texto))})
    return ofertas


def fuente_keepa(cfg: dict) -> list[dict]:
    """Caídas de precio en todo Amazon US según Keepa (lo que usan las cuentas de 'price error'). Requiere KEEPA_KEY."""
    clave = os.environ.get("KEEPA_KEY")
    if not clave:
        return []
    seleccion = {
        "page": 0, "domainId": 1, "priceTypes": [0],            # 0 = precio vendido por Amazon
        "deltaPercentRange": [cfg["descuento_minimo"], 100],     # caída frente al promedio
        "dateRange": 0,                                         # 0 = últimas 24 h
        "currentRange": [int(cfg.get("precio_minimo", 0) * 100), 2_000_000],
        "isFilterEnabled": True, "isRangeEnabled": True, "sortType": 4,
    }
    st, txt = obtener(f"https://api.keepa.com/deal?key={clave}&selection={urllib.parse.quote(json.dumps(seleccion))}", timeout=30)
    if st != 200:
        log(f"Keepa HTTP {st}: {txt[:200]}")
        return []
    ofertas = []
    for d in json.loads(txt).get("deals", {}).get("dr", []):
        try:
            actual = d["current"][0] / 100 if d["current"][0] > 0 else None
            pct = abs(d["deltaPercent"][0][0])
        except (KeyError, IndexError, TypeError):
            continue
        anterior = round(actual / (1 - pct / 100), 2) if actual and pct < 100 else None
        ofertas.append({"id": f"kp:{d['asin']}:{d['current'][0]}", "fuente": "Keepa", "tienda": "amazon", "titulo": d.get("title", d["asin"]),
                        "url": f"https://www.amazon.com/dp/{d['asin']}", "actual": actual, "anterior": anterior, "pct": pct,
                        "error": pct >= cfg.get("pct_error", 80)})
    return ofertas


def descubrir(cfg: dict, estado: dict) -> int:
    todas = []
    for fuente in (fuente_slickdeals, fuente_reddit, fuente_keepa):
        try:
            todas += fuente(cfg)
        except Exception as e:
            log(f"{fuente.__name__}: {e}")
    n = sum(avisar_oferta(cfg, estado, o) for o in todas if interesa(cfg, o))
    log(f"Descubrir: {len(todas)} ofertas de Amazon/Newegg revisadas, {n} avisos nuevos")
    return n


# ------------------------------------------------------------------ lista de productos vigilados
def asin_de(url: str) -> str | None:
    m = re.search(r"/(?:dp|gp/product|gp/aw/d)/([A-Z0-9]{10})", url, re.I)
    return m.group(1).upper() if m else None


def precio_amazon(url: str) -> tuple[float | None, str]:
    asin = asin_de(url)
    clave = os.environ.get("KEEPA_KEY")
    if clave and asin:
        st, txt = obtener(f"https://api.keepa.com/product?key={clave}&domain=1&asin={asin}&stats=90", timeout=30)
        if st == 200:
            p = json.loads(txt)["products"][0]
            cur = p.get("stats", {}).get("current", [])
            candidatos = [v for v in (cur[0] if len(cur) > 0 else -1, cur[1] if len(cur) > 1 else -1) if v and v > 0]
            return (min(candidatos) / 100 if candidatos else None), p.get("title", asin)
    st, pagina = obtener(f"https://www.amazon.com/dp/{asin}" if asin else url)
    if st != 200 or "api-services-support@amazon.com" in pagina:
        return None, "Amazon bloqueó la consulta (usa KEEPA_KEY o ejecútalo desde tu PC)"
    titulo = re.search(r'id="productTitle"[^>]*>\s*([^<]+)', pagina)
    m = re.search(r'class="a-price[^"]*priceToPay[^"]*"[\s\S]{0,300}?class="a-offscreen">\$([\d,]+\.\d{2})', pagina) or \
        re.search(r'id="corePrice(?:Display_desktop)?_feature_div"[\s\S]{0,2000}?class="a-offscreen">\$([\d,]+\.\d{2})', pagina)
    return (float(m.group(1).replace(",", "")) if m else None), (html.unescape(titulo.group(1).strip()) if titulo else url)


def precio_newegg(url: str) -> tuple[float | None, str]:
    item = re.search(r"/p/([A-Za-z0-9-]+)", url)
    if item:
        st, txt = obtener(f"https://www.newegg.com/product/api/ProductRealtime?ItemNumber={item.group(1)}", encabezados={"Accept": "application/json"})
        if st == 200:
            try:
                d = json.loads(txt)["MainItem"]
                return float(d["FinalPrice"]), d.get("Description", {}).get("Title", url)
            except (KeyError, ValueError, json.JSONDecodeError):
                pass
    st, pagina = obtener(url)
    if st != 200:
        return None, f"Newegg HTTP {st} (ejecútalo desde tu PC)"
    m = re.search(r'"price"\s*:\s*"?([\d.]+)', pagina) or re.search(r'itemprop="price"\s+content="([\d.]+)"', pagina)
    t = re.search(r'<h1 class="product-title">([^<]+)', pagina)
    return (float(m.group(1)) if m else None), (html.unescape(t.group(1).strip()) if t else url)


def vigilar(cfg: dict, estado: dict) -> int:
    avisos = 0
    for p in cfg.get("productos", []):
        url = p["url"]
        tienda = "amazon" if "amazon." in url or "amzn." in url else "newegg"
        precio, nombre = (precio_amazon if tienda == "amazon" else precio_newegg)(url)
        if precio is None:
            log(f"Sin precio para {url[:60]}: {nombre}")
            continue
        hist = estado["precios"].setdefault(url, [])
        anterior_min = min((x[1] for x in hist), default=None)
        ultimo = hist[-1][1] if hist else None
        hist.append([int(time.time()), precio])
        del hist[:-500]
        caida = round((1 - precio / ultimo) * 100, 1) if ultimo else 0
        objetivo = p.get("precio_objetivo")
        motivo = None
        if objetivo and precio <= objetivo and (ultimo is None or ultimo > objetivo):
            motivo = f"bajó de tu objetivo ${objetivo:,.2f}"
        elif ultimo and caida >= p.get("caida_pct", cfg["descuento_minimo"] / 2):
            motivo = f"cayó {caida:.0f}% desde la última revisión"
        elif anterior_min and precio < anterior_min * 0.97:
            motivo = "precio más bajo registrado"
        log(f"{tienda} ${precio:,.2f} {nombre[:60]}" + (f" → {motivo}" if motivo else ""))
        if motivo:
            notificar(cfg, f"📉 {tienda.capitalize()}: ${precio:,.2f}", f"{nombre[:200]}\n{motivo}" + (f"\nAntes: ${ultimo:,.2f}" if ultimo else ""), url,
                      5 if caida >= 50 else 4, "chart_with_downwards_trend")
            avisos += 1
        time.sleep(cfg.get("pausa_entre_productos", 3))
    return avisos


# ------------------------------------------------------------------ principal
def main() -> None:
    args = sys.argv[1:]
    modo = args[0] if args else "todo"
    bucle = int(args[args.index("--bucle") + 1]) if "--bucle" in args else 0
    cfg = leer_config()
    if modo == "prueba":
        notificar(cfg, "✅ Alertas de precios conectadas", "Así se verá cada aviso. Toca para abrir el producto.", "https://slickdeals.net", 3, "white_check_mark")
        log("Notificación de prueba enviada")
        return
    while True:
        estado = leer_estado()
        primera_vez = not estado["vistos"] and modo in ("descubrir", "todo")
        if primera_vez and cfg.get("silenciar_primera_pasada", True):
            # Primera ejecución: memorizar lo que ya existe sin avisar, para no recibir 50 notificaciones de golpe
            for fuente in (fuente_slickdeals, fuente_reddit, fuente_keepa):
                try:
                    for o in fuente(cfg):
                        estado["vistos"][o["id"]] = time.time()
                except Exception as e:
                    log(f"{fuente.__name__}: {e}")
            log(f"Primera pasada: {len(estado['vistos'])} ofertas memorizadas sin avisar")
        else:
            if modo in ("descubrir", "todo"):
                descubrir(cfg, estado)
        if modo in ("vigilar", "todo"):
            vigilar(cfg, estado)
        guardar_estado(estado)
        if not bucle:
            break
        time.sleep(bucle)


if __name__ == "__main__":
    main()

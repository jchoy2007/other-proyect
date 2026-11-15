"""
Compone la música (sintetizada, sin derechos de terceros) sincronizada con
src/linea-tiempo.json y la mezcla con la narración.

  python3 scripts/musica.py

Salida:
  public/audio/musica.wav    solo música
  public/audio/mezcla.wav    música + narración (la que usa el video)

Estructura:
  1. Suspenso suave (piano + ambiente en re menor)
  2. Tensión en "Cinco puertas" (pulso tipo latido) y golpe grave en "la venta se cae"
  3. Esperanza desde "Una sola llave" (acordes que crecen, arpegio, bombo suave)
  4. Subida y golpe de impacto al revelar la marca (acorde completo en Fa mayor)
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt

RAIZ = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(7)

tl = json.loads((RAIZ / "src" / "linea-tiempo.json").read_text())
FPS = tl["fps"]
TOTAL = tl["total"] / FPS
ESC = {e["id"]: e for e in tl["escenas"]}


def t_esc(sid, frame=0):
    return (ESC[sid]["desde"] + frame) / FPS


def t_voz(sid, i, frac=0.0):
    v = ESC[sid]["voces"][i]
    return (ESC[sid]["desde"] + v["inicio"] + v["duracion"] * frac) / FPS


N = int((TOTAL + 0.5) * SR)
mus = np.zeros((2, N))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lp(x, fc, orden=2):
    return sosfilt(butter(orden, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, orden=2):
    return sosfilt(butter(orden, fc, "high", fs=SR, output="sos"), x)


PISTAS = {}


def lp_variable(x, cortes, bloque):
    """Pasa-bajos cuyo corte cambia por bloques SIN reiniciar el filtro (evita clics)."""
    out = np.zeros_like(x)
    zi = np.zeros((1, 2))
    for b, i in enumerate(range(0, len(x), bloque)):
        sos = butter(2, float(cortes[min(b, len(cortes) - 1)]), "low", fs=SR, output="sos")
        out[i : i + bloque], zi = sosfilt(sos, x[i : i + bloque], zi=zi)
    return out


def final_suave(sig, ms=40):
    """Desvanece el final de un sonido para que no termine en seco (clic)."""
    n = min(len(sig), int(ms / 1000 * SR))
    if n > 1:
        sig = sig.copy()
        sig[-n:] *= np.linspace(1, 0, n)
    return sig


def poner(sig, t, gan=1.0, pan=0.0, pista="otros"):
    i = int(t * SR)
    if i >= N:
        return
    sig = final_suave(sig[: N - i], 15)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    if pista not in PISTAS:
        PISTAS[pista] = np.zeros((2, N))
    for destino in (mus, PISTAS[pista]):
        destino[0, i : i + len(sig)] += sig * gan * l * 1.41
        destino[1, i : i + len(sig)] += sig * gan * r * 1.41


def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else 1
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ---------------------------------------------------------------- instrumentos
def piano(m, dur=3.5, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.zeros(n)
    for k in range(1, 10):
        fk = f * k * np.sqrt(1 + 0.0004 * k * k)
        if fk > SR / 2.2:
            break
        dec = 1.2 + 0.9 * k + f / 400
        s += np.sin(2 * np.pi * fk * t) * np.exp(-t * dec) / k**1.4
    s *= env_adsr(n, 0.004, 0.3)
    return lp(s, 5000) * vel * 0.35


def sierra(f, n, armonicos=14):
    t = np.arange(n) / SR
    s = np.zeros(n)
    for k in range(1, armonicos + 1):
        if f * k > SR / 2.2:
            break
        s += np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6.28)) / k
    return s


def pad(notas, dur, ataque=1.8, rel=1.8, corte=1400, brillo=0.0):
    n = int(dur * SR)
    s = np.zeros(n)
    for m in notas:
        for det in (-0.12, 0.0, 0.11):
            s += sierra(hz(m + det), n, 10)
    fc = corte * (1 + brillo * np.linspace(0, 1, n))
    # filtro de corte variable aproximado por bloques
    bloque = SR // 50
    out = lp_variable(s, fc[::bloque], bloque)
    out *= env_adsr(n, ataque, rel)
    return out / (len(notas) * 3) * 0.9


def pluck(m, dur=0.6, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sierra(hz(m), n, 8) * np.exp(-t * 7)
    return lp(s, 2600) * env_adsr(n, 0.008, 0.05) * vel * 0.3


def bombo(vel=1.0, f0=95, f1=42, dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)
    return final_suave(s * vel, 120)


def boom(dur=4.0, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 30 + 60 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.1)
    ruido = lp(rng.standard_normal(n), 900) * np.exp(-t * 4) * 0.5
    return (sub + ruido) * vel


def latido(vel=1.0):
    return bombo(vel, 70, 40, 0.5) * 0.9


def tic(vel=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 6000) * np.exp(-t * 120) * vel * 0.15


def subida(dur, tono=True):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    ruido = rng.standard_normal(n)
    bloque = SR // 100
    out = lp_variable(ruido, 300 + 9000 * x[::bloque] ** 2, bloque)
    ton = np.sin(2 * np.pi * np.cumsum(200 + 900 * x**2) / SR) * 0.25 if tono else 0
    return (lp(out, 6000) * 0.6 + ton) * x**2.2


def timbal(vel=1.0):
    return bombo(vel, 140, 85, 1.6) * 0.8 + lp(rng.standard_normal(int(1.6 * SR)), 400) * np.exp(-np.arange(int(1.6 * SR)) / SR * 9) * 0.3 * vel


# ---------------------------------------------------------------- composición
T_PUERTAS = t_esc("Puertas")
T_CAE = t_voz("Puertas", 2, 0.62)  # "…y la venta se cae"
T_LLAVE = t_esc("Llave", 6)
T_EQUIPO = t_esc("Equipo")
T_DOS = t_esc("DosEmpresas")
T_CIERRE = t_esc("Cierre", 4)

def comp_cine():
    """A · Cinematográfica: suspenso, latido, golpe grave e impacto."""
    # 1) Ambiente y piano en suspenso (re menor)
    poner(pad([38, 45], T_LLAVE + 1.0, ataque=3.0, rel=2.5, corte=500), 0, 0.55)  # dron re-la
    motivo = [69, 65, 62, 64, 65, 64, 62, 57]
    t = 1.2
    i = 0
    while t < T_CAE - 0.5:
        m = motivo[i % len(motivo)]
        poner(piano(m, 4.0, 0.8 if i % 4 == 0 else 0.6), t, 1.0, pan=0.25 * np.sin(i))
        if i % 4 == 0:
            poner(piano(m - 24, 5.0, 0.5), t, 1.0)
        t += 1.5 if T_PUERTAS > t else 1.0
        i += 1
    acordes_tension = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52]]  # Dm Bb Gm A
    dur_ac = (T_CAE - T_PUERTAS) / 4
    for k, ac in enumerate(acordes_tension):
        poner(pad(ac, dur_ac + 1.5, ataque=1.0, rel=1.5, corte=900 + 250 * k), T_PUERTAS + k * dur_ac, 0.5)

    # 2) Tensión: latido y tic-tac en "Cinco puertas"
    bpm = 72
    paso = 60 / bpm
    t = T_PUERTAS + 0.3
    while t < T_CAE - 0.2:
        crec = (t - T_PUERTAS) / (T_CAE - T_PUERTAS)
        poner(latido(0.55 + 0.35 * crec), t, 1.0)
        poner(latido(0.35 + 0.25 * crec), t + 0.22, 1.0)
        for s in range(2):
            poner(tic(0.6 + crec), t + s * paso / 2, 1.0, pan=0.4 if s else -0.4)
        t += paso
    # golpe grave cuando "la venta se cae"
    poner(boom(4.5, 0.95), T_CAE, 1.0)
    poner(pad([26, 38], 4.5, ataque=0.02, rel=3.5, corte=300), T_CAE, 0.5)

    # 3) Esperanza desde "Una sola llave": Fa mayor  (Sib - Fa - Do - Rem)
    prog = [[46, 53, 58, 62], [41, 53, 57, 60], [48, 52, 55, 60], [50, 53, 57, 62]]
    bajo = [34, 29, 36, 38]
    dur_c = 3.0
    t = T_LLAVE
    k = 0
    fin_esp = T_CIERRE - 2.6
    while t < fin_esp:
        d = min(dur_c, fin_esp - t + 0.4)
        crec = (t - T_LLAVE) / (fin_esp - T_LLAVE)
        ac = prog[k % 4]
        poner(pad(ac, d + 1.2, ataque=0.8, rel=1.2, corte=1100 + 1800 * crec), t, 0.42 + 0.25 * crec)
        poner(pad([bajo[k % 4]], d + 0.6, ataque=0.3, rel=0.6, corte=300), t, 0.5)
        poner(piano(ac[-1] + 12, 3.5, 0.55), t, 1.0, pan=0.2)
        # arpegio desde el equipo
        if t >= T_EQUIPO - 0.1:
            notas = [ac[1] + 12, ac[2] + 12, ac[3] + 12, ac[2] + 12]
            corcheas = int(d / 0.375)
            for j in range(corcheas):
                poner(pluck(notas[j % 4], 0.5, 0.5 + 0.5 * crec), t + j * 0.375, 1.0, pan=-0.3 if j % 2 else 0.3)
        # bombo suave desde "dos empresas"
        if t >= T_DOS - 0.1:
            for j in range(int(d / 0.75)):
                poner(bombo(0.45 + 0.35 * crec), t + j * 0.75, 1.0)
        t += dur_c
        k += 1

    # 4) Subida e impacto al mostrar la marca
    poner(subida(2.6), T_CIERRE - 2.6, 0.55)
    poner(timbal(0.5), T_CIERRE - 0.75, 1.0)
    poner(timbal(0.6), T_CIERRE - 0.375, 1.0)
    poner(boom(6.0, 1.0), T_CIERRE, 1.5)
    poner(timbal(1.0), T_CIERRE, 1.0)
    final = T_CIERRE
    dur_final = TOTAL - final + 0.3
    poner(pad([41, 48, 53, 57, 60, 65, 69, 72], dur_final, ataque=0.03, rel=4.0, corte=2600, brillo=-0.4), final, 1.35)
    poner(pad([29, 41], dur_final, ataque=0.03, rel=4.0, corte=250), final, 0.7)
    for j, m in enumerate([77, 72, 69, 65]):
        poner(piano(m, 5.0, 0.7), final + 1.2 + j * 0.75, 1.0, pan=0.2 * (j - 1.5))
    poner(piano(65 + 12, 6.0, 0.6), final + 4.5, 1.0)



def clap(vel=1.0):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    ruido = sosfilt(butter(2, [600, 2200], "band", fs=SR, output="sos"), rng.standard_normal(n))
    env = np.exp(-t * 30) + 0.6 * np.exp(-np.maximum(t - 0.012, 0) * 40) * (t > 0.012)
    return ruido * env * vel * 0.5


def hat(vel=1.0, abierto=False):
    n = int((0.25 if abierto else 0.06) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t * (14 if abierto else 70)) * vel * 0.12


def cuerdas(notas, dur, ataque=1.2, rel=2.0, corte=1800):
    """Pad cálido tipo sección de cuerdas (más armónicos pares suaves y vibrato)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for m in notas:
        for det in (-0.08, 0.0, 0.07):
            f = hz(m + det) * (1 + 0.003 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6)))
            fase = 2 * np.pi * np.cumsum(f) / SR
            for k in range(1, 9):
                if hz(m) * k > SR / 2.2:
                    break
                s += np.sin(k * fase) / k**1.1
    s = lp(s, corte) * env_adsr(n, ataque, rel)
    return s / (len(notas) * 3) * 0.7


def comp_lujo():
    """B · Elegante: piano y cuerdas cálidas, sin golpes duros; final grandioso y suave."""
    # Inicio: piano íntimo en Fa mayor con cuerdas suaves
    prog_a = [[41, 48, 53, 57], [38, 45, 50, 53], [46, 50, 53, 58], [48, 52, 55, 60]]  # F Dm Bb C
    t, k = 0.0, 0
    while t < T_PUERTAS:
        ac = prog_a[k % 4]
        d = min(3.4, T_PUERTAS - t + 0.6)
        poner(cuerdas(ac[1:], d + 1.5, ataque=1.5, rel=1.8, corte=1500), t, 0.5)
        for j, m in enumerate([ac[1] + 12, ac[2] + 12, ac[3] + 12, ac[2] + 12]):
            poner(piano(m, 3.0, 0.5), t + 0.2 + j * 0.85, 1.0, pan=0.25 * (j - 1.5))
        poner(piano(ac[0] - 12, 4.0, 0.5), t, 1.0)
        t += 3.4
        k += 1
    # Problema: menor, cuerdas graves que se tensan, piano en notas sueltas
    prog_b = [[38, 45, 50, 53], [34, 46, 50, 53], [43, 46, 50, 55], [45, 49, 52, 57]]  # Dm Bb Gm A
    dur_b = (T_CAE - T_PUERTAS) / 4
    for k, ac in enumerate(prog_b):
        poner(cuerdas(ac, dur_b + 1.4, ataque=0.9, rel=1.4, corte=1100 + 300 * k), T_PUERTAS + k * dur_b, 0.6 + 0.08 * k)
        poner(piano(ac[-1] + 12, 3.0, 0.45), T_PUERTAS + k * dur_b + 0.4, 1.0, pan=0.2)
    # "la venta se cae": la música se detiene; queda un acorde grave que se apaga
    poner(cuerdas([26, 38, 45], 4.5, ataque=0.05, rel=3.5, corte=600), T_CAE, 0.7)
    poner(bombo(0.35, 70, 38, 2.0), T_CAE, 1.0)
    # Esperanza: Fa mayor, piano arpegiado y cuerdas que crecen
    prog_c = [[46, 53, 58, 62], [41, 53, 57, 60], [48, 52, 55, 60], [50, 53, 57, 62]]
    t, k = T_LLAVE, 0
    fin_esp = T_CIERRE - 2.0
    while t < fin_esp:
        d = min(3.0, fin_esp - t + 0.4)
        crec = (t - T_LLAVE) / (fin_esp - T_LLAVE)
        ac = prog_c[k % 4]
        poner(cuerdas(ac, d + 1.4, ataque=0.9, rel=1.3, corte=1400 + 1600 * crec), t, 0.55 + 0.3 * crec)
        poner(cuerdas([ac[0] - 12], d + 0.8, ataque=0.4, rel=0.8, corte=500), t, 0.5)
        paso = 0.375 if crec > 0.35 else 0.75
        notas = [ac[1] + 12, ac[2] + 12, ac[3] + 12, ac[2] + 24]
        for j in range(int(d / paso)):
            poner(piano(notas[j % 4], 2.0, 0.42 + 0.25 * crec), t + j * paso, 1.0, pan=-0.25 if j % 2 else 0.25)
        t += 3.0
        k += 1
    # Final: crescendo de cuerdas y acorde amplio, con campana de piano (sin golpe duro)
    poner(cuerdas([41, 48, 53, 57, 60], 2.2, ataque=2.0, rel=0.2, corte=2500), T_CIERRE - 2.0, 0.6)
    poner(timbal(0.3), T_CIERRE - 0.4, 1.0)
    poner(timbal(0.8), T_CIERRE, 1.0)
    dur_final = TOTAL - T_CIERRE + 0.3
    poner(cuerdas([29, 41, 48, 53, 57, 60, 65, 69], dur_final, ataque=0.15, rel=4.5, corte=3200), T_CIERRE, 2.1)
    poner(boom(4.0, 0.6), T_CIERRE, 1.0)
    for j, m in enumerate([65, 69, 72, 77, 81]):
        poner(piano(m, 5.0, 0.6), T_CIERRE + 0.05 + j * 0.12, 1.0, pan=0.15 * (j - 2))
    for j, m in enumerate([77, 72, 69, 65]):
        poner(piano(m, 5.0, 0.55), T_CIERRE + 3.0 + j * 0.9, 1.0, pan=0.2 * (j - 1.5))


def teclado(m, dur=0.6, vel=1.0):
    """Piano eléctrico suave: seno + 2.º armónico, ataque redondo, sin brillo agudo."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = hz(m)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)
    s += 0.06 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 20)
    s *= np.exp(-t * 3.2) * env_adsr(n, 0.012, 0.12)
    return lp(s, 1800) * vel * 0.32


def hat_suave(vel=1.0):
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    x = sosfilt(butter(2, [5000, 9000], "band", fs=SR, output="sos"), rng.standard_normal(n))
    return x * np.exp(-t * 90) * vel * 0.06


def comp_moderno():
    """C · Moderno corporativo: pulso electrónico, arpegios y drop en la revelación de la marca."""
    bpm = 100
    b = 60 / bpm  # negra
    # Inicio: arpegio en re menor y pad, entra el pulso suave
    prog_a = [[50, 53, 57, 62], [46, 50, 53, 58], [43, 46, 50, 55], [45, 49, 52, 57]]
    t, k = 0.0, 0
    while t < T_CAE - 0.1:
        ac = prog_a[k % 4]
        d = 8 * b
        crec = min(1.0, t / max(T_CAE, 1))
        poner(pad(ac[:3], d + 0.8, ataque=0.6, rel=0.8, corte=700 + 900 * crec), t, 0.4, pista="acordes")
        poner(pad([ac[0] - 24], d, ataque=0.05, rel=0.3, corte=180), t, 0.55, pista="bajo")
        sub = b / 2
        for j in range(int(d / sub)):
            tt = t + j * sub
            if tt >= T_CAE - 0.1:
                break
            poner(teclado([ac[0], ac[1], ac[2], ac[3]][j % 4], 0.7, 0.5 + 0.3 * crec), tt, 1.0, pan=-0.35 if j % 2 else 0.35, pista="arpegio")
        if t >= T_PUERTAS - 0.1:
            for j in range(8):
                tt = t + j * b
                if tt >= T_CAE - 0.1:
                    break
                poner(bombo(0.55), tt, 1.0, pista="bombo")
                poner(hat_suave(0.6), tt + b / 2, 1.0, pan=0.3, pista="platillos")
        t += d
        k += 1
    # Corte seco y golpe en "la venta se cae"
    poner(boom(3.5, 0.9), T_CAE, 1.0, pista="efectos")
    # Esperanza: Fa mayor con bombeo rítmico, palmas desde el recorrido
    prog_c = [[46, 53, 58, 62], [41, 53, 57, 60], [48, 52, 55, 60], [50, 53, 57, 62]]
    t, k = T_LLAVE, 0
    fin_esp = T_CIERRE - 2.4
    T_REC = t_esc("Recorrido")
    while t < fin_esp:
        d = min(8 * b, fin_esp - t + 0.2)
        crec = (t - T_LLAVE) / (fin_esp - T_LLAVE)
        ac = prog_c[k % 4]
        for j in range(int(d / (b / 2))):
            tt = t + j * b / 2
            poner(teclado([ac[1], ac[2], ac[3], ac[2]][j % 4], 0.7, 0.45 + 0.35 * crec), tt, 1.0, pan=-0.3 if j % 2 else 0.3, pista="arpegio")
        # acorde sostenido con pulso suave de volumen (sin ataques repetidos)
        sost = pad(ac, d + 0.6, ataque=0.3, rel=0.6, corte=1100 + 900 * crec)
        tt_ = np.arange(len(sost)) / SR
        sost *= 0.75 + 0.25 * np.cos(2 * np.pi * tt_ / (b / 2))
        poner(sost, t, 0.42 + 0.2 * crec, pista="acordes")
        poner(pad([ac[0] - 12], d, ataque=0.05, rel=0.2, corte=200), t, 0.55, pista="bajo")
        if t >= T_EQUIPO - 0.1:
            for j in range(int(d / b)):
                poner(bombo(0.5 + 0.3 * crec), t + j * b, 1.0, pista="bombo")
                poner(hat_suave(0.5 + 0.3 * crec), t + j * b + b / 2, 1.0, pan=0.3, pista="platillos")
                if t >= T_REC - 0.1 and j % 2 == 1:
                    poner(clap(0.25 + 0.1 * crec), t + j * b, 1.0, pista="palmas")
        t += 8 * b
        k += 1
    # Subida, silencio breve y drop
    poner(subida(2.4, tono=False), T_CIERRE - 2.4, 0.5, pista="efectos")
    for j in range(8):
        poner(clap(0.2 + 0.05 * j), T_CIERRE - 1.0 + j * 0.125, 1.0, pista="palmas")
    poner(boom(5.0, 1.0), T_CIERRE, 1.5, pista="efectos")
    poner(bombo(1.0), T_CIERRE, 1.2, pista="bombo")
    dur_final = TOTAL - T_CIERRE + 0.3
    poner(pad([29, 41, 48, 53, 57, 60, 65, 69, 72], dur_final, ataque=0.02, rel=4.0, corte=1900, brillo=-0.5), T_CIERRE, 2.0, pista="acordes")
    t = T_CIERRE
    j = 0
    while t < TOTAL - 3.0:
        poner(teclado([53, 57, 60, 65][j % 4], 0.7, 0.45 * (1 - (t - T_CIERRE) / dur_final)), t, 1.0, pan=-0.3 if j % 2 else 0.3, pista="arpegio")
        t += b / 2
        j += 1


import sys as _sys
EXPORTAR_PISTAS = "--pistas" in _sys.argv
ESTILO = next((a.split("=")[1] for a in _sys.argv if a.startswith("--estilo=")), "cine")
{"cine": comp_cine, "lujo": comp_lujo, "moderno": comp_moderno}[ESTILO]()

# ---------------------------------------------------------------- reverberación
nir = int(3.2 * SR)
tir = np.arange(nir) / SR
ir = np.stack([rng.standard_normal(nir), rng.standard_normal(nir)]) * np.exp(-tir / 0.85)
ir = np.stack([lp(ir[0], 5000), lp(ir[1], 5000)])
ir /= np.abs(ir).sum(axis=1, keepdims=True) ** 0.5 * 30
seco = mus.copy()
humedo = np.stack([fftconvolve(seco[c], ir[c])[:N] for c in range(2)])
mus = seco * 0.75 + humedo * 0.6
mus = np.stack([hp(mus[c], 28) for c in range(2)])

# fundido final
nf = int(2.5 * SR)
fin = int(TOTAL * SR)
mus[:, fin - nf : fin] *= np.linspace(1, 0, nf)
mus[:, fin:] = 0
# nivel por energía (RMS) y limitador suave, para que los golpes no aplasten el resto
activo = np.abs(mus).mean(axis=0) > 1e-4
rms = np.sqrt((mus[:, activo] ** 2).mean())
GANANCIA = 0.11 / (rms + 1e-9)
mus *= GANANCIA
mus = 0.92 * np.tanh(mus / 0.92)

if EXPORTAR_PISTAS:
    # Cada instrumento por separado, con la misma reverberación y nivel (para el reproductor de prueba)
    dir_p = RAIZ / "prueba-audio" / "pistas"
    dir_p.mkdir(parents=True, exist_ok=True)
    for nombre, x in PISTAS.items():
        x = x * 0.75 + np.stack([fftconvolve(x[c], ir[c])[:N] for c in range(2)]) * 0.6
        x = np.stack([hp(x[c], 35) for c in range(2)])
        x[:, fin - nf : fin] *= np.linspace(1, 0, nf)
        x[:, fin:] = 0
        x *= GANANCIA * 0.8
        tmp = dir_p / f"{nombre}.wav"
        wavfile.write(tmp, SR, (np.clip(x, -1, 1).T * 32767).astype(np.int16))
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(tmp), "-c:a", "libmp3lame", "-b:a", "160k",
                        str(dir_p / f"{nombre}.mp3")], check=True)
        tmp.unlink()
    print("Pistas:", ", ".join(PISTAS))

# ---------------------------------------------------------------- narración y "ducking"
voz = np.zeros(N)
for e in (tl["escenas"] if tl.get("conVoz") else []):
    for v in e["voces"]:
        sr, x = wavfile.read(RAIZ / "public" / v["archivo"])
        x = x.astype(np.float64) / 32768
        i = int((e["desde"] + v["inicio"]) / FPS * SR)
        x = x[: N - i]
        voz[i : i + len(x)] += x
act = (np.abs(voz) > 0.01).astype(float)
ventana = int(0.35 * SR)
act = np.convolve(act, np.ones(ventana) / ventana, mode="same")
act = np.clip(act * 4, 0, 1)
act = lp(act, 3)
duck = 1 - 0.6 * np.clip(act, 0, 1) if tl.get("conVoz") else np.ones(N)
mus_duck = mus * duck

mezcla = mus_duck + np.stack([voz, voz]) * 0.9
mezcla /= max(1.0, np.abs(mezcla).max() / 0.95)

dest = RAIZ / "public" / "audio"
sufijo = "" if ESTILO == "cine" else f"-{ESTILO}"
wavfile.write(dest / f"musica{sufijo}.wav", SR, (mus.T * 32767).astype(np.int16))
wavfile.write(dest / "mezcla-cruda.wav", SR, (mezcla.T * 32767).astype(np.int16))
subprocess.run(
    ["ffmpeg", "-loglevel", "error", "-y", "-i", str(dest / "mezcla-cruda.wav"),
     "-af", "highpass=f=35,treble=g=-3:f=7000,loudnorm=I=-15:TP=-1:LRA=11", "-ar", "48000", str(dest / f"mezcla{sufijo}.wav")], check=True)
(dest / "mezcla-cruda.wav").unlink()
print(f"[{ESTILO}] Música y mezcla listas ({TOTAL:.1f} s). Impacto en {T_CIERRE:.2f} s, golpe grave en {T_CAE:.2f} s")

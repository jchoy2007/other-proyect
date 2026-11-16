interface Entrada<T> {
  valor: T;
  expira: number;
}

export class CacheTTL<T> {
  private mapa = new Map<string, Entrada<T>>();
  constructor(private ttlMs: number) {}

  obtener(clave: string): T | undefined {
    const e = this.mapa.get(clave);
    if (!e) return undefined;
    if (Date.now() > e.expira) {
      this.mapa.delete(clave);
      return undefined;
    }
    return e.valor;
  }

  guardar(clave: string, valor: T): void {
    this.mapa.set(clave, { valor, expira: Date.now() + this.ttlMs });
    if (this.mapa.size > 500) {
      const primera = this.mapa.keys().next().value;
      if (primera !== undefined) this.mapa.delete(primera);
    }
  }

  borrar(clave: string): void {
    this.mapa.delete(clave);
  }
}

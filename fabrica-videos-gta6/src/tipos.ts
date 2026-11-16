export interface Tendencia {
  consulta: string;
  fuente: string;
  pais?: string;
  puntuacion: number;
}

export interface Escena {
  /** Lo que dice la voz en off (1-3 frases) */
  voz: string;
  /** Texto grande en pantalla (máx. 6 palabras) */
  textoPantalla: string;
  /** Palabras clave para elegir el clip/imagen de fondo (coinciden con nombres de archivo en media/) */
  claveVisual: string;
}

export interface Guion {
  id: string;
  formato: 'short' | 'largo';
  titulo: string;
  descripcion: string;
  hashtags: string[];
  gancho: string;
  escenas: Escena[];
  /** Tendencias que lo motivaron */
  basadoEn: string[];
  /** Fuentes consultadas por el modelo (URLs) para no inventar datos */
  fuentes: string[];
}

export interface Produccion {
  guion: Guion;
  audio?: string;
  subtitulos?: string;
  video?: string;
  youtubeId?: string;
  tiktokPublishId?: string;
  errores: string[];
}

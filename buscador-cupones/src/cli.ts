import 'dotenv/config';
import { buscarCupones } from './motor.js';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const titulo = args.find((a) => a.startsWith('--titulo='))?.slice(9);
const json = args.includes('--json');

if (!url) {
  console.error('Uso: npm run buscar -- <enlace del producto> [--titulo="nombre del producto"] [--json]');
  process.exit(1);
}

const ETIQUETA: Record<string, string> = {
  codigo: 'CÓDIGO', cupon: 'CUPÓN', oferta: 'OFERTA', truco: 'TRUCO', historial: 'PRECIOS', cashback: 'CASHBACK',
};

buscarCupones(url, { titulo })
  .then((r) => {
    if (json) {
      console.log(JSON.stringify(r, null, 2));
      return;
    }
    const p = r.producto;
    console.log(`\nProducto: ${p.titulo ?? '(título desconocido)'}`);
    console.log(`Tienda: ${p.tienda}${p.id ? `  ID: ${p.id}` : ''}${p.precio ? `  Precio: ${p.precio} ${p.moneda ?? ''}` : ''}`);
    console.log(`URL limpia: ${p.url}\n`);
    for (const a of r.avisos) console.log(`AVISO: ${a}`);
    if (r.avisos.length) console.log('');
    for (const o of r.ofertas) {
      const cod = o.codigo ? `  [${o.codigo}]` : o.pistaCodigo ? `  [código termina en ${o.pistaCodigo}]` : '';
      console.log(`${ETIQUETA[o.tipo].padEnd(9)} ${o.relevancia.toString().padStart(3)}%  ${o.titulo}${cod}`);
      console.log(`${''.padEnd(15)}${o.fuente} · ${o.url}`);
    }
    console.log('\nFuentes:');
    for (const f of r.fuentes) console.log(`  ${f.estado.padEnd(9)} ${f.nombre.padEnd(22)} ${f.ofertas} resultados, ${f.ms} ms${f.detalle ? ` — ${f.detalle}` : ''}`);
  })
  .catch((e) => {
    console.error('Error:', e instanceof Error ? e.message : e);
    process.exit(1);
  });

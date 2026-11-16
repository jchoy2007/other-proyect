import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsearProducto, dominioTienda } from './url.js';
import { extraerCodigos, extraerPrecio, palabrasClave, relevancia } from './texto.js';

test('Amazon: ASIN y URL limpia desde enlace con afiliado', () => {
  const p = parsearProducto('https://www.amazon.com/Logitech-G502-HERO-High-Performance-Wired/dp/B07GBZ4Q68/ref=sr_1_3?tag=afiliado-20&keywords=mouse');
  assert.equal(p.tienda, 'amazon');
  assert.equal(p.id, 'B07GBZ4Q68');
  assert.equal(p.url, 'https://www.amazon.com/dp/B07GBZ4Q68');
  assert.equal(dominioTienda(p), 'amazon.com');
});

test('Amazon México y gp/product', () => {
  const p = parsearProducto('amazon.com.mx/gp/product/B0CHX3QBCH?th=1&psc=1');
  assert.equal(p.mercado, 'com.mx');
  assert.equal(p.url, 'https://www.amazon.com.mx/dp/B0CHX3QBCH');
});

test('Newegg: item number', () => {
  const p = parsearProducto('https://www.newegg.com/msi-geforce-rtx-4070-ventus-2x-e-12g-oc/p/N82E16814137790?Item=N82E16814137790&utm_medium=x');
  assert.equal(p.tienda, 'newegg');
  assert.equal(p.id, 'N82E16814137790');
  assert.equal(p.url, 'https://www.newegg.com/p/N82E16814137790');
});

test('Best Buy, Walmart y eBay', () => {
  assert.equal(parsearProducto('https://www.bestbuy.com/site/sony-ps5/6566040.p?skuId=6566040').id, '6566040');
  assert.equal(parsearProducto('https://www.walmart.com/ip/Nintendo-Switch/1234567890').id, '1234567890');
  assert.equal(parsearProducto('https://www.ebay.com/itm/123456789012?hash=abc').id, '123456789012');
});

test('URL dentro de texto pegado', () => {
  const p = parsearProducto('mira esto https://www.amazon.com/dp/B07GBZ4Q68, está barato');
  assert.equal(p.id, 'B07GBZ4Q68');
});

test('extraer códigos y precios de texto libre', () => {
  assert.deepEqual(extraerCodigos('Save $20 w/ code SAVE20 at checkout. Use coupon ABC-123. code 20 no vale'), ['SAVE20', 'ABC-123']);
  assert.equal(extraerPrecio('MSI RTX 4070 $549.99 + free shipping'), 549.99);
  assert.equal(extraerPrecio('Precio 1.299,99 €'), 1299.99);
});

test('palabras clave y relevancia', () => {
  const claves = palabrasClave('MSI GeForce RTX 4070 Ventus 2X E 12G OC Graphics Card');
  assert.ok(claves.includes('msi') && claves.includes('rtx') && claves.includes('4070'));
  assert.equal(relevancia('cualquier cosa B07GBZ4Q68', [], 'B07GBZ4Q68'), 100);
  assert.ok(relevancia('MSI RTX 4070 Ventus on sale', claves) > 40);
  assert.equal(relevancia('Apple iPhone case', claves), 0);
});

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';
import { searchAddress } from '../src/addressSearch.js';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
after(() => vite.close());
const { default: DeliveryMap } = await vite.ssrLoadModule('/src/DeliveryMap.jsx');
const {translate, localized} = await vite.ssrLoadModule('/src/i18n.js');
const {SECTIONS, PRODUCTS} = await vite.ssrLoadModule('/src/menu.js');

for (const [name, location, expected] of [
  ['no location', null, 'Manzil belgilanmagan'],
  ['saved location', {lat: 41.3, lng: 69.2}, '41.30000'],
  ['invalid saved location', {lat: 'bad', lng: 69.2}, 'Manzil belgilanmagan'],
]) {
  test(`delivery map renders with ${name}`, () => {
    const html = renderToString(React.createElement(DeliveryMap, {location, onChange: () => {}}));
    assert.match(html, new RegExp(expected));
    assert.match(html, /Yetkazib berish manzili/);
  });
}

const {sendOrder, navigationLinks} = await vite.ssrLoadModule('/src/orderApi.js');
test('sends delivery coordinates and address details to configured backend', async () => {
  const order = {delivery: {location: {lat: 41.3, lng: 69.2}, apartment: '12', entrance: '2', floor: '3', comment: 'Eshik kodi'}};
  let request;
  const result = await sendOrder(order, '/api/orders', async (url, options) => {
    request = {url, ...options};
    return {ok: true, json: async () => ({id: '123'})};
  });
  assert.equal(request.url, '/api/orders');
  assert.deepEqual(JSON.parse(request.body), order);
  assert.deepEqual(result, {demo: false, id: '123'});
  assert.equal(navigationLinks(order.delivery.location).yandex, 'https://yandex.ru/maps/?pt=69.2,41.3&z=16');
  assert.match(navigationLinks(order.delivery.location).google, /destination=41.3,69.2/);
});
test('does not report success when backend fails or returns no acknowledgement', async () => {
  const order = {delivery: {location: {lat: 41.3, lng: 69.2}}};
  await assert.rejects(sendOrder(order, '/api/orders', async () => ({ok: false})));
  await assert.rejects(sendOrder(order, '/api/orders', async () => ({ok: true, json: async () => ({})})));
  await assert.rejects(sendOrder({delivery: {}}, '/api/orders', async () => {throw new Error('should not call');}), /xaritada/);
});

test('searches Uzbekistan addresses in the selected language only on explicit request', async () => {
  let url;
  const places = await searchAddress('  Amir Temur  ', {language: 'en', fetchImpl: async value => {url = value; return {ok:true,json:async()=>[{place_id:1,display_name:'Toshkent',lat:'41.3',lon:'69.2'},{place_id:2,display_name:'Invalid',lat:'no',lon:'69'}]};}});
  assert.equal(new URL(url).searchParams.get('q'), 'Amir Temur');
  assert.equal(new URL(url).searchParams.get('countrycodes'), 'uz');
  assert.equal(new URL(url).searchParams.get('accept-language'), 'en');
  assert.deepEqual(places, [{id:'1',name:'Toshkent',lat:41.3,lng:69.2}]);
});
test('renders delivery map labels in English', () => {
  const html = renderToString(React.createElement(DeliveryMap, {location: null, onChange: () => {}, lang: 'en'}));
  assert.match(html, /Delivery address/);
  assert.match(html, /No address selected/);
  assert.match(html, /Search for an address/);
});

test('English translations are available for menu content and all supported languages', () => {
  assert.equal(translate('uz', 'Barchasi', 'Все'), 'Barchasi');
  assert.equal(translate('ru', 'Barchasi', 'Все'), 'Все');
  assert.equal(translate('en', 'Barchasi', 'Все'), 'All');
  assert.equal(localized({uz: 'Taom', ru: 'Блюдо', en: 'Dish'}, 'en'), 'Dish');
  for (const section of SECTIONS) {
    assert.ok(section.title.en && section.short.en);
  }
  for (const product of PRODUCTS) {
    assert.ok(product.name.en && product.name.en !== product.name.uz, `English product name for ${product.id}`);
    assert.ok(product.portion.en && product.portion.en !== product.portion.uz, `English portion for ${product.id}`);
    assert.ok(product.variants.every(option => option.label.en && option.label.en !== option.label.uz), `English variants for ${product.id}`);
    if (product.desc) assert.ok(product.desc.en && product.desc.en !== product.desc.uz, `English description for ${product.id}`);
  }
});

test('handles address search failures', async () => {
  await assert.rejects(searchAddress('Toshkent', {fetchImpl:async()=>({ok:false})}));
});

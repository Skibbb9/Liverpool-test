const { test, expect } = require('@playwright/test');

test.setTimeout(90000);

function obtenerPrecio(texto) {
  var t = texto.trim();
  var pos = t.indexOf('$', 1);
  var precio = pos === -1 ? t : t.slice(0, pos);
  return precio.slice(0, -2) + '.' + precio.slice(-2);
}

test('Reto Liverpool', async ({ page }) => {
  var respuestasAPI = [];

  page.on('response', async (res) => {
    var link = res.url();
    if (link.includes('/search') || link.includes('/plp')) {
      try {
        var json = await res.json();
        if (json) respuestasAPI.push(json);
      } catch (e) {}
    }
  });

  await page.goto('https://www.liverpool.com.mx/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Cerrar anuncio inicial si estorba
  var cookies = page.locator('#onetrust-close-btn-container, button:has-text("Aceptar")').first();
  if (await cookies.isVisible().catch(() => false)) {
    await cookies.click().catch(() => {});
  }

  // Buscar
  try {
    var buscador = page.locator('#mainSearchbar, [data-testid$="header-search-input"]').first();
    await buscador.waitFor({ state: 'visible', timeout: 10000 });
    await buscador.click();
    await buscador.fill('playstation 5');
    await buscador.press('Enter');
    await page.waitForURL(/(\?s=|\/tienda\/s)/i, { timeout: 10000 });
  } catch (err) {
    // Si truena la barra de busqueda por los scripts, entramos directo
    await page.goto('https://www.liverpool.com.mx/tienda?s=playstation+5', { waitUntil: 'domcontentloaded' });
  }

  var productos = page.locator('[data-testid$="-card"], .m-product__card');
  await productos.first().waitFor({ state: 'visible', timeout: 15000 });

  // Click en color blanco
  var blanco = page.getByText(/^Blanco\(\d+\)$/).first();
  await blanco.waitFor({ state: 'visible', timeout: 10000 });
  await blanco.click();
  await page.waitForTimeout(3000);

  // Ordenar
  var drop = page.locator('button:has-text("Ordenar por"), [role="button"]:has-text("Ordenar por")').first();
  await drop.waitFor({ state: 'visible', timeout: 15000 });
  await drop.click();

  var cambioUrl = page.waitForResponse(
    r => (r.url().includes('/search') || r.url().includes('/plp')) && r.status() === 200,
    { timeout: 15000 }
  ).catch(() => null);

  await page.getByRole('option', { name: /menor precio/i }).click();
  await cambioUrl;
  await page.waitForTimeout(2000);

  // Sacar datos de la pantalla
  var total = await productos.count();
  if (total > 5) total = 5;
  
  var delaUI = [];
  for (var i = 0; i < total; i++) {
    var card = productos.nth(i);
    var nombre = await card.locator('h3, .a-card__description').innerText();
    var precioRaw = await card.locator('[data-testid$="-price"], .a-card__paragraphDiscountPrice').innerText();
    
    delaUI.push({
      name: nombre.trim(),
      price: obtenerPrecio(precioRaw)
    });
  }

  console.table(delaUI);

  // Procesar lo que llego de la API
  var ultimaRes = respuestasAPI[respuestasAPI.length - 1];
  var deLaAPI = [];
  
  if (ultimaRes) {
    var lista = ultimaRes.products || ultimaRes.plpResults?.records || [];
    for (var j = 0; j < lista.length; j++) {
      var item = lista[j];
      var precioFinal = '';
      if (item.variants && item.variants[0] && item.variants[0].prices) {
        precioFinal = item.variants[0].prices.salePrice;
      } else {
        precioFinal = item.promoPrice || item.minimumPromoPrice || '';
      }
      
      deLaAPI.push({
        name: item.title || item.recordTitle || '',
        price: precioFinal ? '$' + Number(precioFinal).toFixed(2) : ''
      });
    }
  }

  // Validar
  var validos = 0;
  for (var k = 0; k < delaUI.length; k++) {
    var ui = delaUI[k];
    
    // Buscar coincidencia limpia
    var match = null;
    for (var m = 0; m < deLaAPI.length; m++) {
      if (deLaAPI[m].name.toLowerCase().replace(/\s+/g, ' ').trim() === ui.name.toLowerCase().replace(/\s+/g, ' ').trim()) {
        match = deLaAPI[m];
        break;
      }
    }

    if (match) {
      validos++;
      var p1 = Number(match.price.replace(/[^0-9.]/g, ''));
      var p2 = Number(ui.price.replace(/[^0-9.]/g, ''));
      if (p1 !== p2) {
        console.log('Alerta: Precio diferente en ' + ui.name);
      }
    }
  }

  expect(validos).toBeGreaterThanOrEqual(3);
});
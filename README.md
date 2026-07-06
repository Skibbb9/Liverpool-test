# Liverpool - Automatización E2E con Playwright


Test automatizado del flujo de búsqueda de PlayStation 5 en Liverpool, hecho con Playwright y Node.js. El test busca el producto, filtra por color blanco, ordena por menor precio, extrae los primeros 5 resultados y valida los datos de la UI contra la respuesta de red que consume la página.

## Requisitos

- Node.js 18 o superior
- Google Chrome instalado (el test corre sobre Chrome real)

## Instalación

```bash
npm install
npx playwright install chrome
```

## Cómo correr los tests

Por defecto corre en modo headless:

```bash
npx playwright test
```

Para verlo en modo headed, con el navegador visible:

```bash
npx playwright test --headed
```

## Ver el reporte

Después de correr los tests se genera un reporte HTML

```bash
npx playwright show-report
```

Las capturas de pantalla en caso de fallo se generan solas. Están configuradas en playwright.config.js, no dentro del test.



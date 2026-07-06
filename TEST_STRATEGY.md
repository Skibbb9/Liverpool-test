# Estrategia de pruebas

Este documento explica las decisiones detrás del test automatizado del flujo de búsqueda de PlayStation 5 en Liverpool.

## Qué no automaticé y por qué

No automaticé el proceso de compra ni el checkout. Ese flujo maneja datos sensibles,no aporta nada al objetivo de este ejercicio, que es la búsqueda y la validación de resultados.

Tampoco validé que todos los resultados fueran consolas PS5. En mi propia corrida, al ordenar por menor precio los primeros lugares los ocupan accesorios y controles, incluso de PS3, porque también hacen match con el término de búsqueda. 

Y no dejé precios fijos en el código. Cambian seguido, sobre todo en temporada de ofertas, así que dejarlos escritos a mano sería pedir que el test se rompa solo.

## Cómo manejaría un CAPTCHA en el flujo de búsqueda

No intentaría romperlo con servicios externos. Eso es frágil, va en contra del propósito del CAPTCHA y no es algo que quiera dentro de un pipeline.

Lo correcto es coordinar con el equipo dueño de la aplicación para correr las pruebas contra un ambiente de staging sin CAPTCHA, o pedir que el runner de CI entre por una lista blanca de IP o con un header de prueba. Así los tests corren en un ambiente controlado y estable.

Ya viví algo parecido con la detección de bots de Akamai en este mismo flujo. La reduzco usando Chrome real y desactivando la bandera que delata la automatizacion, pero eso es un parche, no la solución. La solución de fondo siempre es un ambiente de pruebas coordinado con el equipo.

## Riesgos de flakiness y cómo los mitigué

El mayor riesgo son las esperas mal hechas. En lugar de esperar por un tiempo fijo, espero por señales concretas de que la página ya cambio que la URL refleje el filtro, que las cards vuelvan a estar visibles después de filtrar u ordenar. Así el test no depende de que la página cargue en un tiempo exacto.

Otro riesgo real que me toco fue el boton de ordenar. Liverpool tiene una versión para móvil y otra para escritorio, y la de móvil queda oculta en pantalla ancha. Mi test agarraba la oculta y se quedaba esperando algo que nunca se mostraba. Lo resolví apuntando siempre al control que de verdad está visible en el viewport.



Y está la detección de bots, que ya mencioné. La bajo usando Chrome real con la bandera de automatización desactivada.

## Qué cambiaría para un CI con 50+ suites

Ahora mismo, para pasar la detección de Akamai, corro con un truco de Xvfb y Chrome en modo headed. En un pipeline compartido eso es lento y pesado. Buscaría correr headless de verdad contra un ambiente de staging sin detección de bots.

Aislaría este test para que su inestabilidad no afecte al resto. Lo pondría en su propio job con reintentos limitados, de modo que si falla no tumbe las otras suites.

Correría contra un ambiente de pruebas dedicado, no contra producción, para no depender del catálogo real ni de las promociones del momento.

Y cuidaría el tiempo total, quitar esperas fijas, ajustar los timeouts a lo justo, correr en paralelo con sharding y subir como artefactos solo el reporte y las capturas de los fallos, para no llenar el almacenamiento.
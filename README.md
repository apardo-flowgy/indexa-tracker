# Indexa Capital Laboratory

Aplicacion web estatica para analizar la evolucion historica de Indexa Capital y comparar dos tesis distintas:

- invertir en fondos de inversion;
- invertir en Indexa Capital como empresa.

## Enfoque

La web trabaja sin backend y sirve los datos desde `public/data`. Toda la logica de comparacion y proyeccion vive en el navegador.

## Vistas incluidas

- `Historico`: AUM, aportaciones, ARR, comision y rentabilidad generada.
- `Comparador`: simulacion configurable entre fondos e Indexa Capital.
- `Proyecciones`: motor de escenarios con clientes, AUM, fee, margen y multiple.

## Desarrollo

```bash
npm install
npm run dev
```

## Actualizar datos de Indexa

```bash
npm run update-data
```

Este comando descarga y sobrescribe los CSV usados por la app en `public/data`:

- `indexa_stats_volume.csv`
- `indexa_stats_revenue.csv`

## Build estatico

```bash
npm run build
```

El resultado queda en `dist/` y se puede publicar en GitHub Pages o Cloudflare Pages.

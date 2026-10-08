# FleetCommand — Vehicle Fleet Management Dashboard

A professional dark operations dashboard built with React, Vite, Material UI, MUI DataGrid, Recharts, React Router and localStorage.

## Run

```bash
npm install
npm run dev
```

## Included

- Dashboard with live derived statistics and Recharts visualizations
- Vehicle, driver, assignment, fuel, maintenance and mileage CRUD pages
- Search, edit and delete records through MUI DataGrid
- Reports with print and CSV export
- Persistent frontend data using browser localStorage
- Responsive desktop/tablet/mobile layout
- Seeded mock data matching the assignment scale

## Reset demo data

Open browser DevTools and run:

```js
localStorage.removeItem('fleet-data')
location.reload()
```

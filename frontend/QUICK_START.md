# Quick Start - 3D Map Setup

## Get Your Map Running in 3 Commands!

### 1. Get Free Mapbox Token
Visit: **https://account.mapbox.com/** (no credit card needed)
- Sign up free
- Copy your "Default public token" (starts with `pk.`)

### 2. Add Token
```bash
cd /home/humfurie/Desktop/Projects/Cordova/frontend
echo "NEXT_PUBLIC_MAPBOX_TOKEN=pk.YOUR_TOKEN_HERE" > .env.local
```
*(Replace `pk.YOUR_TOKEN_HERE` with your actual token)*

### 3. Run
```bash
npm run dev
```

### 4. View
Open: **http://localhost:3000**

That's it! You now have a 3D map of Cordova, Cebu.

---

## What You'll See

- **Home Page (/)**: Toggle between "3D Map" and "List" views
- **3D Map Page (/map)**: Full-screen dedicated 3D map view

## Features

✅ 3D terrain and buildings
✅ Satellite imagery
✅ Locked to Cordova, Cebu
✅ Cannot zoom out beyond city
✅ Can zoom in to street level
✅ Free (50,000 loads/month)

## Need More Help?

See `MAPBOX_SETUP.md` for detailed instructions and troubleshooting.

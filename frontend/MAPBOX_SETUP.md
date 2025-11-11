# Mapbox Setup Guide - FREE TIER

## Is Mapbox Free?

**YES!** Mapbox offers a generous free tier:
- ✅ **50,000 map loads per month** (completely free)
- ✅ **No credit card required** for signup
- ✅ Unlimited requests within the 50,000 load limit
- ✅ Access to all features including 3D terrain and buildings
- ✅ Perfect for development and small-to-medium projects

## Quick Setup (5 minutes)

### Step 1: Create Free Account
1. Go to **https://account.mapbox.com/**
2. Click "Sign up" (no credit card needed)
3. Fill in your email and create a password
4. Verify your email

### Step 2: Get Your Token
1. After logging in, you'll see your dashboard
2. Look for **"Default public token"** on the page
3. It starts with `pk.` (example: `pk.eyJ1Ijoi...`)
4. Click the **copy icon** to copy your token

### Step 3: Add Token to Your Project
1. Open your terminal in the `frontend` directory:
   ```bash
   cd /home/humfurie/Desktop/Projects/Cordova/frontend
   ```

2. Create a `.env.local` file:
   ```bash
   echo "NEXT_PUBLIC_MAPBOX_TOKEN=pk.YOUR_ACTUAL_TOKEN_HERE" > .env.local
   ```

   **OR** manually create the file with:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.YOUR_ACTUAL_TOKEN_HERE
   ```

3. Replace `pk.YOUR_ACTUAL_TOKEN_HERE` with your actual token

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: View Your 3D Map!
Open your browser to:
```
http://localhost:3000
```

The 3D map should now appear on the home page!

## What You Get

### On Root Page (localhost:3000)
- **3D Map** of Cordova, Cebu in the "3D Map" view
- Toggle between "3D Map" and "List" views
- Interactive satellite imagery with 3D terrain
- 3D buildings at zoom level 15+
- Locked to Cordova municipality boundaries
- Cannot zoom out beyond the city

### Features
- ✨ **3D Terrain** - See elevation and topography
- 🏢 **3D Buildings** - Extruded building models
- 🛰️ **Satellite Imagery** - Real satellite photos
- 🗺️ **Street Labels** - Clear place names
- 🔒 **Geo-locked** - Cannot pan outside Cordova
- 🚫 **Zoom Limit** - Cannot zoom out past level 13
- ✅ **Free Zoom In** - Zoom in to level 20

## Troubleshooting

### Map not showing?
1. **Check token is correct:**
   ```bash
   cat .env.local
   ```
   Should show: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token...`

2. **Restart dev server:**
   ```bash
   # Press Ctrl+C to stop, then:
   npm run dev
   ```

3. **Clear browser cache:**
   - Chrome: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
   - Firefox: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Token not working?
1. Make sure token starts with `pk.`
2. No spaces before or after the token
3. No quotes around the token in `.env.local`
4. Token is on Mapbox website under "Access tokens"

### Still seeing setup message?
1. Check file is named `.env.local` (with the dot!)
2. File is in the `frontend` directory (not root)
3. No typos in `NEXT_PUBLIC_MAPBOX_TOKEN`
4. Dev server was restarted after creating file

## File Locations

```
/home/humfurie/Desktop/Projects/Cordova/
├── frontend/
│   ├── .env.local                          ← CREATE THIS FILE
│   ├── .env.local.example                  ← Example template
│   ├── src/
│   │   ├── app/
│   │   │   └── page.tsx                    ← Home page with 3D map
│   │   └── components/
│   │       └── Map/
│   │           └── CordovaMap3D.tsx        ← 3D Map component
│   └── package.json
```

## Environment Variable Format

Your `.env.local` file should look exactly like this:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Important:**
- No spaces around the `=`
- No quotes (unless your token has spaces, which it shouldn't)
- File must be named `.env.local` exactly
- Must be in the `frontend` directory

## Checking Usage

To check how many map loads you've used:
1. Go to https://account.mapbox.com/
2. Look at your dashboard
3. See "Usage this month"

You get **50,000 free loads per month**. Each page load counts as one load.

## Security

- ✅ `.env.local` is already in `.gitignore` - won't be committed
- ✅ Public tokens (starting with `pk.`) are safe to use in browser
- ✅ They can only load maps, not modify your account
- ✅ You can restrict token to specific URLs in Mapbox dashboard

## Need Help?

- **Mapbox Docs**: https://docs.mapbox.com/
- **Support**: https://support.mapbox.com/
- **Pricing**: https://www.mapbox.com/pricing (Free tier is plenty!)

## Example Token (DO NOT USE)

This is what a token looks like (this is NOT a real token):
```
pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxx-xxxxxxxxx
```

Yours will be different and much longer!

---

**That's it!** Once you add your token and restart, you'll have a fully functional 3D map of Cordova, Cebu on your home page.

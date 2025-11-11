# Testing Zoom Out Prevention

## How to Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the map:**
   Open http://localhost:3000/map in your browser

3. **Test zoom out prevention:**

   ### Method 1: Mouse Wheel
   - Try scrolling DOWN (away from you) to zoom out
   - The map should STOP at zoom level 13
   - You should NOT be able to see areas outside Cordova municipality

   ### Method 2: Zoom Controls
   - Use the minus (-) button on the navigation control
   - It should stop working at zoom level 13

   ### Method 3: Pinch Gesture (mobile/trackpad)
   - Try pinching to zoom out
   - Should stop at zoom level 13

4. **Test zoom in (should work):**
   - Scroll UP (towards you) - should zoom in freely
   - Use the plus (+) button - should work
   - Pinch out gesture - should work
   - Should be able to zoom all the way to level 20

5. **Test panning boundaries:**
   - Try dragging the map in all directions
   - You should NOT be able to pan outside Cordova's boundaries:
     - Can't go north past Lapu-Lapu border
     - Can't go west past Mactan Channel
     - Can't go east past Hilutangan Channel
     - Can't go south past Cebu Strait

## Expected Behavior

✅ **Zoom IN**: Works freely (levels 13-20)
❌ **Zoom OUT**: Blocked at level 13
❌ **Pan outside**: Blocked at Cordova boundaries

## What You Should See at Minimum Zoom (13)

At zoom level 13, you should see:
- The entire Cordova municipality
- Part of Lapu-Lapu City to the north
- Mactan Channel to the west
- Some of the surrounding waters
- But NOT much beyond Cordova's immediate area

## Troubleshooting

If zoom out is NOT prevented:
1. Check browser console for errors
2. Verify Mapbox token is set in `.env.local`
3. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
4. Check that you're using the latest code

## Technical Details

The zoom prevention is implemented using:
1. Mapbox's `minZoom` property (set to 13)
2. Custom wheel event handler to intercept scroll zoom out
3. Zoom event listeners to enforce the minimum
4. The `maxBounds` property restricts panning to Cordova area

Coordinates:
- Southwest: 123.9150°E, 10.2200°N
- Northeast: 123.9750°E, 10.2800°N
- Center: 123.9450°E, 10.2500°N

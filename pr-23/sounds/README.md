# Spinning Sound Effect

Place a spinning/slot machine sound effect file here named `spin.mp3`.

The audio should be:
- Loopable (seamless loop)
- Short duration (1-3 seconds)
- Volume: moderate (the app sets it to 30% volume)
- Format: MP3

## Quick Setup

### Option 1: Download a Free Sound
You can find free spinning/slot machine sound effects from:

1. **Mixkit** (No attribution required): https://mixkit.co/free-sound-effects/casino/
   - Download any slot machine spin sound
   - Rename to `spin.mp3`
   - Place in this folder

2. **Freesound** (May require attribution): https://freesound.org/
   - Search for "slot machine spin" or "reel spin"
   - Download your favorite
   - Rename to `spin.mp3`

3. **Pixabay** (No attribution required): https://pixabay.com/sound-effects/search/slot%20machine/

### Option 2: Use YouTube-DL or Online Converter
1. Find a slot machine spinning sound on YouTube
2. Use an online MP3 converter or youtube-dl
3. Cut to 1-3 seconds loop
4. Save as `spin.mp3`

## File Location
The file should be at: `public/sounds/spin.mp3`

## Testing
After adding the file:
1. Refresh the browser
2. Open console (F12)
3. Look for "Audio loaded successfully" message
4. Enable debug mode: `localStorage.setItem('debug_mode', 'true')`
5. Click the Debug Spin button
6. You should hear the spinning sound!

## Automatic Fallback

**Good news!** Even if you don't add a `spin.mp3` file, the app will automatically generate a spinning sound effect using Web Audio API.

However, for the best experience, we recommend adding a proper slot machine sound effect as described above.

## Troubleshooting
- **No sound?** Check browser console for these messages:
  - ✅ "Audio file loaded successfully" - MP3 is working
  - 🔊 "Playing Web Audio API fallback sound" - Using generated sound
  - ❌ "Spin audio file not found" - MP3 missing, fallback activated

- **"Audio play blocked"?** Browser autoplay policy - the sound will play after user interaction (clicking debug/spin button)
- **Want better sound?** Download a proper MP3 file and replace the fallback

## Console Messages

When you start spinning, check the browser console (F12) for:
- `✅ Audio file loaded successfully` - Your MP3 file is working
- `🔊 Playing MP3 audio` - MP3 is playing
- `❌ Spin audio file not found at /sounds/spin.mp3` - MP3 missing, using fallback
- `🔊 Playing Web Audio API fallback sound` - Generated sound is playing

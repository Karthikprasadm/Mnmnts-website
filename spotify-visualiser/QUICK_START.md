# Quick Start: Local Audio Visualiser

The Spotify API integration has been removed. The visualiser now plays **local audio files** that you provide.

## 🚀 3-Step Setup

### Step 1: Add Your Audio Files

1. Place your audio files in:

   ```text
   spotify-visualiser/public/audio/
   ```

2. Open `spotify-visualiser/src/components/MusicPlayer.tsx` and update the `playlist` array so each track points to the correct file:

   ```ts
   const playlist = [
     {
       id: 1,
       title: "My Track",
       artist: "Me",
       duration: "3:15",
       cover: `${BASE_URL}covers/my-track.jpg`,
       src: `${BASE_URL}audio/my-track.mp3`,
       hasLyrics: true,
     },
     // ...
   ]
   ```

### Step 2: Install Dependencies

```bash
cd spotify-visualiser
npm install
```

### Step 3: Run the Visualiser

```bash
npm run dev
```

Then open the URL printed in the terminal (by default: `http://localhost:5173/spotify-visualiser/`).

## ✅ Verify It's Working

- You should see the 3D gallery with covers loading from `public/covers/`.
- The audio player controls (**Play / Pause / Next / Previous / Volume**) should control your local audio files.
- No login or API keys are required.

## 📖 Notes

- Supported audio formats depend on the browser (MP3/OGG/WEBM are generally safe).
- If you change the file names or add more tracks, remember to update the `playlist` array.

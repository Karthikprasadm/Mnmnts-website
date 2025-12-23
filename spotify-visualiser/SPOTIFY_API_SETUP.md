> **Note:** The Spotify API integration has been removed.  
> The visualiser now plays **locally hosted audio files** only and no longer connects to Spotify.

# Spotify API Setup (Legacy – No Longer Used)

This document is kept for historical reference. The current version of the project **does not require any Spotify credentials** and does not make requests to the Spotify Web API.

If you ever decide to re‑enable Spotify support in the future, you can refer back to this file and the git history to restore the previous implementation. For now:

- You do **not** need a Spotify Developer account.
- You do **not** need `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`.
- The `api/spotify/*` endpoints are no longer used by the front‑end.

To configure audio for the visualiser now:

1. Place your audio files in `spotify-visualiser/public/audio/`.
2. Open `spotify-visualiser/src/components/MusicPlayer.tsx`.
3. Update the `playlist` array so each track’s `src` field points to your own audio file, for example:

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

4. Run the visualiser as usual:

   ```bash
   cd spotify-visualiser
   npm install
   npm run dev
   ```

The player will now load and play your local audio files directly via the browser’s `<audio>` element – no external API keys or OAuth required.

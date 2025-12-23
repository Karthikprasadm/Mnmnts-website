Place your audio files for the visualiser here.

The React player in src/components/MusicPlayer.tsx expects the following default filenames:

- die-with-a-smile.mp3
- the-fate-of-ophelia.mp3
- espresso.mp3
- beautiful-things.mp3
- loose-controls.mp3
- good-luck-babe.mp3

You can either:
- Rename your audio files to match these names, or
- Update the `src` field in the `playlist` array in MusicPlayer.tsx to point to your own paths.

Supported formats depend on the browser (MP3/OGG/WEBM are generally safe). 


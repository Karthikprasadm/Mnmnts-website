# Gallery Videos Data

This folder contains the gallery video data file that controls which videos and their thumbnails are displayed on the homepage.

## File Structure

- `videos-data.json` - Contains all video data for the gallery (served via `/api/videos-data`)

## How to Edit Videos

Edit `videos-data.json` to add, remove, or modify videos.

### Video Structure

Each video object has:
- `id` - Unique identifier (number)
- `video` - Video file URL (MP4 format recommended)
- `thumbnail` - Thumbnail image URL for the video
- `alt` - Alt text for accessibility

## Example

```json
{
  "videos": [
    {
      "id": 1,
      "video": "https://example.com/video.mp4",
      "thumbnail": "https://example.com/video-thumbnail.jpg",
      "alt": "Video description"
    }
  ]
}
```

## Notes

- Both `video` and `thumbnail` URLs are editable
- The thumbnail is shown before the video plays
- Make sure all URLs are accessible and valid
- The first video in the array will be set as the default video
- Supported video formats: MP4 (recommended), WebM, OGG


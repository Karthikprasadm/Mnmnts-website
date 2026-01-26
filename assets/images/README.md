# Gallery Images Data

This folder contains the gallery image data file that controls which images and thumbnails are displayed on the homepage.

**Note:** Videos are stored separately in `assets/videos/videos-data.json`

## File Structure

- `gallery-data.json` - Contains all image data for the gallery (served via `/api/gallery-data`)

## How to Edit Images

Edit `gallery-data.json` to add, remove, or modify images.

### Image Structure

Each image object has:
- `id` - Unique identifier (number)
- `image` - Full-size image URL
- `thumbnail` - Thumbnail image URL (can be the same as `image` or a smaller version)
- `alt` - Alt text for accessibility

### Default Image

The `defaultImage` object is shown when the page first loads.

## Example

```json
{
  "images": [
    {
      "id": 1,
      "image": "https://example.com/full-image.jpg",
      "thumbnail": "https://example.com/thumbnail.jpg",
      "alt": "Description of image"
    }
  ],
  "defaultImage": {
    "image": "https://example.com/default.jpg",
    "thumbnail": "https://example.com/default-thumb.jpg",
    "alt": "Default image description"
  }
}
```

## Notes

- Both `image` and `thumbnail` URLs are editable
- You can use the same URL for both if you don't have separate thumbnails
- Make sure all URLs are accessible and valid
- The first image in the array will be marked as active by default
- Videos are managed separately in `assets/videos/videos-data.json`


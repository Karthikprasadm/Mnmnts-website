# Local Development Setup

Quick guide for running the project locally.

## 🚀 Quick Start

### Step 1: Configure ImageKit (Optional - Only needed for image uploads)

If you want to use the image upload feature, create a `.env` file in the **root directory** (same level as `server.js`):

```env
IMAGEKIT_PUBLIC_KEY=your-public-key
IMAGEKIT_PRIVATE_KEY=your-private-key
IMAGEKIT_URL_ENDPOINT=your-url-endpoint
```

**Get credentials from**: https://imagekit.io/dashboard

> **Note:** The Spotify API proxy has been removed. The visualiser now uses only local audio files and does not require any backend API.

### Step 2: Start Backend Server (Optional - Only needed for image uploads)

If you're using image uploads, start the backend server in the **root directory**:

```bash
npm start
```

Or for auto-reload during development:

```bash
npm run dev
```

Server will run on: `http://localhost:3000`

### Step 3: Run the Visualiser (Standalone)

The visualiser runs independently and doesn't require the backend:

```bash
cd spotify-visualiser
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173/spotify-visualiser/`

## ✅ Verify Setup

### Test Backend Endpoint (ImageKit only)

If you're using image uploads, test the signature endpoint:

```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/signature" -Method GET

# Or use curl (if available)
curl http://localhost:3000/api/signature
```

You should see a response with signature data.

### Test Visualiser

1. Open `http://localhost:5173/spotify-visualiser/`
2. Open browser DevTools (F12)
3. Check Console tab - should see no errors
4. Album covers should load from local `public/covers/` directory
5. Audio player should work with local audio files

## 🔧 Configuration

### Backend (server.js) - Optional
- **Port**: 3000 (default)
- **Endpoints**:
  - `GET /api/signature` - ImageKit upload signature (for image upload page)

### Visualiser (Vite)
- **Port**: 5173 (default)
- **Base Path**: `/spotify-visualiser/`
- **No backend required** - Uses only local assets

## 🐛 Troubleshooting

### "ImageKit credentials not configured"
- Only needed if using image upload feature
- Verify `.env` file exists in root directory
- Check variable names: `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
- Restart server after adding/changing `.env`

### "Connection refused" or "Backend not available"
- Backend is only needed for image uploads
- Visualiser runs standalone without backend
- If using image uploads, make sure backend server is running (`npm start`)

### Port Already in Use

**Backend (port 3000):**
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Visualiser (port 5173):**
- Vite will automatically try the next available port
- Or change in `spotify-visualiser/vite.config.js`:
  ```js
  server: {
    port: 5174, // or any other port
  }
  ```

## 📝 Development Workflow

1. **Visualiser (Standalone)**:
   - `cd spotify-visualiser`
   - `npm run dev`
   - Changes hot-reload automatically

2. **Backend (Optional - Image uploads only)**:
   - `npm start` (root directory)
   - Backend changes require server restart

3. **Test**: Open browser and check console for errors

## 🔗 URLs

- **Backend API** (optional): http://localhost:3000/api
- **Signature Endpoint** (optional): http://localhost:3000/api/signature
- **Visualiser**: http://localhost:5173/spotify-visualiser/

## 📚 Next Steps

- See `spotify-visualiser/QUICK_START.md` for visualiser setup
- See `SECURITY.md` for security best practices
- Offline/PWA is optional. See `SERVICE_WORKER_GUIDE.md` if you enable it.

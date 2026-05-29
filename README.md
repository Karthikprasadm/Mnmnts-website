# Museum Of Moments

A minimalist, interactive web experience designed as a digital museum of personal or imagined moments in time. This project combines storytelling, aesthetic visuals, and smooth transitions to showcase "moments" as if they were constellations in a galaxy. It's both a creative portfolio and an artistic playground for exploring time & memory.

## 🌌 Features

### Core Features
- **Gallery** of curated images and videos with dynamic loading
- **Smooth transitions** and interactive thumbnails
- **Slideshow mode** with automatic image rotation
- **Direct uploads** to ImageKit with secure backend signature
- **Upload progress bar** and feedback
- **Responsive, modern UI** with dark theme and glassmorphism design
- **Unified Navigation** - Consistent navbar component (Menu-new) across all pages with CSS Grid overlay system
- **Hover Expansion** - Menu button hover reveals navigation links (Gallery, About, Upload, Visualizer, Repository)
- **Size Consistency** - Navbar maintains size using CSS Grid overlay (no layout shifts)
- **Page-Specific Behavior** - Gallery expands to 380px when options shown; Upload/About fixed at 300px
- **Social links** integration with unified icon system
- **Resume viewer** with in-page PDF modal
- **Repository (Archive)** with GitHub project tiles and detail pages
- **Project edit mode** with password-protected updates stored in Supabase
- **Spotify visualizer** powered by Spotify Streaming Mode (OAuth, Web API, and Web Playback SDK)

### Advanced Features
- **Service Worker (legacy/disabled by default)** - Previously offered offline support, background sync, and caching; not registered now.
- **Loading Skeletons** - Beautiful loading states for images
- **Preloading** - Critical resources preloaded for faster performance
- **Print Stylesheet** - Optimized printing experience
- **JSON-LD Structured Data** - SEO optimization with Schema.org markup
- **PWA Support** - Progressive Web App capabilities

## 🚀 Live Demo

**Website**: [https://karthikprasadm.github.io](https://karthikprasadm.github.io)  
**Vercel Preview**: [https://karthikprasadm-github-io-jdbj.vercel.app](https://karthikprasadm-github-io-jdbj.vercel.app)
**Robots**: `/robots.txt`

## 📸 How It Works

- **Browse:** View a collection of moments as images and videos with smooth transitions
- **Explore:** Click thumbnails to view media in detail, or use slideshow mode
- **Upload:** (If enabled) Upload your own media directly from the browser, securely via ImageKit
- **Offline:** (Legacy SW, currently disabled) Previously cached content after first visit

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Media Hosting:** [ImageKit.io](https://imagekit.io/)
- **Backend:** Express server + API routes
- **Database:** Supabase (project edits)
- **Hosting:** GitHub Pages + Vercel
- **PWA:** (Legacy) Service Worker & Web App Manifest; SW not registered by default

## 🏗️ Project Structure

```
├── api/                          # API routes (ImageKit, Spotify)
│   ├── signature.js              # ImageKit signature endpoint
│   └── spotify/                  # Spotify token + proxy
├── assets/
│   ├── images/                   # Gallery image data (JSON)
│   │   └── gallery-data.json
│   ├── videos/                   # Gallery video data (JSON)
│   │   └── videos-data.json
│   ├── scripts/                  # JavaScript files
│   │   ├── script.js            # Main gallery script (includes "view more" link)
│   │   ├── sw-utils.js          # Service worker utilities
│   │   ├── error-handler.js     # Error handling utilities
│   │   ├── logger.js            # Logging utilities
│   │   ├── global-error-handler.js # Global error boundary
│   │   └── tooltips.js          # Tooltip initialization
│   ├── styles/                   # Stylesheets
│   │   ├── galaxy.css           # Main styles
│   │   └── icons.css           # Unified icon system
│   ├── fonts/                    # Self-hosted fonts
│   ├── pdfjs/                    # PDF.js library
│   └── resume/                   # Resume PDF
├── ElasticGridScroll/            # Extended gallery view (linked from gallery)
├── Menu-new/                      # Unified navbar component (HTML/CSS/JS)
│   ├── index.html                 # Navbar demo page
│   ├── style.css                  # Navbar styles
│   ├── script.js                  # Navbar hover logic
│   └── icons/                     # Social media icons
├── gallery/                       # Main gallery page (homepage)
├── image-upload/                  # Upload page
├── know-me/                       # About page
├── spotify-visualiser/            # Audio visualiser project (Spotify API)
├── favicon/                       # Favicon files
├── 404_error/                     # Error page assets
├── Images_for_icon/               # Social media icons
├── icons8-baby-yoda-color-favicons/ # Resume button icons
├── manifest.json                  # PWA manifest
└── offline.html                   # Offline fallback page
```

## 🔒 Security

- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Service Worker (legacy/disabled)**: Previously handled background sync; not registered now
- **Upload Security**: ImageKit keys secured via backend signature endpoint
- **CORS Restricted**: Only allows requests from authorized origins

See [SECURITY.md](./SECURITY.md) and [README_SECURITY.md](./README_SECURITY.md) for detailed security documentation.

## 🎨 Design System

- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur
- **Color Palette**: Dark theme with accent colors (#ffb347)
- **Typography**: Montserrat (body) + Playfair Display (headings)
- **Spacing**: Consistent padding, margins, and gaps
- **Animations**: Smooth transitions (150-220ms ease-out)
- **Accessibility**: ARIA labels, keyboard navigation, focus indicators

### Design Tokens
```css
--hover-speed: 0.18s
--hover-ease: cubic-bezier(0.4, 0, 0.2, 1)
Background: rgba(30, 30, 30, 0.8)
Border: 1px solid rgba(255, 255, 255, 0.06)
Backdrop Filter: blur(18px)
Border Radius: 20-24px
```


## ⚡ Service Worker & Performance (legacy, currently disabled)

> Service worker registration is off by default. The details below are kept for historical reference.

### Offline Support
- Caches critical resources (optional)
- Works offline after first visit (optional)
- Custom offline fallback page
- Automatic cache updates when online

### Background Sync
- Queues form submissions when offline (when enabled)
- Persistent storage in IndexedDB
- Syncs when connection restored

### Preloading
- Critical CSS preloaded
- Web fonts preloaded (WOFF2)
- Critical JavaScript preloaded
- JSON data files preloaded

### Loading States
- Skeleton loaders for images
- Smooth fade transitions
- Glassmorphism design matching

See [SERVICE_WORKER_GUIDE.md](./SERVICE_WORKER_GUIDE.md) for detailed documentation.

## 🏗️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Karthikprasadm/Mnmnts-website.git
cd Mnmnts-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Access locally**
- Main site: `http://localhost:3000` (or your configured port)
- Spotify visualizer: `http://localhost:3000/spotify-visualiser/`
- Repository/Astro app: `http://localhost:4321`

### Spotify Visualizer Setup

1. Create a Spotify app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Use an app name such as `Mnmnts Visualiser` (avoid putting "Spotify" in the app name).
3. Add redirect URIs exactly matching the URLs you use:
```text
http://localhost:3000/spotify-visualiser/
http://127.0.0.1:3000/spotify-visualiser/
http://localhost:5173/spotify-visualiser/
http://127.0.0.1:5173/spotify-visualiser/
https://your-vercel-domain.vercel.app/spotify-visualiser/
```
4. Add local environment variables:
```env
# .env at project root
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
VITE_SPOTIFY_CLIENT_ID=your_client_id

# spotify-visualiser/.env
VITE_SPOTIFY_CLIENT_ID=your_client_id
```
5. Restart the dev server after changing env files.

Notes:
- `VITE_SPOTIFY_CLIENT_ID` is the same value as `SPOTIFY_CLIENT_ID`; it is exposed to the browser.
- `SPOTIFY_CLIENT_SECRET` must stay server-side only and must never be committed.
- Spotify Web Playback SDK playback requires a Spotify Premium account.
- Spotify development-mode apps only allow users added in the Spotify Dashboard.
- The visualizer does not host local song files; playback is handled by Spotify.

## 📝 Content Management

### Gallery Images
Edit `assets/images/gallery-data.json` (served via `/api/gallery-data`):
```json
{
  "images": [
    {
      "id": 1,
      "image": "https://...",
      "thumbnail": "https://...",
      "alt": "Description"
    }
  ],
  "defaultImage": { ... }
}
```

### Gallery Videos
Edit `assets/videos/videos-data.json` (served via `/api/videos-data`):
```json
{
  "videos": [
    {
      "id": 1,
      "video": "https://...",
      "thumbnail": "https://...",
      "alt": "Description"
    }
  ]
}
```

### Icons
All icons are centralized in `assets/styles/icons.css` and stored in `Images_for_icon/` folder.

## 🛡️ Technical Polish

### SEO
- ✅ Meta tags (description, keywords, author)
- ✅ Open Graph tags for social sharing
- ✅ JSON-LD structured data (Schema.org)
- ✅ Sitemap.xml
- ✅ Semantic HTML

### Accessibility
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ Color contrast compliance
- ✅ Screen reader support

### Performance
- ✅ Lazy loading for images
- ✅ Preloading critical resources
- ✅ Service worker caching
- ✅ Optimized images (ImageKit CDN)
- ✅ Minified assets where applicable

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints: 480px, 768px, 1024px
- ✅ Touch-friendly interactions
- ✅ Adaptive layouts

### Browser Support
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Progressive enhancement
- ✅ Fallbacks for older browsers

## 📚 Documentation

- **[Service Worker Guide](./SERVICE_WORKER_GUIDE.md)** - Offline support & caching
- **[Security Documentation](./SECURITY.md)** - Security measures and best practices
- **[Security Quick Reference](./README_SECURITY.md)** - Quick security overview

**Note**: 
- **Content is file-based**: Gallery and video data are loaded from JSON files.
- **Active API endpoints**:
  - `/api/signature` - ImageKit upload signature (used by image-upload page)
  - `/api/spotify/*` - Spotify auth + proxy for the visualizer
  - `/api/project-edits/*` - Project edit read/write (Supabase)

## 🔧 Configuration

### Environment Variables

#### Vercel (ImageKit Signature)
- `IMAGEKIT_PUBLIC_KEY` - ImageKit public key
- `IMAGEKIT_PRIVATE_KEY` - ImageKit private key
- `IMAGEKIT_URL_ENDPOINT` - ImageKit URL endpoint

#### Spotify API (Visualizer)
- `SPOTIFY_CLIENT_ID` - Spotify app Client ID for backend token exchange
- `SPOTIFY_CLIENT_SECRET` - Spotify app Client Secret for backend token exchange; keep private
- `VITE_SPOTIFY_CLIENT_ID` - Same Client ID exposed to the Vite frontend

#### Supabase (Project edits)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PROJECT_EDIT_PASSWORD`

## 🚀 Deployment

### GitHub Pages
1. Push to the deployment branch
2. GitHub Pages automatically deploys
3. Site available at `https://karthikprasadm.github.io`

### Vercel
1. Connect GitHub repository
2. Vercel auto-deploys on push
3. Add required environment variables in Vercel Project Settings
4. Add the Vercel production URL to Spotify redirect URIs
5. ImageKit signature endpoint available at `*.vercel.app/api/signature`

Required Spotify variables on Vercel:
```env
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
VITE_SPOTIFY_CLIENT_ID
```

Spotify production redirect URI example:
```text
https://your-vercel-domain.vercel.app/spotify-visualiser/
```

## 🧪 Testing

### Test Spotify Auth Locally
1. Confirm `.env` and `spotify-visualiser/.env` contain the Spotify variables.
2. Confirm the exact local URL is listed as a Spotify redirect URI.
3. Open `http://localhost:3000/spotify-visualiser/`.
4. Click "Connect with Spotify".
5. If Spotify reports `redirect_uri: Not matching configuration`, add the exact URL shown in the browser to Spotify Dashboard.

### Spotify Compliance Notes
- Use `Mnmnts Visualiser` or another non-Spotify app name.
- Streaming Mode shows Spotify attribution and links tracks back to Spotify.
- Spotify metadata is limited to 20 tracks and is not cached by the PWA runtime cache.
- Spotify artwork is displayed without cropping in Streaming Mode.
- The app does not include or serve local copies of Spotify audio.

### Test Offline Mode
1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Reload page
4. Verify offline page or cached content appears


## 📦 Dependencies

### Main Project
- `express` - Server framework (local dev)
- `imagekit` - ImageKit SDK
- `multer` - File upload handling
- `cors` - CORS middleware
- `dotenv` - Environment variables

## 🎯 Features Roadmap

- [x] Unified icon system
- [x] Unified navbar component (Menu-new) across all pages
- [x] CSS Grid overlay system for navbar (prevents size changes)
- [x] Print stylesheet
- [x] JSON-LD structured data
- [x] Service worker offline support
- [x] Background sync
- [x] Preloading critical resources
- [x] Loading skeletons
- [ ] RESTful API (planned for future)
- [ ] Dark/Light theme toggle
- [ ] Search functionality
- [ ] Advanced filtering
- [ ] Blog/articles section
- [ ] Timeline view

## 🤝 Contributing

This is a personal portfolio project. Contributions are welcome, but please note:

- All content is personal and curated
- Security is a priority
- Design consistency is important

## 📄 License

All Rights Reserved.

Copyright (c) 2025 [Karthik Prasad M (Karthikprasadm)]

This code and all associated files are the exclusive intellectual property of Karthik Prasad M. No person, entity, or organization other than the copyright holder is permitted to use, copy, reproduce, distribute, modify, publish, or access any part of this codebase, in whole or in part, in any form or by any means, without explicit, prior written permission from the copyright holder.

This project is proprietary and confidential. Unauthorized use is strictly prohibited and may result in legal action.

For permission requests, contact: [wingspawn28@gmail.com](mailto:wingspawn28@gmail.com)

---

© 2025 Museum Of Moments. All rights reserved.

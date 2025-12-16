# Museum Of Moments

A minimalist, interactive web experience designed as a digital museum of personal or imagined moments in time. This project combines storytelling, aesthetic visuals, and smooth transitions to showcase "moments" as if they were constellations in a galaxy. It's both a creative portfolio and an artistic playground for exploring time & memory.

## 🌌 Features
- **Gallery** of curated images and videos
- **Smooth transitions** and interactive thumbnails
- **Direct uploads** to ImageKit with secure backend signature
- **Upload progress bar** and feedback (configurable)
- **Responsive, modern UI** with dark theme
- **Social links** for sharing and connection

## 🚀 Live Demo
[https://karthikprasadm-github-io-jdbj.vercel.app](https://karthikprasadm-github-io-jdbj.vercel.app)

## 📸 How It Works
- **Browse:** View a collection of moments as images and videos.
- **Upload:** (If enabled) Upload your own media directly from the browser, securely via ImageKit.
- **Explore:** Click thumbnails to view media in detail, or switch between images and videos.

## 🛠️ Tech Stack
- **Frontend:** HTML, CSS, JavaScript
- **Media Hosting:** [ImageKit.io](https://imagekit.io/)
- **Backend (for uploads):** Vercel serverless function for secure signature generation
- **Hosting:** GitHub Pages + Vercel

## 🏗️ Local Development
1) Clone and install:
```
npm install
```
2) Run dev server:
```
npm run dev
```
3) Build / preview static output if needed:
```
npm run build
```
Note: stop existing dev servers before starting another to avoid port conflicts.

## 📝 Project Structure
- `gallery/index.html` – Main gallery page
- `know-me/about.html` – “Know me” page
- `archive/archive.html` – Archive page
- `image-upload/upload.html` – Upload page
- `project-detail/` – Project detail HTML/CSS/JS
- `assets/styles/` – Shared styles (galaxy.css, styles.css)
- `assets/fonts/` – Self-hosted fonts + fonts.css
- `assets/scripts/` – Shared scripts (script.js)
- `assets/pdfjs/` – PDF.js assets
- `assets/resume/` – Resume PDF
- `favicon/` – Icons/manifests
- `api/signature.js` – Vercel serverless function for ImageKit upload signature

## 🔒 Security
- Uploads use a backend signature endpoint to keep ImageKit keys safe
- CORS configured to allow only trusted origins

## 🎨 Design System (current direction)
- **Glass & material:** background `rgba(30,30,30,0.8)`, border `1px solid rgba(255,255,255,0.06)`, `backdrop-filter: blur(16–20px)`, radius `20–24px`, no heavy glow.
- **Navigation:** Navbar + menu button on one row; dropdown items compact with slight translate/opacity hover and 40px min hit targets.
- **Motion:** Micro-interactions 150–220ms ease-out; modals 300–400ms; avoid translateY > 6px; focus-visible mirrors hover.
- **Accessibility:** Meaningful `aria-label`s, visible focus (`:focus-visible`), sufficient contrast.

## ✨ Customization Ideas
- Add more gallery layouts or a timeline mode
- Enable public uploads with moderation
- Add admin features for managing media
- Integrate analytics or SEO enhancements

## 🖼️ Favicon & Device Support
- Multi-device favicon support: iOS, Android, Windows, desktop browsers, and PWA.
- All favicon and icon files are in the `favicon/` folder and referenced in the HTML head for maximum compatibility.
- Root `/favicon.ico` is present for universal browser support.
- If favicon does not appear, try a hard refresh or clear browser cache.

## 🛡️ Technical Polish
- **SEO optimized**: meta tags, Open Graph, sitemap.xml
- **Accessibility**: ARIA labels, keyboard navigation, color contrast
- **Performance**: Lazy loading for images, smooth scrolling
- **Responsive**: Works on all devices and screen sizes
- **Modern favicon setup**: All platforms and PWA supported

## 🔧 Known Issues / Backlog
- `archive.js`: Artwork/photo modal should reuse the existing image instead of blanking `img.src` and calling non-existent edit hooks.
- `archive.js`: User-added project thumbnails should either be registered with the lazy loader or set `img.src` immediately to avoid blank cards until reload.

## 📄 License
All Rights Reserved.

Copyright (c) 2025 [Karthik Prasad M (Karthikprasadm)]

This code and all associated files are the exclusive intellectual property of Karthik Prasad M. No person, entity, or organization other than the copyright holder is permitted to use, copy, reproduce, distribute, modify, publish, or access any part of this codebase, in whole or in part, in any form or by any means, without explicit, prior written permission from the copyright holder.

This project is proprietary and confidential. Unauthorized use is strictly prohibited and may result in legal action.

For permission requests, contact: [wingspawn28@gmail.com]

---

© 2025 Museum Of Moments. All rights reserved.

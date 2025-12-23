# Implementation Analysis & Issues

This document identifies inconsistencies, missing work, and architectural issues in the current implementation.

## 🔴 1. Critical Inconsistencies / Contradictions

### Issue 1.1: Endpoint Path Mismatch
**Location**: `spotify.ts` vs `api/spotify/index.js`

**Problem**:
- Frontend calls: `spotifyRequest("/browse/new-releases?limit=30")` (no `/v1/` prefix)
- Backend validates: `if (!endpoint.startsWith('/v1/'))` (requires `/v1/` prefix)
- **Result**: All API requests will fail with "Invalid endpoint" error

**Files**:
- `spotify-visualiser/src/spotify.ts:110` - calls without `/v1/`
- `api/spotify/index.js:74` - validates `/v1/` prefix

**Fix Required**: 
- Either prepend `/v1/` in `spotifyRequest()` function
- Or remove `/v1/` validation in backend

### Issue 1.2: Unused Constant
**Location**: `spotify.ts:6`

**Problem**:
- `SPOTIFY_API_BASE = "https://api.spotify.com/v1"` is defined but never used
- All requests go through backend proxy, so direct API base is irrelevant

**✅ FIXED**: Removed unused `SPOTIFY_API_BASE` constant

### Issue 1.3: Token Retry Logic Flaw
**Location**: `spotify.ts:75-93`

**Problem**:
- On 401 error, code clears frontend token cache but retries the **same request**
- Backend proxy has its own token cache that may also be expired
- Retry doesn't actually refresh the token - just retries with potentially same expired token

**✅ FIXED**: Token retry now calls `getAccessToken()` to refresh token before retrying (line 77-95)

### Issue 1.4: Duplicate Token Caching
**Location**: Frontend (`spotify.ts`) and Backend (`api/spotify/index.js`)

**Problem**:
- Frontend caches token: `accessToken`, `tokenExpiry`
- Backend also caches token: `tokenCache.token`, `tokenCache.expiresAt`
- Two separate caches can get out of sync
- Frontend cache is unnecessary since backend handles token management

**Fix Required**: Remove frontend token cache, always fetch from backend

## ⚠️ 2. Missing Work / Partial Implementations

### Issue 2.1: Spotify Search Not Integrated
**Location**: `MusicPlayer.tsx` search functionality

**Problem**:
- `searchTracks()` function exists in `spotify.ts:135`
- MusicPlayer has search UI (`searchQuery` state, search input)
- But search only filters **local playlist**, doesn't use Spotify API
- Search should query Spotify API for real tracks

**Missing**: Integration of `searchTracks()` into MusicPlayer search handler

### Issue 2.2: API Functions Not Used
**Location**: `spotify.ts` exports

**Problem**:
- `searchTracks()` - exported but never called
- `getTrack()` - exported but never called  
- `getAlbum()` - exported but never called
- `getArtistTopTracks()` - exported but never called
- Only `get30NewReleaseCovers()` is actually used (in `planes.ts`)

**Missing**: Actual usage of these functions in the UI

### Issue 2.3: Music Player Not Connected to Spotify
**Location**: `MusicPlayer.tsx`

**Problem**:
- Music player has full UI (play, pause, queue, lyrics, etc.)
- But uses **hardcoded local playlist** (`playlist` array)
- No connection to Spotify API data
- No actual audio playback (just UI state)

**Missing**: 
- Integration with Spotify Web Playback SDK
- Dynamic playlist from Spotify API
- Real audio playback

### Issue 2.4: Error Handling Gaps
**Location**: Multiple files

**Problems**:
- `spotifyRequest()` catches errors but doesn't distinguish network vs API errors
- `get30NewReleaseCovers()` returns empty array on error (silent failure)
- No user-facing error messages when Spotify API fails
- No retry logic for network failures

**Missing**: Comprehensive error handling and user feedback

### Issue 2.5: Production Configuration Missing
**Location**: `vite.config.js` proxy

**Problem**:
- Vite proxy only works in development (`server.proxy`)
- In production build, proxy doesn't exist
- Frontend will try to call `/api/spotify/token` which won't exist on GitHub Pages
- No production backend URL configuration

**Missing**: Production API base URL configuration

## 🏗️ 3. Architectural Red Flags

### Issue 3.1: Code Path That May Never Run
**Location**: `spotify.ts:75-93` (401 retry)

**Problem**:
- 401 retry logic clears frontend cache but doesn't refresh token
- Backend proxy has its own cache that handles token refresh
- If backend cache is expired, retry will still fail
- This code path may never successfully recover

**Risk**: Retry logic is ineffective

**✅ FIXED**: Retry now calls `getAccessToken()` to refresh token before retrying

### Issue 3.2: Circular Dependency Risk
**Location**: Token refresh flow

**Problem**:
- Frontend calls backend for token
- Backend caches token
- If backend cache expires, frontend retry calls backend again
- But if backend has error, frontend can't recover
- No fallback mechanism

**Risk**: Cascading failures with no recovery

### Issue 3.3: Missing Disposal/Cleanup
**Location**: `main.ts`, `canvas.ts`

**Problem**:
- `main.ts` has `stop()` method but it's never called
- `canvas.ts` has event listeners but no cleanup on unmount
- `planes.ts` has `window.addEventListener("wheel")` but no removal
- Memory leaks possible on page navigation

**Risk**: Memory leaks in long-running sessions

### Issue 3.4: React Memoization May Be Ineffective
**Location**: `MusicPlayer.tsx`

**Problem**:
- `useMemo` for `currentTrack` and `filteredPlaylist`
- But `playlist` array is recreated on every render (not memoized)
- `filteredPlaylist` depends on `playlist` which changes reference
- Memoization may not prevent re-renders

**Risk**: Unnecessary re-renders despite memoization

## 🔍 4. Things Likely Forgotten

### Issue 4.1: Production Backend URL
**Missing**: Environment variable or config for production API base URL
- Development: `http://localhost:3000`
- Production: Should be Vercel/Netlify URL
- No configuration for this

### Issue 4.2: API Error User Feedback
**Missing**: UI components to show Spotify API errors to users
- When API fails, user sees nothing (silent failure)
- Should show error message or retry button

### Issue 4.3: Loading States
**Missing**: Loading indicators for Spotify API calls
- `get30NewReleaseCovers()` is async but no loading state
- User doesn't know when covers are being fetched

### Issue 4.4: Rate Limiting Handling
**Missing**: Handling for Spotify API rate limits
- No retry with exponential backoff
- No user notification of rate limits
- No request throttling

### Issue 4.5: Token Refresh on Page Load
**Missing**: Token validation/refresh on initial page load
- Token might be expired when user opens page
- Should check token validity on mount

### Issue 4.6: Search Integration
**Missing**: Connection between search UI and Spotify API
- Search bar exists but doesn't call `searchTracks()`
- Should search Spotify and update playlist dynamically

### Issue 4.7: Playlist Sync
**Missing**: Sync between Spotify API data and music player
- Visualizer loads covers from Spotify
- But music player uses hardcoded playlist
- Should use same data source

## 📊 5. Strict "Diff Gaps" Analysis

### Gap 5.1: Endpoint Path Construction
**Issue**: Frontend doesn't prepend `/v1/` but backend requires it
- Frontend: `spotifyRequest("/browse/new-releases")`
- Backend expects: `/v1/browse/new-releases`
- **Gap**: Missing `/v1/` prefix in frontend calls
- **✅ FIXED**: Added normalization in `spotifyRequest()` function

### Gap 5.2: Token Management Strategy
**Issue**: Two token caches (frontend + backend) but no coordination
- Frontend cache: `accessToken`, `tokenExpiry`
- Backend cache: `tokenCache.token`, `tokenCache.expiresAt`
- **Gap**: No synchronization between caches

### Gap 5.3: Error Response Format
**Issue**: Inconsistent error response handling
- Backend returns: `{ success: false, error: "message" }`
- Frontend expects: `error.error || error.message`
- But also checks: `data.success || data.data?.access_token`
- **Gap**: Error format assumptions may not match

### Gap 5.4: Production vs Development (RESOLVED BY REMOVAL)
Original issue: Development proxy worked, production didn’t because `/api/spotify/*` didn’t exist in the static build.

Current state:
- The visualiser no longer calls `/api/spotify/*` and does not depend on any backend proxy.
- All covers and audio come from local assets under `spotify-visualiser/public/`.
- Production vs development differences for Spotify are no longer relevant.

### Gap 5.5: Documentation vs Implementation (UPDATED)
Original issue: Docs described OAuth and advanced Spotify flows that weren’t actually implemented.

Current state:
- Spotify integration has been removed.
- `SPOTIFY_API_SETUP.md` and `QUICK_START.md` have been updated to clearly mark Spotify as **legacy** and to explain the new local‑audio setup instead.
- All current docs now match the implementation: a self‑contained visualiser using local images + audio.

## 🎯 Priority Fixes (Updated)

Since Spotify integration has been removed, the previous Spotify‑related action items are no longer applicable. Remaining priorities for this project now focus on local UX and maintainability:

### High Priority (User Experience)
1. **Add error feedback** – Continue improving user‑visible errors for missing audio files or images.
2. **Add loading states** – Ensure the 3D gallery and player show clear loading indicators on slow networks.

### Medium Priority (Code Quality)
3. **Ensure playlist stability** – Keep the `playlist` definition in one place and avoid recreating arrays unnecessarily.
4. **Add cleanup handlers** – Confirm all global event listeners (scroll, resize, pointer) are removed on teardown.

### Low Priority (Future Enhancements)
5. **Support dynamic playlists** – Optionally load track metadata from a JSON file instead of hard‑coding in `MusicPlayer.tsx`.
6. **Optional remote sources** – If needed later, add a generic module for pulling images/audio from a CDN (not tied to Spotify).

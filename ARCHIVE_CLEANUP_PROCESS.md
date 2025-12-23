# Archive Directory Cleanup Process

This document describes the process for cleaning and managing the `archive/` build output directory.

## Overview

The `archive/` directory contains the build output from `ArchiveUpdated/`. It should be cleaned before new builds to ensure no stale files remain.

## Cleanup Methods

### Method 1: Automated Clean Build (Recommended)

Use the `-Clean` flag with the build script:

```bash
cd ArchiveUpdated
npm run build:archive:clean
```

Or with PowerShell:

```powershell
.\build-archive.ps1 -Clean
```

This will:
1. Clean `ArchiveUpdated/dist/` directory
2. Clean `archive/` output directory (removes all contents except .git)
3. Build ArchiveUpdated/ project
4. Copy fresh output to `archive/` directory

### Method 2: Manual Cleanup

If you need to manually clean the archive/ directory:

```powershell
# Navigate to root directory
cd D:\Karthikprasadm.github.io

# Remove all contents except .git
Get-ChildItem -Path "archive" -Exclude ".git" | Remove-Item -Recurse -Force
```

**Warning:** Be careful not to delete the `.git` directory if it exists in `archive/`.

### Method 3: Selective Cleanup

To clean specific items only:

```powershell
# Remove specific directories
Remove-Item -Path "archive/_astro" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "archive/favicon" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "archive/images" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "archive/icons" -Recurse -Force -ErrorAction SilentlyContinue

# Remove archive.html
Remove-Item -Path "archive/archive.html" -Force -ErrorAction SilentlyContinue

# Remove artist pages (example)
Get-ChildItem -Path "archive" -Directory | Where-Object { $_.Name -match "^[a-z-]+$" } | Remove-Item -Recurse -Force
```

## When to Clean

### Always Clean Before:
- Major updates to ArchiveUpdated/ source
- After changing Astro configuration
- When switching between different archive versions
- When build output seems incorrect or stale

### Optional Clean:
- Minor content updates (new artist/album)
- Small bug fixes
- The build script will overwrite files anyway

## Verification After Cleanup

After cleaning and rebuilding, verify the output:

```bash
cd ArchiveUpdated
npm run verify
```

This checks:
- All paths use `/archive/` prefix
- Critical files exist (archive.html, _astro/, favicon/, images/)
- No incorrect path patterns
- Sitemap and robots.txt are correct

## Rollback Process

If a build fails or produces incorrect output:

1. **Check Git History:**
   ```bash
   git log archive/archive.html
   ```

2. **Restore Previous Version:**
   ```bash
   git checkout HEAD~1 -- archive/
   ```

3. **Or Restore Specific File:**
   ```bash
   git checkout HEAD~1 -- archive/archive.html
   ```

## Best Practices

1. **Always verify** after cleaning and building
2. **Commit before cleaning** if you want to preserve current state
3. **Use automated clean build** (`build:archive:clean`) for consistency
4. **Test locally** before pushing to production
5. **Keep git history** - commit archive/ changes so you can rollback

## Troubleshooting

### Problem: Archive directory not found
**Solution:** The build script will create it automatically. Or create manually:
```powershell
New-Item -ItemType Directory -Path "archive" -Force
```

### Problem: Permission denied when cleaning
**Solution:** 
- Close any programs using files in archive/
- Run PowerShell as Administrator
- Check file permissions

### Problem: Git conflicts after cleanup
**Solution:**
- Archive/ directory should be committed to git
- If conflicts occur, resolve manually or restore from git

---

**Last Updated:** After ArchiveUpdated/ build script creation  
**Maintained By:** Project maintainer

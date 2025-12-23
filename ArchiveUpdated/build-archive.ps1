# ArchiveUpdated Build Script
# Automates the build and copy process from ArchiveUpdated/dist/ to archive/ directory

param(
    [switch]$Clean = $false,
    [switch]$Verify = $false
)

$ErrorActionPreference = "Stop"
$archiveUpdatedDir = $PSScriptRoot
$distDir = Join-Path $archiveUpdatedDir "dist"
$archiveOutputDir = Join-Path (Split-Path $archiveUpdatedDir -Parent) "archive"

Write-Host "=== ArchiveUpdated Build Script ===" -ForegroundColor Cyan
Write-Host "Source: $archiveUpdatedDir" -ForegroundColor Gray
Write-Host "Output: $archiveOutputDir" -ForegroundColor Gray

# Step 1: Clean dist directory if requested
if ($Clean) {
    Write-Host "`n[1/8] Cleaning dist directory..." -ForegroundColor Yellow
    if (Test-Path $distDir) {
        Remove-Item $distDir -Recurse -Force
        Write-Host "   [OK] Dist directory cleaned" -ForegroundColor Green
    }
    
    # Also clean archive output directory if requested
    Write-Host "`n[1/8] Cleaning archive output directory..." -ForegroundColor Yellow
    if (Test-Path $archiveOutputDir) {
        # Remove contents but keep directory structure
        Get-ChildItem -Path $archiveOutputDir -Exclude ".git" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   [OK] Archive output directory cleaned" -ForegroundColor Green
    } else {
        # Create archive directory if it doesn't exist
        New-Item -ItemType Directory -Path $archiveOutputDir -Force | Out-Null
        Write-Host "   [OK] Created archive output directory" -ForegroundColor Green
    }
}

# Step 2: Build Astro project
Write-Host "`n[2/8] Building Astro project..." -ForegroundColor Yellow
Push-Location $archiveUpdatedDir
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERROR] Build failed!" -ForegroundColor Red
        Write-Host $buildOutput
        exit 1
    }
    Write-Host "   [OK] Build completed successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

# Step 3: Verify dist directory exists
Write-Host "`n[3/8] Verifying build output..." -ForegroundColor Yellow
if (-not (Test-Path $distDir)) {
    Write-Host "   [ERROR] dist/ directory not found after build!" -ForegroundColor Red
    exit 1
}

$indexSource = Join-Path $distDir "index.html"
if (-not (Test-Path $indexSource)) {
    Write-Host "   [ERROR] index.html not found in dist!" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Build output verified" -ForegroundColor Green

# Step 4: Copy index.html to archive/archive.html
Write-Host "`n[4/8] Copying main index to archive/archive.html..." -ForegroundColor Yellow
$archiveDest = Join-Path $archiveOutputDir "archive.html"

# Ensure archive directory exists
if (-not (Test-Path $archiveOutputDir)) {
    New-Item -ItemType Directory -Path $archiveOutputDir -Force | Out-Null
}

Copy-Item $indexSource -Destination $archiveDest -Force
Write-Host "   [OK] archive.html created" -ForegroundColor Green

# Step 5: Copy assets and subdirectories
Write-Host "`n[5/8] Copying assets and subdirectories..." -ForegroundColor Yellow
$itemsToCopy = @(
    "_astro",
    "favicon",
    "images",
    "icons",
    "playersclub-og.jpg"
)

foreach ($item in $itemsToCopy) {
    $source = Join-Path $distDir $item
    $dest = Join-Path $archiveOutputDir $item
    
    if (Test-Path $source) {
        if (Test-Path $dest) {
            Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
        }
        Copy-Item $source -Destination $dest -Recurse -Force
        Write-Host "   [OK] Copied $item" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] $item not found in dist (may be optional)" -ForegroundColor Yellow
    }
}

# Copy all subdirectories (artist pages, etc.)
Get-ChildItem -Path $distDir -Directory | Where-Object { 
    $_.Name -notin @("_astro", "favicon", "images", "icons") 
} | ForEach-Object {
    $source = $_.FullName
    $dest = Join-Path $archiveOutputDir $_.Name
    
    if (Test-Path $dest) {
        Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item $source -Destination $dest -Recurse -Force
    Write-Host "   [OK] Copied directory $($_.Name)" -ForegroundColor Green
}

# Step 6: Copy sitemap and robots.txt
Write-Host "`n[6/8] Copying sitemap and robots.txt..." -ForegroundColor Yellow
$sitemapFiles = Get-ChildItem -Path $distDir -Filter "sitemap*.xml" -ErrorAction SilentlyContinue
foreach ($file in $sitemapFiles) {
    Copy-Item $file.FullName -Destination $archiveOutputDir -Force
    Write-Host "   [OK] Copied $($file.Name)" -ForegroundColor Green
}

$robotsSource = Join-Path $distDir "robots.txt"
if (Test-Path $robotsSource) {
    Copy-Item $robotsSource -Destination $archiveOutputDir -Force
    Write-Host "   [OK] Copied robots.txt" -ForegroundColor Green
}

# Step 7: Verify critical files exist in archive/
Write-Host "`n[7/8] Verifying archive output..." -ForegroundColor Yellow
$criticalFiles = @(
    "archive.html",
    "_astro"
)

$allPresent = $true
foreach ($file in $criticalFiles) {
    $path = Join-Path $archiveOutputDir $file
    if (-not (Test-Path $path)) {
        Write-Host "   [ERROR] Missing critical file: $file" -ForegroundColor Red
        $allPresent = $false
    }
}

if (-not $allPresent) {
    Write-Host "   [ERROR] Verification failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] All critical files present" -ForegroundColor Green

# Step 8: Cleanup dist directory (optional, keep for debugging)
Write-Host "`n[8/8] Build process complete" -ForegroundColor Yellow
Write-Host "   [INFO] dist/ directory kept for reference" -ForegroundColor Gray
Write-Host "   [INFO] Run with -Clean to remove dist/ after build" -ForegroundColor Gray

# Verification step
if ($Verify) {
    Write-Host "`n[VERIFY] Running path verification..." -ForegroundColor Yellow
    $verifyScript = Join-Path $archiveUpdatedDir "verify-paths.ps1"
    if (Test-Path $verifyScript) {
        & $verifyScript
    } else {
        Write-Host "   [WARN] verify-paths.ps1 not found, skipping verification" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host "Archive is ready at: archive/archive.html" -ForegroundColor Green
Write-Host "Output directory: $archiveOutputDir" -ForegroundColor Gray

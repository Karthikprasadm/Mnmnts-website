# Archive Build Script
# Automates the build, copy, and path update process for the archive

param(
    [switch]$Clean = $false,
    [switch]$Verify = $false
)

$ErrorActionPreference = "Stop"
$archiveDir = $PSScriptRoot
$distDir = Join-Path $archiveDir "dist"

Write-Host "=== Archive Build Script ===" -ForegroundColor Cyan

# Step 1: Clean dist directory if requested
if ($Clean) {
    Write-Host "`n[1/7] Cleaning dist directory..." -ForegroundColor Yellow
    if (Test-Path $distDir) {
        Remove-Item $distDir -Recurse -Force
        Write-Host "   [OK] Dist directory cleaned" -ForegroundColor Green
    }
}

# Step 2: Build Astro project
Write-Host "`n[2/7] Building Astro project..." -ForegroundColor Yellow
Push-Location $archiveDir
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

# Step 3: Copy index.html to archive.html
Write-Host "`n[3/7] Copying main index to archive.html..." -ForegroundColor Yellow
$indexSource = Join-Path $distDir "index.html"
$archiveDest = Join-Path $archiveDir "archive.html"

if (-not (Test-Path $indexSource)) {
    Write-Host "   [ERROR] index.html not found in dist!" -ForegroundColor Red
    exit 1
}

Copy-Item $indexSource -Destination $archiveDest -Force
Write-Host "   [OK] archive.html created" -ForegroundColor Green

# Step 4: Copy assets and subdirectories
Write-Host "`n[4/7] Copying assets and subdirectories..." -ForegroundColor Yellow
$itemsToCopy = @(
    "_astro",
    "favicon",
    "images",
    "icons",
    "playersclub-og.jpg"
)

foreach ($item in $itemsToCopy) {
    $source = Join-Path $distDir $item
    $dest = Join-Path $archiveDir $item
    
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
    $dest = Join-Path $archiveDir $_.Name
    
    if (Test-Path $dest) {
        Remove-Item $dest -Recurse -Force -ErrorAction SilentlyContinue
    }
    Copy-Item $source -Destination $dest -Recurse -Force
    Write-Host "   [OK] Copied directory $($_.Name)" -ForegroundColor Green
}

# Copy sitemap and robots.txt
$sitemapFiles = Get-ChildItem -Path $distDir -Filter "sitemap*.xml" -ErrorAction SilentlyContinue
foreach ($file in $sitemapFiles) {
    Copy-Item $file.FullName -Destination $archiveDir -Force
    Write-Host "   [OK] Copied $($file.Name)" -ForegroundColor Green
}

$robotsSource = Join-Path $distDir "robots.txt"
if (Test-Path $robotsSource) {
    Copy-Item $robotsSource -Destination $archiveDir -Force
    Write-Host "   [OK] Copied robots.txt" -ForegroundColor Green
}

# Step 5: Update paths in all HTML files (for backwards compatibility)
# Note: Most paths are now handled by BASE_URL in source templates
Write-Host "`n[5/7] Updating paths in HTML files..." -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $archiveDir -Filter "*.html" -Recurse

$updatedCount = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Apply replacements for any remaining hardcoded paths
    # Note: Most paths are now handled by BASE_URL in source templates
    # These replacements are for backwards compatibility only
    $content = $content -replace 'href="/favicon/', 'href="/archive/favicon/'
    $content = $content -replace 'content="/playersclub-og.jpg"', 'content="/archive/playersclub-og.jpg"'
    $content = $content -replace 'href="/sitemap-index.xml"', 'href="/archive/sitemap-index.xml"'
    
    # CSS URL patterns and navigation links are handled by BASE_URL in source templates
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedCount++
    }
}

Write-Host "   [OK] Updated $updatedCount HTML files" -ForegroundColor Green

# Step 6: Update sitemap XML files
Write-Host "`n[6/7] Updating sitemap XML files..." -ForegroundColor Yellow
$xmlFiles = Get-ChildItem -Path $archiveDir -Filter "sitemap*.xml" -ErrorAction SilentlyContinue
foreach ($file in $xmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $content = $content -replace 'https://karthikprasadm\.github\.io/', 'https://karthikprasadm.github.io/archive/'
    $content = $content -replace '<loc>/', '<loc>/archive/'
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "   [OK] Updated $($file.Name)" -ForegroundColor Green
}

# Update robots.txt
$robotsPath = Join-Path $archiveDir "robots.txt"
if (Test-Path $robotsPath) {
    $robotsContent = Get-Content $robotsPath -Raw
    $robotsContent = $robotsContent -replace 'Sitemap:.*', 'Sitemap: https://karthikprasadm.github.io/archive/sitemap-index.xml'
    Set-Content -Path $robotsPath -Value $robotsContent -NoNewline
    Write-Host "   [OK] Updated robots.txt" -ForegroundColor Green
}

# Step 7: Cleanup dist directory
Write-Host "`n[7/7] Cleaning up dist directory..." -ForegroundColor Yellow
if (Test-Path $distDir) {
    Remove-Item $distDir -Recurse -Force
    Write-Host "   [OK] Dist directory removed" -ForegroundColor Green
}

# Verification step
if ($Verify) {
    Write-Host "`n[VERIFY] Running path verification..." -ForegroundColor Yellow
    & "$archiveDir\verify-paths.ps1"
}

Write-Host ""
Write-Host "=== Build Complete ===" -ForegroundColor Cyan
Write-Host "Archive is ready at: archive/archive.html" -ForegroundColor Green

# Path Verification Script for ArchiveUpdated Build Output
# Verifies that all paths in archive/ directory use the /archive/ prefix

$ErrorActionPreference = "Continue"
$archiveUpdatedDir = $PSScriptRoot
$archiveOutputDir = Join-Path (Split-Path $archiveUpdatedDir -Parent) "archive"
$errors = @()
$warnings = @()

Write-Host "=== Path Verification for Archive Output ===" -ForegroundColor Cyan
Write-Host "Checking: $archiveOutputDir" -ForegroundColor Gray

# Check if archive directory exists
if (-not (Test-Path $archiveOutputDir)) {
    Write-Host "   [ERROR] Archive output directory not found: $archiveOutputDir" -ForegroundColor Red
    Write-Host "   [INFO] Run build-archive.ps1 first to create archive output" -ForegroundColor Yellow
    exit 1
}

# Check HTML files for incorrect paths
$htmlFiles = Get-ChildItem -Path $archiveOutputDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue

if ($htmlFiles.Count -eq 0) {
    Write-Host "   [WARN] No HTML files found in archive output directory" -ForegroundColor Yellow
    Write-Host "   [INFO] Run build-archive.ps1 first to build archive" -ForegroundColor Yellow
    exit 0
}

$incorrectPatterns = @(
    @{ Pattern = 'href="/favicon/'; Description = "Favicon links without /archive/" }
    @{ Pattern = 'href="/images/'; Description = "Image links without /archive/" }
    @{ Pattern = 'href="/icons/'; Description = "Icon links without /archive/" }
    @{ Pattern = 'href="/" role="menuitem"'; Description = "Navigation links without /archive/" }
    @{ Pattern = 'href="/releases/"'; Description = "Releases link without /archive/" }
    @{ Pattern = 'href="/history/"'; Description = "History link without /archive/" }
    @{ Pattern = 'href="/store/"'; Description = "Store link without /archive/" }
    @{ Pattern = 'href="/contact/"'; Description = "Contact link without /archive/" }
    @{ Pattern = 'content="/playersclub-og.jpg"'; Description = "OG image without /archive/" }
    @{ Pattern = 'url\(''/images/'; Description = "CSS image URLs without /archive/" }
    @{ Pattern = 'url\("/images/'; Description = "CSS image URLs without /archive/" }
)

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $relativePath = $file.FullName.Replace($archiveOutputDir, "").TrimStart("\")
    
    foreach ($check in $incorrectPatterns) {
        if ($content -match $check.Pattern) {
            $errors += "  ✗ $relativePath : $($check.Description)"
        }
    }
    
    # Check for artist links without /archive/
    if ($content -match 'href="/(amarie|echo-lume|eclipse-aurelian|eli-haze|fountain|dj-bolly|gold|hoilin|frostbyte|harlxn|isla-nova|k-adom|mal-hayes|ivy-veil|mia-sue|reevo|revelyn|luna-deluxe|nora-wilde|phoenix-halo|teros|velvet-rush|stardust-royale|wale|zariah-bloom|vxn|z-t|zenji)"') {
        $errors += "  ✗ $relativePath : Artist link without /archive/ prefix"
    }
}

# Check XML files
$xmlFiles = Get-ChildItem -Path $archiveOutputDir -Filter "sitemap*.xml" -ErrorAction SilentlyContinue
foreach ($file in $xmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $relativePath = $file.FullName.Replace($archiveOutputDir, "").TrimStart("\")
    
    if ($content -match '<loc>/[^a]' -and $content -notmatch '<loc>/archive/') {
        $errors += "  ✗ $relativePath : Sitemap contains URLs without /archive/ prefix"
    }
}

# Check robots.txt
$robotsPath = Join-Path $archiveOutputDir "robots.txt"
if (Test-Path $robotsPath) {
    $robotsContent = Get-Content $robotsPath -Raw -ErrorAction SilentlyContinue
    if ($null -ne $robotsContent -and $robotsContent -notmatch 'Sitemap:.*archive') {
        $warnings += "  ⚠ robots.txt : Sitemap URL may not point to archive"
    }
}

# Check for missing critical files
$criticalFiles = @(
    "archive.html",
    "_astro",
    "favicon",
    "images"
)

foreach ($file in $criticalFiles) {
    $path = Join-Path $archiveOutputDir $file
    if (-not (Test-Path $path)) {
        $errors += "  ✗ Missing critical file/directory: $file"
    }
}

# Report results
Write-Host "`nResults:" -ForegroundColor Yellow

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "  ✓ All paths verified successfully!" -ForegroundColor Green
    Write-Host "  ✓ All critical files present!" -ForegroundColor Green
    exit 0
}

if ($errors.Count -gt 0) {
    Write-Host "`nErrors found:" -ForegroundColor Red
    foreach ($err in $errors) {
        Write-Host $err -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`nWarnings:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host $warning -ForegroundColor Yellow
    }
}

$totalIssues = $errors.Count + $warnings.Count
Write-Host "`nTotal issues: $totalIssues" -ForegroundColor $(if ($errors.Count -gt 0) { "Red" } else { "Yellow" })
exit $(if ($errors.Count -gt 0) { 1 } else { 0 })

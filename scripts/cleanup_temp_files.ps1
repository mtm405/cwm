# Cleanup Temporary Files Script
# Code with Morais - Remove debug, test, and temporary files
# Run this script to clean up all the temporary files created during development

Write-Host "Starting cleanup of temporary files..." -ForegroundColor Green
Write-Host ("=" * 60)

$deletedFiles = @()
$deletedDirs = @()
$errors = @()

# Function to safely delete a file
function Remove-FilesSafely {
    param(
        [string[]]$FilePaths,
        [string]$Description
    )
    
    Write-Host "`n$Description" -ForegroundColor Yellow
    
    foreach ($file in $FilePaths) {
        $fullPath = Join-Path $PSScriptRoot $file
        if (Test-Path $fullPath) {
            try {
                Remove-Item $fullPath -Force
                Write-Host "   Deleted: $file" -ForegroundColor Green
                $script:deletedFiles += $file
            }
            catch {
                Write-Host "   Failed to delete: $file - $($_.Exception.Message)" -ForegroundColor Red
                $script:errors += "Failed to delete $file - $($_.Exception.Message)"
            }
        }
        else {
            Write-Host "   Not found: $file" -ForegroundColor DarkYellow
        }
    }
}

# Function to safely delete directories
function Remove-DirectoriesSafely {
    param(
        [string[]]$DirPaths,
        [string]$Description
    )
    
    Write-Host "`n$Description" -ForegroundColor Yellow
    
    foreach ($dir in $DirPaths) {
        $fullPath = Join-Path $PSScriptRoot $dir
        if (Test-Path $fullPath) {
            try {
                Remove-Item $fullPath -Recurse -Force
                Write-Host "   Deleted directory: $dir" -ForegroundColor Green
                $script:deletedDirs += $dir
            }
            catch {
                Write-Host "   Failed to delete directory: $dir - $($_.Exception.Message)" -ForegroundColor Red
                $script:errors += "Failed to delete directory $dir - $($_.Exception.Message)"
            }
        }
        else {
            Write-Host "   Not found: $dir" -ForegroundColor DarkYellow
        }
    }
}

# 1. Auth Debug & Fix Files (Root Directory)
$authDebugFiles = @(
    "auth_token_fixer.py",
    "debug_auth_token.py",
    "system_auth_fix.py",
    "manual_auth_fix.py",
    "quick_session_fix.py",
    "verify_auth_fix.py",
    "flask_auth_debug_integration.py"
)
Remove-FilesSafely $authDebugFiles "Auth Debug & Fix Files"

# 2. Test Files (Root Directory)
$testFiles = @(
    "test_auth_fix_scenario.py",
    "test_auth_debug.py",
    "test_system_fix.py",
    "test_js_fix.py",
    "test_subtopic_implementation.py",
    "test_interactive_debug.html",
    "test_auth_debug.ps1",
    "quick_auth_test.py",
    "manual_test_guide.py"
)
Remove-FilesSafely $testFiles "Test Files"

# 3. Temporary JavaScript Files
$tempJsFiles = @(
    "static/js/complete-error-fix.js",
    "static/js/emergency-fix.js",
    "static/js/debug/quick-auth-fix.js",
    "static/js/debug/immediate-auth-debug.js",
    "static/js/debug/immediate-auth-check.js",
    "static/js/debug/auth-auto-fix.js",
    "static/js/debug/google-auth-diagnostics.js",
    "fix-localStorage.js"
)
Remove-FilesSafely $tempJsFiles "Temporary JavaScript Files"

# 4. Debug Templates
$debugTemplates = @(
    "templates/auth-debug-test.html",
    "templates/auth-debug-test-page.html",
    "templates/auth-test-dashboard.html",
    "templates/auth_debug_test.html",
    "templates/simple-auth-diagnostic.html",
    "templates/auth_recovery.html",
    "templates/test_text_with_questions.html",
    "templates/includes/emergency-js-fix.html"
)
Remove-FilesSafely $debugTemplates "Debug Templates"

# 5. Debug Documentation
$debugDocs = @(
    "AUTH_DEBUG_STRATEGY.md",
    "AUTH_FIX_SCOPE_EXPLAINED.md",
    "AUTH_IMPLEMENTATION_COMPLETE.md",
    "AUTH_INTEGRATION_COMPLETE.md",
    "AUTH_SYSTEM_TEST_GUIDE.md",
    "JAVASCRIPT_ERROR_FIXES_COMPLETE.md"
)
Remove-FilesSafely $debugDocs "Debug Documentation"

# 6. Test Data Files
$testDataFiles = @(
    "test_interactive_lesson.json",
    "debug_subtopic_tabs.html",
    "profile_system_test.html"
)
Remove-FilesSafely $testDataFiles "Test Data Files"

# 7. Other Debug Files
$otherDebugFiles = @(
    "fix_routes.py"
)
Remove-FilesSafely $otherDebugFiles "Other Debug Files"

# 8. Debug JavaScript Directories (Optional - uncomment if you want to remove debug tools)
# $debugJsDirs = @(
#     "static/js/auth/debug"
# )
# Remove-DirectoriesSafely $debugJsDirs "Debug JavaScript Directories"

Write-Host "`n" + ("=" * 60)
Write-Host "Cleanup Summary" -ForegroundColor Cyan
Write-Host ("=" * 60)

if ($deletedFiles.Count -gt 0) {
    Write-Host "`nSuccessfully deleted $($deletedFiles.Count) files:" -ForegroundColor Green
    foreach ($file in $deletedFiles) {
        Write-Host "   - $file" -ForegroundColor Gray
    }
}

if ($deletedDirs.Count -gt 0) {
    Write-Host "`nSuccessfully deleted $($deletedDirs.Count) directories:" -ForegroundColor Green
    foreach ($dir in $deletedDirs) {
        Write-Host "   - $dir" -ForegroundColor Gray
    }
}

if ($errors.Count -gt 0) {
    Write-Host "`nErrors encountered:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "   - $error" -ForegroundColor Red
    }
}

Write-Host "`nCleanup completed!" -ForegroundColor Green
Write-Host "Your workspace is now clean and ready for production." -ForegroundColor Green

# Optional: Show remaining essential files
Write-Host "`nEssential files kept for Google login:" -ForegroundColor Cyan
$essentialFiles = @(
    "static/js/auth/google-auth.js",
    "static/js/auth/auth-recovery.js",
    "app.py",
    "config.py"
)

foreach ($file in $essentialFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    if (Test-Path $fullPath) {
        Write-Host "   $file" -ForegroundColor Green
    }
    else {
        Write-Host "   $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

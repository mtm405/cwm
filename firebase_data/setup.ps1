# Firebase Database Cleanup & Seeding - PowerShell Script
# Code with Morais - Python Learning Platform

Write-Host "Firebase Database Cleanup & Seeding Tool" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Gray

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Python found: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "Python not found. Please install Python first." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Python not found. Please install Python first." -ForegroundColor Red
    exit 1
}

# Check if firebase-admin is installed
try {
    $firebaseAdmin = pip show firebase-admin 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "firebase-admin already installed" -ForegroundColor Green
    } else {
        Write-Host "firebase-admin not installed. Installing..." -ForegroundColor Yellow
        pip install firebase-admin
        if ($LASTEXITCODE -eq 0) {
            Write-Host "firebase-admin installed successfully" -ForegroundColor Green
        } else {
            Write-Host "Failed to install firebase-admin" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "Error checking firebase-admin installation" -ForegroundColor Red
    exit 1
}

# Check required files
$requiredFiles = @("serviceAccountKey.json", "lessons.json", "quizzes.json", "daily_challenges.json", "users.json")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "Found: $file" -ForegroundColor Green
    } else {
        $missingFiles += $file
        Write-Host "Missing: $file" -ForegroundColor Red
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Please ensure all files are present and run again." -ForegroundColor Yellow
    exit 1
}

# Get Firebase project ID
try {
    $serviceAccount = Get-Content "serviceAccountKey.json" | ConvertFrom-Json
    $projectId = $serviceAccount.project_id
    Write-Host ""
    Write-Host "Firebase Project: $projectId" -ForegroundColor Cyan
} catch {
    Write-Host "Could not read Firebase project ID from serviceAccountKey.json" -ForegroundColor Red
    exit 1
}

# Warning and confirmation
Write-Host ""
Write-Host "WARNING: This will DELETE ALL DATA in Firebase project '$projectId'" -ForegroundColor Yellow
Write-Host "This includes:" -ForegroundColor Yellow
Write-Host "  - All users (except authenticated accounts)" -ForegroundColor Yellow
Write-Host "  - All lessons and quizzes" -ForegroundColor Yellow
Write-Host "  - All daily challenges" -ForegroundColor Yellow
Write-Host "  - All user activities and progress" -ForegroundColor Yellow

$confirmation = Read-Host "`nType '$projectId' to confirm deletion and re-seeding"

if ($confirmation -ne $projectId) {
    Write-Host "Cancelled - project ID mismatch" -ForegroundColor Red
    exit 0
}

# Run quick setup
Write-Host ""
Write-Host "Starting Firebase setup..." -ForegroundColor Cyan
try {
    $result = python quick_setup.py
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Firebase setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Open Firebase Console and verify data upload" -ForegroundColor White
        Write-Host "2. Create the suggested Firestore indexes" -ForegroundColor White
        Write-Host "3. Upload the generated security rules" -ForegroundColor White
        Write-Host "4. Restart your Flask application" -ForegroundColor White
        Write-Host "5. Test dashboard functionality" -ForegroundColor White
    } else {
        Write-Host "Setup failed. Check output above for errors." -ForegroundColor Red
    }
} catch {
    Write-Host "Error running setup script: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

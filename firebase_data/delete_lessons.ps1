 I# Delete All Lessons via API - PowerShell Version
# Run this script to delete all lessons through the API endpoint

Write-Host "🗑️ Deleting All Lessons via API" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Check if the API server is running
Write-Host "📡 Checking if API server is available..." -ForegroundColor Cyan

# First, try the main app API (if running)
$ApiUrl = "http://localhost:5000/api/admin/delete-all-lessons"

try {
    $testResponse = Invoke-WebRequest -Uri $ApiUrl -Method HEAD -ErrorAction Stop
    Write-Host "✅ Using main app API at $ApiUrl" -ForegroundColor Green
} catch {
    # Try the standalone deletion API
    $ApiUrl = "http://localhost:5001/api/admin/delete-all-lessons"
    Write-Host "🔄 Trying standalone deletion API at $ApiUrl" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "⚠️  WARNING: This will permanently delete ALL lessons!" -ForegroundColor Red
$confirmation = Read-Host "Are you sure you want to continue? (type 'yes' to confirm)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Deletion cancelled" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🗑️ Sending deletion request..." -ForegroundColor Yellow

# Prepare the request body
$body = @{
    confirmation = "DELETE_ALL_LESSONS_CONFIRMED"
} | ConvertTo-Json

# Make the API call
try {
    $response = Invoke-RestMethod -Uri $ApiUrl -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "📡 API Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    # Check if deletion was successful
    if ($response.success -eq $true) {
        Write-Host ""
        Write-Host "✅ Lessons deleted successfully!" -ForegroundColor Green
        
        # Ask about user progress
        Write-Host ""
        $progressConfirmation = Read-Host "Do you also want to delete all user progress? (type 'yes' to confirm)"
        
        if ($progressConfirmation -eq "yes") {
            Write-Host "🗑️ Deleting user progress..." -ForegroundColor Yellow
            
            $progressUrl = $ApiUrl -replace "delete-all-lessons", "delete-user-progress"
            $progressBody = @{
                confirmation = "DELETE_ALL_PROGRESS_CONFIRMED"
            } | ConvertTo-Json
            
            try {
                $progressResponse = Invoke-RestMethod -Uri $progressUrl -Method POST -Body $progressBody -ContentType "application/json"
                
                Write-Host "📡 Progress Deletion Response:" -ForegroundColor Cyan
                $progressResponse | ConvertTo-Json -Depth 10 | Write-Host
            } catch {
                Write-Host "❌ Failed to delete user progress: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "🎉 Cleanup completed!" -ForegroundColor Green
        Write-Host "📝 You can now upload your new module lessons." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Deletion failed. Check the response above for details." -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to API server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure your Flask app is running on port 5000 or start the deletion API:" -ForegroundColor Yellow
    Write-Host "python firebase_data/delete_lessons_api.py" -ForegroundColor White
}

# Pause to keep window open
Read-Host "Press Enter to exit"

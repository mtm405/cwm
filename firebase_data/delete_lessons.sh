#!/bin/bash
# Delete All Lessons via API
# Run this script to delete all lessons through the API endpoint

echo "🗑️ Deleting All Lessons via API"
echo "================================"

# Check if the API server is running
echo "📡 Checking if API server is available..."

# First, try the main app API (if running)
API_URL="http://localhost:5000/api/admin/delete-all-lessons"

# Test if main app is running
if curl -s -f "$API_URL" >/dev/null 2>&1; then
    echo "✅ Using main app API at $API_URL"
else
    # Try the standalone deletion API
    API_URL="http://localhost:5001/api/admin/delete-all-lessons"
    echo "🔄 Trying standalone deletion API at $API_URL"
fi

echo ""
echo "⚠️  WARNING: This will permanently delete ALL lessons!"
echo "Are you sure you want to continue? (type 'yes' to confirm)"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
    echo "❌ Deletion cancelled"
    exit 1
fi

echo ""
echo "🗑️ Sending deletion request..."

# Make the API call
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"confirmation": "DELETE_ALL_LESSONS_CONFIRMED"}' \
    "$API_URL")

# Check if curl was successful
if [ $? -eq 0 ]; then
    echo "📡 API Response:"
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    
    # Check if deletion was successful
    if echo "$response" | grep -q '"success": true'; then
        echo ""
        echo "✅ Lessons deleted successfully!"
        
        # Ask about user progress
        echo ""
        echo "Do you also want to delete all user progress? (type 'yes' to confirm)"
        read -r progress_confirmation
        
        if [ "$progress_confirmation" = "yes" ]; then
            echo "🗑️ Deleting user progress..."
            
            progress_url="${API_URL/delete-all-lessons/delete-user-progress}"
            progress_response=$(curl -s -X POST \
                -H "Content-Type: application/json" \
                -d '{"confirmation": "DELETE_ALL_PROGRESS_CONFIRMED"}' \
                "$progress_url")
            
            echo "📡 Progress Deletion Response:"
            echo "$progress_response" | python3 -m json.tool 2>/dev/null || echo "$progress_response"
        fi
        
        echo ""
        echo "🎉 Cleanup completed!"
        echo "📝 You can now upload your new module lessons."
    else
        echo ""
        echo "❌ Deletion failed. Check the response above for details."
    fi
else
    echo "❌ Failed to connect to API server"
    echo "Make sure your Flask app is running on port 5000 or start the deletion API:"
    echo "python firebase_data/delete_lessons_api.py"
fi

# Auth Token Debug Strategy for Code with Morais

## 🔍 Problem Analysis

Based on your auth monitor output:
- ✅ User Object: Yes
- ✅ Auth Manager: Yes  
- ✅ Google Auth: Yes
- ❌ Auth Token: No
- ❌ Auth Service: No
- ❌ Overall Status: NOT AUTHENTICATED

This indicates a **token storage/retrieval issue** where the user is properly logged in but the token isn't being found.

## 🛠️ Debug Strategy

### Phase 1: Immediate Diagnosis

1. **Access the debug page**: http://localhost:5000/debug/auth-test
2. **Run the browser console commands**:
   ```javascript
   // Quick diagnostic
   runQuickAuthFix()
   
   // Manual check
   debugAuth()
   
   // Check all storage locations
   console.log('localStorage:', localStorage.getItem('auth_token'))
   console.log('cwm_user_token:', localStorage.getItem('cwm_user_token'))
   console.log('sessionStorage:', sessionStorage.getItem('auth_token'))
   ```

### Phase 2: Server-Side Investigation

1. **Check Flask session**:
   ```python
   # Add to your Flask route
   @app.route('/debug/session')
   def debug_session():
       return jsonify({
           'session_keys': list(session.keys()),
           'has_auth_token': 'auth_token' in session,
           'user_data': session.get('current_user'),
           'session_id': request.cookies.get('session')
       })
   ```

2. **Test the new debug endpoints**:
   - `/debug/auth-comprehensive` - Full debug report
   - `/debug/auth-token-fix` - Auto-fix token issues
   - `/api/auth/status` - Current auth status

### Phase 3: Token Flow Analysis

1. **Check token generation** (in your auth callback):
   ```python
   def handle_google_callback():
       # Add debug logging
       print(f"1. User authenticated: {user}")
       
       # Generate/get token
       token = generate_auth_token(user)
       print(f"2. Token generated: {token[:20]}...")
       
       # Store token
       session['auth_token'] = token
       print(f"3. Token stored in session")
       
       # Verify storage
       print(f"4. Token verification: {session.get('auth_token')}")
   ```

2. **Check token retrieval** (in your auth middleware):
   ```python
   @app.before_request
   def check_auth():
       token = session.get('auth_token')
       print(f"Request to {request.path} - Token: {bool(token)}")
   ```

### Phase 4: Common Fixes

1. **Token Key Mismatch**:
   ```javascript
   // Fix inconsistent token keys
   if (localStorage.getItem('cwm_user_token') && !localStorage.getItem('auth_token')) {
       localStorage.setItem('auth_token', localStorage.getItem('cwm_user_token'));
   }
   ```

2. **Session Configuration**:
   ```python
   # Ensure proper session config
   app.config['SESSION_COOKIE_SECURE'] = False  # For development
   app.config['SESSION_COOKIE_HTTPONLY'] = True
   app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
   ```

3. **Token Expiry Check**:
   ```python
   def verify_token(token):
       try:
           # Your token verification logic
           decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
           return decoded
       except jwt.ExpiredSignatureError:
           print("Token expired")
           return None
   ```

## 🔧 Automated Fixes

### Client-Side Auto-Fix
```javascript
// Paste this in browser console for immediate fix
(function() {
    // Check and fix token storage
    const cwmToken = localStorage.getItem('cwm_user_token');
    if (cwmToken && !localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', cwmToken);
        console.log('✅ Fixed: Copied cwm_user_token to auth_token');
    }
    
    // Check and fix user object
    const profile = localStorage.getItem('cwm_user_profile');
    if (profile && !window.currentUser) {
        window.currentUser = JSON.parse(profile);
        console.log('✅ Fixed: Restored currentUser from profile');
    }
    
    // Refresh page to apply fixes
    setTimeout(() => window.location.reload(), 1000);
})();
```

### Server-Side Auto-Fix
Access `/debug/auth-token-fix` to automatically:
- Consolidate tokens from different storage locations
- Flag inconsistent session states
- Clear corrupted data

## 📋 Debugging Checklist

### Client-Side Checks
- [ ] Token in localStorage (`auth_token`)
- [ ] Token in sessionStorage (`auth_token`) 
- [ ] Alternative token (`cwm_user_token`)
- [ ] User profile in localStorage
- [ ] Window.currentUser object
- [ ] Auth service availability
- [ ] Console errors

### Server-Side Checks
- [ ] Flask session contains token
- [ ] Token validation working
- [ ] Session cookie being set
- [ ] CORS configuration
- [ ] Firebase Auth integration
- [ ] Database user record

### Network Checks
- [ ] Auth API endpoints responding
- [ ] Cookies being sent with requests
- [ ] HTTPS/HTTP consistency
- [ ] Session cookie domain/path

## 🚀 Quick Recovery Steps

1. **If you have a user but no token**:
   ```javascript
   // Force re-authentication
   window.location.href = '/auth/login';
   ```

2. **If you have a token but no user**:
   ```javascript
   // Clear corrupted state
   localStorage.clear();
   sessionStorage.clear();
   window.location.reload();
   ```

3. **If nothing works**:
   ```javascript
   // Nuclear option - clear everything
   localStorage.clear();
   sessionStorage.clear();
   document.cookie.split(";").forEach(c => {
       document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
   });
   window.location.href = '/';
   ```

## 🔗 Available Tools

- **Enhanced Auth Monitor**: Real-time auth state monitoring
- **Quick Auth Fix**: Automatic common issue resolution
- **Debug Test Page**: Comprehensive testing interface
- **Server Debug Endpoints**: Backend state inspection
- **Export Debug Data**: Complete diagnostic export

## 📞 Next Steps

1. Start with the debug test page: `/debug/auth-test`
2. Run the quick fix in browser console
3. Check the server debug endpoints
4. Export debug data if issues persist
5. Use the enhanced auth monitor for real-time tracking

The most likely issue is that your Flask session has the token but the client-side JavaScript isn't finding it in the expected location. The debug tools will help identify the exact disconnection point.

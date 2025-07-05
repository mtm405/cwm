#!/usr/bin/env python3
"""
Test the challenge normalization function
"""
import sys
import os
sys.path.append('.')

def test_challenge_normalization():
    try:
        from routes.challenge_api import get_fallback_challenge, normalize_challenge_data
        from datetime import datetime
        
        # Test the normalization function
        today = datetime.now().strftime('%Y-%m-%d')
        fallback = get_fallback_challenge(today)
        
        print('🧪 Testing Challenge Normalization')
        print('=' * 50)
        
        print('\n1. Original fallback challenge:')
        print(f'   Type: {fallback.get("type", "MISSING")}')
        print(f'   Estimated time: {fallback.get("estimated_time", "MISSING")}')
        print(f'   Has content: {"content" in fallback}')
        print(f'   XP reward: {fallback.get("xp_reward", "MISSING")}')
        print(f'   Coin reward: {fallback.get("coin_reward", "MISSING")}')
        
        normalized = normalize_challenge_data(fallback)
        
        print('\n2. Normalized challenge:')
        print(f'   Type: {normalized.get("type", "MISSING")}')
        print(f'   Estimated time: {normalized.get("estimated_time", "MISSING")}')
        print(f'   Has content: {"content" in normalized}')
        print(f'   XP reward: {normalized.get("xp_reward", "MISSING")}')
        print(f'   Coin reward: {normalized.get("coin_reward", "MISSING")}')
        
        content = normalized.get("content", {})
        print(f'   Initial code available: {"initial_code" in content}')
        print(f'   Instructions available: {"instructions" in content}')
        
        if "initial_code" in content:
            print(f'   Initial code preview: {content["initial_code"][:50]}...')
        
        print('\n✅ Normalization test completed successfully!')
        
    except Exception as e:
        print(f'❌ Test failed: {str(e)}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_challenge_normalization()

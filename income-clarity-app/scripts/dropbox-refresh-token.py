#!/usr/bin/env python3
"""
Dropbox Token Refresher
Automatically refreshes access token using refresh token
"""

import requests
import json
from pathlib import Path

def load_env():
    """Load environment variables from .env.dropbox"""
    env_path = Path(__file__).parent.parent / '.env.dropbox'
    env_vars = {}
    
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key] = value
    
    return env_vars

def refresh_access_token():
    """Use refresh token to get new access token"""
    env = load_env()
    
    refresh_token = env.get('DROPBOX_REFRESH_TOKEN')
    app_key = env.get('DROPBOX_APP_KEY')
    app_secret = env.get('DROPBOX_APP_SECRET')
    
    if not refresh_token:
        print("❌ No refresh token found. Run dropbox-oauth-setup.py first.")
        return False
    
    # Request new access token
    token_url = "https://api.dropboxapi.com/oauth2/token"
    data = {
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': app_key,
        'client_secret': app_secret
    }
    
    response = requests.post(token_url, data=data)
    
    if response.status_code == 200:
        tokens = response.json()
        new_access_token = tokens['access_token']
        
        # Update .env.dropbox with new access token
        env_path = Path(__file__).parent.parent / '.env.dropbox'
        
        # Read all lines
        lines = []
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('DROPBOX_ACCESS_TOKEN='):
                    lines.append(f"DROPBOX_ACCESS_TOKEN={new_access_token}\n")
                else:
                    lines.append(line)
        
        # Write back
        with open(env_path, 'w') as f:
            f.writelines(lines)
        
        print("✅ Access token refreshed successfully!")
        print(f"New token: {new_access_token[:20]}...")
        return True
    else:
        print(f"❌ Failed to refresh token: {response.text}")
        return False

def test_token():
    """Test if current access token works"""
    env = load_env()
    access_token = env.get('DROPBOX_ACCESS_TOKEN')
    
    if not access_token:
        print("❌ No access token found")
        return False
    
    # Test API call
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        'https://api.dropboxapi.com/2/files/list_folder',
        headers=headers,
        json={'path': '', 'limit': 1}
    )
    
    if response.status_code == 200:
        print("✅ Current token is working")
        return True
    elif response.status_code == 401:
        print("⚠️ Token expired, refreshing...")
        return False
    else:
        print(f"❌ API error: {response.text}")
        return False

def main():
    print("🔄 Dropbox Token Manager")
    print("=" * 50)
    
    # Test current token
    if not test_token():
        # Try to refresh
        if refresh_access_token():
            # Test again
            test_token()

if __name__ == "__main__":
    main()
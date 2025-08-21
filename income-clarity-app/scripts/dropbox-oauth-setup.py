#!/usr/bin/env python3
"""
Dropbox OAuth 2.0 Setup Script
Generates a refresh token that never expires
"""

import webbrowser
import http.server
import socketserver
import urllib.parse
import requests
import json
import os
from pathlib import Path

# Configuration
APP_KEY = "atbm6yt8kq7n02y"
APP_SECRET = "0eckclu7ov3jilv"
REDIRECT_URI = "http://localhost:8080/oauth_callback"
PORT = 8080

class OAuthHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/oauth_callback'):
            # Parse the authorization code from the URL
            query_components = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            code = query_components.get('code', [None])[0]
            
            if code:
                # Exchange code for tokens
                token_url = "https://api.dropboxapi.com/oauth2/token"
                data = {
                    'code': code,
                    'grant_type': 'authorization_code',
                    'client_id': APP_KEY,
                    'client_secret': APP_SECRET,
                    'redirect_uri': REDIRECT_URI
                }
                
                response = requests.post(token_url, data=data)
                tokens = response.json()
                
                if 'access_token' in tokens:
                    # Save tokens to .env.dropbox
                    env_path = Path(__file__).parent.parent / '.env.dropbox'
                    
                    # Read existing content
                    existing_lines = []
                    if env_path.exists():
                        with open(env_path, 'r') as f:
                            for line in f:
                                if not line.startswith('DROPBOX_ACCESS_TOKEN=') and \
                                   not line.startswith('DROPBOX_REFRESH_TOKEN='):
                                    existing_lines.append(line)
                    
                    # Write updated content
                    with open(env_path, 'w') as f:
                        f.writelines(existing_lines)
                        f.write(f"\nDROPBOX_ACCESS_TOKEN={tokens['access_token']}\n")
                        if 'refresh_token' in tokens:
                            f.write(f"DROPBOX_REFRESH_TOKEN={tokens['refresh_token']}\n")
                    
                    # Send success response
                    self.send_response(200)
                    self.send_header('Content-type', 'text/html')
                    self.end_headers()
                    
                    success_html = """
                    <html>
                    <body style="font-family: Arial; padding: 20px;">
                        <h1 style="color: green;">✅ Success!</h1>
                        <p>Dropbox OAuth setup complete. Tokens have been saved.</p>
                        <p><strong>Access Token:</strong> {}</p>
                        <p><strong>Refresh Token:</strong> {}</p>
                        <p>You can close this window and return to the terminal.</p>
                    </body>
                    </html>
                    """.format(
                        tokens['access_token'][:20] + '...',
                        tokens.get('refresh_token', 'Not provided')[:20] + '...' if 'refresh_token' in tokens else 'Not provided'
                    )
                    
                    self.wfile.write(success_html.encode())
                    
                    # Print to console
                    print("\n✅ OAuth Setup Complete!")
                    print(f"Access Token: {tokens['access_token'][:20]}...")
                    if 'refresh_token' in tokens:
                        print(f"Refresh Token: {tokens['refresh_token'][:20]}...")
                        print("\n🔄 With the refresh token, you won't need to manually update tokens anymore!")
                    else:
                        print("\n⚠️ No refresh token received. You may need to request 'offline' access.")
                    
                    # Stop the server
                    os._exit(0)
                else:
                    self.send_error(400, "Failed to get access token")
            else:
                self.send_error(400, "No authorization code received")

def main():
    print("🔐 Dropbox OAuth 2.0 Setup")
    print("=" * 50)
    
    # Build authorization URL with offline access for refresh token
    auth_url = (
        f"https://www.dropbox.com/oauth2/authorize?"
        f"client_id={APP_KEY}&"
        f"response_type=code&"
        f"redirect_uri={REDIRECT_URI}&"
        f"token_access_type=offline&"  # This requests a refresh token
        f"scope=files.metadata.read files.content.read files.content.write"
    )
    
    print(f"\n📌 Opening browser to authorize Dropbox access...")
    print(f"\nIf browser doesn't open, visit this URL:")
    print(f"\n{auth_url}\n")
    
    # Open browser
    webbrowser.open(auth_url)
    
    # Start local server to receive callback
    print(f"🌐 Starting local server on port {PORT}...")
    print("Waiting for authorization callback...")
    
    with socketserver.TCPServer(("", PORT), OAuthHandler) as httpd:
        httpd.serve_forever()

if __name__ == "__main__":
    main()
#!/usr/bin/env python3

"""
🖼️ DROPBOX API AUTOMATION SCRIPT
Handles listing, downloading, and deleting files from Dropbox
"""

import os
import sys
import requests
import json
from pathlib import Path

# Load environment variables
def load_env():
    env_path = Path(__file__).parent.parent / '.env.dropbox'
    env_vars = {}
    
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    env_vars[key] = value
    
    return env_vars

def list_files():
    """List all files in Dropbox root folder"""
    env = load_env()
    access_token = env.get('DROPBOX_ACCESS_TOKEN')
    
    if not access_token:
        print("❌ No access token found")
        return []
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'path': '/DropboxImage',
        'recursive': False,
        'include_media_info': False,
        'include_deleted': False,
        'include_has_explicit_shared_members': False,
        'include_mounted_folders': True
    }
    
    try:
        response = requests.post(
            'https://api.dropboxapi.com/2/files/list_folder',
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            files = [entry for entry in result['entries'] if entry['.tag'] == 'file']
            print(f"📁 Found {len(files)} files in Dropbox:")
            for file in files:
                print(f"  📄 {file['name']} ({file['size']} bytes)")
            return files
        else:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error listing files: {e}")
        return []

def download_file(file_path, local_path):
    """Download a file from Dropbox"""
    env = load_env()
    access_token = env.get('DROPBOX_ACCESS_TOKEN')
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Dropbox-API-Arg': json.dumps({'path': file_path})
    }
    
    try:
        response = requests.post(
            'https://content.dropboxapi.com/2/files/download',
            headers=headers
        )
        
        if response.status_code == 200:
            with open(local_path, 'wb') as f:
                f.write(response.content)
            print(f"  ✅ Downloaded: {file_path} → {local_path}")
            return True
        else:
            print(f"  ❌ Download failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ Download error: {e}")
        return False

def delete_file(file_path):
    """Delete a file from Dropbox"""
    env = load_env()
    access_token = env.get('DROPBOX_ACCESS_TOKEN')
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'path': file_path
    }
    
    try:
        response = requests.post(
            'https://api.dropboxapi.com/2/files/delete_v2',
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            print(f"  🗑️  Deleted from Dropbox: {file_path}")
            return True
        else:
            print(f"  ❌ Delete failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ Delete error: {e}")
        return False

def upload_file(local_path, remote_path):
    """Upload a file to Dropbox"""
    env = load_env()
    access_token = env.get('DROPBOX_ACCESS_TOKEN')
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Dropbox-API-Arg': json.dumps({
            'path': remote_path,
            'mode': 'overwrite',
            'autorename': False
        }),
        'Content-Type': 'application/octet-stream'
    }
    
    try:
        with open(local_path, 'rb') as f:
            response = requests.post(
                'https://content.dropboxapi.com/2/files/upload',
                headers=headers,
                data=f.read()
            )
        
        if response.status_code == 200:
            print(f"  ✅ Uploaded: {local_path} → {remote_path}")
            return True
        else:
            print(f"  ❌ Upload failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"  ❌ Upload error: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 dropbox-api.py [list|download|delete|upload] [args...]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'list':
        files = list_files()
        
    elif command == 'download':
        if len(sys.argv) < 4:
            print("Usage: python3 dropbox-api.py download <remote_path> <local_path>")
            sys.exit(1)
        
        remote_path = sys.argv[2]
        local_path = sys.argv[3]
        download_file(remote_path, local_path)
        
    elif command == 'delete':
        if len(sys.argv) < 3:
            print("Usage: python3 dropbox-api.py delete <remote_path>")
            sys.exit(1)
        
        remote_path = sys.argv[2]
        delete_file(remote_path)
        
    elif command == 'upload':
        if len(sys.argv) < 4:
            print("Usage: python3 dropbox-api.py upload <local_path> <remote_path>")
            sys.exit(1)
        
        local_path = sys.argv[2]
        remote_path = sys.argv[3]
        upload_file(local_path, remote_path)
        
    else:
        print(f"Unknown command: {command}")
        print("Available commands: list, download, delete, upload")
        sys.exit(1)

if __name__ == '__main__':
    main()
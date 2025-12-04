import http.server
import socketserver
import ssl
import os
import socket
import urllib.parse
import threading
import time
import random
try:
    import requests
except ImportError:
    requests = None

PORT = 8000
BACKEND_URL = "https://duvv-me-api.onrender.com"
keeper_active = False
keeper_timer = None

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        parsed_url = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_url.query)
        path = parsed_url.path
        
        # Check for keeper activation parameter
        if 'activate_keeper' in query_params and requests:
            global keeper_active
            if not keeper_active:
                keeper_active = True
                threading.Thread(target=start_keeper_ping, daemon=True).start()
                print("🔔 Keep-alive keeper activated!")
        
        # Strip query params for routing logic
        path = path.split('?')[0]
        
        # 1. Static Files (css, js, png, etc) - serve as is
        # We check if it has an extension AND it's not .html
        if '.' in path and not path.endswith('.html'):
            super().do_GET()
            return

        # 2. Force Clean URLs (Redirect .html to clean URL)
        if path.endswith('.html'):
            clean_path = path[:-5]
            if clean_path == '/index':
                clean_path = '/'
            
            self.send_response(301)
            self.send_header('Location', clean_path)
            self.end_headers()
            return

        # 3. Routing Logic
        if path == '/' or path == '/index':
            self.path = '/index.html'
        elif path in ['/about', '/safety', '/contact', '/privacy', '/terms']:
            self.path = path + '.html'
        else:
            # Remove leading/trailing slashes for splitting
            clean_path = path.strip('/')
            parts = clean_path.split('/')
            
            # Handle empty parts (e.g. // or /)
            parts = [p for p in parts if p]

            if len(parts) == 2:
                # Pattern: /username/rantId -> respond.html
                self.path = '/respond.html'
            elif len(parts) == 1:
                # Pattern: /username -> app.html
                self.path = '/app.html'
            else:
                # Fallback for everything else (//, /user/id/extra, etc) -> index.html
                self.path = '/index.html'
        
        super().do_GET()

    def log_message(self, format, *args):
        # Custom logging to keep console clean
        pass

def start_keeper_ping():
    """Background thread to ping backend API with randomized intervals"""
    client_id = f"server_{random.randint(100000, 999999)}"
    
    while keeper_active:
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/health",
                params={'keeper': 'true', 'clientId': client_id},
                timeout=10
            )
            data = response.json()
            
            if data.get('isKeeper') and data.get('nextPingIn'):
                next_ping = data['nextPingIn'] / 1000  # Convert ms to seconds
                print(f"✅ Keeper ping successful. Next ping in {next_ping/60:.1f} minutes")
                time.sleep(next_ping)
            else:
                # Not keeper, wait and retry
                time.sleep(60)
        except Exception as e:
            print(f"⚠️  Keeper ping failed: {e}")
            time.sleep(300)  # Wait 5 minutes on error

print("\n" + "="*60)
print("   🕊️  duvv.me LOCAL SERVER STARTING...")
print("="*60 + "\n")

# Get local IP
local_ip = get_local_ip()

try:
    # Create server
    httpd = socketserver.TCPServer(("", PORT), Handler)

    # Wrap with SSL (HTTPS) if certs exist
    if os.path.exists("cert.pem") and os.path.exists("key.pem"):
        context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
        context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")
        httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
        protocol = "https"
        print("✅ SSL/HTTPS Enabled! (Microphone will work)")
    else:
        protocol = "http"
        print("⚠️  SSL Certificates (cert.pem/key.pem) not found.")
        print("   Running in HTTP mode. Microphone features might NOT work.")
        print("   Run 'generate_cert.py' first to fix this.")

    print("\n📍 Access from THIS computer:")
    print(f"   {protocol}://localhost:{PORT}/")

    print(f"\n📱 Access from PHONE (Same WiFi):")
    print(f"   {protocol}://{local_ip}:{PORT}/")
    
    if requests:
        print(f"\n🔔 Activate keep-alive keeper:")
        print(f"   {protocol}://localhost:{PORT}/?activate_keeper=true")
    else:
        print("\n⚠️  'requests' module not found. Keep-alive keeper disabled.")
        print("   Install with: pip install requests")
    
    print("\n" + "-"*60)
    print("⌨️  Press Ctrl+C to stop the server")
    print("-"*60)

    httpd.serve_forever()

except KeyboardInterrupt:
    print("\n\n🛑 Server stopped. Bye!")
except Exception as e:
    print(f"\n❌ Error: {e}")
    input("Press Enter to exit...")

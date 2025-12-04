import http.server
import socketserver
import ssl
import os
import socket

PORT = 8000

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
        # Strip query params for routing logic
        path = self.path.split('?')[0]
        
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
    
    print("\n" + "-"*60)
    print("⌨️  Press Ctrl+C to stop the server")
    print("-"*60)

    httpd.serve_forever()

except KeyboardInterrupt:
    print("\n\n🛑 Server stopped. Bye!")
except Exception as e:
    print(f"\n❌ Error: {e}")
    input("Press Enter to exit...")

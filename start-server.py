import http.server
import socketserver
import socket
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "Unable to determine IP"

Handler = MyHTTPRequestHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    local_ip = get_local_ip()
    
    print("=" * 70)
    print("🚀 Server Started Successfully!")
    print("=" * 70)
    print("")
    print("📍 Access from THIS computer:")
    print(f"   http://localhost:{PORT}/")
    print("")
    print("📱 Access from OTHER devices (same WiFi):")
    print(f"   http://{local_ip}:{PORT}/")
    print("")
    print("📄 Pages:")
    print(f"   • Login:    http://localhost:{PORT}/index.html")
    print(f"   • App:      http://localhost:{PORT}/app.html")
    print(f"   • Respond:  http://localhost:{PORT}/respond.html")
    print("")
    print("📱 Share with friends (same WiFi):")
    print(f"   http://{local_ip}:{PORT}/respond.html?rant=XXX&user=YYY")
    print("")
    print("🎙️  MICROPHONE STATUS:")
    print("   ✅ Works on THIS computer (localhost)")
    print("   ❌ Won't work on OTHER devices (needs HTTPS)")
    print("")
    print("=" * 70)
    print("Press Ctrl+C to stop")
    print("=" * 70)
    print("")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

# Simple wrapper to ensure we run the main server script
if __name__ == "__main__":
    try:
        os.system("python server.py")
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")

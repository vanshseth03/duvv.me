import subprocess
import os
import sys

print("🔐 Generating SSL Certificate...")
print("")

# Common OpenSSL installation paths
openssl_paths = [
    r"C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
    r"C:\Program Files (x86)\OpenSSL-Win32\bin\openssl.exe",
    r"C:\OpenSSL-Win64\bin\openssl.exe",
    r"C:\OpenSSL-Win32\bin\openssl.exe",
    "openssl",  # Try system PATH
]

openssl_exe = None

# Find OpenSSL
for path in openssl_paths:
    try:
        result = subprocess.run([path, "version"], capture_output=True, text=True)
        if result.returncode == 0:
            openssl_exe = path
            print(f"✅ Found OpenSSL at: {path}")
            print(f"   Version: {result.stdout.strip()}")
            print("")
            break
    except:
        continue

if not openssl_exe:
    print("❌ OpenSSL not found!")
    print("")
    print("Please install OpenSSL:")
    print("1. Download from: https://slproweb.com/products/Win32OpenSSL.html")
    print("2. Install 'Win64 OpenSSL Light'")
    print("3. Run this script again")
    print("")
    input("Press Enter to exit...")
    sys.exit(1)

# Generate certificate
print("📝 Generating certificate files...")

cmd = [
    openssl_exe,
    "req",
    "-x509",
    "-newkey", "rsa:2048",
    "-nodes",
    "-keyout", "key.pem",
    "-out", "cert.pem",
    "-days", "365",
    "-subj", "/CN=localhost"
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0 and os.path.exists("cert.pem") and os.path.exists("key.pem"):
        print("")
        print("=" * 60)
        print("✅ SUCCESS! Certificate generated!")
        print("=" * 60)
        print("")
        print("📄 Files created:")
        print("   • cert.pem - SSL certificate")
        print("   • key.pem  - Private key")
        print("")
        print("🚀 Next step:")
        print("   Run: python server.py")
        print("")
        print("   Then open: https://localhost:8000/")
        print("")
        print("=" * 60)
    else:
        print("")
        print("❌ Error generating certificate:")
        print(result.stderr)
        input("Press Enter to exit...")
        sys.exit(1)
        
except Exception as e:
    print("")
    print(f"❌ Error: {e}")
    input("Press Enter to exit...")
    sys.exit(1)

input("Press Enter to continue...")

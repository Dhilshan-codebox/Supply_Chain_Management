# run_tests.py
import urllib.request
import urllib.error
import time
import subprocess
import os
import sys

def test_endpoints():
    print("Starting FastAPI server as subprocess...")
    # Start uvicorn server in a subprocess
    cmd = [sys.executable, "main.py"]
    proc = subprocess.Popen(cmd)
    
    # Wait for server to boot
    time.sleep(5)
    
    endpoints = [
        "/",
        "/api/v1/agents/status",
        "/api/v1/forecast",
        "/api/v1/inventory",
        "/api/v1/shipments",
        "/api/v1/suppliers",
        "/api/v1/production-schedule",
        "/api/v1/risks"
    ]
    
    success = True
    for ep in endpoints:
        url = f"http://127.0.0.1:8001{ep}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                code = response.getcode()
                print(f"[+] {ep} -> HTTP {code}")
        except urllib.error.HTTPError as e:
            print(f"[-] {ep} -> HTTP {e.code} Error: {e.read().decode('utf-8', errors='ignore')}")
            success = False
        except Exception as e:
            print(f"[-] {ep} -> Connection Failed: {str(e)}")
            success = False
            
    # Terminate process
    proc.terminate()
    try:
        proc.wait(timeout=5)
    except subprocess.TimeoutExpired:
        proc.kill()
    
    if not success:
        sys.exit(1)
    else:
        print("All HTTP endpoints returned HTTP 200 successfully!")

if __name__ == "__main__":
    test_endpoints()

